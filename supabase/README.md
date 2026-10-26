# Supabase

This directory contains the local Supabase CLI scaffold and the versioned schema
owned by the TrustSignal customer frontend.

## Ownership boundary

The frontend owns only the account, membership, role, and subscription records
required by its authenticated dashboard. TrustSignal API-key records, secret
generation, hashing, rotation, and revocation are owned by the core TrustSignal
API repository and must be accessed through its authenticated server-side API.

Do not create or restore a frontend-owned `public.api_keys` table. In particular,
never store an API-key plaintext value in Supabase or expose a service-role key to
the browser.

## Active files

- `config.toml` — local Supabase CLI configuration.
- `migrations/20260903041303_production_dashboard_account_schema.sql` — the
  active account-dashboard schema and RLS policy migration.
- `tests/account_schema.test.sql` — local pgTAP coverage for schema ownership,
  forced RLS, provisioning, and cross-account visibility.
- `seed.sql` — intentionally empty local seed placeholder.
- `archive/retired-frontend-schema-20260903/` — byte-preserved provenance only;
  files below this directory are outside active migration and declarative-schema
  paths and must not be copied back into them.

The local services use the dedicated `5532x` range (`55321` API, `55322`
Postgres, `55323` Studio, `55324` mail, `55327` analytics, and `55320` shadow
database) so this frontend stack does not bind the default Supabase ports or the
TrustSignal core database port. The disabled pooler is reserved on `55329`.

## TrustSignal rules

Every new public-schema table must be classified first:

- Reference data
- Client-scoped data
- Backend-only system data

Default posture:

- Reference data: enable RLS, no client policies by default.
- Client-scoped data: enable RLS, add policies only when explicit ownership exists.
- Backend-only system data: enable RLS, no client policies, backend access only.

Do not infer authorization from business identifiers such as owner names, parcel
ids, hashes, or receipt actors.

## Local-only workflow

Use an explicit local target for every destructive reset:

```bash
supabase start
supabase db reset --local
supabase migration list --local
supabase test db --local supabase/tests
```

`supabase db reset --linked`, `supabase db reset --db-url`, and remote migration
commands are outside this local workflow. They require separate target verification,
review, and approval. Never place a database password or service-role key in this
repository or its documentation.
