import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";
import { DocsShell, SectionBlock } from "../_components";

export const metadata: Metadata = createPageMetadata({
  title: "Threat Model",
  description:
    "Public TrustSignal threat model covering tampering, receipt forgery, replay attempts, unauthorized revocation, and source inconsistency.",
  path: "/docs/threat-model",
  keywords: ["threat model", "artifact tampering", "receipt forgery", "replay detection"],
});

const threats = [
  {
    threat: "Artifact tampering",
    behavior:
      "TrustSignal is designed to provide later verification signals against signed verification receipts so drift can be detected during review.",
  },
  {
    threat: "Receipt forgery attempts",
    behavior:
      "TrustSignal is designed to return signed verification receipts that can be validated through public API lifecycle checks.",
  },
  {
    threat: "Replay or duplicate submission attempts",
    behavior:
      "TrustSignal is designed to preserve lifecycle state and timestamps to support duplicate detection and operational review policies.",
  },
  {
    threat: "Unauthorized revocation",
    behavior:
      "TrustSignal is designed to require authenticated lifecycle actions with scoped controls before receipt state changes.",
  },
  {
    threat: "Upstream source inconsistency",
    behavior:
      "TrustSignal is designed to preserve verifiable provenance metadata so downstream teams can evaluate source context during later verification.",
  },
] as const;

export default function ThreatModelPage() {
  return (
    <DocsShell
      eyebrow="Developer Docs"
      title="Threat Model"
      intro="This public threat model summarizes the external risks TrustSignal is designed to address at a high level through signed verification receipts, verification signals, and verifiable provenance metadata."
    >
      <SectionBlock
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
      </SectionBlock>
    </DocsShell>
  );
}
