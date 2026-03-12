import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";
import { DocsSection } from "../_components";

export const metadata: Metadata = createPageMetadata({
  title: "API Overview",
  description:
    "TrustSignal API overview for verification requests, receipt retrieval, and lifecycle status checks.",
  path: "/docs/api",
  keywords: ["TrustSignal API", "verification receipts", "receipt lifecycle"],
});

const mermaid = `flowchart LR
  A["Artifact or Artifact Reference"] --> B["Verification Request"]
  B --> C["Signed Verification Receipt"]
  C --> D["Status and Lifecycle Checks"]`;

const code = `POST /api/attest-evidence
Content-Type: application/json
Authorization: Bearer <token>

{
  "source": "compliance_platform",
  "artifact_hash": "sha256:...",
  "control_id": "CC6.1",
  "timestamp": "2026-03-12T18:42:00Z"
}

HTTP/1.1 201 Created
{
  "receipt_id": "tsig_rcpt_...",
  "status": "signed",
  "verification_status": "match"
}`;

export default function ApiDocsPage() {
  return (
    <DocsSection
      title="API Overview"
      intro="TrustSignal exposes a compact API surface for verification, receipt retrieval, status checks, and lifecycle actions. Integrations use these endpoints as a low-friction boundary alongside existing systems of record."
      mermaid={mermaid}
      code={code}
      codeLabel="Example Verification Request"
    />
  );
}
