"use client";

import { useState, useEffect, useRef } from "react";

/**
 * TrustSignal — "Who it's for" section
 * Scroll-driven: the section sticks to the viewport while the user scrolls through
 * the verticals one by one. Each scroll step advances the active vertical with a
 * smooth vertical slot-machine animation (up on scroll-down, down on scroll-up).
 * Respects prefers-reduced-motion by falling back to a gentle crossfade.
 *
 * Monochrome base with two semantic accents:
 *   Signal Red    #F23A17 = attention / what's at risk
 *   Electric Blue #4D5AF0 = trusted action / verified
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

const VERTICALS = [
  {
    label: "Healthcare Staffing",
    heading: "Verified at the source.",
    headingAccent: "Altered at the handoff.",
    sub:
      "symplr, Verisys, and Nursys confirm a license at the source. None of them seal the assembled credential packet during the agency-to-facility handoff — the moment it changes hands. That gap is where fraud lives. TrustSignal doesn't replace the source check; it sits after it, sealing the packet so any facility can prove the file is exactly what the agency sent.",
    stats: [
      { figure: "7,600+", color: PALETTE.red, label: "fake nursing diplomas surfaced in one federal operation (Op. Nightingale)" },
      { figure: "37%", color: PALETTE.red, label: "of them passed the NCLEX and entered patient care" },
      { figure: "$6.5B", color: PALETTE.ink, label: "annual US travel-nursing market" },
    ],
    fit: "Attach a tamper-evident receipt to every credential packet before it reaches the facility's MSO. The facility calls the verify endpoint and gets mathematical proof the packet is unchanged — no board re-query, no phone call, no manual process. An NFC tap at the credentialing desk binds physical presence to the submission.",
    cta: "See how the credential packet handoff gets sealed",
  },
  {
    label: "Education",
    heading: "Issued by the institution.",
    headingAccent: "Altered before it arrived.",
    sub:
      "Transcript and diploma fraud follows graduates into every job application, licensing board, and graduate admissions process. Registrars issue a document — then lose custody of it. TrustSignal seals the record at issuance so any verifier can confirm the file matches what the school produced, without contacting the school.",
    stats: [
      { figure: "72%", color: PALETTE.red, label: "of employers have caught candidates lying on a résumé — SHRM" },
      { figure: "1 in 4", color: PALETTE.red, label: "U.S. adults have embellished education credentials — HireRight" },
      { figure: "$0", color: PALETTE.ink, label: "workflow change required for the institution" },
    ],
    fit: "Seal transcripts and diplomas at the registrar's export boundary. Any employer, graduate school, or licensing board can verify integrity with a single API call — or an NFC tap on the wallet card — without calling the registrar. The receipt outlives every enrollment system the school ever runs.",
    cta: "See how transcript integrity gets sealed at issuance",
  },
  {
    label: "HR & Staffing",
    heading: "Candidates self-submit.",
    headingAccent: "Nobody seals the file.",
    sub:
      "Background screening catches fabricated histories after the hire. It doesn't detect a real document that was quietly altered before submission. Staffing firms and HR teams receive PDFs they cannot prove are unmodified — and regulators are starting to ask for evidence trails that internal logs can't satisfy.",
    stats: [
      { figure: "85%", color: PALETTE.red, label: "of employers caught applicants lying — HireRight Global Report" },
      { figure: "3x", color: PALETTE.red, label: "costlier to replace a bad hire than to prevent one — SHRM estimate" },
      { figure: "0", color: PALETTE.ink, label: "PII stored by TrustSignal — only a mathematical fingerprint" },
    ],
    fit: "Attach a tamper-evident receipt at the intake boundary — when the candidate submits the document, before it enters your ATS. Any reviewer later can confirm the file wasn't touched between submission and review. Your compliance team holds audit-grade proof without IT involvement.",
    cta: "See how document intake gets sealed at submission",
  },
  {
    label: "Mortgage & Title",
    heading: "The deed was signed.",
    headingAccent: "Can you prove it wasn't changed?",
    sub:
      "Wire fraud in real estate exploits the closing document handoff — the moment a deed, HUD-1, or closing disclosure moves from one party to another without a tamper-evident seal. Lenders, title agents, and secondary market buyers all rely on trust at that gap. TrustSignal closes it: seal the document at execution and any party can prove what was recorded is what was signed.",
    stats: [
      { figure: "50×", color: PALETTE.red, label: "growth in real estate wire fraud losses in under 10 years — FBI" },
      { figure: "$446M", color: PALETTE.red, label: "in reported wire fraud losses in a single year — FBI IC3 2023" },
      { figure: "$12,500", color: PALETTE.ink, label: "90-day pilot — fixed fee, no workflow change" },
    ],
    fit: "Seal closing packages at execution — before the deed is recorded and before wire instructions are transmitted. The title agent, lender, and secondary market buyer all share one verifiable proof of integrity. An NFC tap at closing binds the physical closing card to the digital receipt.",
    cta: "See how closing document integrity gets sealed",
  },
  {
    label: "Government",
    heading: "Public records are public.",
    headingAccent: "Their integrity isn't.",
    sub:
      "Governments produce and certify records that citizens, courts, and businesses rely on. Alteration after issuance — whether by insiders, external fraud, or chain-of-custody failure — is undetectable without a tamper-evident anchor. TrustSignal gives agencies a permanent, verifiable proof layer without IT projects or system replacement.",
    stats: [
      { figure: "42%", color: PALETTE.red, label: "of government data breaches involve insider threats — Verizon DBIR" },
      { figure: "$10,000", color: PALETTE.ink, label: "90-day pilot for public sector — fixed fee, no workflow change" },
      { figure: "0", color: PALETTE.ink, label: "workflow changes required for staff or citizens" },
    ],
    fit: "Seal permits, certificates, and public filings at the point of issuance. Any citizen, court, or federal auditor can verify integrity on demand — without contacting the issuing office. Receipts remain permanently verifiable even if the underlying system is replaced or decommissioned.",
    cta: "See how public record integrity gets anchored at issuance",
  },
  {
    label: "Logistics",
    heading: "The manifest was sealed.",
    headingAccent: "Was it sealed correctly?",
    sub:
      "Counterfeit certificates of origin, forged inspection reports, and altered shipping manifests move billions in fraudulent goods across borders every year. Customs, insurers, and downstream buyers have no way to prove the document they received matches the one that was issued — without a tamper-evident anchor at the source.",
    stats: [
      { figure: "$4.5T", color: PALETTE.red, label: "estimated annual global cost of supply chain fraud — ICC" },
      { figure: "2.5%", color: PALETTE.red, label: "of world trade estimated to involve counterfeit or pirated goods — OECD" },
      { figure: "<3s", color: PALETTE.ink, label: "receipt generation at ingestion — no latency impact" },
    ],
    fit: "Seal manifests, certificates of origin, and inspection reports at the point of creation — before handoff to freight forwarders, customs, or downstream buyers. Any party in the chain verifies integrity with one API call. No EDI changes, no system integration — the seal sits at the export boundary.",
    cta: "See how manifest integrity gets sealed at origin",
  },
];

const N = VERTICALS.length;

export default function TrustSignalAudience() {
  const [reduced, setReduced] = useState(false);
  const [vIndex, setVIndex] = useState(0);
  const [dir, setDir] = useState(1); // 1 = scrolling down, -1 = scrolling up
  const [phase, setPhase] = useState("idle"); // "idle" | "exit" | "enter"
  const wrapRef = useRef(null);
  const stickyRef = useRef(null);
  const pendingIndex = useRef(0);
  const isAnimating = useRef(false);

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
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    setReduced(mq?.matches ?? false);
  }, []);

  // Animate to a new vertical
  const goTo = (nextIndex, scrollDir) => {
    if (isAnimating.current) return;
    if (nextIndex === vIndex) return;
    isAnimating.current = true;
    setDir(scrollDir);
    setPhase("exit");
    pendingIndex.current = nextIndex;

    setTimeout(() => {
      setVIndex(nextIndex);
      setPhase("enter");
      setTimeout(() => {
        setPhase("idle");
        isAnimating.current = false;
      }, 400);
    }, 300);
  };

  // Scroll-driven logic
  useEffect(() => {
    if (reduced) return; // reduced motion: no scroll hijack

    const wrap = wrapRef.current;
    if (!wrap) return;

    // Each "virtual scroll step" is 100vh
    const STEP = typeof window !== "undefined" ? window.innerHeight : 800;
    // Total scroll height = N steps worth of scroll
    const totalExtra = STEP * (N - 1);

    // We read scroll position and compute which vertical should show
    const onScroll = () => {
      const rect = wrap.getBoundingClientRect();
      const wrapTop = wrap.offsetTop; // distance from page top to wrap
      const scrollY = window.scrollY;

      // How far the user has scrolled INTO the section (0 … totalExtra)
      const scrolledInto = Math.max(0, Math.min(scrollY - wrapTop, totalExtra));
      const rawIndex = scrolledInto / STEP;
      const newIndex = Math.min(N - 1, Math.floor(rawIndex + 0.15)); // slight snap bias

      if (newIndex !== pendingIndex.current) {
        const scrollDir = newIndex > pendingIndex.current ? 1 : -1;
        pendingIndex.current = newIndex;
        goTo(newIndex, scrollDir);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduced, vIndex]);

  const v = VERTICALS[vIndex];

  // Animation transforms for slot-machine effect
  const exitTransform = phase === "exit"
    ? `translateY(${dir > 0 ? "-18px" : "18px"})`
    : "translateY(0)";
  const enterTransform = phase === "enter"
    ? "translateY(0)"
    : phase === "idle"
      ? "translateY(0)"
      : `translateY(${dir > 0 ? "18px" : "-18px"})`;
  const contentOpacity = phase === "exit" ? 0 : 1;

  // Total height of the wrapper = sticky height + extra scroll space
  const sectionHeight = `calc(100vh * ${N})`;

  return (
    <div
      ref={wrapRef}
      id="who-its-for"
      style={{
        height: reduced ? "auto" : sectionHeight,
        position: "relative",
        borderTop: `1px solid ${PALETTE.line}`,
      }}
    >
      <style>{css}</style>

      {/* Sticky container — pins inside the wrapper */}
      <div
        ref={stickyRef}
        style={{
          position: reduced ? "relative" : "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
          background: PALETTE.paper,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <section
          style={styles.section}
        >
          <div style={styles.inner}>
            {/* Eyebrow — rotating vertical label */}
            <div style={styles.eyebrow}>
              WHO IT&rsquo;S FOR&nbsp;&nbsp;·&nbsp;&nbsp;
              <span
                style={{
                  display: "inline-block",
                  opacity: contentOpacity,
                  transform: reduced ? "none" : (phase === "exit" ? exitTransform : enterTransform),
                  transition: reduced ? "none" : "opacity 0.28s ease, transform 0.28s ease",
                  willChange: "opacity, transform",
                }}
              >
                {v.label.toUpperCase()}
              </span>
            </div>

            {/* Main content — slot-machine animated */}
            <div
              style={{
                opacity: contentOpacity,
                transform: reduced ? "none" : (phase === "exit" ? exitTransform : enterTransform),
                transition: reduced ? "none" : "opacity 0.28s ease, transform 0.28s ease",
                willChange: "opacity, transform",
              }}
            >
              <h2 style={styles.heading}>
                {v.heading}{" "}
                <span style={styles.headingAccent}>{v.headingAccent}</span>
              </h2>

              <p style={styles.sub}>{v.sub}</p>

              {/* Stats */}
              <div style={styles.stats}>
                {v.stats.map((s, i) => (
                  <div key={`${vIndex}-${i}`} style={styles.stat}>
                    <div style={{ ...styles.statFigure, color: s.color }}>{s.figure}</div>
                    <div style={styles.statLabel}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Fit paragraph */}
              <div style={styles.fit}>
                <span style={styles.check} aria-hidden="true">✓</span>
                <p style={styles.fitText}>{v.fit}</p>
              </div>

              {/* CTA */}
              <a href="#pilot-request" style={styles.link} className="ts-link">
                {v.cta} <span aria-hidden="true">&rarr;</span>
              </a>
            </div>

            {/* Progress dots */}
            {!reduced && (
              <div style={styles.dots} aria-hidden="true">
                {VERTICALS.map((vert, i) => (
                  <div
                    key={vert.label}
                    style={{
                      ...styles.dot,
                      background: i === vIndex ? PALETTE.ink : PALETTE.line,
                      transform: i === vIndex ? "scaleX(2.4)" : "scaleX(1)",
                      transition: "background 0.25s ease, transform 0.25s ease",
                    }}
                  />
                ))}
              </div>
            )}

            {/* Scroll hint — shown only at first vertical */}
            {vIndex === 0 && !reduced && (
              <div style={styles.scrollHint} className="ts-scroll-hint" aria-hidden="true">
                scroll to explore ↓
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Subordinated verticals — shown below the sticky zone on mobile / reduced */}
      {reduced && (
        <section style={{ ...styles.section, paddingTop: "2rem" }}>
          <div style={styles.inner}>
            <div style={styles.otherWrap}>
              <div style={styles.otherHead}>One gap. {N} industries.</div>
              <ul style={styles.otherList}>
                {VERTICALS.filter((_, i) => i !== vIndex).map((vert) => (
                  <li key={vert.label} style={styles.otherItem}>
                    <span style={styles.otherName}>{vert.label}</span>
                    <span style={styles.otherSignal}>{vert.stats[0].figure}&ensp;{vert.stats[0].label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

const styles = {
  section: {
    background: PALETTE.paper,
    padding: "3rem 1.5rem",
    fontFamily: "'DM Sans', sans-serif",
    color: PALETTE.body,
    WebkitFontSmoothing: "antialiased",
  },
  inner: { maxWidth: "980px", width: "100%", margin: "0 auto", position: "relative" },
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
    fontSize: "clamp(1.8rem, 4.2vw, 3.2rem)",
    lineHeight: 1.06,
    letterSpacing: "-0.01em",
    color: PALETTE.ink,
    margin: 0,
  },
  headingAccent: { color: PALETTE.red, fontStyle: "italic" },
  sub: {
    fontWeight: 400,
    fontSize: "clamp(0.95rem, 1.4vw, 1.1rem)",
    lineHeight: 1.62,
    color: PALETTE.body,
    maxWidth: "640px",
    margin: "1.2rem 0 0",
  },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "1.4rem",
    margin: "2.4rem 0 0",
  },
  stat: {},
  statFigure: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontOpticalSizing: "auto",
    fontSize: "clamp(2.2rem, 4vw, 3.2rem)",
    lineHeight: 1,
    letterSpacing: "-0.02em",
  },
  statLabel: {
    fontSize: "0.88rem",
    lineHeight: 1.5,
    color: PALETTE.muted,
    marginTop: "0.5rem",
    maxWidth: "220px",
  },
  fit: {
    display: "flex",
    gap: "0.9rem",
    alignItems: "flex-start",
    margin: "2.4rem 0 0",
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
    fontSize: "0.97rem",
    lineHeight: 1.6,
    color: PALETTE.body,
    margin: 0,
  },
  link: {
    display: "inline-block",
    marginTop: "1.4rem",
    color: PALETTE.blue,
    textDecoration: "none",
    fontWeight: 500,
    fontSize: "0.96rem",
  },
  dots: {
    display: "flex",
    gap: "6px",
    marginTop: "2rem",
    alignItems: "center",
  },
  dot: {
    width: "18px",
    height: "4px",
    borderRadius: "2px",
    transformOrigin: "left center",
  },
  scrollHint: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "0.72rem",
    letterSpacing: "0.14em",
    color: PALETTE.muted,
    marginTop: "1.2rem",
    opacity: 1,
    transition: "opacity 0.4s ease",
  },
  otherWrap: {
    paddingTop: "1.2rem",
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
  .ts-link:hover { color: #3A46D8 !important; text-decoration: underline; }
  .ts-scroll-hint { animation: tsPulse 2.4s ease-in-out infinite; }
  @keyframes tsPulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
`;
