import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";
import { DocsSection } from "../_components";

export const metadata: Metadata = createPageMetadata({
  title: "Quick Verification Example",
  description:
    "Quick TrustSignal example showing how to request a verification receipt and run a later integrity check.",
  path: "/docs/verification-example",
  keywords: ["verification example", "signed verification receipt", "integrity checks"],
});

const mermaid = `sequenceDiagram
  participant Client as Compliance Workflow
  participant TS as TrustSignal API
  participant Store as System of Record
  Client->>TS: Submit artifact hash + metadata
  TS-->>Client: Signed verification receipt
  Client->>Store: Store artifact + receipt
  Client->>TS: Later verification check
  TS-->>Client: Verification signal`;

const code = `// 1) Verify at ingestion
const receipt = await fetch("/api/attest-evidence", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer <token>",
  },
  body: JSON.stringify({
    source: "audit_pipeline",
    artifact_hash: "sha256:...",
    timestamp: new Date().toISOString(),
  }),
}).then((r) => r.json())

// 2) Store receipt with your artifact record
await storeEvidence({ artifactId: "ev_123", receiptId: receipt.receipt_id })`;

export default function VerificationExamplePage() {
  return (
    <DocsSection
      title="Quick Verification Example"
      intro="A typical integration verifies an artifact at ingestion, stores the signed verification receipt with the artifact record, and then performs later verification checks when required."
      mermaid={mermaid}
      code={code}
      codeLabel="Minimal Integration Snippet"
    />
  );
}
