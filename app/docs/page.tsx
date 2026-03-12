import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Shield } from "lucide-react";
import { TRUSTSIGNAL_GITHUB_URL } from "@/lib/site";
import { createPageMetadata } from "@/lib/seo";
import { ARTIFACT_LINKS, DEVELOPER_JOURNEY, LIFECYCLE_STEPS } from "./content";
import { ClaimsBoundaryPanel, DOCS_NAV, DocsIndexCard, DiagramPanel, LifecycleCards, ResourceGrid, SectionBlock } from "./_components";

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

const concepts = [
  {
    title: "Problem",
    description:
      "High-loss workflows need a way to detect evidence tampering, artifact substitution, provenance loss, and stale evidence after collection.",
  },
  {
    title: "Verification Lifecycle",
    description:
      "TrustSignal accepts a verification request, returns verification signals, issues signed verification receipts, and supports later verification.",
  },
  {
    title: "Demo",
    description:
      "The 5-minute developer trial shows artifact intake, receipt issuance, later verification, and tampered artifact rejection in one local run.",
  },
  {
    title: "API Example",
    description:
      "OpenAPI, example payloads, and a Postman collection document the public verification lifecycle.",
  },
] as const;

export default function DocsPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-5">
        <p className="font-mono text-sm uppercase tracking-[0.18em] text-muted-foreground">For Developers</p>
        <h1 className="text-4xl font-display tracking-tight lg:text-6xl">TrustSignal Documentation</h1>
        <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground lg:text-xl">
          TrustSignal exposes a public verification lifecycle for teams that need evidence integrity infrastructure inside existing workflow integration paths. Start here for the problem class, integrity model, demo, API artifacts, and technical docs.
        </p>
      </header>

      <section className="border border-foreground/10 bg-foreground/[0.02] p-6 lg:p-7">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">Developer Journey</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {concepts.map((concept) => (
            <article key={concept.title} className="border border-foreground/10 bg-background p-4">
              <h2 className="text-xl font-display tracking-tight">{concept.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{concept.description}</p>
            </article>
          ))}
        </div>
      </section>

      <DiagramPanel title="Developer Journey Flow" steps={[...DEVELOPER_JOURNEY]} />

      <LifecycleCards title="Verification Lifecycle" steps={LIFECYCLE_STEPS} />

      <SectionBlock
        title="Why This Problem Exists"
        description="Evidence risk usually appears after collection. Review, audit, and partner workflows often rely on artifacts that have been moved, copied, or resubmitted over time."
      >
        <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
          <li>Evidence tampering after collection</li>
          <li>Artifact substitution attacks in workflow handoffs</li>
          <li>Provenance loss across compliance and audit systems</li>
          <li>Stale evidence during later review</li>
          <li>Documentation chains that cannot be verified later</li>
        </ul>
      </SectionBlock>

      <SectionBlock
        title="Integration Boundary"
        description="TrustSignal does not replace the system of record. It adds verifiable provenance and later verification capability."
      />

      <section>
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">Documentation Pages</p>
        <div className="grid gap-4 md:grid-cols-2">
          {DOCS_NAV.map((item) => (
            <DocsIndexCard
              key={item.href}
              href={item.href}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>
      </section>

      <SectionBlock
        title="Repository Artifacts"
        description="The public site mirrors the engine repository artifacts so evaluators can inspect the exact contract, payloads, and demo path."
      >
        <ResourceGrid resources={ARTIFACT_LINKS} />
      </SectionBlock>

      <section className="grid gap-4 md:grid-cols-2">
        <Link href="/security" className="border border-foreground/10 bg-background p-5 text-sm hover:border-foreground/20">
          Security Materials
        </Link>
        <a
          href={TRUSTSIGNAL_GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-between border border-foreground/10 bg-background p-5 text-sm hover:border-foreground/20"
        >
          View Repository
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </section>

      <section className="space-y-4">
        <p className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          <Shield className="h-3.5 w-3.5" />
          Claims Boundary
        </p>
        <ClaimsBoundaryPanel />
      </section>
    </div>
  );
}
