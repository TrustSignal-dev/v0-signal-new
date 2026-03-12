import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata } from "@/lib/seo";
import { CodePanel, DiagramPanel, DocsShell, SectionBlock } from "../_components";

export const metadata: Metadata = createPageMetadata({
  title: "API Overview",
  description:
    "TrustSignal API overview for verification lifecycle requests, signed verification receipts, and status checks.",
  path: "/docs/api",
  keywords: ["TrustSignal API", "signed verification receipts", "verification lifecycle"],
});

const requestExample = `POST /api/attest-evidence
Content-Type: application/json
Authorization: Bearer <token>

{
  "source": "compliance_platform",
  "artifact_hash": "sha256:93f6f35a...",
  "control_id": "CC6.1",
  "timestamp": "2026-03-12T18:42:00Z",
  "metadata": {
    "artifact_type": "compliance_evidence"
  }
}`;

const responseExample = `HTTP/1.1 201 Created
{
  "receipt_id": "tsig_rcpt_01JTQY8N...",
  "status": "signed",
  "verification_status": "match",
  "provenance": {
    "artifact_type": "compliance_evidence"
  },
  "attested_at": "2026-03-12T18:42:01Z"
}`;

const surfaceSummary = [
  ["POST /api/attest-evidence", "Submit artifact context and receive a signed verification receipt."],
  ["GET /api/receipts/:id", "Retrieve receipt details and provenance metadata."],
  ["GET /api/receipts/:id/status", "Check current verification lifecycle status."],
  ["POST /api/receipts/:id/revoke", "Apply lifecycle action under authorized controls."],
] as const;

export default function ApiDocsPage() {
  return (
    <DocsShell
      eyebrow="Developer Docs"
      title="API Overview"
      intro="The TrustSignal API exposes a public verification lifecycle designed for existing workflow integration. Teams verify artifacts, store signed verification receipts, and use verification signals for later verification decisions."
    >
      <DiagramPanel
        title="Verification Lifecycle"
        steps={[
          "Submit artifact or artifact reference",
          "Receive signed verification receipt",
          "Store receipt with artifact record",
          "Run later verification checks",
        ]}
      />

      <SectionBlock
        title="Endpoint Surface"
        description="Representative public routes for verification, receipt retrieval, status checks, and lifecycle actions."
      >
        <div className="space-y-3">
          {surfaceSummary.map(([route, detail]) => (
            <div key={route} className="grid gap-2 border border-foreground/10 bg-foreground/[0.02] p-4 md:grid-cols-[260px_minmax(0,1fr)]">
              <p className="font-mono text-sm text-foreground/85">{route}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{detail}</p>
            </div>
          ))}
        </div>
      </SectionBlock>

      <SectionBlock
        title="Request and Response"
        description="Use authenticated requests with explicit provenance metadata so receipts can support later verification."
      >
        <div className="space-y-5">
          <CodePanel label="Example Request" code={requestExample} />
          <CodePanel label="Example Response" code={responseExample} />
        </div>
      </SectionBlock>

      <SectionBlock
        title="Lifecycle Notes"
        description="Receipt retrieval, status checks, and lifecycle actions should be integrated with your organization’s review controls and record systems."
      >
        <Link href="/docs/verification" className="text-sm text-foreground underline underline-offset-4">
          Continue to Quick Verification Example
        </Link>
      </SectionBlock>
    </DocsShell>
  );
}
