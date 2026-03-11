"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileCheck2, Shield, ShieldCheck, Workflow } from "lucide-react";
import { AnimatedSphere } from "./animated-sphere";

const heroHighlights = [
  {
    icon: Workflow,
    title: "Fits existing compliance motion",
    description: "Works alongside platforms like Vanta, Drata, and internal GRC flows.",
  },
  {
    icon: ShieldCheck,
    title: "Signed at ingestion",
    description: "Adds a signed cryptographic receipt when the artifact enters review.",
  },
  {
    icon: FileCheck2,
    title: "Audit-ready verification",
    description: "Preserves provenance so later review can confirm the record still matches.",
  },
] as const;

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Animated sphere background */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] lg:w-[800px] lg:h-[800px] opacity-40 pointer-events-none">
        <AnimatedSphere />
      </div>
      
      {/* Subtle grid lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        {[...Array(8)].map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute h-px bg-foreground/10"
            style={{
              top: `${12.5 * (i + 1)}%`,
              left: 0,
              right: 0,
            }}
          />
        ))}
        {[...Array(12)].map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute w-px bg-foreground/10"
            style={{
              left: `${8.33 * (i + 1)}%`,
              top: 0,
              bottom: 0,
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 py-32 lg:py-40">
        {/* Eyebrow */}
        <div 
          className={`mb-8 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground">
            <Shield className="w-4 h-4" />
            TrustSignal evidence integrity infrastructure
          </span>
        </div>
        
        {/* Main headline */}
        <div className="mb-12">
          <h1 
            className={`text-[clamp(2.5rem,8vw,6rem)] font-display leading-[0.95] tracking-tight transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <span className="block text-balance">Evidence integrity</span>
            <span className="block text-balance">for compliance artifacts</span>
            <span className="block text-muted-foreground text-balance">without workflow changes</span>
          </h1>
        </div>
        
        {/* Description */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-end">
          <p 
            className={`text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-xl transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            TrustSignal is evidence integrity infrastructure for compliance
            artifacts. It attests artifacts at ingestion, returns signed
            cryptographic receipts, and gives reviewers verifiable audit
            evidence without replacing the collection workflow they already
            trust.
          </p>
          
          {/* CTAs */}
          <div 
            className={`transition-all duration-700 delay-300 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Button 
                asChild
                size="lg" 
                className="bg-foreground hover:bg-foreground/90 text-background px-8 h-14 text-base rounded-full group"
              >
                <a href="#pilot-request">
                  Request a Lightweight Pilot
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </a>
              </Button>
              <Button 
                asChild
                size="lg" 
                variant="outline" 
                className="h-14 px-8 text-base rounded-full border-foreground/20 hover:bg-foreground/5"
              >
                <a href="#integration">View Integration Flow</a>
              </Button>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {heroHighlights.map((highlight) => {
                const Icon = highlight.icon;

                return (
                  <div
                    key={highlight.title}
                    className="border border-foreground/10 bg-background/70 px-4 py-4 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <Icon className="h-4 w-4 text-foreground/70" />
                      <span className="font-medium">{highlight.title}</span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {highlight.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
      </div>
      
      {/* Scroll indicator */}
      <div 
        className={`absolute bottom-12 left-1/2 -translate-x-1/2 transition-all duration-700 delay-700 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <span className="text-xs font-mono">Scroll to explore</span>
          <div className="w-px h-8 bg-foreground/20 relative overflow-hidden">
            <div className="w-full h-4 bg-foreground/60 animate-pulse absolute top-0" />
          </div>
        </div>
      </div>
    </section>
  );
}
