-- Add missing display and metadata columns to api_keys table.
-- These columns are required by the key creation and listing API routes.

alter table public.api_keys
  add column if not exists name text,
  add column if not exists key_prefix text,
  add column if not exists last4 text,
  add column if not exists account_id uuid,
  add column if not exists created_by uuid,
  add column if not exists revoked_by uuid,
  add column if not exists revoked_reason text;

-- Back-fill a placeholder name for any existing keys that have none.
update public.api_keys set name = 'API Key' where name is null;

-- Now enforce not null on name going forward.
alter table public.api_keys alter column name set not null;
alter table public.api_keys alter column name set default 'API Key';

-- Add length constraint on name if not already present.
alter table public.api_keys
  drop constraint if exists api_keys_name_length;
alter table public.api_keys
  add constraint api_keys_name_length check (char_length(trim(name)) between 1 and 120);

-- Add prefix length constraint if not already present.
alter table public.api_keys
  drop constraint if exists api_keys_prefix_length;
alter table public.api_keys
  add constraint api_keys_prefix_length
    check (key_prefix is null or char_length(key_prefix) between 4 and 24);
