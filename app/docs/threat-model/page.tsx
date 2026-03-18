import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";
import { DocHeader, DocSection } from "../_components";

export const metadata: Metadata = createPageMetadata({
  title: "Threat Model",
  description:
    "Public TrustSignal threat model covering tampering, receipt forgery, replay attempts, unauthorized revocation, and source inconsistency.",
  path: "/docs/threat-model",
  keywords: ["threat model", "artifact tampering", "receipt forgery", "replay detection"],
});

const threats = [
  {
    threat: "Evidence tampering after collection",
    behavior:
      "Later verification compares current artifact state to the stored signed verification receipt so drift can be detected during downstream review.",
  },
  {
    threat: "Artifact substitution attacks",
    behavior:
      "Verification signals and receipt-bound commitments make it explicit when a different artifact is presented later under the same workflow context.",
  },
  {
    threat: "Provenance loss in compliance workflows",
    behavior:
      "Receipts preserve verifiable provenance metadata so downstream teams can keep source and lifecycle context attached to the record.",
  },
  {
    threat: "Stale evidence during audit review",
    behavior:
      "Later verification is a separate lifecycle check so older results are not silently reused without checking current receipt state.",
  },
  {
    threat: "Unverifiable documentation chains",
    behavior:
      "Signed verification receipts provide a durable technical record that can travel with the workflow even when documentation moves between systems.",
  },
] as const;

export default function ThreatModelPage() {
  return (
    <div className="space-y-8">
      <DocHeader
        title="Threat Model"
        description="This public threat model summarizes the external risks TrustSignal is designed to address in high-loss workflows where incentives exist to modify, substitute, or detach evidence after collection."
        audience="Security Reviewers"
      />

      <DocSection
        title="Threat Scenarios"
        description="The table below focuses on externally visible threats and expected high-level behavior, without exposing proprietary internals."
      >
        <div className="space-y-3">
          {threats.map((item) => (
            <div key={item.threat} className="grid gap-2 border border-foreground/10 bg-foreground/[0.02] p-4 md:grid-cols-[220px_minmax(0,1fr)]">
              <p className="font-medium text-foreground/90">{item.threat}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{item.behavior}</p>
            </div>
          ))}
        </div>
      </DocSection>

      <DocSection
        title="Boundary Conditions"
        description="TrustSignal does not provide legal determinations, compliance certification, or fraud adjudication. It provides technical verification artifacts that downstream systems can use in their own workflow controls."
      />
    </div>
  );
}
