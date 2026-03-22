import type { Metadata } from "next";
import Link from "next/link";
import type { ComponentType } from "react";
import { Block, HighlightedCodeBlock, parseRoot } from "codehike/blocks";
import { Pre } from "codehike/code";
import { z } from "zod";
import { createPageMetadata } from "@/lib/seo";
import { TRUSTSIGNAL_GITHUB_URL } from "@/lib/site";
import {
  ClaimsBoundaryPanel,
  DocCallout,
  DocDiagram,
  DocFooterLinks,
  DocHeader,
  DocSection,
} from "../docs/_components";

const WalkthroughStepSchema = Block.extend({
  narration: z.string(),
  takeaway: z.string(),
  code: HighlightedCodeBlock,
});

const PartnerConceptSchema = Block.extend({
  eyebrow: z.string(),
  privateNote: z.string(),
  summary: z.string(),
  context: z.string(),
  integration: z.string(),
  whyPartner: z.string(),
  talkTrack: z.string(),
  productionNote: z.string(),
  steps: z.array(WalkthroughStepSchema),
});

const diagramSteps = [
  "Evidence Artifact",
  "Integrity Check Request",
  "Integrity Verification Signals",
  "Signed Verification Receipt",
  "Evidence Record Association",
  "Later Review",
  "Drift / Mismatch Detection",
];

type MDXModule = ComponentType<Record<string, unknown>>;

export function createPartnerMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    ...createPageMetadata({
      title,
      description,
      path,
      keywords: ["partner integration concept", "signed verification receipts"],
    }),
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
      },
    },
  };
}

function getCodeLabel(meta: string) {
  return meta.replace(/^!code\s*/, "").trim() || "example.json";
}

function RichText({ children }: { children: React.ReactNode }) {
  return (
    <div className="[&>p]:text-sm [&>p]:leading-7 [&>p]:text-muted-foreground [&>p+p]:mt-3">
      {children}
    </div>
  );
}

function CodeHikePanel({
  code,
  caption,
}: {
  code: z.infer<typeof HighlightedCodeBlock>;
  caption: string;
}) {
  return (
    <div className="overflow-hidden rounded-[1.25rem] border border-border/60 bg-[#0d1117] shadow-[0_20px_60px_-30px_rgba(15,23,42,0.55)]">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-white/[0.03] px-4 py-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/60">
            {getCodeLabel(code.meta)}
          </p>
          <p className="mt-1 text-xs text-white/45">{caption}</p>
        </div>
        <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-white/50">
          {code.lang}
        </span>
      </div>

      <div className="overflow-x-auto p-4">
        <Pre
          code={code}
          className="min-w-max bg-transparent text-[13px] leading-6 text-white"
          style={code.style}
        />
      </div>
    </div>
  );
}

export function PartnerConceptPage({
  audience,
  title,
  content,
  partnerLabel,
}: {
  audience: string;
  title: string;
  content: MDXModule;
  partnerLabel: string;
}) {
  const demo = parseRoot(content as never, PartnerConceptSchema);

  return (
    <div className="mx-auto max-w-6xl">
      <DocHeader
        eyebrow={demo.eyebrow}
        title={title}
        description={demo.summary}
        audience={audience}
      />

      <div className="mb-6 flex">
        <span className="rounded-full border border-amber-500/20 bg-amber-500/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600/90">
          Experimental Concept
        </span>
      </div>

      <div className="mb-8 rounded-2xl border border-amber-500/30 bg-amber-500/8 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-900/80">
          Private Partner Integration Concept
        </p>
        <p className="mt-2 text-sm leading-7 text-foreground/85">{demo.privateNote}</p>
      </div>

      <section className="mb-10 overflow-hidden rounded-[1.75rem] border border-border/60 bg-[linear-gradient(135deg,rgba(15,23,42,0.035),rgba(15,23,42,0.01))]">
        <div className="grid gap-8 px-6 py-7 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)] lg:px-8">
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {partnerLabel} remains the system of record
              </span>
              <span className="rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Integrity verification signals
              </span>
              <span className="rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Signed verification receipts
              </span>
            </div>

            <p className="max-w-3xl text-base leading-7 text-muted-foreground">
              This walkthrough keeps the workflow narrow and claims-boundary-safe:
              {partnerLabel} manages the evidence record, while TrustSignal performs
              an integrity check, returns integrity verification signals, issues a
              signed verification receipt, and supports later comparison against the
              previously checked artifact state.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-border/60 bg-background/80 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Demo Flow
            </p>
            <ol className="mt-4 space-y-3">
              {diagramSteps.slice(0, 5).map((step, index) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border border-border/60 text-[11px] font-medium text-foreground">
                    {index + 1}
                  </span>
                  <span className="text-sm leading-6 text-muted-foreground">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <DocSection title="Problem / Context" description={demo.context}>
        <DocCallout type="info">
          <p className="font-medium text-foreground">Why this matters for {partnerLabel}</p>
          <p className="mt-2">{demo.whyPartner}</p>
        </DocCallout>
      </DocSection>

      <DocSection title="Integration Model" description={demo.integration}>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-border/60 bg-background/80 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              1. {partnerLabel}
            </p>
            <p className="mt-3 text-lg font-medium text-foreground">
              Workflow and system of record
            </p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {partnerLabel} continues to own the evidence record, the workflow state,
              and the operator experience.
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-muted/25 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              2. TrustSignal
            </p>
            <p className="mt-3 text-lg font-medium text-foreground">
              Integrity layer for existing workflows
            </p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              TrustSignal performs the integrity check, returns integrity verification
              signals, and issues a signed verification receipt without replacing the
              partner workflow.
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/80 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              3. Later review
            </p>
            <p className="mt-3 text-lg font-medium text-foreground">
              Later comparison against prior state
            </p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Reviewers can compare the artifact presented later against the
              previously checked state and detect drift or mismatch before relying on
              the record.
            </p>
          </div>
        </div>

        <DocCallout type="warning">
          <p className="font-medium text-foreground">Production Note</p>
          <p className="mt-2">{demo.productionNote}</p>
        </DocCallout>
      </DocSection>

      <DocSection
        title="Code Hike Walkthrough"
        description={`This partner walkthrough follows the same technical story for ${partnerLabel}: evidence remains in the partner workflow, TrustSignal performs an integrity check, and later review can compare against the previously checked artifact state.`}
      >
        <DocCallout type="info">
          <p className="font-medium text-foreground">Companion Talk Track</p>
          <p className="mt-2">{demo.talkTrack}</p>
        </DocCallout>

        <div className="space-y-6">
          {demo.steps.map((step, index) => (
            <article
              key={step.title}
              className="overflow-hidden rounded-[1.75rem] border border-border/60 bg-background/85"
            >
              <div className="grid gap-0 lg:grid-cols-[minmax(0,0.9fr)_minmax(340px,1.1fr)]">
                <div className="border-b border-border/60 p-6 lg:border-b-0 lg:border-r">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-muted/35 text-xs font-semibold text-foreground">
                      {index + 1}
                    </span>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      Step {index + 1}
                    </p>
                  </div>

                  <h3 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
                    {step.title}
                  </h3>

                  <div className="mt-4 space-y-4">
                    <RichText>{step.children}</RichText>

                    <div className="rounded-2xl border border-border/60 bg-muted/25 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Live narration
                      </p>
                      <p className="mt-2 text-sm leading-7 text-foreground/90">
                        {step.narration}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-border/60 bg-background p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        What the step proves
                      </p>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">
                        {step.takeaway}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-[linear-gradient(180deg,rgba(15,23,42,0.03),rgba(15,23,42,0.01))] p-4 sm:p-6">
                  <CodeHikePanel
                    code={step.code}
                    caption="Code Hike renders the technical companion to the walkthrough narrative."
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      </DocSection>

      <DocSection
        title="Diagram"
        description="The integration remains narrow and claims-boundary-safe: the partner platform keeps the workflow, and TrustSignal adds integrity-oriented outputs around the evidence artifact."
      >
        <DocDiagram title={`${partnerLabel} Evidence Flow`} steps={diagramSteps} />
      </DocSection>

      <DocSection
        title="Claims Boundary"
        description="These partner pages are integration concepts and walkthrough materials. They are not public product claims or announced native integrations."
      >
        <div className="space-y-4">
          <ClaimsBoundaryPanel />
          <DocCallout type="security">
            <p className="font-medium text-foreground">What stays private</p>
            <p className="mt-2">
              Public-facing materials do not expose proof internals, circuit
              identifiers, witness data, model internals, signing infrastructure
              specifics, or internal service topology.
            </p>
          </DocCallout>
        </div>
      </DocSection>

      <div className="mb-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Link
          href="/docs/verification"
          className="rounded-2xl border border-border/60 bg-background/80 p-5 transition-colors hover:bg-muted/30"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Verification
          </p>
          <p className="mt-3 text-lg font-medium text-foreground">
            Public verification lifecycle
          </p>
        </Link>

        <Link
          href="/docs/api"
          className="rounded-2xl border border-border/60 bg-background/80 p-5 transition-colors hover:bg-muted/30"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            API
          </p>
          <p className="mt-3 text-lg font-medium text-foreground">
            Public API overview
          </p>
        </Link>

        <Link
          href="/docs/security"
          className="rounded-2xl border border-border/60 bg-background/80 p-5 transition-colors hover:bg-muted/30"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Security
          </p>
          <p className="mt-3 text-lg font-medium text-foreground">
            Public security model
          </p>
        </Link>

        <a
          href={TRUSTSIGNAL_GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          className="rounded-2xl border border-border/60 bg-background/80 p-5 transition-colors hover:bg-muted/30"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Repository
          </p>
          <p className="mt-3 text-lg font-medium text-foreground">
            Main TrustSignal repo
          </p>
        </a>
      </div>

      <DocFooterLinks
        links={[
          { href: "/docs/verification", label: "Verification Lifecycle" },
          { href: "/docs/api", label: "API" },
          { href: "/docs/security", label: "Security Model" },
          { href: "/#pilot-request", label: "Pilot Request" },
        ]}
      />
    </div>
  );
}
