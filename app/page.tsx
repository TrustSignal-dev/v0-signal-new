import { Navigation } from "@/components/landing/navigation";
import { HeroSection } from "@/components/landing/hero-section";
import { ProblemSection } from "@/components/landing/problem-section";
import { DemoSection } from "@/components/landing/demo-section";
import { IntegrationsSection } from "@/components/landing/integrations-section";
import { DevelopersSection } from "@/components/landing/developers-section";
import { CtaSection } from "@/components/landing/cta-section";
import { PilotRequestSection } from "@/components/landing/pilot-request-section";
import { FooterSection } from "@/components/landing/footer-section";
import { RevealOnScroll } from "@/components/reveal-on-scroll";

export default function Home() {
  return (
    <main id="top" className="relative min-h-screen overflow-x-hidden noise-overlay">
      <Navigation />
      <HeroSection />
      <RevealOnScroll>
        <ProblemSection />
      </RevealOnScroll>
      <RevealOnScroll delayMs={60}>
        <DemoSection />
      </RevealOnScroll>
      <RevealOnScroll delayMs={80}>
        <IntegrationsSection />
      </RevealOnScroll>
      <RevealOnScroll delayMs={100}>
        <DevelopersSection />
      </RevealOnScroll>
      <RevealOnScroll delayMs={120}>
        <CtaSection />
      </RevealOnScroll>
      <RevealOnScroll delayMs={140}>
        <PilotRequestSection />
      </RevealOnScroll>
      <FooterSection />
    </main>
  );
}
