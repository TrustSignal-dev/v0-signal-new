import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Shield } from "lucide-react";
import { TRUSTSIGNAL_GITHUB_URL } from "@/lib/site";
import { createPageMetadata } from "@/lib/seo";
import { ClaimsBoundaryPanel, DOCS_NAV, DocsIndexCard } from "./_components";

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
    title: "Signed verification receipts",
    description:
      "Each verification event returns a receipt that can travel with the artifact record.",
  },
  {
    title: "Verification signals",
    description:
      "Later checks produce clear signals for whether current artifacts still match prior receipts.",
  },
  {
    title: "Verifiable provenance",
    description:
      "Source and timestamp metadata stay attached to receipts for audit and review workflows.",
  },
  {
    title: "Receipt lifecycle",
    description:
      "Receipts can be checked over time with lifecycle-aware status and verification behavior.",
  },
  {
    title: "Later verification",
    description:
      "Integrations can validate evidence again before relying on prior results in high-trust workflows.",
  },
] as const;

export default function DocsPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-5">
        <p className="font-mono text-sm uppercase tracking-[0.18em] text-muted-foreground">For Developers</p>
        <h1 className="text-4xl font-display tracking-tight lg:text-6xl">TrustSignal Documentation</h1>
        <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground lg:text-xl">
          TrustSignal exposes a public verification lifecycle for teams that need
          evidence integrity infrastructure in existing workflow integration
          paths. Start here for API behavior, examples, security guidance, and
          architecture context.
        </p>
      </header>

      <section className="border border-foreground/10 bg-foreground/[0.02] p-6 lg:p-7">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">Core Concepts</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {concepts.map((concept) => (
            <article key={concept.title} className="border border-foreground/10 bg-background p-4">
              <h2 className="text-xl font-display tracking-tight">{concept.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{concept.description}</p>
            </article>
          ))}
        </div>
      </section>

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
