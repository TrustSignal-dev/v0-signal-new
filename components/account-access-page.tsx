import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  KeyRound,
  LogIn,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AccessPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
  steps: string[];
  callout: ReactNode;
  icon: "key" | "signin" | "signup";
};

const ICONS = {
  key: KeyRound,
  signin: LogIn,
  signup: UserPlus,
} satisfies Record<AccessPageProps["icon"], typeof KeyRound>;

export function AccountAccessPage({
  eyebrow,
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  steps,
  callout,
  icon,
}: AccessPageProps) {
  const Icon = ICONS[icon];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_40%),linear-gradient(180deg,_rgba(15,23,42,0.04),_transparent)]">
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute left-0 top-24 h-72 w-72 rounded-full bg-foreground/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-foreground/10 blur-3xl" />
      </div>

      <section className="relative mx-auto flex min-h-screen max-w-[1280px] items-center px-6 py-24 lg:px-12">
        <div className="grid w-full gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-14">
          <div className="max-w-3xl">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              TrustSignal
            </Link>

            <div className="mt-10 inline-flex items-center gap-3 rounded-full border border-foreground/10 bg-background/70 px-4 py-2 backdrop-blur">
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium">{eyebrow}</span>
            </div>

            <h1 className="mt-8 max-w-3xl text-5xl font-display leading-[0.95] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              {title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
              {description}
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-14 rounded-full bg-foreground px-8 text-background hover:bg-foreground/90"
              >
                <a href={primaryHref}>
                  {primaryLabel}
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-14 rounded-full border-foreground/15 px-8"
              >
                <Link href={secondaryHref}>
                  {secondaryLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {steps.map((step, index) => (
                <div
                  key={step}
                  className="rounded-3xl border border-foreground/10 bg-background/70 p-5 backdrop-blur"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Step {index + 1}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-foreground/80">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <Card className="border-foreground/10 bg-background/75 py-0 shadow-[0_30px_80px_rgba(15,23,42,0.10)] backdrop-blur">
            <CardHeader className="border-b border-foreground/10 py-8">
              <CardTitle className="text-2xl font-medium">Developer access</CardTitle>
              <CardDescription className="text-sm leading-6">
                Public entry points here either route into a configured authenticated TrustSignal surface or fall back to manual access review. Do not assume self-serve availability unless the deployment is configured for it.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 py-8">
              <div className="rounded-3xl border border-foreground/10 bg-foreground/[0.03] p-5">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-foreground/70" />
                  <div className="space-y-2 text-sm leading-6 text-muted-foreground">
                    {callout}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-foreground/10 p-5">
                <p className="text-sm font-medium text-foreground">What you can expect</p>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
                  <li>Public docs and marketing stay on this site.</li>
                  <li>Authenticated access may be routed here or to a separate app URL depending on deployment configuration.</li>
                  <li>If no authenticated route is deployed, onboarding should remain manual or pilot-gated.</li>
                </ul>
              </div>

              <div className="text-xs leading-5 text-muted-foreground">
                If the authenticated app URL changes later, update `NEXT_PUBLIC_TRUSTSIGNAL_APP_URL` in this repo. If it is unset, keep the public messaging here aligned to manual or pilot-gated access.
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
