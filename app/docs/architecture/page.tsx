import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";
import { ARTIFACT_LINKS } from "../content";
import {
  AnimatedTrustBoundary,
  ClaimsBoundaryPanel,
  DocCallout,
  DocCodeBlock,
  DocDiagram,
  DocFooterLinks,
  DocHeader,
  DocSection,
} from "../_components";

export const metadata: Metadata = createPageMetadata({
  title: "Architecture",
  description:
    "TrustSignal architecture overview showing integration boundaries, trust boundaries, and integrity-layer workflow fit.",
  path: "/docs/architecture",
  keywords: ["TrustSignal architecture", "integrity layer", "trust boundary"],
});

const integrationSnippet = `// Existing workflow remains the system of record
const artifact = {
  source: "record_system",
  artifact_hash: "0x8b7b2f52f2a2e19f8f3fe0d815d1c1d8d1e0d120e8cc60d1baf5e7a6f9d211aa",
  control_id: "CONTROL_CC_001",
}

// TrustSignal adds verification and receipt outputs
const receipt = await verifyArtifact(artifact)`;

export default function ArchitecturePage() {
  return (
    <div className="space-y-8">
      <DocHeader
        title="Architecture"
        description="TrustSignal operates as an integrity layer between existing evidence workflows and downstream review while keeping the current system of record in place."
        audience="Architects"
      />

      <DocSection
        title="Problem / Context"
        description="Architects evaluating TrustSignal need to understand the trust boundary, the system-of-record boundary, and the externally visible outputs."
      >
        <p className="text-sm leading-relaxed text-muted-foreground">
          The integration target is the workflow boundary where verification artifacts can be stored and checked later without replacing upstream application state.
        </p>
      </DocSection>

      <DocSection
        title="Integrity Model"
        description="TrustSignal returns signed verification receipts, verification signals, and verifiable provenance while the existing workflow remains the system of record."
      >
        <DocCallout type="info">
          Existing workflow integration is the architectural goal. TrustSignal adds verification outputs; it does not replace workflow software.
        </DocCallout>
      </DocSection>

      <DocSection title="How It Works" description="The public architecture view stays focused on trust boundaries and workflow fit.">
        <DocDiagram
          title="System Architecture"
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

      <DocSection title="Example / Diagram" description="This view shows the boundary between partner systems, the public API surface, and private verification execution.">
        <AnimatedTrustBoundary />
      </DocSection>

      <DocSection
        title="Production Considerations"
        description="Architecture review should focus on how the receipt and later verification outputs fit into the surrounding workflow and monitoring model."
      >
        <div className="space-y-5">
          <DocCallout type="warning">
            Receipt storage, later verification, and lifecycle monitoring should live alongside the upstream workflow record, not instead of it.
          </DocCallout>
          <DocCodeBlock label="Integration Snippet" code={integrationSnippet} />
        </div>
      </DocSection>

      <DocSection
        title="Security and Claims Boundary"
        description="The architectural view is public-safe and intentionally excludes internal verification implementation details."
      >
        <div className="space-y-4">
          <DocCallout type="security">
            Public documentation does not expose internal service topology, proof internals, or signing infrastructure specifics.
          </DocCallout>
          <ClaimsBoundaryPanel />
        </div>
      </DocSection>

      <DocSection title="Related Docs" description="Use these links to continue from architecture into API, lifecycle, or security review.">
        <div className="grid gap-3 md:grid-cols-2">
          {ARTIFACT_LINKS.slice(0, 4).map((resource) => (
            <a key={resource.href} href={resource.href} target="_blank" rel="noreferrer" className="border border-foreground/10 bg-foreground/[0.02] p-4 transition-colors hover:border-foreground/20">
              <p className="font-medium text-foreground">{resource.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{resource.description}</p>
            </a>
          ))}
        </div>
      </DocSection>

      <DocFooterLinks
        links={[
          { href: "/docs/verification", label: "Verification Lifecycle" },
          { href: "/docs/api", label: "API" },
          { href: "/docs/security", label: "Security Model" },
        ]}
      />
    </div>
  );
}
