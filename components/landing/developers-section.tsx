"use client";

import { useState, useEffect, useRef } from "react";
import {
  Check,
  Code2,
  Copy,
  FileCheck2,
  Layers3,
  Route,
  ScrollText,
  Shield,
} from "lucide-react";
import { TRUSTSIGNAL_GITHUB_URL, TRUSTSIGNAL_REVIEW_REPO_URL } from "@/lib/site";

const techSpecs = [
  { 
    icon: Shield,
    title: "Signed Receipts", 
    description: "Signed receipts record the artifact hash, source, and timestamp captured at ingestion."
  },
  { 
    icon: FileCheck2,
    title: "Verification Lifecycle", 
    description: "Later checks confirm whether the current artifact still matches the receipted record."
  },
  { 
    icon: Layers3,
    title: "Verifiable Provenance", 
    description: "Receipt metadata preserves source, control, and timestamp context for review workflows."
  },
  { 
    icon: Route,
    title: "Low-Friction Integration", 
    description: "TrustSignal fits behind an existing workflow through a clear verification boundary."
  },
  { 
    icon: ScrollText,
    title: "Documentation and Repository", 
    description: "Technical documentation and GitHub materials support partner, security, and integration review."
  },
  { 
    icon: Code2,
    title: "Implementation Detail", 
    description: "Technical documentation supports teams that need a deeper review of verification behavior."
  },
];

const codeExample = `// Receipt model
const auditReadyReceipt = {
  receipt_id: "tsig_rcpt_01JTQY8N1Q0M4F4F5T4J4B8Y9R",
  source: "vanta",
  artifact_hash: "sha256:93f6f35a550cbe1c3f0b5f0c12b9f0d62f3f9c6f8c6a4eddd8fa1fbfd4654af1",
  control_id: "CC6.1",
  timestamp: "2026-03-11T21:00:00Z",
  receipt_status: "signed",
  verification_status: "match",
  provenance: {
    artifact_type: "compliance_evidence",
    collector: "aws-config-snapshot"
  }
}

// TrustSignal sits behind the system that collected
// the record. The source platform remains in place
// while the receipt carries integrity and provenance.`;

export function DevelopersSection() {
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeExample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
    <section id="developers" ref={sectionRef} className="relative py-24 lg:py-32 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          {/* Left: Content */}
          <div
            className={`transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
              <Code2 className="w-4 h-4" />
              For Developers
            </span>
            <h2 className="text-4xl lg:text-6xl font-display tracking-tight mb-8">
              For Developers
            </h2>
            <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
              TrustSignal exposes a straightforward API surface for
              verification, receipt retrieval, status checks, and lifecycle
              actions. This section is the transition point from buyer-facing
              messaging to technical materials.
            </p>

            <div className="mb-10 grid gap-3 text-sm">
              <a href="#integration" className="border border-foreground/10 bg-foreground/[0.02] px-4 py-3 hover:border-foreground/20">
                API Overview
              </a>
              <a href="#demo" className="border border-foreground/10 bg-foreground/[0.02] px-4 py-3 hover:border-foreground/20">
                Quick Verification Example
              </a>
              <a href="/security" className="border border-foreground/10 bg-foreground/[0.02] px-4 py-3 hover:border-foreground/20">
                Security Model
              </a>
              <a
                href={TRUSTSIGNAL_REVIEW_REPO_URL}
                target="_blank"
                rel="noreferrer"
                className="border border-foreground/10 bg-foreground/[0.02] px-4 py-3 hover:border-foreground/20"
              >
                Threat Model
              </a>
              <a
                href={TRUSTSIGNAL_GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                className="border border-foreground/10 bg-foreground/[0.02] px-4 py-3 hover:border-foreground/20"
              >
                GitHub Repository
              </a>
              <a
                href={TRUSTSIGNAL_REVIEW_REPO_URL}
                target="_blank"
                rel="noreferrer"
                className="border border-foreground/10 bg-foreground/[0.02] px-4 py-3 hover:border-foreground/20"
              >
                Documentation
              </a>
            </div>
            
            {/* Tech Specs Grid */}
            <div className="grid grid-cols-2 gap-6">
              {techSpecs.map((spec, index) => {
                const Icon = spec.icon;
                return (
                  <div
                    key={spec.title}
                    className={`transition-all duration-500 ${
                      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    }`}
                    style={{ transitionDelay: `${index * 50 + 200}ms` }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      <h3 className="font-medium">{spec.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{spec.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Right: Code block */}
          <div
            className={`lg:sticky lg:top-32 transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
            }`}
          >
            <div className="border border-foreground/10">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-foreground/10 px-6 py-4">
                <span className="text-sm font-mono text-muted-foreground">receipt-model.ts</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Copy code"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              
              {/* Code content */}
              <div className="p-6 font-mono text-sm bg-foreground/[0.01] overflow-x-auto">
                <pre className="text-foreground/80 whitespace-pre">
                  {codeExample.split("\n").map((line, i) => (
                    <div key={i} className="leading-relaxed">
                      <span className="text-foreground/20 select-none w-8 inline-block">{i + 1}</span>
                      <span>{line}</span>
                    </div>
                  ))}
                </pre>
              </div>
            </div>

            <details className="mt-6 border border-foreground/10 bg-foreground/[0.02] p-5">
              <summary className="cursor-pointer list-none font-medium">
                Additional implementation context
              </summary>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Use the linked documentation and repository to review endpoint
                behavior, lifecycle expectations, and integration patterns in
                more depth.
              </p>
            </details>
            
            {/* Links */}
            <div className="mt-6 flex items-center gap-6 text-sm">
              <a
                href={TRUSTSIGNAL_REVIEW_REPO_URL}
                target="_blank"
                rel="noreferrer"
                className="text-foreground hover:underline underline-offset-4"
              >
                Read documentation
              </a>
              <span className="text-foreground/20">|</span>
              <a
                href={TRUSTSIGNAL_GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
