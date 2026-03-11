import type { Metadata } from "next";
import { Navigation } from "@/components/landing/navigation";
import { HeroSection } from "@/components/landing/hero-section";
import { EvidenceFlowMarqueeSection } from "@/components/landing/evidence-flow-marquee-section";
import { ComplianceWorkflowsSection } from "@/components/landing/compliance-workflows-section";
import { DemoSection } from "@/components/landing/demo-section";
import { IntegrationsSection } from "@/components/landing/integrations-section";
import { SecuritySection } from "@/components/landing/security-section";
import { DevelopersSection } from "@/components/landing/developers-section";
import { CtaSection } from "@/components/landing/cta-section";
import { PilotRequestSection } from "@/components/landing/pilot-request-section";
import { FooterSection } from "@/components/landing/footer-section";
import { RevealOnScroll } from "@/components/reveal-on-scroll";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Evidence Integrity Infrastructure for Compliance Artifacts",
  description:
    "TrustSignal issues signed cryptographic receipts for compliance artifacts, preserves provenance, and supports audit-ready verification without replacing existing workflows.",
  path: "/",
  keywords: [
    "compliance workflow",
    "signed receipts",
    "audit-ready verification",
    "tamper-evident evidence",
  ],
});

export default function Home() {
  return (
    <main id="top" className="relative min-h-screen overflow-x-hidden noise-overlay">
      <Navigation />
      <HeroSection />
      <RevealOnScroll delayMs={40}>
        <EvidenceFlowMarqueeSection />
      </RevealOnScroll>
      <RevealOnScroll>
        <ComplianceWorkflowsSection />
      </RevealOnScroll>
      <RevealOnScroll delayMs={80}>
        <IntegrationsSection />
      </RevealOnScroll>
      <RevealOnScroll delayMs={100}>
        <SecuritySection />
      </RevealOnScroll>
      <RevealOnScroll delayMs={120}>
        <DemoSection />
      </RevealOnScroll>
      <RevealOnScroll delayMs={140}>
        <DevelopersSection />
      </RevealOnScroll>
      <RevealOnScroll delayMs={160}>
        <CtaSection />
      </RevealOnScroll>
      <RevealOnScroll delayMs={180}>
        <PilotRequestSection />
      </RevealOnScroll>
      <FooterSection />
    </main>
  );
}
