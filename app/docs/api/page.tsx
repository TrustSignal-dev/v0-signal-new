import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata } from "@/lib/seo";
import { ARTIFACT_LINKS, CURL_EXAMPLE, ENGINE_REPO_URL, VERIFICATION_RESPONSE } from "../content";
import { CodePanel, DiagramPanel, DocsShell, ResourceGrid, SectionBlock } from "../_components";

export const metadata: Metadata = createPageMetadata({
  title: "API Overview",
  description:
    "TrustSignal API overview for verification lifecycle requests, signed verification receipts, and status checks.",
  path: "/docs/api",
  keywords: ["TrustSignal API", "signed verification receipts", "verification lifecycle"],
});

const surfaceSummary = [
  ["POST /api/v1/verify", "Submit a verification request and receive verification signals plus a signed verification receipt."],
  ["GET /api/v1/receipt/:receiptId", "Retrieve the stored receipt view and canonical receipt payload."],
  ["POST /api/v1/receipt/:receiptId/verify", "Run later verification for the stored receipt before downstream reliance."],
  ["POST /api/v1/receipt/:receiptId/revoke", "Apply an authorized lifecycle action when revocation is supported."],
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
          "Submit artifact or artifact-derived request",
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
          <CodePanel label="cURL Request" code={CURL_EXAMPLE} />
          <CodePanel label="Verification Response" code={VERIFICATION_RESPONSE} />
        </div>
      </SectionBlock>

      <SectionBlock
        title="Evaluator Artifacts"
        description="These links map directly to the engine repository artifacts used by evaluators."
      >
        <ResourceGrid resources={ARTIFACT_LINKS} />
      </SectionBlock>

      <SectionBlock
        title="Lifecycle Notes"
        description="Receipt retrieval, status checks, and lifecycle actions should be integrated with your organization’s review controls and record systems."
      >
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            TrustSignal is an integrity layer, not a system-of-record replacement. The upstream platform still owns business workflow state.
          </p>
          <p>
            Proof internals, witness data, signing infrastructure details, and internal service topology are intentionally not part of the public API contract.
          </p>
          <p>
            Continue to <Link href="/docs/verification" className="text-foreground underline underline-offset-4">Verification</Link> or inspect the <a href={ENGINE_REPO_URL} target="_blank" rel="noreferrer" className="text-foreground underline underline-offset-4">GitHub repository</a>.
          </p>
        </div>
      </SectionBlock>
    </DocsShell>
  );
}
