import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";
import {
  ClaimsBoundaryPanel,
  DocCallout,
  DocCodeBlock,
  DocHeader,
  DocLayoutShell,
  DocSection,
} from "../_components";
import { STATUS_EXAMPLE } from "../content";

const SECURITY_LIFECYCLE_STEPS = [
  "Authenticate API client and scopes",
  "Submit verification request over TLS",
  "Receive signed verification receipt",
  "Check integrity status and verification signals",
] as const;

export const metadata: Metadata = createPageMetadata({
  title: "Security Model",
  description:
    "Public TrustSignal security model for API authentication, signed verification receipts, lifecycle validation, and abuse controls.",
  path: "/docs/security",
  keywords: [
    "TrustSignal security",
    "signed verification receipts",
    "verification controls",
  ],
});

export default function SecurityPage() {
  return (
    <DocLayoutShell>
      <DocHeader
        eyebrow="Developer Docs"
        title="Security Model"
        description="TrustSignal provides externally verifiable outputs while limiting public interfaces to an authenticated API boundary. Integrations can evaluate verification signals and receipt lifecycle state without exposing private verification engine internals."
        audience="Security reviewers and partner engineers"
      />

      <DocSection
        title="Security Controls in the Verification Lifecycle"
        description="The public surface is narrow by design so integrators can verify outcomes without needing internal engine access."
      >
        <div className="grid gap-3 md:grid-cols-2">
          {SECURITY_LIFECYCLE_STEPS.map((step, index) => (
            <div
              key={step}
              className="rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Step {index + 1}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-foreground">{step}</p>
            </div>
          ))}
        </div>
      </DocSection>

      <DocSection title="Public Security Controls">
        <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
          <li>API authentication and scoped access for verification and lifecycle actions.</li>
          <li>Signed verification receipts for durable integrity records.</li>
          <li>Receipt lifecycle validation and status checks before downstream reliance.</li>
          <li>Authorized revocation controls tied to lifecycle governance.</li>
          <li>Rate limiting and abuse protection on public API boundaries.</li>
          <li>Fail-closed behavior at the integration boundary when verification state is unavailable.</li>
        </ul>
      </DocSection>

      <DocSection
        title="Verification Result Shape"
        description="Downstream systems should treat status and integrity checks as explicit decision inputs before relying on prior verification."
      >
        <DocCodeBlock label="Receipt Verification Result" code={STATUS_EXAMPLE} />
      </DocSection>

      <DocSection
        title="Intentionally Not Exposed"
        description="Public documentation does not disclose proof internals, circuit identifiers, witness data, signing infrastructure specifics, model internals, or internal service topology."
      >
        <DocCallout type="security">
          The public contract is designed to be verifier-friendly without revealing
          implementation details that would widen the attack surface.
        </DocCallout>
      </DocSection>

      <DocSection title="Claims Boundary">
        <ClaimsBoundaryPanel />
      </DocSection>
    </DocLayoutShell>
  );
}
