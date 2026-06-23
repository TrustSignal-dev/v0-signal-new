"use client";

import { useState, useEffect } from "react";

/**
 * TrustSignal — above-the-fold hero
 * Monochrome base (near-black on near-white) with two semantic accents:
 *   Electric Blue #4D5AF0 = trusted action / verified  (primary CTA)
 *   Signal Red    #F23A17 = attention / what's at risk  (rotating record type, arrow)
 * Each color appears sparingly — the field is black and white. Structure,
 * layout, motion, and copy are unchanged from the prior version.
 */

const RECORD_TYPES = [
  "loan files",
  "patient records",
  "transcripts",
  "title records",
  "audit logs",
];

const PALETTE = {
  paper: "#FAFAF8",
  ink: "#121316",
  body: "#2a2b30",
  blue: "#4D5AF0",
  red: "#F23A17",
  muted: "rgba(18,19,22,0.60)",
  line: "rgba(18,19,22,0.12)",
};

export default function TrustSignalHero() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const id = "ts-hero-fonts";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,400&family=DM+Sans:wght@400;500&family=DM+Mono:wght@400;500&display=swap";
      document.head.appendChild(link);
    }
    setReduced(
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false
    );
  }, []);

  useEffect(() => {
    if (reduced) {
      const t = setInterval(() => setIndex((i) => (i + 1) % RECORD_TYPES.length), 2600);
      return () => clearInterval(t);
    }
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % RECORD_TYPES.length);
        setVisible(true);
      }, 320);
    }, 2400);
    return () => clearInterval(t);
  }, [reduced]);

  return (
    <section style={styles.section}>
      <style>{css}</style>

      <div style={styles.inner}>
        <div style={styles.eyebrow}>TRUSTSIGNAL&nbsp;&nbsp;·&nbsp;&nbsp;PROVE. VERIFY. TRUST.</div>

        <h1 style={styles.headline}>
          <span style={styles.srOnly}>
            Prove your records haven't changed since the day you filed them.
          </span>

          <span aria-hidden="true">
            Prove your{" "}
            <span style={styles.rotatorWrap}>
              <span
                style={{
                  ...styles.rotator,
                  opacity: visible ? 1 : 0,
                  transform: reduced
                    ? "none"
                    : visible
                    ? "translateY(0)"
                    : "translateY(0.25em)",
                }}
              >
                {RECORD_TYPES[index]}
              </span>
            </span>
            <br />
            haven't changed since the day you filed them.
          </span>
        </h1>

        <p style={styles.sub}>
          TrustSignal issues a cryptographic receipt for every record and anchors it on a
          public blockchain. When a regulator, auditor, or court asks years later, you can
          prove it&rsquo;s untouched &mdash; in seconds, without trusting us or anyone else.
        </p>

        <div style={styles.ctaRow}>
          <a href="#pilot-request" style={styles.primary} className="ts-primary">
            Request a Pilot
          </a>
          <a href="#pilot-request" style={styles.secondary} className="ts-secondary">
            See how a pilot works <span style={styles.arrow} aria-hidden="true">&rarr;</span>
          </a>
        </div>

        <p style={styles.pilotNote}>
          90-day pilot &nbsp;·&nbsp; your documents never leave your infrastructure
          &nbsp;·&nbsp; receipts stay permanently verifiable, even after cancellation
        </p>

        <div style={styles.trustStrip}>
          <TrustItem>Anchored on Ethereum + Polygon</TrustItem>
          <Dot />
          <TrustItem>Independently verifiable</TrustItem>
          <Dot />
          <TrustItem>No documents or PII stored</TrustItem>
        </div>
      </div>
    </section>
  );
}

function TrustItem({ children }) {
  return <span style={styles.trustItem}>{children}</span>;
}

function Dot() {
  return <span style={styles.dot} aria-hidden="true">&bull;</span>;
}

const styles = {
  section: {
    minHeight: "100vh",
    background: PALETTE.paper,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "6rem 1.5rem",
    fontFamily: "'DM Sans', sans-serif",
    color: PALETTE.body,
    WebkitFontSmoothing: "antialiased",
  },
  inner: { maxWidth: "860px", width: "100%", textAlign: "left" },
  eyebrow: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "0.78rem",
    letterSpacing: "0.18em",
    color: PALETTE.muted,
    marginBottom: "2rem",
    fontWeight: 500,
  },
  headline: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontOpticalSizing: "auto",
    fontWeight: 400,
    fontSize: "clamp(2.6rem, 6.2vw, 4.6rem)",
    lineHeight: 1.04,
    letterSpacing: "-0.01em",
    color: PALETTE.ink,
    margin: 0,
  },
  rotatorWrap: {
    display: "inline-block",
    minWidth: "8.5em",
    textAlign: "left",
    verticalAlign: "baseline",
  },
  rotator: {
    display: "inline-block",
    color: PALETTE.red,
    fontStyle: "italic",
    transition: "opacity 0.32s ease, transform 0.32s ease",
    willChange: "opacity, transform",
  },
  sub: {
    fontWeight: 400,
    fontSize: "clamp(1.05rem, 1.6vw, 1.22rem)",
    lineHeight: 1.6,
    color: PALETTE.body,
    maxWidth: "620px",
    margin: "1.8rem 0 0",
  },
  ctaRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "1rem",
    alignItems: "center",
    margin: "2.4rem 0 0",
  },
  primary: {
    background: PALETTE.blue,
    color: "#FFFFFF",
    textDecoration: "none",
    fontWeight: 500,
    fontSize: "1rem",
    padding: "0.95rem 1.8rem",
    borderRadius: "2px",
    letterSpacing: "0.01em",
    transition: "transform 0.15s ease, background 0.15s ease",
    display: "inline-block",
  },
  secondary: {
    color: PALETTE.ink,
    textDecoration: "none",
    fontWeight: 500,
    fontSize: "1rem",
    padding: "0.95rem 1.4rem",
    borderRadius: "2px",
    border: `1px solid ${PALETTE.line}`,
    transition: "border-color 0.15s ease, background 0.15s ease",
    display: "inline-block",
  },
  arrow: { color: PALETTE.red, fontWeight: 600 },
  pilotNote: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "0.8rem",
    lineHeight: 1.6,
    color: PALETTE.muted,
    margin: "1.6rem 0 0",
    maxWidth: "640px",
  },
  trustStrip: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "0.65rem",
    marginTop: "2.8rem",
    paddingTop: "1.6rem",
    borderTop: `1px solid ${PALETTE.line}`,
  },
  trustItem: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "0.76rem",
    letterSpacing: "0.04em",
    color: PALETTE.muted,
  },
  dot: { color: PALETTE.muted, fontSize: "0.7rem", opacity: 0.7 },
  srOnly: {
    position: "absolute",
    width: "1px",
    height: "1px",
    padding: 0,
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0,0,0,0)",
    whiteSpace: "nowrap",
    border: 0,
  },
};

const css = `
  .ts-primary:hover { background: #3A46D8 !important; transform: translateY(-1px); }
  .ts-secondary:hover { border-color: rgba(18,19,22,0.5) !important; background: rgba(18,19,22,0.03); }
  ::selection { background: #4D5AF0; color: #FFFFFF; }
`;
