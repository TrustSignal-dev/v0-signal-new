"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SignInForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const fd = new FormData(e.currentTarget);
    const email = (fd.get("email") as string).trim();
    const password = fd.get("password") as string;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        if (res.status === 401 || res.status === 403) {
          setError("Invalid email or password.");
        } else {
          setError(data.error ?? "Sign in failed. Please try again.");
        }
        setIsSubmitting(false);
        return;
      }

      router.refresh();
      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <section className="border-t border-foreground/10 bg-foreground/[0.015] py-24 lg:py-32">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:px-12">
        <div>
          <span className="mb-6 inline-flex items-center gap-3 font-subtitle text-sm uppercase tracking-[0.18em] text-muted-foreground">
            Sign In
          </span>
          <h1 className="mb-6 text-4xl font-display tracking-tight lg:text-6xl">
            Sign in to TrustSignal.
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground lg:text-xl">
            Sign in to manage your API keys and machine clients.
          </p>
        </div>

        <div className="border border-foreground/10 bg-background p-8 shadow-[0_24px_80px_rgba(0,0,0,0.06)] lg:p-10">
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
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
                className="h-12 rounded-none border-foreground/15"
                placeholder="Your password"
                autoComplete="current-password"
              />
            </Field>

            {error ? <p className="text-sm text-red-700">{error}</p> : null}

            <div className="space-y-3 pt-2">
              <Button
                asChild
                variant="outline"
                className="h-12 w-full rounded-full"
              >
                <a href="/auth/sign-in?provider=google&next=%2Fdashboard">
                  Continue with Google
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 w-full rounded-full"
              >
                <a href="/auth/sign-in?provider=github&next=%2Fdashboard">
                  Continue with GitHub
                </a>
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-12 w-full rounded-full bg-foreground text-background hover:bg-foreground/90"
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                No account?{" "}
                <a href="/sign-up" className="underline underline-offset-4">
                  Create one
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
