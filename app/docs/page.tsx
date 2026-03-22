import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { TRUSTSIGNAL_GITHUB_URL } from "@/lib/site";
import { createPageMetadata } from "@/lib/seo";
import { DEVELOPER_JOURNEY, EVALUATOR_ENTRY_URL, LIFECYCLE_STEPS } from "./content";
import {
  AnimatedLifecycle,
  ClaimsBoundaryPanel,
  DocCallout,
  DocDiagram,
  DocFooterLinks,
  DocHeader,
  DocSection,
} from "./_components";

export const metadata: Metadata = createPageMetadata({
  title: "Developer Documentation",
  description:
    "TrustSignal developer documentation for verification APIs, signed verification receipts, verification signals, and integration workflows.",
  path: "/docs",
  keywords: [
    "TrustSignal docs",
    "signed verification receipts",
    "verification signals",
    "verifiable provenance",
  ],
});

export default function DocsPage() {
  return (
    <div className="space-y-8">
      <DocHeader
        title="TrustSignal Documentation"
        description="Professional evaluator-facing documentation for the verification lifecycle, public API contract, security model, and architecture fit inside existing workflows."
        audience="Technical Evaluators"
      />

      <DocSection
        title="Problem / Context"
        description="High-loss workflows need a durable way to detect artifact tampering, provenance drift, and stale evidence after collection."
      >
        <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
          <li>Evidence tampering after collection</li>
          <li>Artifact substitution attacks in workflow handoffs</li>
          <li>Provenance loss across compliance and audit systems</li>
          <li>Stale evidence during later review</li>
          <li>Documentation chains that cannot be verified later</li>
        </ul>
      </DocSection>

      <DocSection
        title="Integrity Model"
        description="TrustSignal operates as an integrity layer for existing workflow integration. It returns signed verification receipts, verification signals, verifiable provenance, and later verification capability."
      >
        <DocCallout type="info">
          The developer journey is structured as problem, verification lifecycle, try the API, API example, and related documentation.
        </DocCallout>
      </DocSection>

      <DocSection title="How It Works" description="The evaluator path should be understandable in one scan before you open the API example pages.">
        <DocDiagram title="Developer Journey Flow" steps={[...DEVELOPER_JOURNEY]} />
      </DocSection>

      <DocSection title="Example / Diagram" description="This lifecycle view mirrors the public contract and the repo-side evaluator start path.">
        <AnimatedLifecycle
          title="Verification Lifecycle"
          description="Submit artifact material, receive verification signals and a signed verification receipt, store the receipt with your workflow record, and run later verification when trust conditions matter."
          steps={LIFECYCLE_STEPS}
        />
      </DocSection>

      <DocSection title="Production Considerations" description="The evaluator path is intentionally narrow. Production integration still requires explicit authentication, environment configuration, and lifecycle monitoring.">
        <div className="grid gap-4 md:grid-cols-2">
          <Link href="/docs/verification" className="group border border-foreground/10 bg-foreground/[0.02] p-5 text-sm transition-colors hover:border-foreground/20">
            <div className="flex items-center justify-between gap-4">
              <span>Try the Verification Lifecycle</span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </div>
          </Link>
          <Link href="/docs/api" className="group border border-foreground/10 bg-foreground/[0.02] p-5 text-sm transition-colors hover:border-foreground/20">
            <div className="flex items-center justify-between gap-4">
              <span>Review the API Overview</span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </div>
          </Link>
          <Link
            href={EVALUATOR_ENTRY_URL}
            className="group border border-foreground/10 bg-background p-5 text-sm transition-colors hover:border-foreground/20"
          >
            <div className="flex items-center justify-between gap-4">
              <span>Open Verification Lifecycle</span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </div>
          </Link>
          <a
            href={TRUSTSIGNAL_GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="group border border-foreground/10 bg-background p-5 text-sm transition-colors hover:border-foreground/20"
          >
            <div className="flex items-center justify-between gap-4">
              <span>View GitHub Repository</span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </div>
          </a>
        </div>
      </DocSection>

      <DocSection title="Security and Claims Boundary" description="Evaluators should understand the public contract and the explicit claims boundary before relying on the output model.">
        <div className="space-y-4">
          <ClaimsBoundaryPanel />
          <DocCallout type="security">
            Public documentation does not expose proof internals, circuit identifiers, witness data, signing infrastructure specifics, model internals, or internal service topology.
          </DocCallout>
        </div>
      </DocSection>

      <DocFooterLinks
        links={[
          { href: "/docs/verification", label: "Verification Lifecycle" },
          { href: "/docs/api", label: "API" },
          { href: "/docs/security", label: "Security Model" },
          { href: "/docs/architecture", label: "Architecture" },
        ]}
      />
    </div>
  );
}
