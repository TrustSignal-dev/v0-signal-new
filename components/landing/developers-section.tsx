"use client";

import { useState, useEffect, useRef } from "react";
import { Copy, Check, Code2, Shield, Zap, Lock, FlaskConical, Cpu } from "lucide-react";

const techSpecs = [
  { 
    icon: Shield,
    title: "EVM Anchoring", 
    description: "Sepolia and Polygon testnets for standardized infrastructure."
  },
  { 
    icon: Zap,
    title: "Sub-3s Proofs", 
    description: "Generates cryptographic proofs in under 3 seconds."
  },
  { 
    icon: Lock,
    title: "Halo2 Circuits", 
    description: "Merkle-based exclusion proofs for tamper detection."
  },
  { 
    icon: FlaskConical,
    title: "Poseidon Nullifiers", 
    description: "Dynamic revocation capabilities for evidence lifecycle."
  },
  { 
    icon: Cpu,
    title: "AI ZKML Oracle", 
    description: "ezkl-powered verifiable fraud scoring."
  },
  { 
    icon: Code2,
    title: "99.34% Coverage", 
    description: "Evaluated across 64 comprehensive tests."
  },
];

const codeExample = `import { TrustSignal } from '@trustsignal/sdk'

const ts = new TrustSignal({
  apiKey: process.env.TRUSTSIGNAL_KEY,
  network: 'polygon' // or 'sepolia'
})

// Generate receipt at ingestion
const receipt = await ts.ingest({
  artifact: documentBuffer,
  metadata: {
    type: 'compliance_evidence',
    source: 'vanta_integration'
  }
})

// Later: verify integrity
const verification = await ts.verify({
  artifact: documentBuffer,
  receipt: receipt.id
})

console.log(verification.status) // 'CLEAN' or 'FAILURE'
console.log(verification.proof)  // ZK proof data`;

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
    <section id="architecture" ref={sectionRef} className="relative py-24 lg:py-32 overflow-hidden">
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
              Standardized
              <br />
              <span className="text-muted-foreground">infrastructure.</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
              Built on proven cryptographic primitives and blockchain anchoring. 
              Production-ready with comprehensive test coverage.
            </p>
            
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
                <span className="text-sm font-mono text-muted-foreground">trustsignal.ts</span>
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
                  {codeExample.split('\n').map((line, i) => (
                    <div key={i} className="leading-relaxed">
                      <span className="text-foreground/20 select-none w-8 inline-block">{i + 1}</span>
                      <span>{line}</span>
                    </div>
                  ))}
                </pre>
              </div>
            </div>
            
            {/* Links */}
            <div className="mt-6 flex items-center gap-6 text-sm">
              <a href="#" className="text-foreground hover:underline underline-offset-4">
                Read the docs
              </a>
              <span className="text-foreground/20">|</span>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
