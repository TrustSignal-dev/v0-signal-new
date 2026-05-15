import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";
import { FeedbackForm } from "./feedback-form";

export const metadata: Metadata = createPageMetadata({
  title: "Feedback",
  description: "Share feedback about TrustSignal.",
  path: "/feedback",
  keywords: ["TrustSignal feedback"],
  noIndex: true,
});

export default function FeedbackPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-20 lg:px-12 lg:py-28">
      <p className="mb-4 font-mono text-sm uppercase tracking-[0.18em] text-muted-foreground">
        Feedback
      </p>
      <h1 className="mb-6 text-4xl font-display tracking-tight lg:text-5xl">
        Share your feedback.
      </h1>
      <p className="mb-10 text-base leading-relaxed text-muted-foreground">
        We read every submission. Use this form to share thoughts on the product,
        documentation, or integration experience.
      </p>
      <FeedbackForm />
    </main>
  );
}
