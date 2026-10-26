-- Account-scoped monetization model.
-- Security goals:
-- 1) Scope operational data by account membership.
-- 2) Keep API key plaintext server-side only and store hashes.
-- 3) Preserve auditable lifecycle events for key and billing actions.

create extension if not exists pgcrypto;

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
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

alter table public.api_keys
  add column if not exists account_id uuid references public.accounts(id) on delete cascade,
  add column if not exists last4 text,
  add column if not exists created_by uuid references auth.users(id) on delete set null,
  add column if not exists revoked_by uuid references auth.users(id) on delete set null,
  add column if not exists revoked_reason text;

create table if not exists public.api_key_events (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  api_key_id uuid references public.api_keys(id) on delete set null,
  receipt_id uuid,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null check (action in ('created', 'revoked', 'used')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
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

create index if not exists account_members_user_idx on public.account_members(user_id);
create index if not exists account_members_account_idx on public.account_members(account_id);
create index if not exists api_keys_account_idx on public.api_keys(account_id);
create index if not exists api_keys_account_active_name_idx
  on public.api_keys(account_id, lower(name))
  where revoked_at is null;
create index if not exists api_key_events_account_idx on public.api_key_events(account_id, created_at desc);

alter table public.accounts enable row level security;
alter table public.roles enable row level security;
alter table public.account_members enable row level security;
alter table public.api_keys enable row level security;
alter table public.api_key_events enable row level security;
alter table public.subscriptions enable row level security;

alter table public.accounts force row level security;
alter table public.roles force row level security;
alter table public.account_members force row level security;
alter table public.api_keys force row level security;
alter table public.api_key_events force row level security;
alter table public.subscriptions force row level security;

create or replace function public.is_account_member(target_account_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.account_members am
    where am.account_id = target_account_id
      and am.user_id = auth.uid()
  );
$$;

create or replace function public.is_account_admin(target_account_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.account_members am
    where am.account_id = target_account_id
      and am.user_id = auth.uid()
      and am.role in ('owner', 'admin')
  );
$$;

revoke all on function public.is_account_member(uuid) from public;
grant execute on function public.is_account_member(uuid) to authenticated;

revoke all on function public.is_account_admin(uuid) from public;
grant execute on function public.is_account_admin(uuid) to authenticated;

drop policy if exists accounts_select_member on public.accounts;
create policy accounts_select_member
on public.accounts
for select
to authenticated
using (public.is_account_member(id));

drop policy if exists accounts_update_admin on public.accounts;
create policy accounts_update_admin
on public.accounts
for update
to authenticated
using (public.is_account_admin(id))
with check (public.is_account_admin(id));

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
  user_id = auth.uid()
  or public.is_account_member(account_id)
);

drop policy if exists account_members_insert_admin on public.account_members;
create policy account_members_insert_admin
on public.account_members
for insert
to authenticated
with check (public.is_account_admin(account_id));

drop policy if exists account_members_update_admin on public.account_members;
create policy account_members_update_admin
on public.account_members
for update
to authenticated
using (public.is_account_admin(account_id))
with check (public.is_account_admin(account_id));

drop policy if exists account_members_delete_admin on public.account_members;
create policy account_members_delete_admin
on public.account_members
for delete
to authenticated
using (public.is_account_admin(account_id));

drop policy if exists api_keys_select_member on public.api_keys;
create policy api_keys_select_member
on public.api_keys
for select
to authenticated
using (account_id is not null and public.is_account_member(account_id));

drop policy if exists api_keys_insert_admin on public.api_keys;
create policy api_keys_insert_admin
on public.api_keys
for insert
to authenticated
with check (
  account_id is not null
  and public.is_account_admin(account_id)
  and created_by = auth.uid()
);

drop policy if exists api_keys_update_admin on public.api_keys;
create policy api_keys_update_admin
on public.api_keys
for update
to authenticated
using (account_id is not null and public.is_account_admin(account_id))
with check (
  account_id is not null
  and public.is_account_admin(account_id)
  and (revoked_by is null or revoked_by = auth.uid())
);

drop policy if exists api_keys_delete_admin on public.api_keys;
create policy api_keys_delete_admin
on public.api_keys
for delete
to authenticated
using (account_id is not null and public.is_account_admin(account_id));

drop policy if exists api_key_events_select_member on public.api_key_events;
create policy api_key_events_select_member
on public.api_key_events
for select
to authenticated
using (public.is_account_member(account_id));

drop policy if exists api_key_events_insert_admin on public.api_key_events;
create policy api_key_events_insert_admin
on public.api_key_events
for insert
to authenticated
with check (
  public.is_account_admin(account_id)
  and (actor_user_id is null or actor_user_id = auth.uid())
);

drop policy if exists subscriptions_select_member on public.subscriptions;
create policy subscriptions_select_member
on public.subscriptions
for select
to authenticated
using (public.is_account_member(account_id));

drop policy if exists subscriptions_insert_admin on public.subscriptions;
create policy subscriptions_insert_admin
on public.subscriptions
for insert
to authenticated
with check (public.is_account_admin(account_id));

drop policy if exists subscriptions_update_admin on public.subscriptions;
create policy subscriptions_update_admin
on public.subscriptions
for update
to authenticated
using (public.is_account_admin(account_id))
with check (public.is_account_admin(account_id));

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_accounts_updated_at on public.accounts;
create trigger set_accounts_updated_at
before update on public.accounts
for each row execute function public.set_updated_at();

drop trigger if exists set_account_members_updated_at on public.account_members;
create trigger set_account_members_updated_at
before update on public.account_members
for each row execute function public.set_updated_at();

drop trigger if exists set_subscriptions_updated_at on public.subscriptions;
create trigger set_subscriptions_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

create or replace function public.provision_default_account_for_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_account_id uuid;
  resolved_name text;
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)))
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.profiles.full_name),
        updated_at = timezone('utc', now());

  resolved_name := coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1), 'TrustSignal account');

  insert into public.accounts (name, slug)
  values (
    resolved_name,
    concat('acct_', encode(gen_random_bytes(6), 'hex'))
  )
  returning id into new_account_id;

  insert into public.account_members (account_id, user_id, role)
  values (new_account_id, new.id, 'owner');

  insert into public.subscriptions (account_id, plan, status)
  values (new_account_id, 'free', 'inactive')
  on conflict (account_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.provision_default_account_for_user();

-- Rollback notes:
-- 1) Drop trigger and function first:
--    drop trigger if exists on_auth_user_created on auth.users;
--    drop function if exists public.provision_default_account_for_user();
-- 2) Drop policies/functions/triggers introduced in this migration.
-- 3) Drop tables in reverse dependency order:
--    drop table if exists public.subscriptions;
--    drop table if exists public.api_key_events;
--    drop table if exists public.account_members;
--    drop table if exists public.roles;
--    drop table if exists public.accounts;
-- 4) If desired, remove added columns on public.api_keys:
--    alter table public.api_keys
--      drop column if exists account_id,
--      drop column if exists last4,
--      drop column if exists created_by,
--      drop column if exists revoked_by,
--      drop column if exists revoked_reason;
