"use client";

import { useState } from "react";
import { Github, Mail, ShieldCheck } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const accessMethodSchema = z.enum(["github", "email"]);

const developerAccessSchema = z
  .object({
    accessMethod: accessMethodSchema,
    fullName: z.string().trim().min(2, "Enter your full name."),
    company: z.string().trim().min(2, "Enter your company name."),
    role: z.string().trim().min(2, "Enter your role or title."),
    email: z.string().trim().email("Enter a valid work email."),
    phone: z.string().trim().optional(),
    githubUsername: z.string().trim().optional(),
    githubProfileUrl: z
      .string()
      .trim()
      .url("Enter a valid GitHub profile URL.")
      .optional()
      .or(z.literal("")),
    useCase: z.string().trim().min(12, "Describe what you want to verify."),
  })
  .superRefine((value, ctx) => {
    if (value.accessMethod === "github" && !value.githubUsername?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["githubUsername"],
        message: "Enter your GitHub username.",
      });
    }
  });

type DeveloperAccessValues = z.infer<typeof developerAccessSchema>;

const accessOptions = [
  {
    value: "github" as const,
    label: "GitHub access",
    description:
      "Use your GitHub identity for access review and account provisioning prep.",
    icon: Github,
  },
  {
    value: "email" as const,
    label: "Email signup",
    description:
      "Request access manually with your work email and company details.",
    icon: Mail,
  },
];

export function DeveloperAccessRequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<DeveloperAccessValues>({
    resolver: zodResolver(developerAccessSchema),
    defaultValues: {
      accessMethod: "github",
      fullName: "",
      company: "",
      role: "",
      email: "",
      phone: "",
      githubUsername: "",
      githubProfileUrl: "",
      useCase: "",
    },
  });

  const accessMethod = form.watch("accessMethod");

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/developer-access", {
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
        "The request could not be saved right now. Use the pilot request form below and TrustSignal will follow up manually.",
      );
    } finally {
      setIsSubmitting(false);
    }
  });

  if (isSubmitted) {
    return (
      <section className="border-t border-foreground/10 bg-foreground/[0.015] py-24 lg:py-32">
        <div className="mx-auto max-w-3xl px-6 lg:px-12">
          <div className="border border-foreground/10 bg-background p-8 shadow-[0_24px_80px_rgba(0,0,0,0.06)] lg:p-10">
            <p className="font-subtitle text-sm uppercase tracking-[0.18em] text-muted-foreground">
              Access Request Sent
            </p>
            <h1 className="mt-5 text-4xl font-display tracking-tight lg:text-6xl">
              We have your developer access request.
            </h1>
            <p className="mt-6 text-base leading-8 text-muted-foreground">
              TrustSignal will review the request and follow up with the next step for
              account setup and API access.
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-8 rounded-full"
              onClick={() => setIsSubmitted(false)}
            >
              Send another request
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="border-t border-foreground/10 bg-foreground/[0.015] py-24 lg:py-32">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:px-12">
        <div>
          <span className="mb-6 inline-flex items-center gap-3 font-subtitle text-sm uppercase tracking-[0.18em] text-muted-foreground">
            Developer Signup
          </span>
          <h1 className="mb-6 text-4xl font-display tracking-tight lg:text-6xl">
            Sign up for TrustSignal API access.
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground lg:text-xl">
            Request developer access here first. Once TrustSignal approves your access,
            you will receive the next step for account setup and API key issuance.
          </p>
          <div className="mt-10 space-y-4 text-sm text-muted-foreground">
            <p>Choose GitHub review if you want access tied to your GitHub identity.</p>
            <p>Choose email signup if you want the TrustSignal team to provision access manually.</p>
            <p>No payment or live credentials are requested through this form.</p>
          </div>
        </div>

        <div className="border border-foreground/10 bg-background p-8 shadow-[0_24px_80px_rgba(0,0,0,0.06)] lg:p-10">
          <form className="space-y-6" onSubmit={onSubmit} noValidate>
            <div className="grid gap-3">
              {accessOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = accessMethod === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    className={cn(
                      "flex w-full items-start gap-4 border px-5 py-4 text-left transition-colors",
                      isSelected
                        ? "border-foreground bg-foreground/[0.04]"
                        : "border-foreground/10 hover:border-foreground/30",
                    )}
                    onClick={() => form.setValue("accessMethod", option.value, { shouldValidate: true })}
                  >
                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-foreground/80" />
                    <div>
                      <p className="font-medium text-foreground">{option.label}</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Full name"
                error={form.formState.errors.fullName?.message}
                input={<Input {...form.register("fullName")} className="h-12 rounded-none border-foreground/15" placeholder="Your full name" autoComplete="name" />}
              />
              <Field
                label="Company"
                error={form.formState.errors.company?.message}
                input={<Input {...form.register("company")} className="h-12 rounded-none border-foreground/15" placeholder="Company name" autoComplete="organization" />}
              />
              <Field
                label="Role"
                error={form.formState.errors.role?.message}
                input={<Input {...form.register("role")} className="h-12 rounded-none border-foreground/15" placeholder="Engineering, security, ops..." />}
              />
              <Field
                label="Work email"
                error={form.formState.errors.email?.message}
                input={<Input {...form.register("email")} className="h-12 rounded-none border-foreground/15" placeholder="name@company.com" autoComplete="email" inputMode="email" />}
              />
            </div>

            {accessMethod === "github" ? (
              <div className="grid gap-5 md:grid-cols-2">
                <Field
                  label="GitHub username"
                  error={form.formState.errors.githubUsername?.message}
                  input={<Input {...form.register("githubUsername")} className="h-12 rounded-none border-foreground/15" placeholder="trustsignal-dev" autoComplete="username" />}
                />
                <Field
                  label="GitHub profile URL"
                  error={form.formState.errors.githubProfileUrl?.message}
                  input={<Input {...form.register("githubProfileUrl")} className="h-12 rounded-none border-foreground/15" placeholder="https://github.com/your-handle" inputMode="url" />}
                />
              </div>
            ) : null}

            <Field
              label="Phone"
              error={form.formState.errors.phone?.message}
              input={<Input {...form.register("phone")} className="h-12 rounded-none border-foreground/15" placeholder="Optional phone number" autoComplete="tel" inputMode="tel" />}
            />

            <Field
              label="What do you need access for?"
              error={form.formState.errors.useCase?.message}
              input={
                <Textarea
                  {...form.register("useCase")}
                  className="min-h-32 rounded-none border-foreground/15"
                  placeholder="Describe the integration, repo, or workflow you need API access for."
                />
              }
            />

            <div className="rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-foreground/70" />
                <p className="text-sm leading-6 text-muted-foreground">
                  GitHub is currently an access-review path, not a live OAuth account flow in this repo.
                  The request is stored privately and reviewed by the TrustSignal team before access is provisioned.
                </p>
              </div>
            </div>

            {submitError ? <p className="text-sm text-red-700">{submitError}</p> : null}

            <div className="space-y-3 pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-12 w-full rounded-full bg-foreground text-background hover:bg-foreground/90"
              >
                {isSubmitting ? "Sending request..." : "Sign up for access"}
              </Button>
              <p className="text-xs leading-relaxed text-muted-foreground">
                By sending this request, you agree that TrustSignal may contact you
                about developer onboarding, pilot planning, and integration review.
              </p>
            </div>
          </form>
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
