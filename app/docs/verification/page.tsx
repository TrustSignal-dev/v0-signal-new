import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";
import { CURL_EXAMPLE, RECEIPT_EXAMPLE, STATUS_EXAMPLE, TAMPERED_REJECTION } from "../content";
import { CodePanel, DiagramPanel, DocsShell, SectionBlock } from "../_components";

export const metadata: Metadata = createPageMetadata({
  title: "Quick Verification",
  description:
    "Quick TrustSignal verification example with request/response fields, lifecycle context, and production readiness notes.",
  path: "/docs/verification",
  keywords: ["quick verification", "verification signals", "signed verification receipts"],
});

const fieldNotes = [
  ["receiptId", "Unique receipt reference for retrieval, status checks, and lifecycle actions."],
  ["receiptHash", "Stable hash of the canonical receipt payload used for later verification."],
  ["receiptSignature", "Signed receipt metadata returned with the verification response."],
  ["inputsCommitment", "Canonical commitment to the verified request inputs."],
] as const;

export default function VerificationPage() {
  return (
    <DocsShell
      eyebrow="Developer Docs"
      title="Verification"
      intro="This page shows the full public verification lifecycle: request, signed receipt, later verification status, and tampered artifact rejection."
    >
      <DiagramPanel
        title="Try the Verification Lifecycle"
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
        <CodePanel label="cURL Example" code={CURL_EXAMPLE} />
      </SectionBlock>

      <SectionBlock
        title="Verification Response"
        description="The response includes the receipt identifier, receipt hash, signature metadata, provenance state, and lifecycle state."
      >
        <div className="space-y-5">
          <CodePanel label="JSON Response" code={RECEIPT_EXAMPLE} />
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

      <SectionBlock
        title="Later Verification"
        description="A later verification check confirms that the stored receipt still matches current state before audit, partner review, or another high-trust workflow step."
      >
        <CodePanel label="Verification Status" code={STATUS_EXAMPLE} />
      </SectionBlock>

      <SectionBlock
        title="Tampered Artifact Rejection"
        description="If the artifact has changed since receipt issuance, later verification returns a mismatch signal instead of silently reusing the earlier result."
      >
        <CodePanel label="Tampered Artifact Response" code={TAMPERED_REJECTION} />
      </SectionBlock>
    </DocsShell>
  );
}
