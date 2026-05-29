"use client";

import { useState, useEffect } from "react";

/**
 * TrustSignal — "Who it's for" section (healthcare-led)
 * Monochrome base with two semantic accents:
 *   Signal Red    #F23A17 = attention / what's at risk  (fraud stats, "the handoff")
 *   Electric Blue #4D5AF0 = trusted action / verified    (the fit, the link)
 * Leads with the highest-priority Phase 1 vertical (healthcare staffing, 9/10)
 * and subordinates the other verticals beneath it, so the page reads focused.
 * Grounded in the healthcare vertical sheet + executive briefing.
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

const STATS = [
  { figure: "7,600+", color: PALETTE.red, label: "fake nursing diplomas surfaced in one federal operation" },
  { figure: "37%", color: PALETTE.red, label: "of them passed the NCLEX and entered patient care" },
  { figure: "$6.5B", color: PALETTE.ink, label: "annual US travel-nursing market" },
];

const OTHER_VERTICALS = [
  { name: "Education", signal: "Prove the transcript matches what the school issued." },
  { name: "HR & Staffing", signal: "Tamper-detection for self-submitted PDFs." },
  { name: "Mortgage & Title", signal: "Prove the deed recorded is the deed signed." },
  { name: "Government", signal: "Public records that can prove they weren't altered." },
  { name: "Logistics", signal: "Seal the manifest before customs receives it." },
];

export default function TrustSignalAudience() {
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
    <section style={styles.section} id="who-its-for">
      <style>{css}</style>

      <div style={styles.inner}>
        <div style={styles.eyebrow}>WHO IT&rsquo;S FOR&nbsp;&nbsp;·&nbsp;&nbsp;HEALTHCARE STAFFING</div>

        <h2 style={styles.heading}>
          Verified at the source.{" "}
          <span style={styles.headingAccent}>Altered at the handoff.</span>
        </h2>

        <p style={styles.sub}>
          symplr, Verisys, and Nursys confirm a license at the source. None of them seal the
          assembled credential packet during the agency-to-facility handoff &mdash; the moment
          it changes hands. That gap is where fraud lives. TrustSignal doesn&rsquo;t replace the
          source check; it sits after it, sealing the packet so any facility can prove the file
          is exactly what the agency sent.
        </p>

        <div style={styles.stats}>
          {STATS.map((s, i) => (
            <div
              key={s.figure}
              style={{ ...styles.stat, animationDelay: reduced ? "0s" : `${0.08 * i}s` }}
              className="ts-fade"
            >
              <div style={{ ...styles.statFigure, color: s.color }}>{s.figure}</div>
              <div style={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={styles.fit}>
          <span style={styles.check} aria-hidden="true">✓</span>
          <p style={styles.fitText}>
            Attach a tamper-evident receipt to every credential packet before it reaches the
            facility&rsquo;s MSO. The facility calls the verify endpoint and gets mathematical
            proof the packet is unchanged &mdash; no board re-query, no phone call, no manual
            process. An NFC tap at the credentialing desk binds physical presence to the
            submission.
          </p>
        </div>

        <a href="#pilot-request" style={styles.link} className="ts-link">
          See how the packet handoff gets sealed <span aria-hidden="true">&rarr;</span>
        </a>

        {/* Subordinated verticals — same gap, more industries */}
        <div style={styles.otherWrap}>
          <div style={styles.otherHead}>One gap. Eight industries.</div>
          <ul style={styles.otherList}>
            {OTHER_VERTICALS.map((v) => (
              <li key={v.name} style={styles.otherItem}>
                <span style={styles.otherName}>{v.name}</span>
                <span style={styles.otherSignal}>{v.signal}</span>
              </li>
            ))}
          </ul>
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
    fontSize: "clamp(2rem, 4.6vw, 3.4rem)",
    lineHeight: 1.06,
    letterSpacing: "-0.01em",
    color: PALETTE.ink,
    margin: 0,
  },
  headingAccent: { color: PALETTE.red, fontStyle: "italic" },
  sub: {
    fontWeight: 400,
    fontSize: "clamp(1.02rem, 1.5vw, 1.18rem)",
    lineHeight: 1.62,
    color: PALETTE.body,
    maxWidth: "660px",
    margin: "1.5rem 0 0",
  },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1.8rem",
    margin: "3.4rem 0 0",
  },
  stat: {
    animationName: "tsFadeUp",
    animationDuration: "0.5s",
    animationFillMode: "both",
    animationTimingFunction: "ease",
  },
  statFigure: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontOpticalSizing: "auto",
    fontSize: "clamp(2.6rem, 5vw, 3.6rem)",
    lineHeight: 1,
    letterSpacing: "-0.02em",
  },
  statLabel: {
    fontSize: "0.92rem",
    lineHeight: 1.5,
    color: PALETTE.muted,
    marginTop: "0.7rem",
    maxWidth: "240px",
  },
  fit: {
    display: "flex",
    gap: "0.9rem",
    alignItems: "flex-start",
    margin: "3.4rem 0 0",
    maxWidth: "680px",
  },
  check: {
    color: PALETTE.blue,
    fontWeight: 700,
    fontSize: "1.1rem",
    lineHeight: 1.5,
    flexShrink: 0,
  },
  fitText: {
    fontSize: "1rem",
    lineHeight: 1.6,
    color: PALETTE.body,
    margin: 0,
  },
  link: {
    display: "inline-block",
    marginTop: "1.6rem",
    color: PALETTE.blue,
    textDecoration: "none",
    fontWeight: 500,
    fontSize: "0.98rem",
  },
  otherWrap: {
    marginTop: "4rem",
    paddingTop: "2.2rem",
    borderTop: `1px solid ${PALETTE.line}`,
  },
  otherHead: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "0.78rem",
    letterSpacing: "0.14em",
    color: PALETTE.muted,
    marginBottom: "1.4rem",
  },
  otherList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "1.1rem 2rem",
  },
  otherItem: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
    paddingLeft: "0.9rem",
    borderLeft: `2px solid ${PALETTE.line}`,
  },
  otherName: {
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    fontSize: "0.95rem",
    color: PALETTE.ink,
  },
  otherSignal: {
    fontSize: "0.88rem",
    lineHeight: 1.45,
    color: PALETTE.muted,
  },
};

const css = `
  @keyframes tsFadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @media (prefers-reduced-motion: reduce) { .ts-fade { animation: none !important; } }
  .ts-link:hover { color: #3A46D8 !important; text-decoration: underline; }
`;
