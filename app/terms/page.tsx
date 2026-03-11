import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Terms of Use",
  description:
    "Read the TrustSignal website terms covering site usage, ownership, pilot discussions, and intellectual property rights.",
  path: "/terms",
  keywords: [
    "TrustSignal terms",
    "website terms of use",
    "pilot evaluation terms",
  ],
});

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-20 lg:px-12 lg:py-28">
      <p className="mb-4 font-mono text-sm uppercase tracking-[0.18em] text-muted-foreground">
        Terms
      </p>
      <h1 className="mb-8 text-4xl font-display tracking-tight lg:text-6xl">
        Website terms of use.
      </h1>
      <div className="space-y-8 text-base leading-relaxed text-muted-foreground">
        <section>
          <h2 className="mb-3 text-xl font-medium text-foreground">Use of site</h2>
          <p>
            This website is provided for informational and pilot evaluation
            purposes. Access to the site does not grant any right to TrustSignal
            source code, implementation details, private data, or deployment
            infrastructure.
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-xl font-medium text-foreground">No license granted</h2>
          <p>
            Except where TrustSignal expressly states otherwise in writing, no
            license or other right is granted to reproduce, distribute, reverse
            engineer, or create derivative works from TrustSignal materials.
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-xl font-medium text-foreground">Pilot discussions</h2>
          <p>
            Website content does not create a service commitment, partnership,
            warranty, or regulatory certification. Any pilot or commercial terms
            must be set out in a separate written agreement.
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-xl font-medium text-foreground">Ownership</h2>
          <p>
            TrustSignal branding, copy, diagrams, and technical descriptions are
            proprietary and remain the exclusive property of TrustSignal and its
            licensors.
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-xl font-medium text-foreground">Contact</h2>
          <p>
            Questions about these terms can be sent to info@trustsignal.dev.
          </p>
        </section>
      </div>
    </main>
  );
}
