"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const PALETTE = {
  paper: "#FAFAF8",
  ink: "#121316",
  blue: "#4D5AF0",
  muted: "rgba(18,19,22,0.60)",
  line: "rgba(18,19,22,0.12)",
};

const NAV_LINKS = [
  { label: "Who it's for", href: "/#who-its-for" },
  { label: "How a pilot works", href: "/#pilot-request" },
  { label: "Developers", href: "/#developers" },
  { label: "Docs", href: "/docs" },
];

export default function TrustSignalNav() {
  const [scrolled, setScrolled] = useState(false);
  // undefined while loading, null when signed out. Only the presence of a session is used here.
  const [signedIn, setSignedIn] = useState(undefined);
  useEffect(() => {
    let active = true;
    fetch("/api/auth/me", { credentials: "same-origin", cache: "no-store" })
      .then((r) => { if (active) setSignedIn(r.ok); })
      .catch(() => { if (active) setSignedIn(false); });
    return () => { active = false; };
  }, []);
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
      <style>{navCss}</style>
      <div style={navStyles.inner} className="ts-navinner">
        <Link href="/" style={navStyles.wordmark}>
          <img src="/brand/lockup-horizontal.svg" alt="TrustSignal Logo" style={navStyles.logo} />
        </Link>
        <div style={navStyles.links} className="ts-navlinks">
          {NAV_LINKS.map((l) => (
            <Link key={l.label} href={l.href} style={navStyles.link} className="ts-navlink">
              {l.label}
            </Link>
          ))}
        </div>
        <div style={navStyles.actions} className="ts-navactions">
          <Link href={signedIn ? "/dashboard" : "/sign-in"} style={navStyles.signIn} className="ts-navsignin">
            {signedIn ? "Dashboard" : "Sign in"}
          </Link>
          <Link href="/get-your-api-key" style={navStyles.cta} className="ts-navcta">
            Get an API key
          </Link>
        </div>
      </div>
    </nav>
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
    display: "flex",
    alignItems: "center",
    textDecoration: "none",
  },
  logo: { height: "40px", width: "auto", maxWidth: "200px" },
  links: { display: "flex", gap: "1.8rem", alignItems: "center" },
  link: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "0.92rem",
    color: PALETTE.muted,
    textDecoration: "none",
    transition: "color 0.15s ease",
  },
  actions: { display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "1.1rem", minWidth: 0 },
  signIn: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "0.92rem",
    fontWeight: 500,
    color: PALETTE.ink,
    textDecoration: "none",
    whiteSpace: "nowrap",
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

const navCss = `
  .ts-navlink:hover { color: #121316 !important; }
  .ts-navcta:hover { background: #3A46D8 !important; }
  .ts-navsignin:hover { text-decoration: underline !important; text-underline-offset: 4px; }
  @media (max-width: 1050px) {
    .ts-navlinks { display: none !important; }
  }
  @media (max-width: 480px) {
    .ts-navinner { padding: 0.75rem !important; gap: 0.75rem !important; }
    .ts-navactions { flex-wrap: wrap; gap: 0.5rem !important; }
    .ts-navcta { font-size: 0.8rem !important; padding: 0.6rem 0.7rem !important; white-space: normal !important; text-align: center; }
    .ts-navsignin { font-size: 0.8rem !important; }
    nav img[alt="TrustSignal Logo"] { max-width: 120px !important; height: auto !important; }
  }
`;
