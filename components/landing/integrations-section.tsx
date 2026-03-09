"use client";

import { useEffect, useState, useRef } from "react";
import { ArrowRight, Workflow } from "lucide-react";

const flowSteps = [
  {
    label: "Existing Compliance Flow",
    description: "Your current system (Vanta, Drata, etc.)",
    color: "bg-foreground/5 border-foreground/20",
  },
  {
    label: "TrustSignal Integrity Layer",
    description: "Single API call or webhook at ingestion",
    color: "bg-foreground/10 border-foreground/40",
    highlight: true,
  },
  {
    label: "Artifact + Signed Receipt",
    description: "Cryptographically anchored evidence",
    color: "bg-foreground/5 border-foreground/20",
  },
];

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
        {/* Header */}
        <div
          className={`text-center max-w-3xl mx-auto mb-16 lg:mb-24 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <span className="inline-flex items-center gap-3 text-sm font-mono text-background/50 mb-6">
            <Workflow className="w-4 h-4" />
            Integration
          </span>
          <h2 className="text-4xl lg:text-6xl font-display tracking-tight mb-6">
            Minimal workflow change.
            <br />
            <span className="text-background/50">Maximum integrity.</span>
          </h2>
          <p className="text-xl text-background/60 leading-relaxed">
            Integration requires near-zero process adjustments. A single API call or webhook 
            at the point of ingestion is all you need.
          </p>
        </div>

        {/* Flow diagram */}
        <div className={`flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-0 transition-all duration-700 delay-200 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}>
          {flowSteps.map((step, index) => (
            <div key={step.label} className="flex items-center">
              <div 
                className={`relative p-8 lg:p-10 border ${step.color} min-w-[280px] lg:min-w-[320px] transition-all duration-500 hover:scale-105 ${
                  step.highlight ? "border-2" : ""
                }`}
              >
                {step.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-background text-foreground text-xs font-mono">
                    TrustSignal
                  </div>
                )}
                <h3 className="text-lg font-display mb-2">{step.label}</h3>
                <p className="text-sm text-background/50">{step.description}</p>
              </div>
              
              {index < flowSteps.length - 1 && (
                <div className="hidden lg:flex items-center px-4">
                  <ArrowRight className="w-6 h-6 text-background/30" />
                </div>
              )}
              
              {index < flowSteps.length - 1 && (
                <div className="lg:hidden py-2">
                  <ArrowRight className="w-6 h-6 text-background/30 rotate-90" />
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Code example */}
        <div className={`mt-16 lg:mt-24 max-w-2xl mx-auto transition-all duration-700 delay-300 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}>
          <div className="border border-background/10">
            <div className="px-6 py-3 border-b border-background/10 flex items-center justify-between">
              <span className="text-xs font-mono text-background/40">integration.ts</span>
            </div>
            <div className="p-6 font-mono text-sm">
              <pre className="text-background/70">
{`// That's it. One line.
await trustsignal.receipt(artifact);

// Or via webhook
POST /api/trustsignal/ingest
Content-Type: application/json
{ "artifact_id": "doc_123" }`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
