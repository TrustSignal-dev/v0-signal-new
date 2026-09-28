"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sanitizeNextPath } from "@/lib/auth/redirect";

export function SignUpForm({ nextPath = "/dashboard" }: { nextPath?: string } = {}) {
  const destination = sanitizeNextPath(nextPath);
  const encodedNext = encodeURIComponent(destination);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    const fd = new FormData(e.currentTarget);
    const email = (fd.get("email") as string).trim();
    const password = fd.get("password") as string;
    const confirm = fd.get("confirm") as string;
    const displayName = (fd.get("displayName") as string).trim() || undefined;

    if (password !== confirm) {
      setError("Passwords do not match.");
      setIsSubmitting(false);
      return;
    }

    try {
      const reg = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, displayName, next: destination }),
        signal: AbortSignal.timeout(15_000),
      });

      if (!reg.ok) {
        const data = await reg.json() as { error?: string };
        if (reg.status === 409) {
          setError("An account with that email already exists. Try signing in.");
        } else {
          setError(data.error ?? "Registration failed. Please try again.");
        }
        setIsSubmitting(false);
        return;
      }

      const registration = (await reg.json()) as {
        requiresEmailVerification?: boolean;
      };

      if (registration.requiresEmailVerification) {
        setMessage("Account created. Check your email to verify your account, then sign in.");
        setIsSubmitting(false);
        return;
      }

      // The signup route has already committed the authenticated session.
      window.location.assign(destination);
    } catch {
      setError("Sign-in service is temporarily unavailable. Please try again shortly.");
      setIsSubmitting(false);
    }
  }

  return (
    <section className="border-t border-foreground/10 bg-foreground/[0.015] py-24 lg:py-32">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:px-12">
        <div>
          <span className="mb-6 inline-flex items-center gap-3 font-subtitle text-sm uppercase tracking-[0.18em] text-muted-foreground">
            Developer Signup
          </span>
          <h1 className="mb-6 text-4xl font-display tracking-tight lg:text-6xl">
            Create your TrustSignal account.
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground lg:text-xl">
            Create your account to manage API access and verification receipts.
          </p>
          <div className="mt-10 space-y-4 text-sm text-muted-foreground">
            <p>Enter your email and choose a password to create your account.</p>
            <p>After confirming your email, create a named API key from your dashboard.</p>
            <p>Your full API key is shown only once. Store it securely.</p>
          </div>
        </div>

        <div className="border border-foreground/10 bg-background p-8 shadow-[0_24px_80px_rgba(0,0,0,0.06)] lg:p-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <Field label="Display name (optional)">
              <Input
                name="displayName"
                className="h-12 rounded-none border-foreground/15"
                placeholder="Jane Smith"
                autoComplete="name"
              />
            </Field>
            <Field label="Email">
              <Input
                name="email"
                type="email"
                required
                className="h-12 rounded-none border-foreground/15"
                placeholder="name@company.com"
                autoComplete="email"
                inputMode="email"
              />
            </Field>
            <Field label="Password">
              <Input
                name="password"
                type="password"
                required
                minLength={12}
                className="h-12 rounded-none border-foreground/15"
                placeholder="Min. 12 characters"
                autoComplete="new-password"
              />
            </Field>
            <Field label="Confirm password">
              <Input
                name="confirm"
                type="password"
                required
                className="h-12 rounded-none border-foreground/15"
                placeholder="Repeat your password"
                autoComplete="new-password"
              />
            </Field>

            {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
            {message ? <p role="status" className="text-sm text-emerald-700">{message}</p> : null}

            <div className="space-y-3 pt-2">
              <Button
                asChild
                variant="outline"
                className="h-12 w-full rounded-full"
              >
                <a href={`/auth/sign-in?provider=google&next=${encodedNext}`}>
                  Continue with Google
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 w-full rounded-full"
              >
                <a href={`/auth/sign-in?provider=github&next=${encodedNext}`}>
                  Continue with GitHub
                </a>
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-12 w-full rounded-full bg-foreground text-background hover:bg-foreground/90"
              >
                {isSubmitting ? "Creating account..." : "Create account"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <a href={`/sign-in?next=${encodedNext}`} className="underline underline-offset-4">
                  Sign in
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
