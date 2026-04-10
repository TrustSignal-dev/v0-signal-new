# TrustSignal — Public Website

[![trustsignal.dev](https://img.shields.io/badge/trustsignal.dev-live-brightgreen)](https://trustsignal.dev)
[![Docs](https://img.shields.io/badge/docs-available-blue)](https://trustsignal.dev/docs)
[![Pilot](https://img.shields.io/badge/pilot-open-orange)](https://trustsignal.dev/#pilot-request)
[![Email](https://img.shields.io/badge/contact-info%40trustsignal.dev-lightgrey)](mailto:info@trustsignal.dev)

The public-facing website, documentation hub, and developer entry point for [TrustSignal](https://trustsignal.dev) — evidence integrity infrastructure for compliance and audit workflows.

→ **[trustsignal.dev](https://trustsignal.dev)** · **[Documentation](https://trustsignal.dev/docs)** · **[Request a Pilot](https://trustsignal.dev/#pilot-request)**

---

## What This Repo Contains

This is the Next.js application that powers **trustsignal.dev**, including:

- **Marketing pages** — Product positioning, use cases, and pilot request flow
- **Developer documentation** — Verification lifecycle, API reference, architecture, security model, and threat model
- **Integration demos** — Drata and Scrut walkthrough pages
- **Auth & dashboard** — Sign-in/sign-up via Supabase, customer dashboard, admin console
- **API routes** — Pilot requests, feedback, developer access, partner access, Stripe checkout
- **Admin console** — API key management, receipt inspection

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS, Radix UI |
| Auth | Supabase Auth |
| Payments | Stripe (checkout + webhooks) |
| Content | MDX for documentation pages |

---

## Quick Start

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your Supabase, Stripe, and app credentials

# Start development server
npm run dev
```

The site runs at `http://localhost:3000`.

### Environment Variables

See [.env.example](.env.example) for the full list. Key variables:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side) |
| `STRIPE_SECRET_KEY` | Stripe API key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `NEXT_PUBLIC_TRUSTSIGNAL_APP_URL` | Central TrustSignal app URL (set only when deployed) |

---

## Project Structure

```
app/
├── (root)                Landing page and global layout
├── admin/                Admin console (key management, receipts)
├── auth/                 Sign-in, sign-out, callback routes
├── dashboard/            Customer dashboard
├── docs/                 Documentation pages (MDX)
│   ├── api/              API reference
│   ├── architecture/     Architecture overview
│   ├── drata-demo/       Drata integration walkthrough
│   ├── scrut-demo/       Scrut integration walkthrough
│   ├── security/         Security documentation
│   ├── security-model/   Security model details
│   ├── threat-model/     Threat model
│   ├── verification/     Verification lifecycle
│   └── verification-example/  Live verification example
├── get-your-api-key/     Developer onboarding
├── integrations/         Integration landing pages
├── partner-access/       Partner access request
├── pilot-request/        Pilot request form
├── pricing/              Pricing page
├── sign-in/              Sign-in page
├── sign-up/              Sign-up page
├── api/                  API routes
│   ├── admin/            Admin endpoints (keys, receipts, session)
│   ├── developer-access/ Developer access requests
│   ├── feedback/         Feedback collection
│   ├── partner-access/   Partner access requests
│   ├── pilot-request/    Pilot request submissions
│   └── stripe/           Checkout and webhook handlers
components/               Shared UI components
lib/                      Utilities and client libraries
supabase/                 Database schema, config, security runbook
docs/                     Additional documentation
```

---

## Developer Access

The website is the discovery layer. Account creation, sign-in, and API key management route through the central TrustSignal app:

- `/sign-up`, `/sign-in`, `/get-your-api-key` — entry points on the public site
- API key issuance lives in the central app, not this marketing repo

---

## Supabase

The repo includes a Supabase CLI scaffold and a security runbook:

- **Runbook:** [docs/supabase-security-runbook.md](docs/supabase-security-runbook.md)
- **Starter schema:** [supabase/schemas/001_trustsignal_base.sql](supabase/schemas/001_trustsignal_base.sql)
- **CLI config:** [supabase/config.toml](supabase/config.toml)

Table classification:
| Table | Exposure |
|---|---|
| `profiles` | Client-scoped |
| `api_keys` | Client-scoped, backend-managed |
| `verification_log` | Backend-only |

---

## Validation

```bash
npm run typecheck       # Type checking
npm run build           # Production build
npm run messaging:check # Messaging guardrails
```

---

## Documentation Pages

| Page | URL |
|---|---|
| Developer Overview | [/docs](https://trustsignal.dev/docs) |
| Verification Lifecycle | [/docs/verification](https://trustsignal.dev/docs/verification) |
| API Overview | [/docs/api](https://trustsignal.dev/docs/api) |
| API Reference | [/docs/api/reference](https://trustsignal.dev/docs/api/reference) |
| Security Model | [/docs/security-model](https://trustsignal.dev/docs/security-model) |
| Threat Model | [/docs/threat-model](https://trustsignal.dev/docs/threat-model) |
| Architecture | [/docs/architecture](https://trustsignal.dev/docs/architecture) |

---

## Security

Public documentation does not expose proof internals, signing infrastructure, or internal service topology.

- Security review: [trustsignal.dev/security](https://trustsignal.dev/security)
- Report a vulnerability: [info@trustsignal.dev](mailto:info@trustsignal.dev)

---

## Claims Boundary

**TrustSignal provides:** Signed verification receipts · Verification signals · Verifiable provenance metadata · Later integrity-check capability

**TrustSignal does not provide:** Legal determinations · Compliance certification · Fraud adjudication · Replacement for the system of record

---

## Related Repositories

| Repository | Purpose |
|---|---|
| [TrustSignal](https://github.com/TrustSignal-dev/TrustSignal) | Core API and verification engine |
| [TrustSignal-App](https://github.com/TrustSignal-dev/TrustSignal-App) | GitHub App for CI verification |
| [TrustSignal-Verify-Artifact](https://github.com/TrustSignal-dev/TrustSignal-Verify-Artifact) | GitHub Action for artifact verification |
| [TrustSignal-docs](https://github.com/TrustSignal-dev/TrustSignal-docs) | Public documentation repo |

---

## Contact

[trustsignal.dev](https://trustsignal.dev) · [info@trustsignal.dev](mailto:info@trustsignal.dev) · [Request a Pilot](https://trustsignal.dev/#pilot-request)
