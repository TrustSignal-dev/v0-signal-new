"use client";

import { useState, useEffect } from "react";

/**
 * TrustSignal — "How a pilot works" section
 * Monochrome base with two semantic accents:
 *   Electric Blue #4D5AF0 = trusted action / verified  (Verify step, checks, CTA)
 *   Signal Red    #F23A17 = attention                  (heading emphasis)
 * Grounded in the real pilot model: 90-day, fixed-fee, one-time, non-refundable,
 * up to ~3,000 proofs, 25 NFC cards where applicable, receipts permanent.
 */

const PALETTE = {
  paper: "#FAFAF8",
  ink: "#121316",
  body: "#2a2b30",
  blue: "#4D5AF0",
  red: "#F23A17",
  muted: "rgba(18,19,22,0.60)",
  line: "rgba(18,19,22,0.12)",
};

const STEPS = [
  { n: "01", label: "Collect", body: "Evidence enters through your existing systems. No workflow change, no new tools for your team." },
  { n: "02", label: "Receipt", body: "A signed, tamper-evident receipt is generated at ingestion — a mathematical proof, not a log entry." },
  { n: "03", label: "Verify", body: "Any time later, a single API call confirms the evidence matches its original sealed state.", accent: true },
  { n: "04", label: "Review", body: "Your compliance, legal, and audit teams hold mathematical proof of integrity — not just internal logs." },
];

const TERMS = [
  "90 days, fixed fee, one-time",
  "Up to ~3,000 proofs",
  "25 NFC wallet cards where applicable",
  "No IT integration, no workflow change",
  "Receipts permanently verifiable, even after cancellation",
];

export default function TrustSignalPilot() {
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

  return (
    <section style={styles.section} id="request-pilot">
      <style>{css}</style>

      <div style={styles.inner}>
        <div style={styles.eyebrow}>HOW A PILOT WORKS</div>
        <h2 style={styles.heading}>
          90 days. One workflow. <span style={styles.headingAccent}>One partner.</span>
        </h2>
        <p style={styles.sub}>
          TrustSignal sits behind your existing workflow at the ingestion boundary. We seal a
          single document type, prove its integrity on demand, and the receipts outlive the
          pilot &mdash; and us.
        </p>

        <ol style={styles.steps} aria-label="The pilot lifecycle">
          {STEPS.map((s, i) => (
            <li
              key={s.n}
              style={{ ...styles.step, animationDelay: reduced ? "0s" : `${0.08 * i}s` }}
              className="ts-step"
            >
              <div
                style={{
                  ...styles.stepNum,
                  color: s.accent ? PALETTE.blue : PALETTE.ink,
                  borderColor: s.accent ? "rgba(77,90,240,0.45)" : PALETTE.line,
                }}
              >
                {s.n}
              </div>
              <div style={styles.stepLabel}>{s.label}</div>
              <p style={styles.stepBody}>{s.body}</p>
              {i < STEPS.length - 1 && <span style={styles.connector} aria-hidden="true" />}
            </li>
          ))}
        </ol>

        <ul style={styles.terms} aria-label="Pilot terms">
          {TERMS.map((t) => (
            <li key={t} style={styles.term}>
              <span style={styles.check} aria-hidden="true">✓</span>
              {t}
            </li>
          ))}
        </ul>

        <div style={styles.ctaRow}>
          <a href="#contact" style={styles.primary} className="ts-primary">
            Request a Pilot
          </a>
          <span style={styles.priceNote}>
            Phase 1 verticals (workforce, healthcare staffing): $8,500 / 90 days
          </span>
        </div>
      </div>
    </section>
  );
}

const styles = {
  section: {
    background: PALETTE.paper,
    padding: "6rem 1.5rem",
    fontFamily: "'DM Sans', sans-serif",
    color: PALETTE.body,
    WebkitFontSmoothing: "antialiased",
    borderTop: `1px solid ${PALETTE.line}`,
  },
  inner: { maxWidth: "980px", width: "100%", margin: "0 auto" },
  eyebrow: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "0.78rem",
    letterSpacing: "0.18em",
    color: PALETTE.muted,
    marginBottom: "1.2rem",
    fontWeight: 500,
  },
  heading: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontOpticalSizing: "auto",
    fontWeight: 400,
    fontSize: "clamp(2rem, 4.4vw, 3.2rem)",
    lineHeight: 1.08,
    letterSpacing: "-0.01em",
    color: PALETTE.ink,
    margin: 0,
  },
  headingAccent: { color: PALETTE.red, fontStyle: "italic" },
  sub: {
    fontWeight: 400,
    fontSize: "clamp(1.02rem, 1.5vw, 1.18rem)",
    lineHeight: 1.6,
    color: PALETTE.body,
    maxWidth: "620px",
    margin: "1.4rem 0 0",
  },
  steps: {
    listStyle: "none",
    padding: 0,
    margin: "3.4rem 0 0",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1.8rem",
  },
  step: {
    position: "relative",
    animationName: "tsFadeUp",
    animationDuration: "0.5s",
    animationFillMode: "both",
    animationTimingFunction: "ease",
  },
  stepNum: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "0.85rem",
    fontWeight: 500,
    width: "2.6rem",
    height: "2.6rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    border: "1px solid",
    marginBottom: "1rem",
  },
  stepLabel: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: "1.35rem",
    color: PALETTE.ink,
    marginBottom: "0.5rem",
  },
  stepBody: {
    fontSize: "0.95rem",
    lineHeight: 1.55,
    color: PALETTE.muted,
    margin: 0,
    maxWidth: "230px",
  },
  connector: {
    position: "absolute",
    top: "1.3rem",
    left: "3.2rem",
    right: "-1.8rem",
    height: "1px",
    background: "linear-gradient(90deg, rgba(18,19,22,0.18), rgba(18,19,22,0.04))",
  },
  terms: {
    listStyle: "none",
    padding: 0,
    margin: "3.6rem 0 0",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "0.85rem 1.6rem",
    borderTop: `1px solid ${PALETTE.line}`,
    paddingTop: "2rem",
  },
  term: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "0.82rem",
    lineHeight: 1.5,
    color: PALETTE.body,
    display: "flex",
    alignItems: "flex-start",
    gap: "0.6rem",
  },
  check: { color: PALETTE.blue, fontWeight: 700, flexShrink: 0 },
  ctaRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "1.2rem",
    alignItems: "center",
    marginTop: "3rem",
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
  priceNote: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "0.78rem",
    color: PALETTE.muted,
  },
};

const css = `
  @keyframes tsFadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @media (prefers-reduced-motion: reduce) { .ts-step { animation: none !important; } }
  @media (max-width: 760px) { .ts-step span[aria-hidden="true"] { display: none; } }
  .ts-primary:hover { background: #3A46D8 !important; transform: translateY(-1px); }
`;
