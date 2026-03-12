import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";
import { CodePanel, DiagramPanel, DocsShell, SectionBlock } from "../_components";

export const metadata: Metadata = createPageMetadata({
  title: "Quick Verification",
  description:
    "Quick TrustSignal verification example with request/response fields, lifecycle context, and production readiness notes.",
  path: "/docs/verification",
  keywords: ["quick verification", "verification signals", "signed verification receipts"],
});

const curlExample = `curl -X POST https://api.trustsignal.dev/api/attest-evidence \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "source": "audit_pipeline",
    "artifact_hash": "sha256:93f6f35a...",
    "control_id": "CC6.1",
    "timestamp": "2026-03-12T19:02:00Z"
  }'`;

const responseExample = `{
  "receipt_id": "tsig_rcpt_01JTQY8N...",
  "status": "signed",
  "verification_status": "match",
  "attested_at": "2026-03-12T19:02:01Z",
  "provenance": {
    "source": "audit_pipeline",
    "control_id": "CC6.1"
  }
}`;

const fieldNotes = [
  ["receipt_id", "Unique receipt reference for retrieval, status checks, and lifecycle actions."],
  ["status", "Lifecycle state of the receipt artifact (for example, signed)."],
  ["verification_status", "Current verification signal for the submitted artifact context."],
  ["provenance", "Source metadata supporting verifiable provenance and later review."],
] as const;

export default function VerificationPage() {
  return (
    <DocsShell
      eyebrow="Developer Docs"
      title="Quick Verification Example"
      intro="This example shows the fastest way to request a signed verification receipt and interpret verification signals in an existing workflow integration path."
    >
      <DiagramPanel
        title="Verification Flow"
        steps={[
          "Submit artifact hash and source metadata",
          "Receive signed verification receipt",
          "Store receipt with system-of-record entry",
          "Run later verification before relying on prior results",
        ]}
      />

      <SectionBlock
        title="Copy-Paste Request"
        description="Use scoped authentication and environment-specific API base URLs in production environments."
      >
        <CodePanel label="cURL Example" code={curlExample} />
      </SectionBlock>

      <SectionBlock
        title="Example Response"
        description="The response includes lifecycle and provenance fields intended for storage and later verification checks."
      >
        <div className="space-y-5">
          <CodePanel label="JSON Response" code={responseExample} />
          <div className="space-y-3">
            {fieldNotes.map(([field, note]) => (
              <div key={field} className="grid gap-2 border border-foreground/10 bg-foreground/[0.02] p-4 md:grid-cols-[180px_minmax(0,1fr)]">
                <p className="font-mono text-sm text-foreground/85">{field}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{note}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionBlock>

      <SectionBlock title="Production Readiness">
        <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
          <li>Authentication and scopes should be limited to required lifecycle actions.</li>
          <li>Environment configuration should separate local, staging, and production credentials.</li>
          <li>Receipt lifecycle monitoring should alert on status changes relevant to your controls.</li>
          <li>Verification checks should run before relying on prior receipt results in high-trust steps.</li>
        </ul>
      </SectionBlock>
    </DocsShell>
  );
}
