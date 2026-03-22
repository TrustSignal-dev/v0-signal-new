import type { Metadata } from "next";
import { Navigation } from "@/components/landing/navigation";
import { HeroSection } from "@/components/landing/hero-section";
import { ProblemSection } from "@/components/landing/problem-section";
import { EvidenceFlowMarqueeSection } from "@/components/landing/evidence-flow-marquee-section";
import { IntegrationsSection } from "@/components/landing/integrations-section";
import { DevelopersSection } from "@/components/landing/developers-section";
import { ClaimsBoundarySection } from "@/components/landing/claims-boundary-section";
import { ComplianceWorkflowsSection } from "@/components/landing/compliance-workflows-section";
import { SecuritySection } from "@/components/landing/security-section";
import { DemoSection } from "@/components/landing/demo-section";
import { CtaSection } from "@/components/landing/cta-section";
import { PilotRequestSection } from "@/components/landing/pilot-request-section";
import { FooterSection } from "@/components/landing/footer-section";
import { RevealOnScroll } from "@/components/reveal-on-scroll";
import { DEFAULT_OG_IMAGE, DEFAULT_KEYWORDS, absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    absolute: "TrustSignal | Evidence Integrity Infrastructure for Compliance Workflows",
  },
  description:
    "TrustSignal issues signed verification receipts so compliance and audit teams can prove when evidence was created, where it came from, and whether it has changed.",
  keywords: [
    ...DEFAULT_KEYWORDS,
    "compliance workflow",
    "signed receipts",
    "verification signals",
    "verifiable provenance",
  ],
  alternates: {
    canonical: absoluteUrl("/"),
  },
  openGraph: {
    title: "TrustSignal | Evidence Integrity Infrastructure for Compliance Workflows",
    description:
      "TrustSignal issues signed verification receipts so compliance and audit teams can prove when evidence was created, where it came from, and whether it has changed.",
    url: absoluteUrl("/"),
    siteName: "TrustSignal",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: absoluteUrl(DEFAULT_OG_IMAGE),
        width: 1200,
        height: 630,
        alt: "TrustSignal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TrustSignal | Evidence Integrity Infrastructure for Compliance Workflows",
    description:
      "TrustSignal issues signed verification receipts so compliance and audit teams can prove when evidence was created, where it came from, and whether it has changed.",
    images: [absoluteUrl(DEFAULT_OG_IMAGE)],
  },
};

export default function Home() {
  return (
    <main id="top" className="relative min-h-screen overflow-x-hidden noise-overlay">
      <Navigation />
      <HeroSection />
      <RevealOnScroll delayMs={40}>
        <ProblemSection />
      </RevealOnScroll>
      <RevealOnScroll>
        <EvidenceFlowMarqueeSection />
      </RevealOnScroll>
      <RevealOnScroll delayMs={80}>
        <IntegrationsSection />
      </RevealOnScroll>
      <RevealOnScroll delayMs={100}>
        <DevelopersSection />
      </RevealOnScroll>
      <RevealOnScroll delayMs={120}>
        <ClaimsBoundarySection />
      </RevealOnScroll>
      <RevealOnScroll delayMs={140}>
        <ComplianceWorkflowsSection />
      </RevealOnScroll>
      <RevealOnScroll delayMs={160}>
        <SecuritySection />
      </RevealOnScroll>
      <RevealOnScroll delayMs={180}>
        <DemoSection />
      </RevealOnScroll>
      <RevealOnScroll delayMs={200}>
        <CtaSection />
      </RevealOnScroll>
      <RevealOnScroll delayMs={220}>
        <PilotRequestSection />
      </RevealOnScroll>
      <FooterSection />
    </main>
  );
}
