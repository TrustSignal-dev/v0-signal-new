# Repository Guidelines

## Purpose

This repository is the public TrustSignal website, docs hub, and onboarding surface. Changes here must preserve public-message accuracy, avoid exposing internal architecture, and keep authentication and billing flows safe.

## Guardrails

- Do not expose secrets, service role keys, admin credentials, partner passwords, webhook secrets, or internal-only URLs in code, docs, logs, or screenshots.
- Treat `NEXT_PUBLIC_*` values as public-by-design. Everything else must stay server-only.
- Keep public claims aligned with the canonical product behavior in `TrustSignal/`.
- Do not imply production features, certifications, or integrations that are only prototypes.
- Avoid adding custom auth. Prefer Supabase Auth and server-side enforcement.
- Do not expand admin access, partner access, or billing behavior without updating validation and docs.

## High-risk areas

- `app/api/`
- `app/admin/`
- `app/dashboard/`
- `lib/`
- `supabase/`

Changes touching those paths must preserve least privilege, logging discipline, and server/client separation.

## Validation

Run the smallest relevant checks before finishing:

- `npm run typecheck`
- `npm run build`
- `npm run messaging:check`

## Branch Scope Discipline

- Keep PRs single-concern and reviewable. Do not combine auth flow, schema/data model, and public messaging refactors in one branch.
- Use separate branches and PRs for:
	- auth/session/dashboard behavior,
	- API key or schema/runtime contract changes,
	- messaging or docs copy updates.
- Merge order should preserve production stability: backend/runtime contract first, then auth UX wiring, then messaging/docs.

## Notes

- This repo currently uses `pnpm-lock.yaml`; keep package-manager usage consistent.
- Prefer editing source content here rather than duplicating docs into `TrustSignal-docs/` unless the task is explicitly public-review packaging.
