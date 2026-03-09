"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Building2, Stethoscope, CreditCard } from "lucide-react";

const fraudStats = [
  {
    icon: Building2,
    sector: "Real Estate",
    stat: "$173.6M",
    description: "in wire fraud and deed-record manipulation losses in 2024",
  },
  {
    icon: Stethoscope,
    sector: "Healthcare",
    stat: "$144B–$480B",
    description: "lost annually to fraud. Medicare alone: $57B in 2024",
  },
  {
    icon: CreditCard,
    sector: "Financial & Credentials",
    stat: "$12.5B",
    description: "in identity fraud losses. Synthetic identity fraud up 311% in H1 2025",
  },
];

export function ProblemSection() {
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
      id="problem"
      ref={sectionRef}
      className="relative py-24 lg:py-32 bg-foreground text-background overflow-hidden"
    >
      {/* Diagonal lines pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 40px,
            currentColor 40px,
            currentColor 41px
          )`
        }} />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-16 lg:mb-24">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-background/50 mb-6">
            <AlertTriangle className="w-4 h-4" />
            The Stakes
          </span>
          <h2
            className={`text-4xl lg:text-6xl font-display tracking-tight transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            When evidence changes after collection,
            <br />
            <span className="text-background/50">process controls aren&apos;t enough.</span>
          </h2>
          <p className={`mt-8 text-xl text-background/60 max-w-3xl leading-relaxed transition-all duration-700 delay-100 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}>
            TrustSignal intercepts fraud before records are finalized, providing mathematical proof of evidence integrity across high-stakes industries.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {fraudStats.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.sector}
                className={`group relative p-8 lg:p-10 border border-background/10 hover:border-background/30 transition-all duration-500 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${index * 100 + 200}ms` }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 border border-background/20 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-background/60" />
                  </div>
                  <span className="font-mono text-sm text-background/40">{item.sector}</span>
                </div>
                
                <div className="text-5xl lg:text-6xl font-display mb-4 group-hover:translate-x-1 transition-transform duration-300">
                  {item.stat}
                </div>
                
                <p className="text-background/50 leading-relaxed">
                  {item.description}
                </p>
                
                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-8 h-8 border-l border-b border-background/10 group-hover:border-background/30 transition-colors" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
