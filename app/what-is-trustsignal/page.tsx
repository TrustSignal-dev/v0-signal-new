import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, FileCheck2, Fingerprint, Shield } from "lucide-react";
import { FooterSection } from "@/components/landing/footer-section";
import { Navigation } from "@/components/landing/navigation";
import { createPageMetadata, organizationJsonLd } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "What Is TrustSignal?",
  description:
    "Learn what TrustSignal is: evidence integrity infrastructure for compliance artifacts, signed receipts, provenance, and audit-ready verification.",
  path: "/what-is-trustsignal",
  keywords: [
    "what is trustsignal",
    "evidence integrity",
    "compliance artifact verification",
    "verifiable provenance",
  ],
});

const foundations = [
  {
    icon: Shield,
    title: "Evidence integrity",
    description:
      "TrustSignal preserves the integrity of compliance artifacts from the moment they enter review.",
  },
  {
    icon: FileCheck2,
    title: "Signed receipts",
    description:
      "Each attestation produces a signed receipt that can be stored beside the original artifact.",
  },
  {
    icon: Fingerprint,
    title: "Verifiable provenance",
    description:
      "Receipt metadata captures source, control context, and timestamps for later verification.",
  },
] as const;

export default function WhatIsTrustSignalPage() {
  return (
    <main id="top" className="relative min-h-screen overflow-x-hidden noise-overlay">
      <Navigation />

      <section className="relative overflow-hidden border-b border-foreground/10 pt-32 lg:pt-40">
        <div className="mx-auto max-w-[1400px] px-6 pb-20 lg:px-12 lg:pb-24">
          <div className="grid gap-14 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-20">
            <div>
              <span className="inline-flex items-center gap-3 font-mono text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                TrustSignal
              </span>
              <h1 className="mt-6 text-5xl font-display tracking-tight lg:text-7xl">
                What is TrustSignal?
              </h1>
              <p className="mt-8 max-w-2xl text-xl leading-relaxed text-muted-foreground">
                TrustSignal is evidence integrity infrastructure for compliance
                artifacts. It issues signed receipts at ingestion, preserves
                verifiable provenance, and gives teams a reliable way to confirm
                that an artifact still matches the record that was originally
                reviewed.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {foundations.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="border border-foreground/10 bg-foreground/[0.02] p-6"
                  >
                    <div className="flex h-11 w-11 items-center justify-center border border-foreground/15 bg-background">
                      <Icon className="h-5 w-5 text-foreground/70" />
                    </div>
                    <h2 className="mt-5 text-2xl font-display">{item.title}</h2>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-24">
        <div className="mx-auto max-w-[980px] px-6 lg:px-12">
          <div className="space-y-8 text-lg leading-relaxed text-muted-foreground">
            <p>
              At a practical level, TrustSignal sits behind an existing
              compliance workflow rather than replacing it. A platform, internal
              system, or evidence collector continues to gather documents,
              exports, and snapshots in the normal way. TrustSignal adds a
              signed receipt when the artifact is ingested, so the artifact hash
              and related metadata are recorded at the moment the record enters
              review. That receipt becomes a durable reference point for later
              verification.
            </p>

            <p>
              This matters because many compliance programs depend on artifacts
              that move through multiple systems, reviewers, and retention
              stages. Screenshots, documents, or exported control evidence can
              drift after collection, either through accidental changes or
              deliberate tampering. TrustSignal addresses that integrity gap by
              attaching signed receipts to compliance artifacts and preserving
              the provenance needed to evaluate them later. Instead of relying
              only on process history, teams can compare the current artifact to
              the receipted record and detect whether it still matches.
            </p>

            <p>
              Signed receipts are central to the product. A receipt records the
              evidence source, the artifact hash, the relevant control or review
              context, and the attestation timestamp. Because the receipt is
              signed, it can be checked independently from the original
              collection workflow. That makes TrustSignal useful for security
              reviewers, compliance buyers, partner evaluators, and technical
              teams who need a clear answer to a simple question: does the
              artifact under review still correspond to what was originally
              collected?
            </p>

            <p>
              Verifiable provenance is equally important. TrustSignal is not
              only about detecting drift; it is also about preserving the chain
              of context around an artifact so later review remains meaningful.
              Source identifiers, timestamps, and control mappings help teams
              understand where a record came from, when it entered the workflow,
              and what it was supposed to represent. That combination of
              provenance and signed receipts supports audit readiness without
              forcing organizations to replatform their evidence systems.
            </p>

            <p>
              For users who want the broader product overview, the{" "}
              <Link href="/" className="text-foreground underline underline-offset-4">
                homepage
              </Link>{" "}
              explains how TrustSignal fits alongside compliance platforms and
              internal workflows. The{" "}
              <Link
                href="/security"
                className="text-foreground underline underline-offset-4"
              >
                security overview
              </Link>{" "}
              describes the public site boundary and operational safeguards. The{" "}
              <Link
                href="/#developers"
                className="text-foreground underline underline-offset-4"
              >
                developers page
              </Link>{" "}
              is the intended destination for implementation-oriented material,
              and the public codebase is available in the{" "}
              <a
                href="https://github.com/TrustSignal-dev/TrustSignal"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-foreground underline underline-offset-4"
              >
                TrustSignal repository
                <ArrowUpRight className="h-4 w-4" />
              </a>
              .
            </p>

            <p>
              In short, TrustSignal is the integrity layer for compliance
              artifacts. It adds signed receipts, preserves verifiable
              provenance, and supports compliance artifact verification in a way
              that fits existing workflows. That definition is narrow by design:
              TrustSignal is not a replacement for your compliance platform, and
              it is not a generic document store. It is infrastructure for
              proving that important artifacts remain trustworthy after
              collection.
            </p>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />

      <FooterSection />
    </main>
  );
}
