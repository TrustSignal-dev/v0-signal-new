-- Production repair for the account-scoped dashboard tables.
--
-- The TrustSignal API-key records remain owned by the core API. This migration
-- only adds the account, membership, and subscription records required by the
-- customer dashboard and protects every exposed table with RLS.

create extension if not exists pgcrypto;
create schema if not exists private;

revoke all on schema private from public;
revoke all on schema private from anon;
grant usage on schema private to authenticated;

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  billing_plan text not null default 'free',
  billing_status text not null default 'inactive',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint accounts_name_length check (char_length(trim(name)) between 1 and 120)
);

create table if not exists public.roles (
  role text primary key,
  description text not null,
  created_at timestamptz not null default timezone('utc', now())
);

insert into public.roles (role, description)
values
  ('owner', 'Full account control including billing and membership management.'),
  ('admin', 'Operational account admin with API key and billing management rights.'),
  ('member', 'Read-only account member for operational visibility.')
on conflict (role) do update
set description = excluded.description;

create table if not exists public.account_members (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null references public.roles(role),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (account_id, user_id)
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null unique references public.accounts(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  plan text not null default 'free',
  status text not null default 'inactive',
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists account_members_user_idx
  on public.account_members(user_id);
create index if not exists account_members_account_idx
  on public.account_members(account_id);
create index if not exists account_members_role_idx
  on public.account_members(role);

alter table public.accounts enable row level security;
alter table public.roles enable row level security;
alter table public.account_members enable row level security;
alter table public.subscriptions enable row level security;

alter table public.accounts force row level security;
alter table public.roles force row level security;
alter table public.account_members force row level security;
alter table public.subscriptions force row level security;

revoke all on public.accounts from anon;
revoke all on public.roles from anon;
revoke all on public.account_members from anon;
revoke all on public.subscriptions from anon;

grant select, update on public.accounts to authenticated;
grant select on public.roles to authenticated;
grant select, insert, update, delete on public.account_members to authenticated;
grant select, insert, update on public.subscriptions to authenticated;

create or replace function private.is_account_member(target_account_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.account_members am
    where am.account_id = target_account_id
      and am.user_id = (select auth.uid())
  );
$$;

create or replace function private.is_account_admin(target_account_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.account_members am
    where am.account_id = target_account_id
      and am.user_id = (select auth.uid())
      and am.role in ('owner', 'admin')
  );
$$;

revoke all on function private.is_account_member(uuid) from public;
revoke all on function private.is_account_member(uuid) from anon;
grant execute on function private.is_account_member(uuid) to authenticated;

revoke all on function private.is_account_admin(uuid) from public;
revoke all on function private.is_account_admin(uuid) from anon;
grant execute on function private.is_account_admin(uuid) to authenticated;

drop policy if exists accounts_select_member on public.accounts;
create policy accounts_select_member
on public.accounts
for select
to authenticated
using ((select private.is_account_member(id)));

drop policy if exists accounts_update_admin on public.accounts;
create policy accounts_update_admin
on public.accounts
for update
to authenticated
using ((select private.is_account_admin(id)))
with check ((select private.is_account_admin(id)));

drop policy if exists roles_select_authenticated on public.roles;
create policy roles_select_authenticated
on public.roles
for select
to authenticated
using (true);

drop policy if exists account_members_select_member on public.account_members;
create policy account_members_select_member
on public.account_members
for select
to authenticated
using (
  user_id = (select auth.uid())
  or (select private.is_account_member(account_id))
);

drop policy if exists account_members_insert_admin on public.account_members;
create policy account_members_insert_admin
on public.account_members
for insert
to authenticated
with check ((select private.is_account_admin(account_id)));

drop policy if exists account_members_update_admin on public.account_members;
create policy account_members_update_admin
on public.account_members
for update
to authenticated
using ((select private.is_account_admin(account_id)))
with check ((select private.is_account_admin(account_id)));

drop policy if exists account_members_delete_admin on public.account_members;
create policy account_members_delete_admin
on public.account_members
for delete
to authenticated
using ((select private.is_account_admin(account_id)));

drop policy if exists subscriptions_select_member on public.subscriptions;
create policy subscriptions_select_member
on public.subscriptions
for select
to authenticated
using ((select private.is_account_member(account_id)));

drop policy if exists subscriptions_insert_admin on public.subscriptions;
create policy subscriptions_insert_admin
on public.subscriptions
for insert
to authenticated
with check ((select private.is_account_admin(account_id)));

drop policy if exists subscriptions_update_admin on public.subscriptions;
create policy subscriptions_update_admin
on public.subscriptions
for update
to authenticated
using ((select private.is_account_admin(account_id)))
with check ((select private.is_account_admin(account_id)));

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

revoke all on function private.set_updated_at() from public;

drop trigger if exists set_accounts_updated_at on public.accounts;
create trigger set_accounts_updated_at
before update on public.accounts
for each row execute function private.set_updated_at();

drop trigger if exists set_account_members_updated_at on public.account_members;
create trigger set_account_members_updated_at
before update on public.account_members
for each row execute function private.set_updated_at();

drop trigger if exists set_subscriptions_updated_at on public.subscriptions;
create trigger set_subscriptions_updated_at
before update on public.subscriptions
for each row execute function private.set_updated_at();

create or replace function private.ensure_default_account_for_user(
  target_user_id uuid,
  target_email text,
  target_display_name text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  resolved_account_id uuid;
  resolved_name text;
begin
  select am.account_id
    into resolved_account_id
  from public.account_members am
  where am.user_id = target_user_id
  order by am.created_at asc
  limit 1;

  if resolved_account_id is not null then
    return resolved_account_id;
  end if;

  resolved_name := coalesce(
    nullif(trim(target_display_name), ''),
    nullif(split_part(target_email, '@', 1), ''),
    'TrustSignal account'
  );

  insert into public.accounts (name, slug)
  values (
    resolved_name,
    concat('acct_', encode(extensions.gen_random_bytes(9), 'hex'))
  )
  returning id into resolved_account_id;

  insert into public.account_members (account_id, user_id, role)
  values (resolved_account_id, target_user_id, 'owner');

  insert into public.subscriptions (account_id, plan, status)
  values (resolved_account_id, 'free', 'inactive');

  return resolved_account_id;
end;
$$;

create or replace function private.provision_default_account_for_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.ensure_default_account_for_user(
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'name'
  );
  return new;
end;
$$;

revoke all on function private.ensure_default_account_for_user(uuid, text, text) from public;
revoke all on function private.ensure_default_account_for_user(uuid, text, text) from anon;
revoke all on function private.ensure_default_account_for_user(uuid, text, text) from authenticated;
revoke all on function private.provision_default_account_for_user() from public;
revoke all on function private.provision_default_account_for_user() from anon;
revoke all on function private.provision_default_account_for_user() from authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.provision_default_account_for_user();

do $$
declare
  existing_user record;
begin
  for existing_user in
    select id, email, raw_user_meta_data ->> 'name' as display_name
    from auth.users
  loop
    perform private.ensure_default_account_for_user(
      existing_user.id,
      existing_user.email,
      existing_user.display_name
    );
  end loop;
end;
$$;
