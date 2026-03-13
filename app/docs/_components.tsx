"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Check, Copy, Home, Info, ShieldAlert, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MotionReveal, usePrefersReducedMotion } from "./_motion";

export const DOCS_NAV = [
  { href: "/docs", title: "Overview", description: "Evaluator entry, problem framing, and related docs." },
  { href: "/docs/verification", title: "Verification Lifecycle", description: "Lifecycle, receipt flow, and later verification." },
  { href: "/docs/api", title: "API", description: "Public contract, example request, and response shape." },
  { href: "/docs/verification-example", title: "Verification Example", description: "Companion example route in the developer portal." },
  { href: "/docs/security", title: "Security Model", description: "Authentication, lifecycle checks, and claims boundary." },
  { href: "/docs/threat-model", title: "Threat Model", description: "Tampering, provenance loss, and audit-review risks." },
  { href: "/docs/architecture", title: "Architecture", description: "Integration boundary and existing workflow fit." },
] as const;

type DocLayoutShellProps = {
  children: ReactNode;
};

export function DocLayoutShell({ children }: DocLayoutShellProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)_220px] lg:gap-10">
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="overflow-hidden border border-foreground/10 bg-background">
          <div className="border-b border-foreground/10 bg-foreground/[0.03] p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Documentation</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Technical evaluator path for verification lifecycle, API usage, and claims boundaries.
            </p>
          </div>

          <div className="space-y-6 p-5">
            <div className="space-y-2 text-sm">
              <Link href="/docs" className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
                <BookOpen className="h-4 w-4" />
                Docs Home
              </Link>
              <Link href="/" className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
                <Home className="h-4 w-4" />
                Website Home
              </Link>
            </div>

            <nav>
              <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Sections</p>
              <ul className="space-y-2">
                {DOCS_NAV.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="block border border-transparent px-3 py-3 text-sm transition-colors hover:border-foreground/10 hover:bg-foreground/[0.03]"
                    >
                      <p className="font-medium text-foreground">{item.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </aside>

      <div className="min-w-0">{children}</div>

      <aside className="hidden lg:block lg:sticky lg:top-28 lg:self-start">
        <div className="border border-foreground/10 bg-background p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Read The Docs</p>
          <div className="mt-4 space-y-3 text-sm text-muted-foreground">
            <p>Start with the problem and context.</p>
            <p>Move through the integrity model and lifecycle.</p>
            <p>Use the example and production notes to evaluate integration fit.</p>
          </div>
        </div>
      </aside>
    </div>
  );
}

export function DocHeader({
  title,
  description,
  audience,
}: {
  title: string;
  description: string;
  audience?: string;
}) {
  return (
    <MotionReveal>
      <header className="space-y-5 border border-foreground/10 bg-gradient-to-br from-foreground/[0.04] via-background to-background p-7 lg:p-9">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="outline" className="rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Developer Docs
          </Badge>
          {audience ? (
            <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.16em]">
              {audience}
            </Badge>
          ) : null}
        </div>
        <div className="space-y-3">
          <h1 className="max-w-4xl text-4xl font-display tracking-tight lg:text-6xl">{title}</h1>
          <p className="max-w-3xl text-base leading-relaxed text-muted-foreground lg:text-lg">{description}</p>
        </div>
      </header>
    </MotionReveal>
  );
}

export function DocSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <MotionReveal>
      <section className="border border-foreground/10 bg-background p-6 lg:p-7">
        <div className="space-y-3">
          <h2 className="text-2xl font-display tracking-tight lg:text-3xl">{title}</h2>
          {description ? (
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground lg:text-base">{description}</p>
          ) : null}
        </div>
        {children ? <div className="mt-5">{children}</div> : null}
      </section>
    </MotionReveal>
  );
}

const CALLOUT_STYLES = {
  info: {
    icon: Info,
    label: "Info",
    className: "border-sky-500/20 bg-sky-500/6",
  },
  security: {
    icon: ShieldAlert,
    label: "Security",
    className: "border-amber-500/20 bg-amber-500/8",
  },
  production: {
    icon: Sparkles,
    label: "Production Note",
    className: "border-emerald-500/20 bg-emerald-500/7",
  },
  claims: {
    icon: ShieldCheck,
    label: "Claims Boundary",
    className: "border-foreground/15 bg-foreground/[0.04]",
  },
} as const;

export function DocCallout({
  type,
  title,
  children,
}: {
  type: keyof typeof CALLOUT_STYLES;
  title?: string;
  children?: ReactNode;
}) {
  const style = CALLOUT_STYLES[type];
  const Icon = style.icon;

  return (
    <MotionReveal>
      <div className={cn("border p-5", style.className)}>
        <div className="flex items-center gap-3">
          <Icon className="h-4 w-4 text-foreground/80" />
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {title || style.label}
          </p>
        </div>
        <div className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {children ||
            (type === "claims" ? (
              <p>
                TrustSignal provides signed verification receipts, verification signals, and verifiable provenance.
                It does not provide legal determinations, compliance certification, or replace the system of record.
              </p>
            ) : null)}
        </div>
      </div>
    </MotionReveal>
  );
}

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function highlightCode(code: string, language?: string) {
  const escaped = escapeHtml(code);

  if (language === "json") {
    return escaped
      .replace(/"([^"]+)"(?=\s*:)/g, '<span class="text-sky-300">"$1"</span>')
      .replace(/:\s*"([^"]*)"/g, ': <span class="text-emerald-300">"$1"</span>')
      .replace(/\b(true|false|null)\b/g, '<span class="text-fuchsia-300">$1</span>')
      .replace(/:\s*(-?\d+(?:\.\d+)?)/g, ': <span class="text-amber-300">$1</span>');
  }

  if (language === "bash") {
    return escaped
      .replace(/^(curl|export)\b/gm, '<span class="text-sky-300">$1</span>')
      .replace(/(\$[A-Z0-9_]+)/g, '<span class="text-amber-300">$1</span>')
      .replace(/(-{1,2}[A-Za-z0-9-]+)/g, '<span class="text-fuchsia-300">$1</span>')
      .replace(/"([^"]*)"/g, '<span class="text-emerald-300">"$1"</span>');
  }

  return escaped
    .replace(/\b(const|await|return|export)\b/g, '<span class="text-sky-300">$1</span>')
    .replace(/"([^"]*)"/g, '<span class="text-emerald-300">"$1"</span>');
}

export function DocCodeBlock({
  label,
  code,
  language,
}: {
  label: string;
  code: string;
  language?: "bash" | "json" | "ts" | "text";
}) {
  const [copied, setCopied] = useState(false);
  const highlighted = useMemo(() => highlightCode(code, language), [code, language]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <MotionReveal>
      <section className="overflow-hidden border border-foreground/10 bg-[#0c1117] text-foreground">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-3">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/55">{label}</p>
            {language ? <p className="mt-1 text-xs text-white/40">{language}</p> : null}
          </div>
          <Button type="button" variant="outline" size="sm" onClick={handleCopy} className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        <pre className="overflow-x-auto p-5 text-sm leading-7 text-white/88">
          <code dangerouslySetInnerHTML={{ __html: highlighted }} />
        </pre>
      </section>
    </MotionReveal>
  );
}

export function DocDiagram({
  title,
  steps,
}: {
  title: string;
  steps: ReadonlyArray<string>;
}) {
  return (
    <MotionReveal>
      <section className="overflow-hidden border border-foreground/10 bg-gradient-to-br from-foreground/[0.04] via-background to-background p-6 lg:p-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Diagram</p>
            <h3 className="mt-2 text-xl font-display tracking-tight lg:text-2xl">{title}</h3>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step} className="relative border border-foreground/10 bg-background p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">0{index + 1}</p>
              <p className="mt-3 text-sm leading-relaxed text-foreground/85">{step}</p>
              {index < steps.length - 1 ? (
                <div className="mt-4 flex items-center gap-2 text-muted-foreground">
                  <div className="h-px flex-1 bg-foreground/10" />
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </MotionReveal>
  );
}

type LifecycleStep = {
  title: string;
  description: string;
};

function useActiveStep<T extends HTMLElement>(count: number) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const refs = useRef<Array<T | null>>([]);

  useEffect(() => {
    if (prefersReducedMotion) {
      setActiveIndex(0);
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      return;
    }

    const elements = refs.current.filter(Boolean) as T[];
    if (!elements.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (!visibleEntries.length) {
          return;
        }

        const nextIndex = elements.findIndex((element) => element === visibleEntries[0].target);
        if (nextIndex >= 0) {
          setActiveIndex(nextIndex);
        }
      },
      {
        threshold: [0.2, 0.45, 0.7],
        rootMargin: "-18% 0px -28% 0px",
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [count, prefersReducedMotion]);

  return {
    activeIndex,
    prefersReducedMotion,
    setRef: (index: number) => (node: T | null) => {
      refs.current[index] = node;
    },
  };
}

export function AnimatedLifecycle({
  title,
  description,
  steps,
}: {
  title: string;
  description?: string;
  steps: ReadonlyArray<LifecycleStep>;
}) {
  const { activeIndex, prefersReducedMotion, setRef } = useActiveStep<HTMLDivElement>(steps.length);

  return (
    <MotionReveal>
      <section className="overflow-hidden border border-foreground/10 bg-gradient-to-br from-foreground/[0.05] via-background to-background p-6 lg:p-7">
        <div className="max-w-3xl space-y-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Animated Lifecycle</p>
          <h3 className="text-xl font-display tracking-tight lg:text-2xl">{title}</h3>
          {description ? <p className="text-sm leading-relaxed text-muted-foreground lg:text-base">{description}</p> : null}
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-8">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="border border-foreground/10 bg-background/95 p-5 backdrop-blur-sm">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Active Step</p>
              <div className="mt-4 space-y-4">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  0{activeIndex + 1}
                </p>
                <div>
                  <h4 className="text-xl font-display tracking-tight text-foreground">{steps[activeIndex]?.title}</h4>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{steps[activeIndex]?.description}</p>
                </div>
                <div className="space-y-2">
                  {steps.map((step, index) => {
                    const isActive = index === activeIndex;
                    return (
                      <div key={step.title} className="flex items-center gap-3">
                        <span
                          className={cn(
                            "h-2.5 w-2.5 rounded-full border border-foreground/15 transition-all duration-300",
                            isActive ? "scale-125 bg-foreground" : "bg-transparent"
                          )}
                        />
                        <p className={cn("text-sm transition-colors duration-300", isActive ? "text-foreground" : "text-muted-foreground")}>
                          {step.title}
                        </p>
                      </div>
                    );
                  })}
                </div>
                {prefersReducedMotion ? (
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Reduced motion is enabled. The lifecycle remains visible without progressive step emphasis.
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => {
              const isActive = index === activeIndex;
              return (
                <div
                  key={step.title}
                  ref={setRef(index)}
                  className={cn(
                    "relative overflow-hidden border bg-background p-5 transition-[transform,opacity,border-color,background-color,box-shadow] duration-500 ease-out transform-gpu",
                    isActive
                      ? "border-foreground/25 bg-foreground/[0.05] opacity-100 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.45)] scale-[1.01]"
                      : "border-foreground/10 opacity-70 scale-[0.995]"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">0{index + 1}</p>
                      <h4 className="mt-3 text-lg font-display tracking-tight text-foreground">{step.title}</h4>
                    </div>
                    <div className={cn("hidden h-px flex-1 self-center md:block", isActive ? "bg-foreground/20" : "bg-foreground/8")} />
                  </div>
                  <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                  {index < steps.length - 1 ? (
                    <div className="mt-5 flex items-center gap-2 text-muted-foreground">
                      <div className="h-px flex-1 bg-foreground/10" />
                      <ArrowRight className={cn("h-4 w-4 shrink-0 transition-transform duration-300", isActive ? "translate-x-0.5" : "")} />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </MotionReveal>
  );
}

type BoundaryLayer = {
  title: string;
  description: string;
};

export function AnimatedTrustBoundary({
  title,
  description,
  layers,
}: {
  title: string;
  description?: string;
  layers: ReadonlyArray<BoundaryLayer>;
}) {
  const { activeIndex, prefersReducedMotion, setRef } = useActiveStep<HTMLDivElement>(layers.length);

  return (
    <MotionReveal>
      <section className="overflow-hidden border border-foreground/10 bg-gradient-to-br from-foreground/[0.05] via-background to-background p-6 lg:p-7">
        <div className="max-w-3xl space-y-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Trust Boundary</p>
          <h3 className="text-xl font-display tracking-tight lg:text-2xl">{title}</h3>
          {description ? <p className="text-sm leading-relaxed text-muted-foreground lg:text-base">{description}</p> : null}
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_280px] lg:gap-8">
          <div className="space-y-4">
            {layers.map((layer, index) => {
              const isActive = index === activeIndex;
              return (
                <div
                  key={layer.title}
                  ref={setRef(index)}
                  className={cn(
                    "relative overflow-hidden border p-5 transition-[transform,opacity,border-color,background-color,box-shadow] duration-500 ease-out transform-gpu",
                    isActive
                      ? "border-foreground/25 bg-foreground/[0.05] opacity-100 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.45)] scale-[1.01]"
                      : "border-foreground/10 bg-background opacity-75 scale-[0.995]"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">0{index + 1}</p>
                    <div className="h-px flex-1 bg-foreground/10" />
                  </div>
                  <h4 className="mt-4 text-lg font-display tracking-tight text-foreground">{layer.title}</h4>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{layer.description}</p>
                </div>
              );
            })}
          </div>

          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="border border-foreground/10 bg-background/95 p-5 backdrop-blur-sm">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Current Boundary</p>
              <h4 className="mt-4 text-xl font-display tracking-tight text-foreground">{layers[activeIndex]?.title}</h4>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{layers[activeIndex]?.description}</p>
              <div className="mt-5 space-y-3">
                {layers.map((layer, index) => (
                  <div key={layer.title} className="flex items-center gap-3">
                    <span
                      className={cn(
                        "h-2.5 w-2.5 rounded-full border border-foreground/15 transition-all duration-300",
                        index === activeIndex ? "scale-125 bg-foreground" : "bg-transparent"
                      )}
                    />
                    <p className={cn("text-sm transition-colors duration-300", index === activeIndex ? "text-foreground" : "text-muted-foreground")}>
                      {layer.title}
                    </p>
                  </div>
                ))}
              </div>
              {prefersReducedMotion ? (
                <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
                  Reduced motion is enabled. Boundary layers remain visible without progressive emphasis.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </MotionReveal>
  );
}

export function DocFooterLinks({
  links,
}: {
  links: ReadonlyArray<{ href: string; label: string; description?: string }>;
}) {
  return (
    <MotionReveal>
      <section className="border border-foreground/10 bg-background p-6 lg:p-7">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Related Docs</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group border border-foreground/10 bg-foreground/[0.02] p-4 transition-colors hover:border-foreground/20"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="font-medium">{link.label}</p>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </div>
              {link.description ? <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{link.description}</p> : null}
            </Link>
          ))}
        </div>
      </section>
    </MotionReveal>
  );
}
