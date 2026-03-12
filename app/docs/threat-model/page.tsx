import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";
import { DocsSection } from "../_components";

export const metadata: Metadata = createPageMetadata({
  title: "Threat Model",
  description:
    "Public TrustSignal threat model covering tampering, replay, and access risks with mitigation patterns.",
  path: "/docs/threat-model",
  keywords: ["TrustSignal threat model", "evidence tampering", "verification risk"],
});

const mermaid = `flowchart LR
  A["Threat: Artifact Tampering"] --> B["Mitigation: Later Integrity Checks"]
  C["Threat: Unauthorized API Use"] --> D["Mitigation: Auth + Access Controls"]
  E["Threat: Replay or Drift"] --> F["Mitigation: Timestamped Verification Signals"]`;

const code = `POST /api/verify
Content-Type: application/json
Authorization: Bearer <token>

{
  "receipt_id": "tsig_rcpt_...",
  "artifact_hash": "sha256:..."
}

// Response includes the verification signal used for downstream review.`;

export default function ThreatModelPage() {
  return (
    <DocsSection
      title="Threat Model"
      intro="This public threat model focuses on workflow and API-boundary risks: tampered artifacts, unauthorized access attempts, and lifecycle drift. Mitigations are surfaced through signed verification receipts, verification signals, and operational controls."
      mermaid={mermaid}
      code={code}
      codeLabel="Verification Check Example"
    />
  );
}
