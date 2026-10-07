-- All test identities and changes disappear on rollback. No email is sent.
begin;
do $$
declare
  a uuid := gen_random_uuid(); b uuid := gen_random_uuid(); c uuid := gen_random_uuid();
  sa uuid := gen_random_uuid(); sb uuid := gen_random_uuid(); sc uuid := gen_random_uuid();
  total integer; changed integer; blocked boolean := false;
  meta jsonb := '{"full_name":"Conta de teste","account_consent":true,"privacy_version":"2026-10-07"}'::jsonb;
begin
  begin
    insert into auth.users(id,email,raw_user_meta_data) values (a,'gate-test-'||a||'@example.invalid',meta);
  exception when raise_exception then blocked := true; end;
  if not blocked then raise exception 'FAIL: server signup gate'; end if;
  update chega_private.account_settings set registration_enabled=true where singleton;
  insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data) values
    (a,'test-'||a||'@example.invalid',now(),meta),
    (b,'test-'||b||'@example.invalid',now(),meta),
    (c,'test-'||c||'@example.invalid',null,meta);
  insert into auth.sessions(id,user_id,created_at) values (sa,a,now()),(sb,b,now()),(sc,c,now());
  perform set_config('request.jwt.claims',jsonb_build_object('sub',a,'role','authenticated','session_id',sa)::text,true);
  execute 'set local role authenticated';
  select count(*) into total from public.chega_profiles;
  if total<>1 then raise exception 'FAIL: profile isolation'; end if;
  update public.chega_profiles set full_name='Conta atualizada' where id=a;
  get diagnostics changed = row_count;
  if changed<>1 then raise exception 'FAIL: own profile update'; end if;
  update public.chega_profiles set full_name='Tentativa indevida' where id=b;
  get diagnostics changed = row_count;
  if changed<>0 then raise exception 'FAIL: another profile update'; end if;
  blocked:=false;
  begin update public.chega_profiles set account_consent_version='2026-10-07' where id=a;
  exception when insufficient_privilege then blocked:=true; end;
  if not blocked then raise exception 'FAIL: immutable consent'; end if;
  blocked:=false;
  begin update public.chega_profiles set id=b where id=a;
  exception when insufficient_privilege then blocked:=true; end;
  if not blocked then raise exception 'FAIL: owner reassignment'; end if;
  perform set_config('request.jwt.claims',jsonb_build_object('sub',c,'role','authenticated','session_id',sc)::text,true);
  select count(*) into total from public.chega_profiles;
  if total<>0 then raise exception 'FAIL: unconfirmed email access'; end if;
  execute 'reset role';
  delete from auth.sessions where id=sa;
  perform set_config('request.jwt.claims',jsonb_build_object('sub',a,'role','authenticated','session_id',sa)::text,true);
  execute 'set local role authenticated';
  select count(*) into total from public.chega_profiles;
  if total<>0 then raise exception 'FAIL: revoked session access'; end if;
  execute 'reset role';
  execute 'set local role anon';
  blocked:=false;
  begin perform count(*) from public.chega_profiles;
  exception when insufficient_privilege then blocked:=true; end;
  if not blocked then raise exception 'FAIL: anonymous profile access'; end if;
  blocked:=false;
  begin perform chega_private.account_is_active();
  exception when insufficient_privilege then blocked:=true; end;
  if not blocked then raise exception 'FAIL: anonymous internal function access'; end if;
  execute 'reset role';
  delete from auth.users where id=b;
  select count(*) into total from public.chega_profiles where id=b;
  if total<>0 then raise exception 'FAIL: account deletion cascade'; end if;
end $$;
rollback;
select jsonb_build_object('security_tests','passed','accounts_remaining',(select count(*) from auth.users),'registration_enabled',(select registration_enabled from chega_private.account_settings where singleton)) as verification;
