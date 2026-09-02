"use client";

import { useEffect } from "react";

/**
 * TrustSignal — Developer band (inverted dark section)
 * Monochrome dark base with the two semantic accents brightened for the dark
 * ground: Blue = verified/clean, Red = altered/mismatch — shown literally inside
 * the code sample. Grounded in the Product Manual IT/Technical talk track + stack.
 *
 * NOTE: verify route is shown as GET /api/v1/receipt/:id/verify (Product Manual +
 * Forensic Timeline). Lock this against the API-reference doc before launch.
 */

const C = {
  bg: "#121316",
  panel: "#1A1B20",
  paper: "#FAFAF8",
  blue: "#6573FF",
  red: "#FB5B3C",
  muted: "rgba(250,250,248,0.58)",
  faint: "rgba(250,250,248,0.40)",
  line: "rgba(250,250,248,0.12)",
};

const FEATURES = [
  "Pure Node.js SDK — no Python",
  "We receive a feature vector, not your document",
  "Independently verifiable — no TrustSignal server at audit time",
  "Full receipt export on cancellation — zero lock-in",
];

const STACK = [
  "Fastify", "TypeScript", "EdDSA Ed25519", "RFC 8785",
  "Polygon + Sepolia", "DigiCert RFC3161", "OpenAPI",
];

export default function TrustSignalDevelopers() {
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
  }, []);

  return (
    <section style={styles.section} id="developers">
      <style>{css}</style>

      <div style={styles.inner}>
        <div style={styles.grid}>
          <div>
            <div style={styles.eyebrow}>FOR ENGINEERS</div>
            <h2 style={styles.heading}>
              One install. One call.<br />Your documents never leave.
            </h2>
            <p style={styles.sub}>
              Extract a feature vector locally and send numbers &mdash; not files. Get back a
              permanent, independently verifiable receipt. Setup is one command and about thirty
              minutes: no database, server, or queue to provision.
            </p>

            <ul style={styles.features}>
              {FEATURES.map((f) => (
                <li key={f} style={styles.feature}>
                  <span style={styles.tick} aria-hidden="true">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <a href="/docs" style={styles.link} className="ts-devlink">
              Read the API reference <span aria-hidden="true">&rarr;</span>
            </a>
          </div>

          <div style={styles.codeWrap}>
            <div style={styles.codeBar}>
              <span style={styles.dotR} /><span style={styles.dotY} /><span style={styles.dotG} />
              <span style={styles.codeTitle}>trustsignal · quickstart</span>
            </div>
            <pre style={styles.code}>
<span style={styles.cmt}>{"# ~30 min, no DevOps"}</span>{"\n"}
<span style={styles.kw}>$ npx</span>{" trustsignal-setup\n\n"}
<span style={styles.cmt}>{"# seal at ingestion — docs never leave your infra"}</span>{"\n"}
<span style={styles.kw}>POST</span>{" /api/v1/receipts\n"}
{"  → "}<span style={styles.ok}>200</span>{"  { receipt_id, signature: "}<span style={styles.str}>&quot;ed25519:…&quot;</span>{", verify_url }\n\n"}
<span style={styles.cmt}>{"# verify anytime — on-chain math, no TrustSignal server"}</span>{"\n"}
<span style={styles.kw}>GET</span>{"  /api/v1/receipt/:id/verify\n"}
{"  → { status: "}<span style={styles.clean}>&quot;clean&quot;</span>{" }     "}<span style={styles.clean}>✓ unchanged</span>{"\n"}
{"  → { status: "}<span style={styles.mismatch}>&quot;mismatch&quot;</span>{" }  "}<span style={styles.mismatch}>✗ altered since sealing</span>
            </pre>
          </div>
        </div>

        <div style={styles.stack}>
          {STACK.map((s, i) => (
            <span key={s} style={styles.stackItem}>
              {s}
              {i < STACK.length - 1 && <span style={styles.stackSep}>·</span>}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

const styles = {
  section: {
    background: C.bg,
    padding: "6rem 1.5rem",
    fontFamily: "'DM Sans', sans-serif",
    color: C.paper,
    WebkitFontSmoothing: "antialiased",
  },
  inner: { maxWidth: "1080px", width: "100%", margin: "0 auto" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "3rem",
    alignItems: "start",
  },
  eyebrow: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "0.78rem",
    letterSpacing: "0.18em",
    color: C.faint,
    marginBottom: "1.2rem",
    fontWeight: 500,
  },
  heading: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontOpticalSizing: "auto",
    fontWeight: 400,
    fontSize: "clamp(1.9rem, 3.8vw, 2.9rem)",
    lineHeight: 1.08,
    letterSpacing: "-0.01em",
    color: C.paper,
    margin: 0,
  },
  sub: {
    fontSize: "1rem",
    lineHeight: 1.62,
    color: C.muted,
    margin: "1.4rem 0 0",
    maxWidth: "440px",
  },
  features: { listStyle: "none", padding: 0, margin: "1.8rem 0 0" },
  feature: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "0.82rem",
    lineHeight: 1.5,
    color: C.muted,
    display: "flex",
    gap: "0.6rem",
    alignItems: "flex-start",
    marginBottom: "0.7rem",
  },
  tick: { color: C.blue, fontWeight: 700, flexShrink: 0 },
  link: {
    display: "inline-block",
    marginTop: "1.4rem",
    color: C.blue,
    textDecoration: "none",
    fontWeight: 500,
    fontSize: "0.98rem",
  },
  codeWrap: {
    background: C.panel,
    border: `1px solid ${C.line}`,
    borderRadius: "8px",
    overflow: "hidden",
  },
  codeBar: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    padding: "0.7rem 1rem",
    borderBottom: `1px solid ${C.line}`,
  },
  dotR: { width: 10, height: 10, borderRadius: "50%", background: "#FB5B3C", display: "inline-block" },
  dotY: { width: 10, height: 10, borderRadius: "50%", background: "#E3A72F", display: "inline-block" },
  dotG: { width: 10, height: 10, borderRadius: "50%", background: "#3BB273", display: "inline-block" },
  codeTitle: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "0.72rem",
    color: C.faint,
    marginLeft: "0.6rem",
  },
  code: {
    margin: 0,
    padding: "1.3rem 1.2rem",
    fontFamily: "'DM Mono', monospace",
    fontSize: "0.78rem",
    lineHeight: 1.7,
    color: C.paper,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    overflowX: "auto",
  },
  cmt: { color: C.faint },
  kw: { color: C.paper, fontWeight: 500 },
  str: { color: "#C9C1B1" },
  ok: { color: C.blue, fontWeight: 600 },
  clean: { color: C.blue, fontWeight: 600 },
  mismatch: { color: C.red, fontWeight: 600 },
  stack: {
    marginTop: "3.4rem",
    paddingTop: "1.8rem",
    borderTop: `1px solid ${C.line}`,
    fontFamily: "'DM Mono', monospace",
    fontSize: "0.74rem",
    letterSpacing: "0.04em",
    color: C.faint,
  },
  stackItem: { whiteSpace: "nowrap" },
  stackSep: { margin: "0 0.7rem", opacity: 0.5 },
};

const css = `
  .ts-devlink:hover { color: #FFFFFF !important; text-decoration: underline; }
`;
