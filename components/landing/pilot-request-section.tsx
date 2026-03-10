"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { CONTACT_EMAIL } from "@/lib/site";

const pilotRequestSchema = z.object({
  name: z.string().trim().min(2, "Enter your name."),
  company: z.string().trim().min(2, "Enter your company name."),
  address: z.string().trim().min(5, "Enter a mailing address."),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z.string().trim().min(7, "Enter a phone number."),
});

type PilotRequestValues = z.infer<typeof pilotRequestSchema>;

export function PilotRequestSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<PilotRequestValues>({
    resolver: zodResolver(pilotRequestSchema),
    defaultValues: {
      name: "",
      company: "",
      address: "",
      email: "",
      phone: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/pilot-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Submission failed.");
      }

      setIsSubmitted(true);
      form.reset();
    } catch {
      setSubmitError(
        "The request could not be sent right now. Email info@trustsignal.dev and we will respond manually.",
      );
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <section
      id="pilot-request"
      className="border-t border-foreground/10 bg-foreground/[0.015] py-24 lg:py-32 scroll-mt-28"
    >
      <div className="mx-auto grid max-w-[1400px] gap-12 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:px-12">
        <div>
          <span className="mb-6 inline-flex items-center gap-3 font-mono text-sm text-muted-foreground">
            Pilot Request
          </span>
          <h2 className="mb-6 text-4xl font-display tracking-tight lg:text-6xl">
            Start a lightweight pilot or align on integration.
          </h2>
          <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground lg:text-xl">
            Share the basics and TrustSignal will follow up with next steps for a
            pilot or integration discussion. Outside reviewers can look through
            the site, but all operational access stays private.
          </p>
          <div className="mt-10 space-y-4 text-sm text-muted-foreground">
            <p>Responses are reviewed directly by the TrustSignal team.</p>
            <p>Submissions are sent to {CONTACT_EMAIL}.</p>
            <p>No payment or system access is requested through this form.</p>
          </div>
        </div>

        <div className="border border-foreground/10 bg-background p-8 shadow-[0_24px_80px_rgba(0,0,0,0.06)] lg:p-10">
          {isSubmitted ? (
            <div className="space-y-5">
              <p className="font-mono text-sm uppercase tracking-[0.18em] text-muted-foreground">
                Request Sent
              </p>
              <h3 className="text-3xl font-display tracking-tight">
                We have your information.
              </h3>
              <p className="text-base leading-relaxed text-muted-foreground">
                TrustSignal will respond within 24-48 hours with the next step
                for your pilot or integration review.
              </p>
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => setIsSubmitted(false)}
              >
                Send another request
              </Button>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={onSubmit} noValidate>
              <Field
                label="Name"
                error={form.formState.errors.name?.message}
                input={
                  <input
                    {...form.register("name")}
                    className="h-12 w-full border border-foreground/15 bg-background px-4 text-sm outline-none transition focus:border-foreground"
                    autoComplete="name"
                    placeholder="Your name"
                  />
                }
              />
              <Field
                label="Company"
                error={form.formState.errors.company?.message}
                input={
                  <input
                    {...form.register("company")}
                    className="h-12 w-full border border-foreground/15 bg-background px-4 text-sm outline-none transition focus:border-foreground"
                    autoComplete="organization"
                    placeholder="Company name"
                  />
                }
              />
              <Field
                label="Address"
                error={form.formState.errors.address?.message}
                input={
                  <input
                    {...form.register("address")}
                    className="h-12 w-full border border-foreground/15 bg-background px-4 text-sm outline-none transition focus:border-foreground"
                    autoComplete="street-address"
                    placeholder="Business address"
                  />
                }
              />
              <div className="grid gap-5 md:grid-cols-2">
                <Field
                  label="Email"
                  error={form.formState.errors.email?.message}
                  input={
                    <input
                      {...form.register("email")}
                      className="h-12 w-full border border-foreground/15 bg-background px-4 text-sm outline-none transition focus:border-foreground"
                      autoComplete="email"
                      inputMode="email"
                      placeholder="name@company.com"
                    />
                  }
                />
                <Field
                  label="Phone"
                  error={form.formState.errors.phone?.message}
                  input={
                    <input
                      {...form.register("phone")}
                      className="h-12 w-full border border-foreground/15 bg-background px-4 text-sm outline-none transition focus:border-foreground"
                      autoComplete="tel"
                      inputMode="tel"
                      placeholder="(555) 555-5555"
                    />
                  }
                />
              </div>

              {submitError ? (
                <p className="text-sm text-red-700">{submitError}</p>
              ) : null}

              <div className="space-y-3 pt-3">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 w-full rounded-full bg-foreground text-background hover:bg-foreground/90"
                >
                  {isSubmitting ? "Sending request..." : "Send pilot request"}
                </Button>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  By sending this request, you agree that TrustSignal may contact
                  you about pilot planning, integration review, and service
                  follow-up.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  error,
  input,
}: {
  label: string;
  error?: string;
  input: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium">{label}</span>
      {input}
      {error ? <span className="text-xs text-red-700">{error}</span> : null}
    </label>
  );
}
