import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";
import { DocsIndexCard } from "./_components";

export const metadata: Metadata = createPageMetadata({
  title: "Developer Docs",
  description:
    "TrustSignal developer documentation for API usage, verification workflows, security model, threat model, and architecture fit.",
  path: "/docs",
  keywords: ["TrustSignal docs", "developer docs", "verification API"],
});

export default function DocsPage() {
  return (
    <div>
      <p className="mb-4 font-mono text-sm uppercase tracking-[0.18em] text-muted-foreground">
        For Developers
      </p>
      <h1 className="text-4xl font-display tracking-tight lg:text-6xl">Documentation</h1>
      <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground lg:text-xl">
        Use these pages to evaluate TrustSignal integration patterns, verification
        lifecycle behavior, and security boundaries without exposing proprietary
        implementation internals.
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <DocsIndexCard
          href="/docs/api"
          title="API Overview"
          description="Core endpoints for verification, receipt retrieval, status checks, and lifecycle actions."
        />
        <DocsIndexCard
          href="/docs/verification-example"
          title="Quick Verification Example"
          description="Reference request and response flow for issuing and checking verification receipts."
        />
        <DocsIndexCard
          href="/docs/security-model"
          title="Security Model"
          description="Public security assumptions, controls, and operational boundaries for integrations."
        />
        <DocsIndexCard
          href="/docs/threat-model"
          title="Threat Model"
          description="High-level threat categories and mitigation patterns at API and workflow boundaries."
        />
        <DocsIndexCard
          href="/docs/architecture"
          title="Architecture"
          description="How TrustSignal operates as an integrity layer for existing workflows and systems of record."
        />
      </div>
    </div>
  );
}
