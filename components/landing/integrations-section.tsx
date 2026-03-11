"use client";

import { useEffect, useState, useRef } from "react";
import { ArrowRight, FileCheck2, ShieldCheck, Workflow } from "lucide-react";

const integrationSteps = [
  {
    title: "Collect evidence where you already do",
    description:
      "Keep your existing platform, collector, or internal workflow as the source of truth for the artifact.",
  },
  {
    title: "Call TrustSignal at ingestion",
    description:
      "Send the source, artifact hash, control ID, and timestamp through one API call or webhook.",
  },
  {
    title: "Store the receipt with the review record",
    description:
      "Receipts and provenance metadata can sit beside the original evidence for later audit or partner review.",
  },
] as const;

const codeExample = `POST /api/attest-evidence
Content-Type: application/json

{
  "source": "vanta",
  "artifact_hash": "sha256:93f6f35a550cbe1c3f0b5f0c12b9f0d62f3f9c6f8c6a4eddd8fa1fbfd4654af1",
  "control_id": "CC6.1",
  "timestamp": "2026-03-11T21:00:00Z",
  "metadata": {
    "artifact_type": "compliance_evidence",
    "collector": "aws-config-snapshot"
  }
}

HTTP/1.1 201 Created

{
  "receipt_id": "tsig_rcpt_01JTQY8N1Q0M4F4F5T4J4B8Y9R",
  "status": "signed",
  "source": "vanta",
  "control_id": "CC6.1",
  "attested_at": "2026-03-11T21:00:01Z",
  "signature": "tsig_sig_01JTQY8QK6X4YF7M6T2P9A5D3H",
  "provenance": {
    "artifact_type": "compliance_evidence",
    "collector": "aws-config-snapshot"
  }
}`;

export function IntegrationsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section 
      id="integration" 
      ref={sectionRef} 
      className="relative py-24 lg:py-32 bg-foreground text-background overflow-hidden"
    >
      {/* Diagonal lines pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 40px,
            currentColor 40px,
            currentColor 41px
          )`
        }} />
      </div>
      
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid items-start gap-14 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-16">
          <div
            className={`transition-all duration-700 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <span className="mb-6 inline-flex items-center gap-3 text-sm font-mono text-background/50">
              <Workflow className="w-4 h-4" />
              Integration
            </span>
            <h2 className="text-4xl lg:text-6xl font-display tracking-tight">
              Near-zero workflow change.
              <br />
              <span className="text-background/50">Attestation at the handoff point.</span>
            </h2>
            <p className="mt-8 text-lg text-background/60 leading-relaxed lg:text-xl">
              TrustSignal is designed to sit behind an existing compliance
              motion. Collect evidence where you already do, attest it at
              ingestion, and keep the signed receipt beside the artifact for
              later verification.
            </p>

            <div className="mt-10 space-y-4">
              {integrationSteps.map((step, index) => (
                <div
                  key={step.title}
                  className={`border border-background/10 bg-background/[0.04] p-5 transition-all duration-500 ${
                    isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  }`}
                  style={{ transitionDelay: `${index * 90 + 120}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-background/15 font-mono text-xs text-background/60">
                      0{index + 1}
                    </div>
                    <div>
                      <h3 className="text-xl font-display">{step.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-background/55">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-background/60">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Signed receipt returned
              </span>
              <span className="text-background/20">|</span>
              <span className="inline-flex items-center gap-2">
                <FileCheck2 className="h-4 w-4" />
                Audit-ready verification later
              </span>
            </div>
          </div>

          <div
            className={`transition-all duration-700 delay-150 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <div className="border border-background/10 bg-background/[0.02] shadow-[0_32px_80px_rgba(0,0,0,0.18)]">
              <div className="flex items-center justify-between border-b border-background/10 px-6 py-4">
                <span className="text-sm font-mono text-background/45">
                  attest-evidence.http
                </span>
                <span className="inline-flex items-center gap-2 text-xs text-background/40">
                  <ArrowRight className="h-3.5 w-3.5" />
                  Request and response
                </span>
              </div>
              <div className="overflow-x-auto p-6 font-mono text-sm">
                <pre className="whitespace-pre text-background/72">
                  {codeExample}
                </pre>
              </div>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-background/50">
              The same fields can be emitted from a webhook if your evidence
              platform already has an event-driven collection flow.
            </p>
          </div>
        </div>

        <div
          className={`mt-12 grid gap-4 sm:grid-cols-3 transition-all duration-700 delay-300 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="border border-background/10 bg-background/[0.04] px-5 py-4 text-sm leading-relaxed text-background/55">
            No system migration required.
          </div>
          <div className="border border-background/10 bg-background/[0.04] px-5 py-4 text-sm leading-relaxed text-background/55">
            Evidence stays in the workflow your team already trusts.
          </div>
          <div className="border border-background/10 bg-background/[0.04] px-5 py-4 text-sm leading-relaxed text-background/55">
            TrustSignal adds provenance and receipt integrity at the edge of review.
          </div>
        </div>
      </div>
    </section>
  );
}
