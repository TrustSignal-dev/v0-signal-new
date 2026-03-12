"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Building2,
  FileCheck2,
  ShieldCheck,
  Workflow,
} from "lucide-react";

const ecosystemSteps = [
  {
    icon: Building2,
    eyebrow: "Source systems",
    title: "Company systems and evidence sources",
    description:
      "Cloud config snapshots, ticket exports, documents, registries, and internal apps continue to produce the artifacts your team already reviews.",
    highlight: false,
  },
  {
    icon: Workflow,
    eyebrow: "Existing workflow",
    title: "Compliance platform or internal GRC flow",
    description:
      "Platforms like Vanta and Drata can keep collecting, organizing, and routing evidence inside the process your team already uses.",
    highlight: false,
  },
  {
    icon: ShieldCheck,
    eyebrow: "Integrity layer",
    title: "TrustSignal attests at ingestion",
    description:
      "TrustSignal adds a signed receipt at the handoff point so integrity and provenance travel with the artifact from the start.",
    highlight: true,
  },
  {
    icon: FileCheck2,
    eyebrow: "Audit output",
    title: "Signed receipt and verifiable audit evidence",
    description:
      "Reviewers get a tamper-evident reference they can verify later without replacing the system that collected the original record.",
    highlight: false,
  },
] as const;

const reviewPoints = [
  "Designed to fit compliance evidence workflows",
  "Works alongside platforms like Vanta and Drata",
  "No workflow replacement required",
] as const;

export function ComplianceWorkflowsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 },
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="workflows"
      ref={sectionRef}
      className="relative overflow-hidden border-t border-foreground/10 py-24 lg:py-32"
    >
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-foreground/10 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
          <div
            className={`transition-all duration-700 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <span className="mb-6 inline-flex items-center gap-3 font-mono text-sm text-muted-foreground">
              <Workflow className="h-4 w-4" />
              Works with compliance platforms
            </span>
            <h2 className="text-4xl font-display tracking-tight lg:text-6xl">
              Built for compliance evidence workflows.
            </h2>
            <p className="mt-8 max-w-3xl text-lg leading-relaxed text-muted-foreground lg:text-xl">
              TrustSignal evidence integrity infrastructure sits behind the
              system that collected the artifact, fits alongside platforms like
              Vanta and Drata, and returns signed verification receipts that
              can be verified later during audit or partner review.
            </p>
          </div>

          <div
            className={`grid gap-4 sm:grid-cols-3 transition-all duration-700 delay-100 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            {reviewPoints.map((point) => (
              <div
                key={point}
                className="border border-foreground/10 bg-foreground/[0.02] px-5 py-4 text-sm leading-relaxed text-muted-foreground"
              >
                {point}
              </div>
            ))}
          </div>
        </div>

        <div
          className={`mt-16 border border-foreground/10 bg-gradient-to-br from-background via-background to-foreground/[0.02] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.04)] transition-all duration-700 delay-200 lg:mt-20 lg:p-8 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="mb-6 flex items-center justify-between gap-4 border-b border-foreground/10 pb-4">
            <span className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Ecosystem fit
            </span>
            <span className="text-xs text-muted-foreground">
              Attests artifacts at ingestion without replacing your process
            </span>
          </div>

          <div className="flex flex-col items-stretch gap-4 lg:flex-row lg:items-center lg:justify-center lg:gap-0">
            {ecosystemSteps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div key={step.title} className="flex items-center">
                  <div
                    className={`relative min-w-0 flex-1 border p-6 lg:min-h-[260px] lg:min-w-[260px] lg:max-w-[280px] ${
                      step.highlight
                        ? "border-foreground/35 bg-foreground/[0.05]"
                        : "border-foreground/10 bg-background"
                    }`}
                  >
                    {step.highlight ? (
                      <div className="absolute -top-3 left-5 bg-background px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground">
                        TrustSignal
                      </div>
                    ) : null}
                    <div className="flex h-11 w-11 items-center justify-center border border-foreground/15 bg-foreground/[0.03]">
                      <Icon className="h-5 w-5 text-foreground/70" />
                    </div>
                    <p className="mt-5 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      {step.eyebrow}
                    </p>
                    <h3 className="mt-3 text-2xl font-display leading-tight">
                      {step.title}
                    </h3>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>

                  {index < ecosystemSteps.length - 1 ? (
                    <>
                      <div className="hidden items-center px-4 lg:flex">
                        <ArrowRight className="h-5 w-5 text-foreground/25" />
                      </div>
                      <div className="flex justify-center py-3 lg:hidden">
                        <ArrowRight className="h-5 w-5 rotate-90 text-foreground/25" />
                      </div>
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
