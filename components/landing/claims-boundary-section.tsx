"use client";

import { Scale, ShieldAlert } from "lucide-react";

export function ClaimsBoundarySection() {
  return (
    <section
      id="claims-boundary"
      className="relative border-y border-foreground/10 bg-foreground/[0.015] py-20 lg:py-24"
    >
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="max-w-4xl">
          <span className="mb-6 inline-flex items-center gap-3 font-mono text-sm text-muted-foreground">
            <Scale className="h-4 w-4" />
            Claims Boundary
          </span>
          <h2 className="text-4xl font-display tracking-tight lg:text-5xl">
            Claims Boundary
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground lg:text-xl">
            TrustSignal provides signed verification receipts, verification
            signals, and verifiable provenance metadata so teams can run later
            integrity checks in existing workflows.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="border border-foreground/10 bg-background p-6">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              TrustSignal provides
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
              <li>Signed verification receipts</li>
              <li>Verification signals</li>
              <li>Verifiable provenance metadata</li>
            </ul>
          </div>

          <div className="border border-foreground/10 bg-background p-6">
            <p className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <ShieldAlert className="h-3.5 w-3.5" />
              TrustSignal does not provide
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
              <li>Legal determinations</li>
              <li>Compliance certification</li>
              <li>Fraud adjudication</li>
              <li>Replacement for the system of record</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
