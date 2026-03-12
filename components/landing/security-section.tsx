"use client";

import { useEffect, useRef, useState } from "react";
import {
  FileCheck2,
  Fingerprint,
  Lock,
  Route,
  Shield,
} from "lucide-react";

const trustSignals = [
  {
    icon: Shield,
    title: "Signed receipts",
    description:
      "Each attestation returns a signed verification receipt that can be stored beside the original artifact.",
  },
  {
    icon: FileCheck2,
    title: "Tamper-evident audit trail",
    description:
      "Later verification shows whether the current artifact still matches the receipted record.",
  },
  {
    icon: Lock,
    title: "TLS in transit",
    description:
      "Receipt requests travel over standard encrypted transport instead of introducing a custom workflow channel.",
  },
  {
    icon: Route,
    title: "Minimal workflow change",
    description:
      "TrustSignal integrates at ingestion through a low-friction API boundary or webhook without replacing the evidence platform.",
  },
  {
    icon: Fingerprint,
    title: "Verifiable provenance",
    description:
      "Source, control, and timestamp metadata remain attached to the receipt for audit-ready review.",
  },
] as const;

export function SecuritySection() {
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
      id="security"
      ref={sectionRef}
      className="relative overflow-hidden border-y border-foreground/10 bg-foreground/[0.015] py-24 lg:py-32"
    >
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <span
            className={`mb-6 inline-flex items-center gap-3 font-mono text-sm text-muted-foreground transition-all duration-700 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            <Shield className="h-4 w-4" />
            Security and trust signals
          </span>
          <h2
            className={`text-4xl font-display tracking-tight transition-all duration-700 lg:text-6xl ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            Visible safeguards without workflow sprawl.
          </h2>
          <p
            className={`mt-8 text-lg leading-relaxed text-muted-foreground transition-all duration-700 delay-100 lg:text-xl ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            TrustSignal is designed to be straightforward to evaluate. The core
            trust signals show up in the signed receipt, the audit trail, and
            the provenance fields reviewers can inspect later.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-5">
          {trustSignals.map((signal, index) => {
            const Icon = signal.icon;

            return (
              <div
                key={signal.title}
                className={`group relative border border-foreground/10 bg-background/90 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.04)] transition-all duration-500 hover:-translate-y-1 hover:border-foreground/20 ${
                  isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                }`}
                style={{ transitionDelay: `${index * 80 + 160}ms` }}
              >
                <div className="flex h-11 w-11 items-center justify-center border border-foreground/15 bg-foreground/[0.03]">
                  <Icon className="h-5 w-5 text-foreground/70" />
                </div>
                <h3 className="mt-5 text-xl font-display leading-tight">
                  {signal.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {signal.description}
                </p>
                <div className="absolute right-0 top-0 h-8 w-8 border-b border-l border-foreground/10 transition-colors group-hover:border-foreground/25" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
