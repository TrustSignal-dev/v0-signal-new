import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata } from "@/lib/seo";
import {
  ClaimsBoundaryPanel,
  DocCallout,
  DocCodeBlock,
  DocFooterLinks,
  DocHeader,
  DocLayoutShell,
  DocSection,
} from "../_components";
import { CURL_EXAMPLE, VERIFICATION_RESPONSE } from "../content";

const API_ROUTES = [
  {
    route: "POST /verify",
    detail:
      "Submit an artifact or artifact reference and receive verification signals plus a signed verification receipt.",
  },
  {
    route: "GET /receipt/:id",
    detail:
      "Retrieve a previously issued verification receipt for downstream storage, review, or audit use.",
  },
  {
    route: "GET /status/:id",
    detail:
      "Check current lifecycle status before relying on an earlier verification result.",
  },
  {
    route: "POST /receipt/:id/revoke",
    detail:
      "Revoke a receipt when lifecycle governance requires the prior verification output to be invalidated.",
  },
];

export const metadata: Metadata = createPageMetadata({
  title: "API Overview",
  description:
    "Public TrustSignal API overview for verification requests, signed verification receipts, lifecycle status checks, and evaluator-friendly integration guidance.",
  path: "/docs/api",
  keywords: [
    "TrustSignal API",
    "verification API",
    "signed verification receipts",
    "verification lifecycle",
  ],
});

export default function ApiPage() {
  return (
    <DocLayoutShell>
      <DocHeader
        eyebrow="Developer Docs"
        title="API Overview"
        description="TrustSignal exposes a narrow public API for verification requests, signed verification receipts, lifecycle status checks, and related evaluator workflows."
        audience="Developers and technical evaluators"
      />

      <DocSection
        title="Problem / Context"
        description="Compliance evidence can be collected correctly and still become harder to trust later if provenance is unclear or the artifact is challenged after collection."
      >
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
          TrustSignal addresses that problem by returning verifiable outputs that can
          travel with the artifact. The upstream platform still owns workflow state,
          user actions, and the system of record.
        </p>
      </DocSection>

      <DocSection
        title="Integrity Model"
        description="The public surface returns verification signals, signed verification receipts, and later verification outputs that can be stored alongside the system-of-record entry."
      >
        <DocCallout type="info">
          TrustSignal is an integrity layer. The upstream platform still owns workflow
          state, user actions, and the system of record.
        </DocCallout>
      </DocSection>

      <DocSection
        title="How It Works"
        description="A typical integration submits an artifact or artifact reference, stores the signed verification receipt, and checks lifecycle state before relying on prior results."
      >
        <div className="grid gap-3 md:grid-cols-2">
          {API_ROUTES.map(({ route, detail }) => (
            <div
              key={route}
              className="grid gap-2 rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-4"
            >
              <p className="font-mono text-sm text-foreground/85">{route}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{detail}</p>
            </div>
          ))}
        </div>
      </DocSection>

      <DocSection
        title="Example Request / Response"
        description="These examples illustrate the public verification lifecycle using evaluator-safe payloads and response fields."
      >
        <div className="space-y-5">
          <DocCodeBlock label="Example Request" code={CURL_EXAMPLE} />
          <DocCodeBlock label="Example Response" code={VERIFICATION_RESPONSE} />
        </div>
      </DocSection>

      <DocSection
        title="Production Considerations"
        description="Production deployment requires explicit authentication, environment configuration, lifecycle monitoring, and verification checks before relying on prior results."
      >
        <DocCallout type="warning">
          Authentication and lifecycle monitoring should be explicit, and later
          verification or status checks should be part of the normal integration path.
          The quick evaluator flow is intentionally lighter than production deployment.
        </DocCallout>
      </DocSection>

      <DocSection
        title="Security and Claims Boundary"
        description="The public contract is intentionally narrow and excludes internal implementation details."
      >
        <div className="space-y-5">
          <DocCallout type="security">
            Proof internals, witness data, signing infrastructure specifics, and
            internal service topology are intentionally not exposed through the public
            contract.
          </DocCallout>
          <ClaimsBoundaryPanel />
        </div>
      </DocSection>

      <DocFooterLinks
        links={[
          { href: "/docs/verification", label: "Quick Verification Example" },
          { href: "/docs/security", label: "Security Model" },
          { href: "/docs/threat-model", label: "Threat Model" },
          { href: "/docs/architecture", label: "Architecture" },
        ]}
      />

      <div className="mt-8 text-sm leading-6 text-muted-foreground">
        <p>
          TrustSignal is an integrity layer, not a system-of-record replacement. The
          upstream platform continues to own workflow state and evidence storage.
        </p>
        <p className="mt-3">
          Continue to{" "}
          <Link href="/docs/verification" className="text-foreground underline">
            Quick Verification Example
          </Link>{" "}
          for a lifecycle walkthrough or{" "}
          <Link href="/docs/security" className="text-foreground underline">
            Security Model
          </Link>{" "}
          for public security controls.
        </p>
      </div>
    </DocLayoutShell>
  );
}
