import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata } from "@/lib/seo";
import { ARTIFACT_LINKS, CURL_EXAMPLE, ENGINE_REPO_URL, VERIFICATION_RESPONSE } from "../content";
import { DocCallout, DocCodeBlock, DocDiagram, DocFooterLinks, DocHeader, DocSection } from "../_components";

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
    <div className="space-y-8">
      <DocHeader
        title="API Overview"
        description="The public TrustSignal API exposes a verification lifecycle for existing workflow integration, receipt retrieval, and later verification."
        audience="API Consumers"
      />

      <DocSection
        title="Problem / Context"
        description="API evaluators need a stable contract that fits behind an existing workflow without exposing private verification engine details."
      >
        <p className="text-sm leading-relaxed text-muted-foreground">
          The relevant attack surface includes artifact tampering, provenance loss, and stale evidence during later review. The API is designed to support later verification rather than one-time intake only.
        </p>
      </DocSection>

      <DocSection
        title="Integrity Model"
        description="The public surface returns verification signals, signed verification receipts, and later verification outputs that can be stored alongside the system-of-record entry."
      >
        <DocCallout type="info">
          TrustSignal is an integrity layer. The upstream platform still owns workflow state, user actions, and the system of record.
        </DocCallout>
      </DocSection>

      <DocSection title="How It Works" description="Representative public routes for verification, receipt retrieval, status checks, and lifecycle actions.">
        <DocDiagram
          title="Verification Lifecycle"
          steps={[
            "Artifact",
            "Verification Request",
            "Verification Result",
            "Signed Verification Receipt",
            "Receipt Storage",
            "Later Verification",
            "Tamper Detection",
          ]}
        />
      </DocSection>

      <DocSection
        title="Example / Diagram"
        description="Representative public routes for verification, receipt retrieval, status checks, and lifecycle actions."
      >
        <div className="space-y-3">
          {surfaceSummary.map(([route, detail]) => (
            <div
              key={route}
              className="grid gap-2 border border-foreground/10 bg-foreground/[0.02] p-4 transition-[transform,border-color,background-color] duration-300 ease-out hover:-translate-y-0.5 hover:border-foreground/20 hover:bg-foreground/[0.04] md:grid-cols-[260px_minmax(0,1fr)]"
            >
              <p className="font-mono text-sm text-foreground/85">{route}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{detail}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 space-y-5">
          <DocCodeBlock label="Example Request" language="bash" code={CURL_EXAMPLE} />
          <DocCodeBlock label="Example Response" language="json" code={VERIFICATION_RESPONSE} />
        </div>
      </DocSection>

      <DocSection
        title="Production Considerations"
        description="Production deployment requires explicit authentication, environment configuration, and lifecycle monitoring around the public API boundary."
      >
        <DocCallout type="production">
          Authentication and lifecycle monitoring should be explicit, and later verification should run before relying on a prior receipt result in a high-trust workflow step.
        </DocCallout>
      </DocSection>

      <DocSection
        title="Security and Claims Boundary"
        description="The public contract is intentionally narrow and excludes internal implementation details."
      >
        <div className="space-y-5">
          <DocCallout type="security">
            Proof internals, witness data, signing infrastructure specifics, and internal service topology are intentionally not part of the public API contract.
          </DocCallout>
          <DocCallout type="claims" />
        </div>
      </DocSection>

      <DocSection title="Related Docs" description="Use these entry points for evaluator artifacts and adjacent technical material.">
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            TrustSignal is an integrity layer, not a system-of-record replacement. The upstream platform still owns business workflow state.
          </p>
          <p>
            Continue to <Link href="/docs/verification" className="text-foreground underline underline-offset-4">Verification</Link> or inspect the <a href={ENGINE_REPO_URL} target="_blank" rel="noreferrer" className="text-foreground underline underline-offset-4">GitHub repository</a>.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {ARTIFACT_LINKS.slice(0, 4).map((resource) => (
              <a key={resource.href} href={resource.href} target="_blank" rel="noreferrer" className="border border-foreground/10 bg-foreground/[0.02] p-4 transition-colors hover:border-foreground/20">
                <p className="font-medium text-foreground">{resource.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{resource.description}</p>
              </a>
            ))}
          </div>
        </div>
      </DocSection>

      <DocFooterLinks
        links={[
          { href: "/docs/verification", label: "Verification Lifecycle", description: "Lifecycle, receipt handling, and tamper detection." },
          { href: "/docs/security", label: "Security Model", description: "Authentication boundary and public-safe controls." },
          { href: "/docs/architecture", label: "Architecture", description: "Integration fit inside existing workflows." },
        ]}
      />
    </div>
  );
}
