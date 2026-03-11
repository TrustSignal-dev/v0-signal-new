"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, XCircle, Terminal } from "lucide-react";

const validTerminalLines = [
  { text: "Artifact received for attestation", type: "command" },
  { text: "Issuing signed integrity receipt...", type: "process" },
  { text: "Receipt issued: rcpt_7f3a...9c2d", type: "success" },
  { text: "", type: "empty" },
  { text: "Later verification requested", type: "command" },
  { text: "Comparing current digest to receipted digest...", type: "process" },
  { text: "Verification: RECEIPT MATCH", type: "clean" },
  { text: "Artifact matches the originally receipted record", type: "info" },
];

const tamperedTerminalLines = [
  { text: "Later verification requested", type: "command" },
  { text: "Loading existing receipt rcpt_7f3a...9c2d", type: "process" },
  { text: "", type: "empty" },
  { text: "Comparing current digest to receipted digest...", type: "process" },
  { text: "Verification: DRIFT DETECTED", type: "failure" },
  { text: "Current artifact no longer matches the receipted record", type: "warning" },
  { text: "Receipted digest: sha256:7f3a...9c2d", type: "info" },
  { text: "Current digest:  sha256:8b4c...1e5f", type: "info" },
];

function TerminalPanel({ 
  title, 
  lines, 
  isSuccess, 
  isVisible,
  delay = 0 
}: { 
  title: string; 
  lines: typeof validTerminalLines;
  isSuccess: boolean;
  isVisible: boolean;
  delay?: number;
}) {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setVisibleLines(prev => {
          if (prev >= lines.length) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 400);
      return () => clearInterval(interval);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [isVisible, lines.length, delay]);

  return (
    <div className={`border border-foreground/10 transition-all duration-700 ${
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
    }`}>
      {/* Terminal header */}
      <div className="px-6 py-4 border-b border-foreground/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-foreground/20" />
            <div className="w-3 h-3 rounded-full bg-foreground/20" />
            <div className="w-3 h-3 rounded-full bg-foreground/20" />
          </div>
          <span className="text-sm font-mono text-muted-foreground">{title}</span>
        </div>
        {isSuccess ? (
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        ) : (
          <XCircle className="w-5 h-5 text-red-500" />
        )}
      </div>
      
      {/* Terminal content */}
      <div className="p-6 font-mono text-sm bg-foreground/[0.02] min-h-[320px]">
        {lines.map((line, index) => {
          if (index >= visibleLines) return null;
          
          let colorClass = "text-foreground/70";
          if (line.type === "command") colorClass = "text-foreground";
          if (line.type === "process") colorClass = "text-muted-foreground";
          if (line.type === "success") colorClass = "text-blue-400";
          if (line.type === "clean") colorClass = "text-green-400 font-bold";
          if (line.type === "failure") colorClass = "text-red-400 font-bold";
          if (line.type === "warning") colorClass = "text-red-300";
          if (line.type === "info") colorClass = "text-foreground/50";
          
          return (
            <div 
              key={index} 
              className={`leading-loose ${colorClass} animate-in fade-in slide-in-from-left-2 duration-300`}
            >
              {line.text}
            </div>
          );
        })}
        <span className="inline-block w-2 h-4 bg-foreground/60 animate-pulse" />
      </div>
    </div>
  );
}

export function DemoSection() {
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
      id="demo"
      ref={sectionRef}
      className="relative py-24 lg:py-32 overflow-hidden"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-16 lg:mb-24 text-center">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
            <Terminal className="w-4 h-4" />
            Verification
          </span>
          <h2
            className={`text-4xl lg:text-6xl font-display tracking-tight transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Audit-ready verification.
            <br />
            <span className="text-muted-foreground">Clear signal when a record drifts.</span>
          </h2>
        </div>

        {/* Terminal panels */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="font-mono text-sm text-muted-foreground">Receipt Match</span>
            </div>
            <TerminalPanel 
              title="receipt_match.log"
              lines={validTerminalLines}
              isSuccess={true}
              isVisible={isVisible}
              delay={0}
            />
          </div>
          
          <div>
            <div className="mb-4 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="font-mono text-sm text-muted-foreground">Drift Detected</span>
            </div>
            <TerminalPanel 
              title="drift_detected.log"
              lines={tamperedTerminalLines}
              isSuccess={false}
              isVisible={isVisible}
              delay={500}
            />
          </div>
        </div>
        
        {/* Explanation */}
        <div className={`mt-16 text-center max-w-2xl mx-auto transition-all duration-700 delay-500 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}>
          <p className="text-lg text-muted-foreground leading-relaxed">
            TrustSignal issues a signed receipt at ingestion and can later
            compare the current artifact against the receipted digest. That
            gives reviewers a fast, audit-ready signal when a record no longer
            matches the original intake.
          </p>
        </div>
      </div>
    </section>
  );
}
