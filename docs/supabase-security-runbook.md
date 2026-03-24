# Supabase Security Runbook

This runbook captures the TrustSignal rules for classifying new tables and deciding whether any client access is allowed.

## Table classification

For every new table in the `public` schema, classify it first:

1. Reference data
Reference data is shared metadata, lookup data, imported registries, county records, property metadata, and similar externally sourced records.

2. Client-scoped data
Client-scoped data belongs to an authenticated user, tenant, organization, or workspace.

3. Backend-only system data
Backend-only system data includes receipts, verification artifacts, internal jobs, orchestration state, caches, and audit records.

## Default posture

- Reference data
  - Enable RLS
  - No client policies by default
  - Treat as backend-only until a client access model is explicitly approved

- Client-scoped data
  - Enable RLS
  - Add policies only after the schema contains explicit ownership columns or a documented helper path

- Backend-only system data
  - Enable RLS
  - No client policies
  - Access via `service_role` or server-side endpoints only

## Never infer ownership from business fields

Do not treat domain fields as auth identifiers.

Examples:

- `current_owner` on a property table is not an auth user id
- `actor` on a receipt table may be an external identity, not `auth.uid()`
- Parcel ids, policy numbers, hashes, and receipt ids are business identifiers, not access control columns

## Required columns before client policies

Before writing any client-facing policy, the table must have at least one explicit access column or a provable helper path:

- `user_id`
- `tenant_id`
- `organization_id`
- `workspace_id`
- or a documented `SECURITY DEFINER` helper function that maps `auth.uid()` to permitted rows and is not broadly executable by `anon` or `authenticated`

If none of those exist, do not create client policies.

## Safe exposure pattern

When data should become client-readable:

1. Expose it through an RPC, Edge Function, or backend endpoint first.
2. Return a curated shape instead of raw table access.
3. Add indexes for any columns used in policy predicates before heavy client usage.
4. Only then add narrow `TO authenticated` policies with explicit `USING` and `WITH CHECK` clauses.
5. Prefer views or functions that encapsulate joins and authorization logic.

## Review checklist

Before exposing any table to clients:

- Is RLS enabled?
- Who should read rows?
- Who should write rows?
- Is ownership explicit in the schema?
- Are policies tested as `anon`, `authenticated`, and `service_role`?
- Are indexes present for policy predicates and join keys?
- Can the access surface be narrowed through an RPC or view instead of raw table reads?

## Current TrustSignal decisions

- `public.profiles`
  - client-scoped
  - RLS enabled
  - ownership is explicit through `id = auth.uid()`

- `public.api_keys`
  - client-scoped
  - RLS enabled
  - prefer backend issuance and curated reads
  - never expose raw secrets after creation

- `public.verification_log`
  - backend-only system data
  - RLS enabled
  - no client policies

- `public.Property`
  - locked reference data
  - RLS enabled
  - no client policies

- `public.CountyRecord`
  - locked reference data
  - RLS enabled
  - no client policies

- `public.Receipt`
  - backend-only system data
  - RLS enabled
  - no client policies

## Repo mapping

- Main runbook: `docs/supabase-security-runbook.md`
- Starter schema: `supabase/schemas/001_trustsignal_base.sql`
- Supabase CLI scaffold: `supabase/config.toml`
