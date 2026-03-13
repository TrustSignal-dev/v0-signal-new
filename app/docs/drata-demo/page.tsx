import type { Metadata } from "next";
import Link from "next/link";
import { Block, HighlightedCodeBlock, parseRoot } from "codehike/blocks";
import { Pre } from "codehike/code";
import { z } from "zod";
import { createPageMetadata } from "@/lib/seo";
import {
  ClaimsBoundaryPanel,
  DocCallout,
  DocDiagram,
  DocFooterLinks,
  DocHeader,
  DocLayoutShell,
  DocSection,
} from "../_components";
import { ENGINE_REPO_URL } from "../content";
import Content from "./content.mdx";

export const metadata: Metadata = createPageMetadata({
  title: "Drata + TrustSignal Demo",
  description:
    "Concept walkthrough for how TrustSignal adds signed verification receipts and later provenance checks to evidence already managed in Drata.",
  path: "/docs/drata-demo",
  keywords: [
    "Drata integration",
    "signed verification receipts",
    "evidence provenance",
    "TrustSignal demo",
  ],
});

const WalkthroughStepSchema = Block.extend({
  narration: z.string(),
  takeaway: z.string(),
  code: HighlightedCodeBlock,
});

const DrataDemoSchema = Block.extend({
  eyebrow: z.string(),
  summary: z.string(),
  context: z.string(),
  integration: z.string(),
  whyDrata: z.string(),
  talkTrack: z.string(),
  productionNote: z.string(),
  steps: z.array(WalkthroughStepSchema),
});

const demo = parseRoot(Content as never, DrataDemoSchema);

const diagramSteps = [
  "Drata Evidence Artifact",
  "TrustSignal Verification",
  "Verification Result",
  "Signed Verification Receipt",
  "Drata Evidence Record",
  "Later Audit / Review",
  "Tamper Detection",
];

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

export default function DrataDemoPage() {
  return (
    <DocLayoutShell>
      <DocHeader
        eyebrow={demo.eyebrow}
        title="Drata + TrustSignal: Verified Evidence Receipts"
        description={demo.summary}
        audience="Partner demos and technical walkthroughs"
      />

      <section className="mb-10 overflow-hidden rounded-[1.75rem] border border-border/60 bg-[linear-gradient(135deg,rgba(15,23,42,0.035),rgba(15,23,42,0.01))]">
        <div className="grid gap-8 px-6 py-7 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)] lg:px-8">
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Drata remains the system of record
              </span>
              <span className="rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Signed verification receipts
              </span>
              <span className="rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Later provenance checks
              </span>
            </div>

            <p className="max-w-3xl text-base leading-7 text-muted-foreground">
              This concept page shows how TrustSignal fits into Drata&apos;s evidence
              workflow as an integrity layer. The evidence record stays in Drata while
              TrustSignal returns verification signals, a signed verification receipt,
              and later verifiable provenance.
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

      <DocSection
        title="Problem / Context"
        description={demo.context}
      >
        <DocCallout type="info">
          <p className="font-medium text-foreground">Why this matters for Drata</p>
          <p className="mt-2">{demo.whyDrata}</p>
        </DocCallout>
      </DocSection>

      <DocSection
        title="Integration Model"
        description={demo.integration}
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-border/60 bg-background/80 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              1. Drata
            </p>
            <p className="mt-3 text-lg font-medium text-foreground">
              Workflow and system of record
            </p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Drata continues to own the evidence record, the surrounding control
              workflow, and the operator experience.
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
              TrustSignal receives the artifact or artifact reference, evaluates it,
              and returns verification signals plus a signed verification receipt.
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/80 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              3. Later review
            </p>
            <p className="mt-3 text-lg font-medium text-foreground">
              Provenance can be checked again
            </p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Auditors and reviewers can verify the receipt against the artifact
              presented later and detect tampering or drift before relying on it.
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
        description="This is the live-demo path: start with the evidence already managed in Drata, send TrustSignal the artifact or reference, store the signed receipt, and verify it again later."
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
                    caption="Code Hike renders this example as the technical companion to the narrative."
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      </DocSection>

      <DocSection
        title="Diagram"
        description="The concept stays narrow: Drata manages the evidence workflow while TrustSignal returns verification outputs that can be stored and checked later."
      >
        <DocDiagram title="Drata Evidence Flow" steps={diagramSteps} />
      </DocSection>

      <DocSection
        title="Claims Boundary"
        description="This page is intentionally public-safe and keeps the integration story focused on workflow fit, signed receipts, and later provenance checks."
      >
        <div className="space-y-4">
          <ClaimsBoundaryPanel />
          <DocCallout type="security">
            <p className="font-medium text-foreground">What stays private</p>
            <p className="mt-2">
              Public documentation does not expose proof internals, witness data,
              model internals, signing infrastructure specifics, or internal service
              topology.
            </p>
          </DocCallout>
        </div>
      </DocSection>

      <div className="mb-10 grid gap-4 md:grid-cols-2">
        <Link
          href="/docs/verification"
          className="rounded-2xl border border-border/60 bg-background/80 p-5 transition-colors hover:bg-muted/30"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Next
          </p>
          <p className="mt-3 text-lg font-medium text-foreground">
            Verification lifecycle details
          </p>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            Continue into the core receipt flow, later verification, and tamper
            detection model.
          </p>
        </Link>

        <a
          href={ENGINE_REPO_URL}
          target="_blank"
          rel="noreferrer"
          className="rounded-2xl border border-border/60 bg-background/80 p-5 transition-colors hover:bg-muted/30"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Reference
          </p>
          <p className="mt-3 text-lg font-medium text-foreground">
            GitHub source-of-truth materials
          </p>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            Public contract, examples, and evaluator materials that support partner
            walkthroughs.
          </p>
        </a>
      </div>

      <DocFooterLinks
        links={[
          { href: "/docs/verification", label: "Verification Lifecycle" },
          { href: "/docs/api", label: "API" },
          { href: "/docs/security", label: "Security Model" },
          { href: "/docs/architecture", label: "Architecture" },
        ]}
      />
    </DocLayoutShell>
  );
}
