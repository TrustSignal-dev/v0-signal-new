import type { ReactNode } from "react";
import { FooterSection } from "@/components/landing/footer-section";
import { Navigation } from "@/components/landing/navigation";

export default function PartnerLayout({ children }: { children: ReactNode }) {
  return (
    <main id="top" className="relative min-h-screen overflow-x-hidden noise-overlay">
      <Navigation />
      <section className="mx-auto max-w-[1200px] px-6 pb-20 pt-28 lg:px-12 lg:pb-24 lg:pt-36">
        {children}
      </section>
      <FooterSection />
    </main>
  );
}
