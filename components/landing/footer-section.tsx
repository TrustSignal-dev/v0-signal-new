"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { AnimatedWave } from "./animated-wave";
import {
  ACCOUNT_LINKS,
  CONTACT_EMAIL,
  TRUSTSIGNAL_GITHUB_URL,
  PRIMARY_NAV_LINKS,
  TRUSTSIGNAL_REVIEW_REPO_URL,
} from "@/lib/site";

const footerLinks = {
  Product: PRIMARY_NAV_LINKS,
  Developers: [
    { name: "Get Your API Key", href: ACCOUNT_LINKS.getApiKey },
    { name: "Sign Up", href: ACCOUNT_LINKS.signUp },
    { name: "Sign In", href: ACCOUNT_LINKS.signIn },
    { name: "Documentation", href: "/docs" },
    { name: "GitHub", href: TRUSTSIGNAL_GITHUB_URL, external: true },
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
  { name: "GitHub", href: TRUSTSIGNAL_GITHUB_URL, external: true },
  { name: "Reddit", href: "https://www.reddit.com/r/trustsignal/", external: true },
  { name: "Email", href: `mailto:${CONTACT_EMAIL}`, external: true },
];

export function FooterSection() {
  const pathname = usePathname();

  const resolveHomeHref = (hash?: string) => {
    if (!hash) return pathname === "/" ? "#top" : "/";
    return pathname === "/" ? hash : `/${hash}`;
  };

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
              <Link href={resolveHomeHref()} className="inline-flex items-center gap-2 mb-6">
                <span className="text-2xl font-display">TrustSignal</span>
              </Link>

              <p className="text-muted-foreground leading-relaxed mb-8 max-w-xs">
                TrustSignal evidence integrity infrastructure issues signed
                verification receipts for compliance artifacts and supports
                later verification without replacing the workflow that collected
                them.
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
                      {"external" in link && link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
                        >
                          {link.name}
                        </a>
                      ) : (
                        <Link
                          href={link.href.startsWith("#") ? resolveHomeHref(link.href) : link.href}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
                        >
                          {link.name}
                        </Link>
                      )}
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
              Documentation, account access, and pilot intake are available from the public TrustSignal surface.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
