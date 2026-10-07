alter table chega_private.account_settings enable row level security;
create or replace function chega_private.account_is_active() returns boolean language sql stable security definer set search_path = '' as $$ select auth.uid() is not null and exists (select 1 from auth.users u join auth.sessions s on s.user_id=u.id where u.id=auth.uid() and u.email_confirmed_at is not null and not u.is_anonymous and (u.banned_until is null or u.banned_until < now()) and (s.not_after is null or s.not_after > now()) and s.id::text=auth.jwt()->>'session_id'); $$;
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

create policy chega_settings_deny_clients on chega_private.account_settings for all to anon, authenticated using (false) with check (false);
