"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Clock3, FileSearch, Link2 } from "lucide-react";

const evidenceRisks = [
  {
    icon: Clock3,
    title: "Evidence drifts over time",
    description:
      "Files, exports, and screenshots can change after initial collection as they move between teams and systems.",
  },
  {
    icon: FileSearch,
    title: "Provenance gets harder to confirm",
    description:
      "Weeks or months later, reviewers often cannot easily prove where an artifact came from or when it was captured.",
  },
  {
    icon: Link2,
    title: "Audit readiness weakens",
    description:
      "Teams need a reliable way to verify what was collected, when it was collected, and from which source system.",
  },
] as const;

export function ProblemSection() {
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
      id="problem"
      ref={sectionRef}
      className="relative overflow-hidden bg-foreground py-24 text-background lg:py-32"
    >
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 40px,
            currentColor 40px,
            currentColor 41px
          )`,
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="mb-16 lg:mb-20">
          <span className="mb-6 inline-flex items-center gap-3 font-mono text-sm text-background/50">
            <AlertTriangle className="h-4 w-4" />
            Problem
          </span>
          <h2
            className={`text-4xl font-display tracking-tight transition-all duration-700 lg:text-6xl ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            Evidence can drift after collection.
            <br />
            <span className="text-background/55">Verification gets harder later.</span>
          </h2>
          <p
            className={`mt-8 max-w-3xl text-xl leading-relaxed text-background/60 transition-all duration-700 delay-100 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            Compliance and audit teams rely on artifacts that pass through
            multiple systems. Without a durable integrity reference, provenance
            can become difficult to validate during later review.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 lg:gap-10">
          {evidenceRisks.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className={`group relative border border-background/10 p-8 transition-all duration-500 hover:border-background/25 ${
                  isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                }`}
                style={{ transitionDelay: `${index * 100 + 200}ms` }}
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center border border-background/20">
                  <Icon className="h-5 w-5 text-background/70" />
                </div>
                <h3 className="text-2xl font-display">{item.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-background/55">
                  {item.description}
                </p>
                <div className="absolute right-0 top-0 h-8 w-8 border-b border-l border-background/10 transition-colors group-hover:border-background/25" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
