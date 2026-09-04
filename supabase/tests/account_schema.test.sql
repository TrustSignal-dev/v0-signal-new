begin;

select plan(37);

select has_schema('private', 'private helper schema exists');
select has_table('public', 'accounts', 'accounts table exists');
select has_table('public', 'roles', 'roles table exists');
select has_table('public', 'account_members', 'account_members table exists');
select has_table('public', 'subscriptions', 'subscriptions table exists');
select hasnt_table('public', 'api_keys', 'API keys remain owned by the core API');

select ok(
  (select relrowsecurity from pg_class where oid = 'public.accounts'::regclass),
  'accounts has RLS enabled'
);
select ok(
  (select relforcerowsecurity from pg_class where oid = 'public.accounts'::regclass),
  'accounts forces RLS'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.roles'::regclass),
  'roles has RLS enabled'
);
select ok(
  (select relforcerowsecurity from pg_class where oid = 'public.roles'::regclass),
  'roles forces RLS'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.account_members'::regclass),
  'account_members has RLS enabled'
);
select ok(
  (select relforcerowsecurity from pg_class where oid = 'public.account_members'::regclass),
  'account_members forces RLS'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.subscriptions'::regclass),
  'subscriptions has RLS enabled'
);
select ok(
  (select relforcerowsecurity from pg_class where oid = 'public.subscriptions'::regclass),
  'subscriptions forces RLS'
);

select has_function(
  'private',
  'is_account_member',
  array['uuid'],
  'membership helper exists in the private schema'
);
select has_function(
  'private',
  'is_account_admin',
  array['uuid'],
  'administrator helper exists in the private schema'
);
select has_trigger(
  'auth',
  'users',
  'on_auth_user_created',
  'signup provisioning trigger exists on auth.users'
);

select ok(
  has_schema_privilege('authenticated', 'private', 'USAGE'),
  'authenticated users may use the private helper schema'
);
select ok(
  not has_schema_privilege('anon', 'private', 'USAGE'),
  'anonymous users cannot use the private helper schema'
);
select ok(
  has_function_privilege('authenticated', 'private.is_account_member(uuid)', 'EXECUTE'),
  'authenticated users may execute the membership helper'
);
select ok(
  has_function_privilege('authenticated', 'private.is_account_admin(uuid)', 'EXECUTE'),
  'authenticated users may execute the administrator helper'
);
select ok(
  not has_function_privilege('anon', 'private.is_account_member(uuid)', 'EXECUTE'),
  'anonymous users cannot execute the membership helper'
);
select ok(
  not has_function_privilege('anon', 'private.is_account_admin(uuid)', 'EXECUTE'),
  'anonymous users cannot execute the administrator helper'
);
select ok(
  not has_function_privilege(
    'authenticated',
    'private.ensure_default_account_for_user(uuid,text,text)',
    'EXECUTE'
  ),
  'authenticated users cannot call the account provisioning helper directly'
);
select ok(
  not has_function_privilege(
    'authenticated',
    'private.provision_default_account_for_user()',
    'EXECUTE'
  ),
  'authenticated users cannot call the signup trigger function directly'
);

insert into auth.users (id, email, raw_user_meta_data)
values
  (
    '10000000-0000-4000-8000-000000000001'::uuid,
    'schema-test-a@example.test',
    '{"name":"Schema Test A"}'::jsonb
  ),
  (
    '20000000-0000-4000-8000-000000000002'::uuid,
    'schema-test-b@example.test',
    '{"name":"Schema Test B"}'::jsonb
  );

select is(
  (
    select count(distinct am.account_id)
    from public.account_members am
    where am.user_id in (
      '10000000-0000-4000-8000-000000000001'::uuid,
      '20000000-0000-4000-8000-000000000002'::uuid
    )
  ),
  2::bigint,
  'signup provisions one account per test user'
);
select is(
  (
    select count(*)
    from public.account_members am
    where am.user_id in (
      '10000000-0000-4000-8000-000000000001'::uuid,
      '20000000-0000-4000-8000-000000000002'::uuid
    )
  ),
  2::bigint,
  'signup provisions one owner membership per test user'
);
select is(
  (
    select count(*)
    from public.subscriptions s
    where s.account_id in (
      select am.account_id
      from public.account_members am
      where am.user_id in (
        '10000000-0000-4000-8000-000000000001'::uuid,
        '20000000-0000-4000-8000-000000000002'::uuid
      )
    )
  ),
  2::bigint,
  'signup provisions one free subscription per test account'
);
select is((select count(*) from public.roles), 3::bigint, 'only the three supported roles exist');

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '10000000-0000-4000-8000-000000000001',
  true
);

select is((select count(*) from public.accounts), 1::bigint, 'user A sees only its account');
select is(
  (select count(*) from public.account_members),
  1::bigint,
  'user A sees only its account membership'
);
select is(
  (select count(*) from public.subscriptions),
  1::bigint,
  'user A sees only its subscription'
);
select is((select count(*) from public.roles), 3::bigint, 'user A may read reference roles');

reset role;
set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '20000000-0000-4000-8000-000000000002',
  true
);

select is((select count(*) from public.accounts), 1::bigint, 'user B sees only its account');
select is(
  (select count(*) from public.account_members),
  1::bigint,
  'user B sees only its account membership'
);
select is(
  (select count(*) from public.subscriptions),
  1::bigint,
  'user B sees only its subscription'
);
select is((select count(*) from public.roles), 3::bigint, 'user B may read reference roles');

reset role;
select * from finish();
rollback;
