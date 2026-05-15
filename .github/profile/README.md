# TrustSignal

**Evidence integrity infrastructure for compliance and audit workflows.**

TrustSignal issues signed verification receipts so organizations can prove when evidence was created, where it came from, and whether it has changed - without replacing the system that collected it.

---

### What TrustSignal Does

Compliance and audit teams rely on artifacts that pass through multiple systems. Without a durable integrity reference, provenance becomes difficult to validate during later review.

TrustSignal adds an integrity layer at the handoff point:

- **Signed verification receipts** - issued at artifact ingestion, binding hash, source, control, and timestamp
- **Verifiable provenance** - source metadata travels with the receipt from the start
- **Later integrity checks** - compare the current artifact against the original receipt before audit review
- **Tamper detection** - mismatch signals surface when a record no longer matches intake state
- **No workflow replacement** - fits alongside Encompass, Drata, and existing GRC platforms via a clean API boundary

---

### How It Works

```
POST /api/v1/verify

{
  "source": "encompass",
  "loan_number": "2026-03-0042",
  "document_type": "borrower_w2_2025",
  "event_type": "income_document_received",
  "artifact_hash": "sha256:93f6f35...",
  "timestamp": "2026-03-11T21:00:00Z",
  "policy_profile": "mortgage_loan_file_integrity_v1"
}

-> Returns a signed receipt with verification signal and provenance metadata
-> Store receipt alongside the artifact
-> Verify again later when trust conditions matter
```

---

### Built For

| Use Case | How TrustSignal Fits |
|---|---|
| Mortgage loan file integrity | Receipts at URLA intake, income docs, appraisal, closing package, post-close audit |
| Compliance evidence pipelines | Attests artifacts at ingestion, returns signed receipts |
| Audit-readiness workflows | Provides tamper-evident reference for later review |
| GRC platform integrations | Sits behind Encompass, Drata, or internal collectors |
| Security and partner review | Public API contract, claims boundary, and threat model available |

---

### Documentation

| Resource | Description |
|---|---|
| [Developer Docs](https://trustsignal.dev/docs) | Verification lifecycle, API overview, architecture |
| [API Overview](https://trustsignal.dev/docs/api) | Public request and response model |
| [Security Model](https://trustsignal.dev/docs/security) | Claims boundary and public-safe controls |
| [Threat Model](https://trustsignal.dev/docs/threat-model) | Threat assumptions and review posture |
| [Architecture](https://trustsignal.dev/docs/architecture) | Workflow fit and trust-boundary framing |

---

### Claims Boundary

TrustSignal provides signed verification receipts, verification signals, and verifiable provenance metadata.

TrustSignal does **not** provide legal determinations, compliance certification, fraud adjudication, or replacement for the system of record.

---

### Contact

-> [trustsignal.dev](https://trustsignal.dev) · [Request a Pilot](https://trustsignal.dev/#pilot-request) · [info@trustsignal.dev](mailto:info@trustsignal.dev)
