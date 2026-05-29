"use client";

import { useState, useEffect } from "react";
import TrustSignalHero from "./TrustSignalHero";
import TrustSignalAudience from "./TrustSignalAudience";
import TrustSignalPilot from "./TrustSignalPilot";
import TrustSignalDevelopers from "./TrustSignalDevelopers";

/**
 * TrustSignal — full landing page
 * Composes the four section components with a sticky nav and footer.
 * Order follows the buyer journey: problem/audience → the offer → technical proof.
 * Renders when the four sibling section files are present in the same folder.
 *
 * Palette (shared across all sections):
 *   paper #FAFAF8 · ink #121316 · blue #4D5AF0 (trusted action) · red #F23A17 (attention)
 */

const PALETTE = {
  paper: "#FAFAF8",
  ink: "#121316",
  deep: "#0E0F12",
  blue: "#4D5AF0",
  muted: "rgba(18,19,22,0.60)",
  lightMuted: "rgba(250,250,248,0.55)",
  line: "rgba(18,19,22,0.12)",
  lineDark: "rgba(250,250,248,0.12)",
};

const NAV_LINKS = [
  { label: "Who it's for", href: "#who-its-for" },
  { label: "How a pilot works", href: "#request-pilot" },
  { label: "Developers", href: "#developers" },
  { label: "Docs", href: "/docs" },
];

const FOOTER_COLS = [
  { 
    head: "Product", 
    links: [
      { label: "How it works", href: "#who-its-for" },
      { label: "Pricing", href: "#request-pilot" },
      { label: "Developers", href: "#developers" },
      { label: "Live demo", href: "/demo" }
    ] 
  },
  { 
    head: "Verticals", 
    links: [
      { label: "Healthcare staffing", href: "#who-its-for" },
      { label: "Education", href: "#who-its-for" },
      { label: "Mortgage & title", href: "#who-its-for" },
      { label: "Government", href: "#who-its-for" }
    ] 
  },
  { 
    head: "Company", 
    links: [
      { label: "Founder's story", href: "mailto:christopher@trustsignal.dev" },
      { label: "Contact", href: "mailto:christopher@trustsignal.dev" }
    ] 
  },
];

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      style={{
        ...navStyles.nav,
        borderBottom: scrolled ? `1px solid ${PALETTE.line}` : "1px solid transparent",
        background: scrolled ? "rgba(250,250,248,0.85)" : "transparent",
        backdropFilter: scrolled ? "saturate(180%) blur(10px)" : "none",
        WebkitBackdropFilter: scrolled ? "saturate(180%) blur(10px)" : "none",
      }}
    >
      <div style={navStyles.inner}>
        <a href="#top" style={navStyles.wordmark}>
          <span style={navStyles.mark} aria-hidden="true">—||—</span> TrustSignal
        </a>
        <div style={navStyles.links} className="ts-navlinks">
          {NAV_LINKS.map((l) => (
            <a key={l.label} href={l.href} style={navStyles.link} className="ts-navlink">
              {l.label}
            </a>
          ))}
        </div>
        <a href="#request-pilot" style={navStyles.cta} className="ts-navcta">
          Request a Pilot
        </a>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer style={footStyles.footer}>
      <div style={footStyles.inner}>
        <div style={footStyles.grid}>
          <div style={footStyles.brandCol}>
            <div style={footStyles.wordmark}>
              <span style={footStyles.mark} aria-hidden="true">—||—</span> TrustSignal
            </div>
            <p style={footStyles.tagline}>Evidence integrity infrastructure.</p>
            <p style={footStyles.prove}>Prove. Verify. Trust.</p>
            <p style={footStyles.contact}>
              <a href="mailto:christopher@trustsignal.dev" style={footStyles.contactLink} className="ts-footlink">
                christopher@trustsignal.dev
              </a>
              <br />Chicago, IL
            </p>
          </div>

          {FOOTER_COLS.map((col) => (
            <div key={col.head}>
              <div style={footStyles.colHead}>{col.head}</div>
              <ul style={footStyles.colList}>
                {col.links.map((l) => (
                  <li key={l.label} style={footStyles.colItem}>
                    <a href={l.href} style={footStyles.colLink} className="ts-footlink">{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={footStyles.bottom}>
          <span>© 2026 TrustSignal · Pre-Seed · Chicago, IL</span>
          <span style={footStyles.bottomNote}>Receipts remain verifiable even after cancellation.</span>
        </div>
      </div>
    </footer>
  );
}

export default function TrustSignalPage() {
  return (
    <div id="top" style={{ background: PALETTE.paper }}>
      <style>{pageCss}</style>
      <Nav />
      <TrustSignalHero />
      <TrustSignalAudience />
      <TrustSignalPilot />
      <TrustSignalDevelopers />
      <Footer />
    </div>
  );
}

const navStyles = {
  nav: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    transition: "background 0.2s ease, border-color 0.2s ease",
  },
  inner: {
    maxWidth: "1140px",
    margin: "0 auto",
    padding: "1rem 1.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1.5rem",
  },
  wordmark: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: "1.25rem",
    color: PALETTE.ink,
    textDecoration: "none",
    fontWeight: 500,
    whiteSpace: "nowrap",
  },
  mark: { fontFamily: "'DM Mono', monospace", color: PALETTE.blue, fontSize: "0.9rem" },
  links: { display: "flex", gap: "1.8rem", alignItems: "center" },
  link: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "0.92rem",
    color: PALETTE.muted,
    textDecoration: "none",
    transition: "color 0.15s ease",
  },
  cta: {
    background: PALETTE.blue,
    color: "#FFFFFF",
    textDecoration: "none",
    fontWeight: 500,
    fontSize: "0.92rem",
    padding: "0.6rem 1.2rem",
    borderRadius: "2px",
    whiteSpace: "nowrap",
    transition: "background 0.15s ease",
  },
};

const footStyles = {
  footer: {
    background: PALETTE.deep,
    color: PALETTE.paper,
    padding: "4.5rem 1.5rem 2.5rem",
    fontFamily: "'DM Sans', sans-serif",
    borderTop: `1px solid ${PALETTE.lineDark}`,
  },
  inner: { maxWidth: "1080px", margin: "0 auto" },
  grid: {
    display: "grid",
    gridTemplateColumns: "1.6fr 1fr 1fr 1fr",
    gap: "2.5rem",
  },
  brandCol: { maxWidth: "300px" },
  wordmark: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: "1.3rem",
    color: PALETTE.paper,
    fontWeight: 500,
  },
  mark: { fontFamily: "'DM Mono', monospace", color: PALETTE.blue, fontSize: "0.95rem" },
  tagline: { fontSize: "0.92rem", color: PALETTE.lightMuted, margin: "0.9rem 0 0" },
  prove: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "0.78rem",
    letterSpacing: "0.1em",
    color: PALETTE.lightMuted,
    margin: "0.4rem 0 0",
  },
  contact: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "0.78rem",
    lineHeight: 1.7,
    color: PALETTE.lightMuted,
    margin: "1.4rem 0 0",
  },
  contactLink: { color: PALETTE.lightMuted, textDecoration: "none" },
  colHead: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "0.74rem",
    letterSpacing: "0.12em",
    color: "rgba(250,250,248,0.4)",
    marginBottom: "1rem",
  },
  colList: { listStyle: "none", padding: 0, margin: 0 },
  colItem: { marginBottom: "0.7rem" },
  colLink: {
    fontSize: "0.9rem",
    color: PALETTE.lightMuted,
    textDecoration: "none",
    transition: "color 0.15s ease",
  },
  bottom: {
    marginTop: "3.5rem",
    paddingTop: "1.6rem",
    borderTop: `1px solid ${PALETTE.lineDark}`,
    display: "flex",
    flexWrap: "wrap",
    gap: "0.8rem",
    justifyContent: "space-between",
    fontFamily: "'DM Mono', monospace",
    fontSize: "0.74rem",
    color: "rgba(250,250,248,0.4)",
  },
  bottomNote: { color: "rgba(250,250,248,0.4)" },
};

const pageCss = `
  html { scroll-behavior: smooth; }
  .ts-navlink:hover { color: #121316 !important; }
  .ts-navcta:hover { background: #3A46D8 !important; }
  .ts-footlink:hover { color: #FFFFFF !important; }
  @media (max-width: 820px) {
    .ts-navlinks { display: none !important; }
  }
  @media (max-width: 760px) {
    footer > div > div:first-child { grid-template-columns: 1fr 1fr !important; gap: 2rem !important; }
  }
`;
