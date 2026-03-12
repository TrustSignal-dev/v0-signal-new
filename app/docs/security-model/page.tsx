import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";
import { DocsSection } from "../_components";

export const metadata: Metadata = createPageMetadata({
  title: "Security Model",
  description:
    "TrustSignal security model overview for API authentication, transport security, and verification lifecycle safeguards.",
  path: "/docs/security-model",
  keywords: ["TrustSignal security model", "API authentication", "verification safeguards"],
});

const mermaid = `flowchart TD
  A["Authenticated Client"] --> B["TLS API Boundary"]
  B --> C["Verification Processing"]
  C --> D["Signed Verification Receipt"]
  D --> E["Lifecycle Status Checks"]`;

const code = `GET /api/receipts/tsig_rcpt_01JTQY...
Authorization: Bearer <token>

HTTP/1.1 200 OK
{
  "receipt_id": "tsig_rcpt_01JTQY...",
  "status": "signed",
  "verification_status": "match",
  "updated_at": "2026-03-12T18:46:00Z"
}`;

export default function SecurityModelPage() {
  return (
    <DocsSection
      title="Security Model"
      intro="TrustSignal integrations rely on authenticated API access, encrypted transport, and explicit receipt lifecycle checks. The service provides verification signals and provenance metadata while keeping proprietary internals outside the public interface."
      mermaid={mermaid}
      code={code}
      codeLabel="Receipt Status Retrieval"
    />
  );
}
