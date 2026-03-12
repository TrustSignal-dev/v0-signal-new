# TrustSignal

TrustSignal is evidence integrity infrastructure that adds signed cryptographic receipts to high-trust workflows so teams can prove records have not changed after collection.

The public site explains how TrustSignal fits behind an existing workflow and
supports later verification without overstating what is currently implemented.

The website is the presentation layer for TrustSignal. It should simplify the
story, but it must not contradict the implementation truth in the `trustsignal`
repo or the public-safe boundaries in `TrustSignal-docs`.

## What the website communicates

- Evidence integrity without workflow disruption
- Minimal integration through an API call or webhook
- Public-facing pilot intake for early adopters
- Audit-ready traceability without exposing private implementation details
- Deed verification as one use case, not the product definition

## Current site sections

- Problem: why post-collection drift and fraud matter
- Demo: valid and tampered evidence verification
- Integration: where TrustSignal sits in an existing workflow
- Architecture: high-level developer and infrastructure messaging
- Pilot Request: basic intake form for pilot and integration follow-up

## Public review posture

This repository is intended for the TrustSignal website and related public
materials. Any separate review repository linked from the live site should
remain sanitized and should not expose proprietary internals, secrets, or
private registry integrations.

Public website copy must not:

- lead with blockchain, ZKML, or AI fraud detection
- invent SDK or endpoint behavior that is not backed by the source-of-truth repo
- present roadmap or experimental architecture as shipped behavior
- publish precise performance or proof claims without current verification

Unless TrustSignal states otherwise in writing, all website materials are
proprietary and covered by the terms in [LICENSE.md](./LICENSE.md).

## Local development

```bash
corepack pnpm install
corepack pnpm dev
```

## Environment

Copy values from `.env.example` and configure SMTP credentials before enabling
pilot request email delivery.

## Deployment

The site is deployed on Vercel and intended to serve `trustsignal.dev`.

## Contributor Note

`trustsignal` is the implementation and messaging source of truth.

Public website copy in this repo must follow the guardrails in
`docs/PUBLIC_MESSAGING_GUARDRAILS.md` and should stay aligned with
implementation-backed behavior and public-safe claim boundaries.
