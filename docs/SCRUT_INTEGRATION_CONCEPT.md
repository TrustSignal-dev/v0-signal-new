# Scrut Integration Concept

Meeting context: Tuesday, March 17, 2026 at 2:15 PM Central

Status: Internal concept brief for partner discussion. This document describes an illustrative integration pattern only. It does not claim an official Scrut integration, access to private Scrut API documentation, or live production connectivity.

## 1. One-Page Technical Brief

### Integration Overview

TrustSignal fits beside a Scrut-style compliance automation workflow as an evidence integrity layer.

Scrut remains the system for:
- evidence collection
- control monitoring
- workflow orchestration
- audit readiness

TrustSignal adds:
- evidence verification at intake or refresh time
- provenance binding to the collected artifact or stable reference
- signed receipts for later reviewer and auditor inspection
- tamper-evident verification metadata when evidence changes over time

Core narrative:
- Scrut keeps the workflow, control mapping, and reviewer experience.
- TrustSignal verifies the evidence object or stable reference and returns a signed integrity record.
- Compliance teams get stronger evidence defensibility without replacing the underlying workflow.

### API-First Model

Representative flow:
1. Scrut collects or receives evidence through its existing workflow.
2. Scrut calls TrustSignal to verify the artifact hash or stable URI plus provenance and control context.
3. TrustSignal validates the request, records provenance, and issues a signed receipt.
4. Scrut stores the returned verification and receipt identifiers with the evidence record.
5. Reviewers or auditors retrieve verification metadata only when needed.

Illustrative TrustSignal endpoints:
- `POST /v1/evidence/verify`
- `GET /v1/evidence/{id}`
- `GET /v1/receipts/{id}`

Representative request:

```json
{
  "external_evidence_id": "scrut-ev-20491",
  "workspace_id": "acme-prod",
  "frameworks": ["SOC 2", "ISO 27001"],
  "controls": [
    { "framework": "SOC 2", "control_id": "CC6.1" },
    { "framework": "ISO 27001", "control_id": "A.5.15" }
  ],
  "artifact": {
    "uri": "s3://acme-evidence/access-reviews/q1-2026.csv",
    "hash": "sha256:4f4f7297a82f4d5308a6754df9374d9f2e2ef86361f98f290568a0dfcbaf8d4a",
    "mime_type": "text/csv"
  },
  "provenance": {
    "source_system": "Okta",
    "collected_by": "scrut-service-account",
    "collected_at": "2026-03-17T14:15:00.000Z"
  }
}
```

Representative response:

```json
{
  "evidence_id": "ts_evi_01JTSCRUT4ETR2Y6X7A1P5W9F0",
  "verification_status": "verified",
  "receipt_id": "ts_rcpt_01JTSCRUT7DY1R57V9B56QJQ2W",
  "receipt_hash": "sha256:0b7ebaa4c5e11de85d2e8196ec2a2ebfa0e39b14d4f17d2b190e3ef4d97c4306",
  "signature": {
    "alg": "EdDSA",
    "kid": "demo-trustsignal-2026-01"
  },
  "summary": {
    "artifact_hash_match": true,
    "provenance_bound": true,
    "tamper_evident_receipt_issued": true
  }
}
```

Representative retrieval:

```json
{
  "evidence_id": "ts_evi_01JTSCRUT4ETR2Y6X7A1P5W9F0",
  "status": "verified",
  "linked_controls": ["CC6.1", "A.5.15"],
  "latest_receipt_id": "ts_rcpt_01JTSCRUT7DY1R57V9B56QJQ2W"
}
```

### Webhook Augmentation Model

Representative flow:
1. Scrut or a Scrut-adjacent ingestion worker submits evidence for verification.
2. TrustSignal completes verification asynchronously or detects a later evidence change.
3. TrustSignal sends a signed webhook to a Scrut-managed receiver.
4. Scrut updates evidence status, reviewer context, and control mapping based on the event.

Illustrative endpoint for connectivity testing:
- `POST /v1/webhooks/scrut/test`

Illustrative events:
- `evidence.verified`
- `evidence.verification_failed`
- `evidence.changed`
- `receipt.issued`
- `control.evidence_updated`

Representative webhook:

```json
{
  "event_id": "evt_01JTSCRUT9FF5M0TR7WTQ5TD73",
  "event_type": "receipt.issued",
  "occurred_at": "2026-03-17T14:16:12.000Z",
  "delivery_id": "dlv_01JTSCRUTA8NK2H3ZZ8X8NQ7A9",
  "evidence_id": "ts_evi_01JTSCRUT4ETR2Y6X7A1P5W9F0",
  "external_evidence_id": "scrut-ev-20491",
  "receipt": {
    "receipt_id": "ts_rcpt_01JTSCRUT7DY1R57V9B56QJQ2W",
    "verification_status": "verified",
    "receipt_hash": "sha256:0b7ebaa4c5e11de85d2e8196ec2a2ebfa0e39b14d4f17d2b190e3ef4d97c4306"
  },
  "controls": ["CC6.1", "A.5.15"]
}
```

### Security Controls

Required MVP controls:
- OAuth 2.0 client credentials or scoped service accounts for machine-to-machine API access
- TLS 1.2+ for all traffic carrying evidence metadata or receipt data
- signed webhook deliveries with key rotation support
- replay protection using delivery IDs, timestamps, nonces, and bounded acceptance windows
- idempotency keys on `POST /v1/evidence/verify`
- least-privilege scopes so pilot callers can submit, read, or test only the records they need
- structured audit logs for verification, receipt issuance, retrieval, and webhook delivery
- strict input validation for IDs, timestamps, hashes, URIs, and control metadata
- no raw evidence contents or sensitive request bodies in logs
- explicit retry, dead-letter, and failure-state handling for webhook delivery

Security posture statement:
This concept assumes metadata, hashes, and stable references by default. Direct file transfer should be optional, narrowly scoped, and disabled unless a pilot evidence type requires it.

### Pilot Scope

Recommended MVP:
- one evidence category such as quarterly access reviews or vulnerability exports
- one API-first path with optional webhook callbacks
- one to two frameworks such as SOC 2 and ISO 27001
- five to ten mapped controls
- compact reviewer display for receipt status, provenance summary, and latest verification result

Pilot success criteria:
- verification attaches to evidence without disrupting collection workflows
- reviewers can inspect signed receipt metadata in the same review path
- changed evidence is surfaced deterministically after refresh or replacement
- audit teams can retrieve provenance and receipt details without manual reconciliation

Business framing:
TrustSignal does not add another compliance system. It makes the evidence already flowing through Scrut-style workflows more defensible.

## 2. Short Call Script

### Opening Positioning

"We are not proposing a broad platform integration. The MVP concept is narrower: Scrut continues to handle evidence collection, control monitoring, workflows, and audit readiness. TrustSignal adds an integrity layer that can verify evidence, bind provenance, and issue signed receipts that stay with the evidence record."

### Key Value Props

- stronger evidence integrity without changing reviewer workflow
- signed receipts instead of informal notes when auditors ask what was checked
- tamper-evident metadata when evidence is refreshed, replaced, or disputed
- reusable verification records across multiple controls and frameworks
- security-first machine-to-machine integration with clear audit logs

### Discovery Questions

- Where in the current workflow would integrity metadata help most: collection, review, or audit export?
- How does the system represent evidence lineage when an artifact is refreshed or replaced?
- Is synchronous verification acceptable for some evidence types, or is asynchronous processing preferred?
- Which evidence categories are most sensitive to drift, stale artifacts, or reviewer disputes?
- What is the preferred auth model for integrations today: OAuth2, service accounts, or both?
- How should receipt status appear so reviewers get value without extra workflow friction?

### Objections and Answers

Objection: "We already collect the evidence."

Answer: "Collection proves the file arrived. TrustSignal is aimed at proving the integrity state, provenance, and receipt trail of that file later, when auditors or reviewers rely on it."

Objection: "This adds complexity."

Answer: "The MVP is intentionally small: one verification call, one receipt object, and optional signed webhooks for status updates."

Objection: "Could this slow down evidence collection?"

Answer: "Not necessarily. The design supports synchronous verification for high-value evidence and asynchronous verification with signed callbacks where latency matters."

Objection: "What about tenant isolation and audit requirements?"

Answer: "The concept assumes OAuth2 or scoped service accounts, TLS 1.2+, signed webhooks, replay protection, least privilege, and structured audit logs from day one."

## 3. Pseudo-Diagrams

### API Request/Response Flow

```text
Scrut evidence workflow
    |
    |  Representative verify call
    |  POST /v1/evidence/verify
    v
TrustSignal verification service
    |
    |  Validate caller, verify hash/reference,
    |  bind provenance, issue signed receipt
    v
TrustSignal response
    |
    |  evidence_id, verification_status,
    |  receipt_id, receipt_hash, signature summary
    v
Scrut evidence record / reviewer workflow
    |
    |  Optional retrieval
    |  GET /v1/evidence/{id}
    |  GET /v1/receipts/{id}
    v
Reviewer / auditor sees defensible provenance
```

### Webhook Event Flow

```text
Scrut collection or refresh flow
    |
    |  Representative submission or later change detection
    v
TrustSignal verification service
    |
    |  Verification complete, failed, or changed-evidence detected
    v
Signed webhook delivery to Scrut-managed receiver
    |
    |  evidence.verified
    |  evidence.verification_failed
    |  evidence.changed
    |  receipt.issued
    |  control.evidence_updated
    v
Scrut updates evidence status, reviewer context, and audit trail
```

## Messaging Guardrail Check

This brief intentionally does not:
- imply an official Scrut integration already exists
- claim access to private Scrut API documentation
- present illustrative route names as official Scrut endpoints
- position TrustSignal as replacing evidence collection, control monitoring, or workflow orchestration
