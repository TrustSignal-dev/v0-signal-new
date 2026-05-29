"use client";

import { useState, useEffect, useRef } from "react";

/**
 * TrustSignal — above-the-fold hero
 * Scroll-driven word reveal: the headline record type changes as user scrolls,
 * with a dramatic vertical slot-machine animation. Each word is paired with a
 * striking stat that counts up when it enters view — creating number drama.
 *
 * Monochrome base with two semantic accents:
 *   Electric Blue #4D5AF0 = trusted action / verified  (primary CTA)
 *   Signal Red    #F23A17 = attention / what's at risk  (record type, arrow)
 */

const RECORD_TYPES = [
  {
    word: "loan files",
    stat: "$8.8B",
    statLabel: "lost to mortgage fraud in 2023",
    statNumeric: 8.8,
    statPrefix: "$",
    statSuffix: "B",
  },
  {
    word: "patient records",
    stat: "7,600+",
    statLabel: "fake nursing diplomas in one federal operation",
    statNumeric: 7600,
    statPrefix: "",
    statSuffix: "+",
  },
  {
    word: "transcripts",
    stat: "37%",
    statLabel: "of fakes passed licensing exams and entered practice",
    statNumeric: 37,
    statPrefix: "",
    statSuffix: "%",
  },
  {
    word: "title records",
    stat: "$103B",
    statLabel: "in title fraud exposure in the US annually",
    statNumeric: 103,
    statPrefix: "$",
    statSuffix: "B",
  },
  {
    word: "audit logs",
    stat: "94%",
    statLabel: "of OIG findings involve documentation gaps",
    statNumeric: 94,
    statPrefix: "",
    statSuffix: "%",
  },
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

// Animated number counter — counts up from 0 to target when triggered
function AnimatedStat({ item, active }) {
  const [displayVal, setDisplayVal] = useState("0");
  const [prevActive, setPrevActive] = useState(false);
  const rafRef = useRef(null);

  useEffect(() => {
    if (active && !prevActive) {
      // Start count-up animation
      const duration = 900;
      const startTime = performance.now();
      const target = item.statNumeric;
      const isDecimal = target % 1 !== 0;

      const animate = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out expo
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const current = eased * target;

        if (isDecimal) {
          setDisplayVal(current.toFixed(1));
        } else if (target > 1000) {
          setDisplayVal(Math.floor(current).toLocaleString());
        } else {
          setDisplayVal(Math.floor(current).toString());
        }

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(animate);
        } else {
          // Set final display
          if (isDecimal) setDisplayVal(target.toFixed(1));
          else if (target > 1000) setDisplayVal(target.toLocaleString());
          else setDisplayVal(target.toString());
        }
      };

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(animate);
    }

    if (!active && prevActive) {
      // Reset when leaving
      setDisplayVal("0");
    }

    setPrevActive(active);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active, item, prevActive]);

  return (
    <div style={styles.statBox}>
      <div style={styles.statNumber}>
        {item.statPrefix}{displayVal}{item.statSuffix}
      </div>
      <div style={styles.statLabel}>{item.statLabel}</div>
    </div>
  );
}

export default function TrustSignalHero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(null);
  const [animDir, setAnimDir] = useState("down"); // "down" | "up"
  const [reduced, setReduced] = useState(false);
  const sectionRef = useRef(null);
  const lastScrollY = useRef(0);

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
    if (reduced) return;

    // Scroll-driven: each "step" is one record type
    // The section is sticky for RECORD_TYPES.length × viewport heights
    const handleScroll = () => {
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const sectionTop = window.scrollY + rect.top - document.documentElement.scrollTop + rect.top;
      
      // Use the sticky container logic: track progress through sticky scroll
      const scrollY = window.scrollY;
      const direction = scrollY > lastScrollY.current ? "down" : "up";
      lastScrollY.current = scrollY;

      // The outer wrapper controls scroll depth; read progress from data attr
      const wrapper = section.closest("[data-scroll-hero]");
      if (!wrapper) return;

      const wrapperRect = wrapper.getBoundingClientRect();
      const wrapperTop = wrapperRect.top + scrollY;
      const wrapperHeight = wrapper.offsetHeight;
      const stickyHeight = window.innerHeight;
      const scrollableDepth = wrapperHeight - stickyHeight;

      const scrolledIn = Math.max(0, scrollY - wrapperTop);
      const progress = Math.min(scrolledIn / scrollableDepth, 1);

      const newIndex = Math.min(
        Math.floor(progress * RECORD_TYPES.length),
        RECORD_TYPES.length - 1
      );

      if (newIndex !== activeIndex) {
        setAnimDir(direction);
        setPrevIndex(activeIndex);
        setActiveIndex(newIndex);
        // Clear prev after animation
        setTimeout(() => setPrevIndex(null), 500);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeIndex, reduced]);

  const current = RECORD_TYPES[activeIndex];
  const prev = prevIndex !== null ? RECORD_TYPES[prevIndex] : null;

  // Slot-machine animation classes
  const wordEnter = animDir === "down" ? "ts-word-enter-down" : "ts-word-enter-up";
  const wordExit = animDir === "down" ? "ts-word-exit-down" : "ts-word-exit-up";

  return (
    <div data-scroll-hero style={styles.scrollWrapper}>
      <section ref={sectionRef} style={styles.section}>
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
                {/* Exiting word */}
                {prev && !reduced && (
                  <span
                    key={`exit-${prevIndex}`}
                    style={{ ...styles.rotator, ...styles.rotatorAbsolute }}
                    className={wordExit}
                  >
                    {prev.word}
                  </span>
                )}
                {/* Entering word */}
                <span
                  key={`enter-${activeIndex}`}
                  style={styles.rotator}
                  className={reduced ? "" : wordEnter}
                >
                  {current.word}
                </span>
              </span>
              <br />
              haven't changed since the day you filed them.
            </span>
          </h1>

          {/* Dramatic stat — animates in with the word */}
          <div style={styles.statRow}>
            {RECORD_TYPES.map((item, i) => (
              <div
                key={i}
                style={{
                  ...styles.statSlot,
                  opacity: i === activeIndex ? 1 : 0,
                  transform: i === activeIndex ? "none" : "translateY(6px)",
                  position: i === activeIndex ? "relative" : "absolute",
                  pointerEvents: i === activeIndex ? "auto" : "none",
                  transition: "opacity 0.4s ease, transform 0.4s ease",
                }}
              >
                <AnimatedStat item={item} active={i === activeIndex} />
              </div>
            ))}
          </div>

          <p style={styles.sub}>
            TrustSignal issues a cryptographic receipt for every record and anchors it on a
            public blockchain. When a regulator, auditor, or court asks years later, you can
            prove it&rsquo;s untouched &mdash; in seconds, without trusting us or anyone else.
          </p>

          <div style={styles.ctaRow}>
            <a href="#pilot-request" style={styles.primary} className="ts-primary">
              Request a Pilot
            </a>
            <a href="/demo" style={styles.secondary} className="ts-secondary">
              See it verify live <span style={styles.arrow} aria-hidden="true">&rarr;</span>
            </a>
          </div>

          <p style={styles.pilotNote}>
            90-day pilot &nbsp;·&nbsp; your documents never leave your infrastructure
            &nbsp;·&nbsp; receipts stay permanently verifiable, even after cancellation
          </p>

          {/* Scroll indicator — fades out once user starts scrolling */}
          <div style={styles.scrollHint} className="ts-scroll-hint">
            <span style={styles.scrollHintLine} />
            <span style={styles.scrollHintText}>scroll to explore</span>
          </div>

          <div style={styles.trustStrip}>
            <TrustItem>Anchored on Ethereum + Polygon</TrustItem>
            <Dot />
            <TrustItem>Independently verifiable</TrustItem>
            <Dot />
            <TrustItem>No documents or PII stored</TrustItem>
          </div>
        </div>
      </section>
    </div>
  );
}

function TrustItem({ children }) {
  return <span style={styles.trustItem}>{children}</span>;
}

function Dot() {
  return <span style={styles.dot} aria-hidden="true">•</span>;
}

const styles = {
  // Outer wrapper creates the scroll depth for sticky behavior
  scrollWrapper: {
    height: `${100 * RECORD_TYPES.length}vh`,
    position: "relative",
  },
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
    // Sticky: stays in view while wrapper scrolls
    position: "sticky",
    top: 0,
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
    position: "relative",
    overflow: "hidden",
  },
  rotator: {
    display: "inline-block",
    color: PALETTE.red,
    fontStyle: "italic",
    willChange: "opacity, transform",
  },
  rotatorAbsolute: {
    position: "absolute",
    left: 0,
    top: 0,
  },
  // Stat display
  statRow: {
    position: "relative",
    height: "5rem",
    margin: "2rem 0 0",
  },
  statSlot: {
    top: 0,
    left: 0,
    width: "100%",
  },
  statBox: {
    display: "flex",
    alignItems: "baseline",
    gap: "1rem",
    flexWrap: "wrap",
  },
  statNumber: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: "clamp(2.4rem, 5vw, 3.6rem)",
    fontWeight: 400,
    lineHeight: 1,
    letterSpacing: "-0.03em",
    color: PALETTE.red,
  },
  statLabel: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "0.82rem",
    lineHeight: 1.45,
    color: PALETTE.muted,
    maxWidth: "340px",
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
  scrollHint: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    marginTop: "2.8rem",
  },
  scrollHintLine: {
    display: "block",
    width: "32px",
    height: "1px",
    background: PALETTE.muted,
  },
  scrollHintText: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "0.72rem",
    letterSpacing: "0.12em",
    color: PALETTE.muted,
  },
  trustStrip: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "0.65rem",
    marginTop: "2rem",
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
  /* Slot-machine word transitions */
  @keyframes wordEnterDown {
    from { opacity: 0; transform: translateY(0.6em); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes wordExitDown {
    from { opacity: 1; transform: translateY(0); }
    to   { opacity: 0; transform: translateY(-0.6em); }
  }
  @keyframes wordEnterUp {
    from { opacity: 0; transform: translateY(-0.6em); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes wordExitUp {
    from { opacity: 1; transform: translateY(0); }
    to   { opacity: 0; transform: translateY(0.6em); }
  }

  .ts-word-enter-down {
    animation: wordEnterDown 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
  .ts-word-exit-down {
    animation: wordExitDown 0.35s cubic-bezier(0.55, 0, 1, 0.45) forwards;
  }
  .ts-word-enter-up {
    animation: wordEnterUp 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
  .ts-word-exit-up {
    animation: wordExitUp 0.35s cubic-bezier(0.55, 0, 1, 0.45) forwards;
  }

  /* Scroll hint fades after first scroll */
  .ts-scroll-hint {
    opacity: 1;
    transition: opacity 0.6s ease;
  }
  .ts-scroll-hint.ts-scrolled {
    opacity: 0;
    pointer-events: none;
  }

  .ts-primary:hover { background: #3A46D8 !important; transform: translateY(-1px); }
  .ts-secondary:hover { border-color: rgba(18,19,22,0.5) !important; background: rgba(18,19,22,0.03); }
  ::selection { background: #4D5AF0; color: #FFFFFF; }

  @media (prefers-reduced-motion: reduce) {
    .ts-word-enter-down,
    .ts-word-exit-down,
    .ts-word-enter-up,
    .ts-word-exit-up { animation: none !important; }
  }
`;
