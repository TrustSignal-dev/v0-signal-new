"use client";

import { ArrowUpRight } from "lucide-react";
import { AnimatedWave } from "./animated-wave";
import {
  CONTACT_EMAIL,
  PRIMARY_NAV_LINKS,
  TRUSTSIGNAL_REVIEW_REPO_URL,
} from "@/lib/site";

const footerLinks = {
  Product: PRIMARY_NAV_LINKS,
  Developers: [
    { name: "Documentation", href: TRUSTSIGNAL_REVIEW_REPO_URL, external: true },
    { name: "GitHub Repository", href: TRUSTSIGNAL_REVIEW_REPO_URL, external: true },
    { name: "Security Overview", href: "/security" },
    { name: "Contact TrustSignal", href: `mailto:${CONTACT_EMAIL}`, external: true },
  ],
  Company: [
    { name: "About", href: "#workflows" },
    { name: "What is TrustSignal?", href: "/what-is-trustsignal" },
    { name: "Pilot Request", href: "#pilot-request" },
    { name: "Contact", href: `mailto:${CONTACT_EMAIL}`, external: true },
  ],
  Legal: [
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
    { name: "Security", href: "/security" },
  ],
};

const socialLinks = [
  { name: "GitHub", href: TRUSTSIGNAL_REVIEW_REPO_URL, external: true },
  { name: "Email", href: `mailto:${CONTACT_EMAIL}`, external: true },
];

export function FooterSection() {
  return (
    <footer className="relative border-t border-foreground/10">
      {/* Animated wave background */}
      <div className="absolute inset-0 h-64 opacity-20 pointer-events-none overflow-hidden">
        <AnimatedWave />
      </div>
      
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Main Footer */}
        <div className="py-16 lg:py-24">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-12 lg:gap-8">
            {/* Brand Column */}
            <div className="col-span-2">
              <a href="#top" className="inline-flex items-center gap-2 mb-6">
                <span className="text-2xl font-display">TrustSignal</span>
              </a>

              <p className="text-muted-foreground leading-relaxed mb-8 max-w-xs">
                Evidence integrity infrastructure. Signed cryptographic receipts
                for compliance artifacts that support later verification without
                replacing the workflow that collected them.
              </p>

              {/* Social Links */}
              <div className="flex gap-6">
                {socialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noreferrer" : undefined}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group"
                  >
                    {link.name}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </a>
                ))}
              </div>
            </div>

            {/* Link Columns */}
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h3 className="text-sm font-medium mb-6">{title}</h3>
                <ul className="space-y-4">
                  {links.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        target={"external" in link && link.external ? "_blank" : undefined}
                        rel={"external" in link && link.external ? "noreferrer" : undefined}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-8 border-t border-foreground/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            2026 TrustSignal. All rights reserved.
          </p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-foreground/35" />
              Documentation and pilot intake available
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
