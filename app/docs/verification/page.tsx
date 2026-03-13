import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";
import { CURL_EXAMPLE, EVALUATOR_ENTRY_URL, LIFECYCLE_STEPS, RECEIPT_EXAMPLE, STATUS_EXAMPLE, TAMPERED_REJECTION } from "../content";
import {
  AnimatedLifecycle,
  ClaimsBoundaryPanel,
  DocCallout,
  DocCodeBlock,
  DocFooterLinks,
  DocHeader,
  DocSection,
} from "../_components";

export const metadata: Metadata = createPageMetadata({
  title: "Quick Verification",
  description:
    "Quick TrustSignal verification example with request/response fields, lifecycle context, and production readiness notes.",
  path: "/docs/verification",
  keywords: ["quick verification", "verification signals", "signed verification receipts"],
});

const fieldNotes = [
  ["receiptId", "Unique receipt reference for retrieval, status checks, and lifecycle actions."],
  ["receiptHash", "Stable hash of the canonical receipt payload used for later verification."],
  ["receiptSignature", "Signed receipt metadata returned with the verification response."],
  ["inputsCommitment", "Canonical commitment to the verified request inputs."],
] as const;

export default function VerificationPage() {
  return (
    <div className="space-y-8">
      <DocHeader
        title="Verification Lifecycle"
        description="This page shows the public verification lifecycle from artifact submission through signed verification receipts, later verification, and tamper detection."
        audience="Partner Engineers"
      />

      <DocSection
        title="Problem / Context"
        description="Verification should remain understandable during audit review, not only at the moment of initial submission."
      >
        <p className="text-sm leading-relaxed text-muted-foreground">
          The evaluator path focuses on workflows where artifact tampering, provenance loss, and stale evidence matter after collection.
        </p>
      </DocSection>

      <DocSection
        title="Integrity Model"
        description="TrustSignal accepts a verification request, returns verification signals, issues signed verification receipts, and supports later verification."
      >
        <DocCallout type="info">
          Want the full technical evaluation path? Start with the repo-side evaluator entry point.
        </DocCallout>
        <div className="mt-4">
          <a
            href={EVALUATOR_ENTRY_URL}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-foreground underline underline-offset-4"
          >
            Start here
          </a>
        </div>
      </DocSection>

      <DocSection title="How It Works" description="The lifecycle stays explicit so downstream teams can store the receipt and re-run later verification when needed.">
        <AnimatedLifecycle
          title="Verification Lifecycle"
          description="The active step progresses as you scroll so evaluators can read the full flow without losing the current lifecycle state."
          steps={LIFECYCLE_STEPS}
        />
      </DocSection>

      <DocSection
        title="Example / Diagram"
        description="Start with the repo-side evaluator entry point for the problem framing, verification lifecycle, public API contract, example payloads, and security / claims boundary."
      >
        <div className="space-y-5">
          <DocCodeBlock label="Example Request" code={CURL_EXAMPLE} />
          <DocCodeBlock label="Example Response" code={RECEIPT_EXAMPLE} />
          <div className="space-y-3">
            {fieldNotes.map(([field, note]) => (
              <div key={field} className="grid gap-2 border border-foreground/10 bg-foreground/[0.02] p-4 md:grid-cols-[180px_minmax(0,1fr)]">
                <p className="font-mono text-sm text-foreground/85">{field}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{note}</p>
              </div>
            ))}
          </div>
        </div>
      </DocSection>

      <DocSection
        title="Production Considerations"
        description="Production environments should treat later verification as a distinct operational step before relying on an earlier result."
      >
        <div className="space-y-5">
          <DocCallout type="warning">
            Use scoped authentication, environment-specific configuration, lifecycle monitoring, and explicit verification checks before relying on prior results.
          </DocCallout>
          <DocCodeBlock label="Later Verification Status" code={STATUS_EXAMPLE} />
          <DocCodeBlock label="Tamper Detection Example" code={TAMPERED_REJECTION} />
        </div>
      </DocSection>

      <DocSection
        title="Security and Claims Boundary"
        description="This evaluator path is public-safe and intentionally excludes internal verification implementation details."
      >
        <div className="space-y-4">
          <DocCallout type="security">
            Later verification returns status and integrity signals, not internal proof-system detail, witness data, or signing infrastructure specifics.
          </DocCallout>
          <ClaimsBoundaryPanel />
        </div>
      </DocSection>

      <DocFooterLinks
        links={[
          { href: "/docs/api", label: "API" },
          { href: "/docs/security", label: "Security Model" },
          { href: "/docs/architecture", label: "Architecture" },
        ]}
      />
    </div>
  );
}
