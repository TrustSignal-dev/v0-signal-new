"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
};

export const DOCS_NAV: NavItem[] = [
  { href: "/docs", label: "Overview" },
  { href: "/docs/drata-demo", label: "Drata Demo" },
  { href: "/docs/api", label: "API" },
  { href: "/docs/verification", label: "Verification" },
  { href: "/docs/security", label: "Security" },
  { href: "/docs/threat-model", label: "Threat Model" },
  { href: "/docs/architecture", label: "Architecture" },
];

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

type DocLayoutShellProps = {
  children: React.ReactNode;
};

export function DocLayoutShell({ children }: DocLayoutShellProps) {
  const pathname = usePathname();

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Developer Docs
            </p>

            <nav className="space-y-1">
              {DOCS_NAV.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/docs" && pathname?.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "block rounded-lg px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}

type DocHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  audience?: string;
};

export function DocHeader({
  title,
  description,
  eyebrow,
  audience,
}: DocHeaderProps) {
  return (
    <header className="mb-10 space-y-4">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          {eyebrow}
        </p>
      ) : null}

      <div className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {description ? (
          <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
            {description}
          </p>
        ) : null}
      </div>

      {audience ? (
        <div>
          <span className="inline-flex items-center rounded-full border border-border/60 px-3 py-1 text-xs font-medium text-muted-foreground">
            {audience}
          </span>
        </div>
      ) : null}
    </header>
  );
}

type DocSectionProps = {
  title: string;
  description?: string;
  children?: React.ReactNode;
};

export function DocSection({
  title,
  description,
  children,
}: DocSectionProps) {
  return (
    <section className="mb-10 space-y-4">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {description ? (
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {children ? <div className="space-y-4">{children}</div> : null}
    </section>
  );
}

type DocCalloutProps = {
  children: React.ReactNode;
  type?: "info" | "warning" | "security";
};

export function DocCallout({
  children,
  type = "info",
}: DocCalloutProps) {
  const toneClasses =
    type === "security"
      ? "border-emerald-500/30 bg-emerald-500/5"
      : type === "info"
      ? "border-sky-500/30 bg-sky-500/5"
      : type === "warning"
      ? "border-amber-500/30 bg-amber-500/5"
      : "border-border/60 bg-muted/30";

  return (
    <div className={cn("rounded-2xl border p-5", toneClasses)}>
      <div className="text-sm leading-6 text-muted-foreground">{children}</div>
    </div>
  );
}

type DocCodeBlockProps = {
  label?: string;
  code: string;
};

export function DocCodeBlock({ label, code }: DocCodeBlockProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-black">
      {label ? (
        <div className="border-b border-white/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-white/60">
          {label}
        </div>
      ) : null}
      <pre className="overflow-x-auto p-4 text-sm leading-6 text-white">
        <code>{code}</code>
      </pre>
    </div>
  );
}

type DocDiagramProps = {
  title: string;
  steps: string[];
};

export function DocDiagram({ title, steps }: DocDiagramProps) {
  return (
    <div className="rounded-2xl border border-border/60 bg-muted/20 p-5">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground">
          {title}
        </h3>

        <div className="grid gap-3 md:grid-cols-2">
          {steps.map((step, index) => (
            <div
              key={`${title}-${index}`}
              className="rounded-xl border border-border/60 bg-background/80 p-4"
            >
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Step {index + 1}
              </div>
              <p className="text-sm leading-6 text-foreground">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

type DocFooterLinksProps = {
  links: Array<{ href: string; label: string }>;
};

export function DocFooterLinks({ links }: DocFooterLinksProps) {
  if (!links.length) return null;

  return (
    <div className="mt-12 border-t border-border/60 pt-6">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Related Docs
      </p>
      <div className="flex flex-wrap gap-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-full border border-border/60 px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

type AnimatedLifecycleProps = {
  title: string;
  description?: string;
  steps: readonly (
    | string
    | {
        title: string;
        description?: string;
      }
  )[];
};

export function AnimatedLifecycle({
  title,
  description,
  steps,
}: AnimatedLifecycleProps) {
  return (
    <div className="rounded-2xl border border-border/60 bg-muted/20 p-5">
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground">
            {title}
          </h3>
          {description ? (
            <p className="text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {steps.map((step, index) => (
            <div
              key={`${title}-${index}`}
              className="rounded-xl border border-border/60 bg-background/80 p-4"
            >
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Stage {index + 1}
              </div>
              <p className="text-sm leading-6 text-foreground">
                {typeof step === "string" ? step : step.title}
              </p>
              {typeof step === "string" || !step.description ? null : (
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {step.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Compatibility layer for older docs pages
 */

type DocsShellProps = {
  eyebrow?: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
};

export function DocsShell({
  eyebrow,
  title,
  intro,
  children,
}: DocsShellProps) {
  return (
    <DocLayoutShell>
      <DocHeader title={title} description={intro} eyebrow={eyebrow} />
      <div>{children}</div>
    </DocLayoutShell>
  );
}

type SectionBlockProps = {
  title: string;
  description?: string;
  children?: React.ReactNode;
};

export function SectionBlock({
  title,
  description,
  children,
}: SectionBlockProps) {
  return (
    <DocSection title={title} description={description}>
      {children}
    </DocSection>
  );
}

export function ClaimsBoundaryPanel() {
  return (
    <div className="rounded-xl border border-foreground/10 bg-foreground/[0.02] p-4 text-sm leading-relaxed text-muted-foreground">
      <p className="font-medium text-foreground">Claims Boundary</p>
      <ul className="mt-2 space-y-1">
        <li>• TrustSignal provides signed verification receipts.</li>
        <li>• Returns verification signals and lifecycle status.</li>
        <li>• Enables later verification of previously checked artifacts.</li>
        <li>• Integrates with existing compliance workflows.</li>
      </ul>

      <p className="mt-3 font-medium text-foreground">Not Provided</p>
      <ul className="mt-2 space-y-1">
        <li>• Legal determinations</li>
        <li>• Fraud guarantees</li>
        <li>• Compliance certification</li>
        <li>• Replacement for system-of-record platforms</li>
      </ul>
    </div>
  );
}

type CodePanelProps = {
  label: string;
  code: string;
};

export function CodePanel({ label, code }: CodePanelProps) {
  return <DocCodeBlock label={label} code={code} />;
}

type DiagramPanelProps = {
  title: string;
  steps: string[];
};

export function DiagramPanel({ title, steps }: DiagramPanelProps) {
  return <DocDiagram title={title} steps={steps} />;
}

export function AnimatedTrustBoundary() {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 p-6 text-sm">
      <p className="mb-3 font-medium text-foreground">Trust Boundary</p>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="rounded-lg border p-3">External Systems</div>
        <div className="rounded-lg border p-3 bg-foreground/[0.05]">
          TrustSignal API
        </div>
        <div className="rounded-lg border p-3">Verification Engine</div>
      </div>

      <p className="mt-4 text-muted-foreground">
        Public integrations interact with the authenticated API boundary.
        Internal verification infrastructure remains private.
      </p>
    </div>
  );
}
