-- Applied to the existing hosted project. No CPF, payment data or order copies.
create schema if not exists chega_private;
revoke all on schema chega_private from public, anon, authenticated;
grant usage on schema chega_private to authenticated;

create table public.chega_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 120),
  phone text check (phone is null or phone ~ '^\+55[1-9][0-9]{9,10}$'),
  marketing_email boolean not null default false,
  marketing_whatsapp boolean not null default false,
  account_consent_version text not null check (account_consent_version = '2026-10-07'),
  account_consent_at timestamptz not null default now(),
  preferences_updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint whatsapp_requires_phone check (not marketing_whatsapp or phone is not null)
);
alter table public.chega_profiles enable row level security;
revoke all on public.chega_profiles from public, anon, authenticated;
grant select on public.chega_profiles to authenticated;
grant update (full_name, phone, marketing_email, marketing_whatsapp) on public.chega_profiles to authenticated;

-- A server-side release gate prevents clients from bypassing the paused signup
-- form before email delivery, redirect URLs and CAPTCHA are configured.
create table chega_private.account_settings (
  singleton boolean primary key default true check (singleton),
  registration_enabled boolean not null default false,
  max_accounts integer not null default 5000 check (max_accounts between 1 and 5000)
);
revoke all on chega_private.account_settings from public, anon, authenticated;
insert into chega_private.account_settings (singleton) values (true);

-- Server lookup: never authorize using editable user_metadata. Also reject JWTs
-- whose account/session has already been removed, even before JWT expiration.
create function chega_private.account_is_active() returns boolean
language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists (
    select 1 from auth.users u join auth.sessions s on s.user_id = u.id
    where u.id = auth.uid() and u.email_confirmed_at is not null
      and s.id::text = auth.jwt()->>'session_id'
  );
$$;
revoke all on function chega_private.account_is_active() from public, anon, authenticated;
grant execute on function chega_private.account_is_active() to authenticated;

create policy chega_profile_read_own on public.chega_profiles for select to authenticated
using ((select auth.uid()) = id and (select chega_private.account_is_active()));
create policy chega_profile_update_own on public.chega_profiles for update to authenticated
using ((select auth.uid()) = id and (select chega_private.account_is_active()))
with check ((select auth.uid()) = id and (select chega_private.account_is_active()));

-- Auth trigger runs internally only. Metadata is input, never an authorization
-- claim. Consent time/version and preference-change time are server controlled.
create function chega_private.create_account_profile() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  contact_phone text := nullif(meta->>'phone', '');
  settings chega_private.account_settings%rowtype;
begin
  select * into settings from chega_private.account_settings where singleton for update;
  if not settings.registration_enabled then
    raise exception 'Account registration is not available yet';
  end if;
  if (select count(*) from public.chega_profiles) >= settings.max_accounts then
    raise exception 'Account registration capacity reached';
  end if;
  if meta->>'account_consent' is distinct from 'true'
     or meta->>'privacy_version' is distinct from '2026-10-07' then
    raise exception 'Account privacy acknowledgement required';
  end if;
  insert into public.chega_profiles (id, full_name, phone, marketing_email, marketing_whatsapp, account_consent_version)
  values (new.id, btrim(meta->>'full_name'), contact_phone,
    coalesce(meta->>'marketing_email' = 'true', false),
    coalesce(meta->>'marketing_whatsapp' = 'true', false), '2026-10-07');
  return new;
end;
$$;
revoke all on function chega_private.create_account_profile() from public, anon, authenticated;
create trigger chega_auth_user_profile after insert on auth.users
for each row execute function chega_private.create_account_profile();

create function chega_private.stamp_profile_update() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.full_name := btrim(new.full_name);
  new.updated_at := now();
  if new.marketing_email is distinct from old.marketing_email
     or new.marketing_whatsapp is distinct from old.marketing_whatsapp then
    new.preferences_updated_at := now();
  end if;
  return new;
end;
$$;
revoke all on function chega_private.stamp_profile_update() from public, anon, authenticated;
create trigger chega_profile_update_stamp before update on public.chega_profiles
for each row execute function chega_private.stamp_profile_update();
