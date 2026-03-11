import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Privacy Notice",
  description:
    "Read the TrustSignal privacy notice for pilot inquiries, including contact data collection, usage, retention, and access controls.",
  path: "/privacy",
  keywords: [
    "TrustSignal privacy",
    "pilot inquiry privacy",
    "contact data retention",
  ],
});

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-20 lg:px-12 lg:py-28">
      <p className="mb-4 font-mono text-sm uppercase tracking-[0.18em] text-muted-foreground">
        Privacy
      </p>
      <h1 className="mb-8 text-4xl font-display tracking-tight lg:text-6xl">
        Privacy notice for pilot inquiries.
      </h1>
      <div className="space-y-8 text-base leading-relaxed text-muted-foreground">
        <section>
          <h2 className="mb-3 text-xl font-medium text-foreground">What we collect</h2>
          <p>
            TrustSignal collects the contact information you submit through the
            pilot request form, including name, company, mailing address, email,
            and phone number. This information is used only to review pilot and
            integration requests.
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-xl font-medium text-foreground">How we use it</h2>
          <p>
            Submitted information is used to respond to inquiries, evaluate pilot
            fit, and coordinate product follow-up. TrustSignal does not sell form
            submissions or use them for unrelated marketing campaigns.
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-xl font-medium text-foreground">Access and sharing</h2>
          <p>
            Access is limited to TrustSignal personnel and service providers who
            support site hosting and transactional email delivery. Data may be
            disclosed when required by law or to protect TrustSignal rights and
            service integrity.
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-xl font-medium text-foreground">Retention</h2>
          <p>
            Inquiry data is retained only as long as necessary to manage the
            business relationship, comply with legal obligations, and preserve a
            record of pilot communications.
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-xl font-medium text-foreground">Contact</h2>
          <p>
            Privacy questions can be sent to info@trustsignal.dev.
          </p>
        </section>
      </div>
    </main>
  );
}
