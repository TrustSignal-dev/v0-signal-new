"use client";

export function FeedbackForm() {
  return (
    <form
      action="https://formspree.io/f/mqeyvedk"
      method="POST"
      className="space-y-5 border border-foreground/10 bg-background p-8 shadow-[0_24px_80px_rgba(0,0,0,0.06)]"
    >
      <label className="block space-y-2">
        <span className="text-sm font-medium">Name</span>
        <input
          type="text"
          name="name"
          required
          autoComplete="name"
          placeholder="Your name"
          className="h-12 w-full border border-foreground/15 bg-background px-4 text-sm outline-none transition focus:border-foreground"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium">Email</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="name@company.com"
          className="h-12 w-full border border-foreground/15 bg-background px-4 text-sm outline-none transition focus:border-foreground"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium">Feedback</span>
        <textarea
          name="message"
          required
          rows={5}
          placeholder="Share your feedback, questions, or ideas…"
          className="w-full resize-none border border-foreground/15 bg-background px-4 py-3 text-sm outline-none transition focus:border-foreground"
        />
      </label>

      <div className="space-y-3 pt-2">
        <button
          type="submit"
          className="h-12 w-full rounded-full bg-foreground px-6 text-sm font-medium text-background transition hover:bg-foreground/90"
        >
          Send feedback
        </button>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Submissions are read by the TrustSignal team. We may follow up by email.
        </p>
      </div>
    </form>
  );
}
