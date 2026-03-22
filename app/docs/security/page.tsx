import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";
import {
  CodePanel,
  DiagramPanel,
  DocsShell,
  SectionBlock,
} from "../_components";
import { STATUS_EXAMPLE } from "../content";

export const metadata: Metadata = createPageMetadata({
  title: "Security Model",
  description:
    "Public TrustSignal security model for API authentication, signed verification receipts, lifecycle validation, and abuse controls.",
  path: "/docs/security",
  keywords: ["TrustSignal security", "signed verification receipts", "verification controls"],
});

export default function SecurityPage() {
  return (
    <DocsShell
      eyebrow="Developer Docs"
      title="Security Model"
      intro="TrustSignal provides externally verifiable outputs while limiting public interfaces to an authenticated API boundary. Integrations can evaluate verification signals and receipt lifecycle state without exposing private verification engine internals."
    >
      <DiagramPanel
        title="Security Controls in the Verification Lifecycle"
        steps={[
          "Authenticate API client and scopes",
          "Submit verification request over TLS",
          "Receive signed verification receipt",
          "Check lifecycle status and verification signals",
        ]}
      />

      <SectionBlock title="Public Security Controls">
        <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
          <li>API authentication and scoped access for verification and lifecycle actions.</li>
          <li>Signed verification receipts for durable integrity records.</li>
          <li>Receipt lifecycle validation and status checks before downstream reliance.</li>
          <li>Authorized revocation controls tied to lifecycle governance.</li>
          <li>Rate limiting and abuse protection on public API boundaries.</li>
          <li>Fail-closed behavior at the integration boundary when verification state is unavailable.</li>
        </ul>
      </SectionBlock>

      <CodePanel label="Lifecycle Status Check" code={STATUS_EXAMPLE} />

      <SectionBlock
        title="Intentionally Not Exposed"
        description="Public documentation does not disclose proof internals, circuit identifiers, witness data, signing infrastructure specifics, model internals, or internal service topology."
      />

      <SectionBlock title="Claims Boundary">
        <ClaimsBoundaryPanel />
      </SectionBlock>
    </DocsShell>
  );
}
