# Supabase

This repo now includes a Supabase CLI scaffold for TrustSignal database work.

## Current posture

- Project scaffolded with `supabase init`
- No remote project linked from this repo yet
- The CLI account can see hosted projects, including `trustsignal-staging`
- The database password is still required before this repo can be linked with `supabase link`

## Files

- `config.toml`
  - local Supabase CLI configuration
- `schemas/001_trustsignal_base.sql`
  - TrustSignal starter schema with RLS defaults and commented policy patterns
- `seed.sql`
  - intentionally empty placeholder

## TrustSignal rules

Every new public-schema table must be classified first:

- Reference data
- Client-scoped data
- Backend-only system data

Default posture:

- Reference data: enable RLS, no client policies by default
- Client-scoped data: enable RLS, add policies only when explicit ownership exists
- Backend-only system data: enable RLS, no client policies, backend access only

Do not infer authorization from business identifiers such as owner names, parcel ids, hashes, or receipt actors.

## Linking to hosted Supabase

When you have the database password for the target project:

```bash
supabase link --project-ref bwjyvakfrnmaawztasxu --password '...'
```

That project currently appears in the authenticated CLI account as `trustsignal-staging`.

## Local workflow

```bash
supabase start
supabase db reset
```

Use the schema file in `supabase/schemas/` as the authoritative starting point for TrustSignal auth, RLS, and table exposure decisions.
