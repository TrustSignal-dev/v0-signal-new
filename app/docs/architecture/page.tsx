import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";
import { DocsSection } from "../_components";

export const metadata: Metadata = createPageMetadata({
  title: "Architecture",
  description:
    "TrustSignal architecture overview showing how verification services fit into existing compliance and audit workflows.",
  path: "/docs/architecture",
  keywords: ["TrustSignal architecture", "integrity layer", "workflow integration"],
});

const mermaid = `flowchart LR
  A["Evidence Source"] --> B["System of Record"]
  B --> C["TrustSignal Integrity Layer"]
  C --> D["Signed Verification Receipt"]
  D --> E["Audit and Compliance Review"]`;

const code = `// Keep your existing source system in place
const artifactRef = {
  source: "record_system",
  artifact_hash: "sha256:...",
  control_id: "CC8.2",
}

// Add TrustSignal verification as an integration boundary
await verifyArtifact(artifactRef)`;

export default function ArchitecturePage() {
  return (
    <DocsSection
      title="Architecture"
      intro="TrustSignal is designed as an integrity layer that operates alongside existing evidence workflows. Teams retain current collection and record systems while attaching signed verification receipts and verification signals for later integrity checks."
      mermaid={mermaid}
      code={code}
      codeLabel="Architecture Integration Snippet"
    />
  );
}
