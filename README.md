# TrustSignal

TrustSignal is evidence integrity infrastructure for high-trust workflows.

The public site explains how TrustSignal generates signed cryptographic receipts
at ingestion so organizations can prove that a compliance artifact, document,
or operational record has not changed after collection.

## What the website communicates

- Evidence integrity without workflow disruption
- Minimal integration through an API call or webhook
- Public-facing pilot intake for early adopters
- Technical credibility without exposing private implementation details

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
