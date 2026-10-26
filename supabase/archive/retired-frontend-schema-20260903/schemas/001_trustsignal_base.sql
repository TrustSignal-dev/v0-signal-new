-- TrustSignal Supabase baseline
--
-- This schema follows the TrustSignal table-classification runbook:
-- 1. Classify every table before exposing it.
-- 2. Enable RLS on every public table.
-- 3. Do not infer ownership from business fields.
-- 4. Only add client policies when the ownership model is explicit.
-- 5. Prefer RPCs, views, or backend endpoints before raw table access.

create extension if not exists pgcrypto;

-- Profiles are client-scoped because they map directly to authenticated users.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint profiles_email_format check (
    email is null or email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  )
);

comment on table public.profiles is
  'Client-scoped data. RLS enabled. Client policies may use id = auth.uid().';

-- Customers store company/plan metadata linked to the auth user.
-- Backend-only by default; expose via RPC or server-side endpoints.
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  company_name text,
  plan text not null default 'free',
  stripe_customer_id text unique,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint customers_plan_values check (plan in ('free', 'pro', 'enterprise'))
);

create index if not exists customers_stripe_customer_id_idx
  on public.customers (stripe_customer_id)
  where stripe_customer_id is not null;

comment on table public.customers is
  'Backend-only system data. RLS enabled. No client policies by default. Use server-side endpoints.';

-- API keys are client-scoped, but secret material must remain server-managed.
create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  name text not null,
  key_prefix text not null,
  key_hash text not null,
  scopes text[] not null default '{}',
  last_used_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint api_keys_name_length check (char_length(trim(name)) between 1 and 120),
  constraint api_keys_prefix_length check (char_length(key_prefix) between 4 and 24),
  constraint api_keys_hash_length check (char_length(key_hash) >= 32)
);

comment on table public.api_keys is
  'Client-scoped data. RLS enabled. Prefer backend endpoints or RPCs. Never expose raw key secrets after creation.';

create unique index if not exists api_keys_user_id_name_active_idx
  on public.api_keys (user_id, lower(name))
  where revoked_at is null;

create unique index if not exists api_keys_key_hash_idx
  on public.api_keys (key_hash);

create index if not exists api_keys_user_id_idx
  on public.api_keys (user_id);

-- Verification logs are backend-only system data. Keep them locked.
create table if not exists public.verification_log (
  id uuid primary key default gen_random_uuid(),
  api_key_id uuid references public.api_keys(id) on delete set null,
  user_id uuid references public.profiles(id) on delete set null,
  endpoint text not null,
  status_code integer not null,
  request_id text,
  source_ip inet,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  constraint verification_log_status_code_range check (status_code between 100 and 599)
);

comment on table public.verification_log is
  'Backend-only system data. RLS enabled. No client policies by default.';

create index if not exists verification_log_api_key_id_idx
  on public.verification_log (api_key_id);

create index if not exists verification_log_user_id_idx
  on public.verification_log (user_id);

create index if not exists verification_log_created_at_idx
  on public.verification_log (created_at desc);

create index if not exists api_keys_customer_id_idx
  on public.api_keys (customer_id);

alter table public.profiles enable row level security;
alter table public.api_keys enable row level security;
alter table public.verification_log enable row level security;
alter table public.customers enable row level security;

alter table public.profiles force row level security;
alter table public.api_keys force row level security;
alter table public.verification_log force row level security;
alter table public.customers force row level security;

-- Profiles: narrow client access is acceptable because ownership is explicit.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- API keys: explicit ownership exists via user_id, but the safer default is:
-- expose keys through backend endpoints or RPCs first.
-- The following policies allow users to view and manage only their own key metadata.
-- Keep secret generation and raw secret return in backend code only.
drop policy if exists "api_keys_select_own" on public.api_keys;
create policy "api_keys_select_own"
on public.api_keys
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "api_keys_insert_own" on public.api_keys;
create policy "api_keys_insert_own"
on public.api_keys
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "api_keys_update_own" on public.api_keys;
create policy "api_keys_update_own"
on public.api_keys
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "api_keys_delete_own" on public.api_keys;
create policy "api_keys_delete_own"
on public.api_keys
for delete
to authenticated
using (user_id = auth.uid());

-- Verification log: backend-only. Do not create anon/authenticated policies.
-- Access should happen through service_role or server-side endpoints only.

-- Optional trigger to keep updated_at current on mutable tables.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_api_keys_updated_at on public.api_keys;
create trigger set_api_keys_updated_at
before update on public.api_keys
for each row
execute function public.set_updated_at();

drop trigger if exists set_customers_updated_at on public.customers;
create trigger set_customers_updated_at
before update on public.customers
for each row
execute function public.set_updated_at();

-- Auto-create a profile row when a new auth.users entry is created (OAuth signup).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- Auto-create a customers row when a profile is inserted (OAuth signup).
create or replace function public.handle_new_customer()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.customers (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_profile_created_create_customer on public.profiles;
create trigger on_profile_created_create_customer
after insert on public.profiles
for each row
execute function public.handle_new_customer();

-- Example conversion pattern for locked tables:
--
-- 1. Start locked:
--    alter table public.some_table enable row level security;
--    do not add client policies
--
-- 2. Add explicit ownership:
--    add column user_id uuid not null references public.profiles(id);
--    create index on (user_id);
--
-- 3. Prefer RPC/view before raw table access:
--    create or replace view public.some_table_client_view as ...
--    or create a SECURITY DEFINER RPC that returns curated rows
--
-- 4. Only then add narrow authenticated policies.
