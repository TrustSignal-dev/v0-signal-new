import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";
import { ARTIFACT_LINKS } from "../content";
import { CodePanel, DiagramPanel, DocsShell, ResourceGrid, SectionBlock } from "../_components";

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
    <DocsShell
      eyebrow="Developer Docs"
      title="Architecture"
      intro="TrustSignal operates as an integrity layer between existing evidence workflows and downstream review. Teams keep current systems of record while adding signed verification receipts and verification signals for later verification."
    >
      <DiagramPanel
        title="System Architecture"
        steps={[
          "External evidence source",
          "Existing system of record",
          "TrustSignal verification boundary",
          "Receipt and verification outputs",
        ]}
      />

      <SectionBlock title="Trust-Boundary Diagram">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="border border-foreground/10 bg-foreground/[0.02] p-4">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">External / Partner Systems</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Evidence collectors, compliance platforms, and partner review systems.
            </p>
          </div>
          <div className="border border-foreground/20 bg-background p-4">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">Public Boundary</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              TrustSignal API Gateway handles authenticated verification and lifecycle requests.
            </p>
          </div>
          <div className="border border-foreground/10 bg-foreground/[0.02] p-4">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">Private Boundary</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Internal verification engine remains private while signed verification receipts and verification signals are returned as outputs.
            </p>
          </div>
        </div>
      </SectionBlock>

      <SectionBlock
        title="Workflow Fit"
        description="TrustSignal is not a workflow replacement. It integrates at defined boundaries so compliance, audit evidence pipelines, and systems of record can continue operating as they do today."
      />

      <CodePanel label="Integration Snippet" code={integrationSnippet} />

      <SectionBlock
        title="Linked Technical Artifacts"
        description="The website developer portal mirrors the engine repository artifacts rather than inventing a separate surface."
      >
        <ResourceGrid resources={ARTIFACT_LINKS} />
      </SectionBlock>
    </DocsShell>
  );
}
