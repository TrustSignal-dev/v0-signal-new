"use client";

import TrustSignalNav from "@/components/landing/TrustSignalNav";
import TrustSignalFooter from "@/components/landing/TrustSignalFooter";
import { CSSProperties, useEffect } from "react";

const PALETTE = {
  paper: "#FAFAF8",
  ink: "#121316",
  body: "#2a2b30",
  blue: "#4D5AF0",
  red: "#F23A17",
  muted: "rgba(18,19,22,0.60)",
  line: "rgba(18,19,22,0.12)",
};

export default function FoundersStoryPage() {
  useEffect(() => {
    const id = "ts-fonts";
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
    <div style={{ background: PALETTE.paper, minHeight: "100vh" }}>
      <style>{css}</style>
      <TrustSignalNav />
      
      <main style={styles.main as CSSProperties}>
        <header style={styles.header as CSSProperties}>
          <div style={styles.eyebrow as CSSProperties}>FOUNDER&rsquo;S STORY</div>
          <h1 style={styles.headline as CSSProperties}>The Signal Came From Frustration.</h1>
          <p style={styles.subheadline as CSSProperties}>
            How a personal battle over identity, credentials, and data ownership became the infrastructure layer that compliance-driven industries have been missing.
          </p>
          <div style={styles.meta as CSSProperties}>
            <div style={styles.author as CSSProperties}>Christopher Marziani · Founder & CEO</div>
            <div style={styles.date as CSSProperties}>Chicago, IL · May 2026</div>
          </div>
        </header>

        <section style={styles.section as CSSProperties}>
          <div style={styles.sectionNum as CSSProperties}>§ 1 — THE ORIGIN</div>
          <h2 style={styles.sectionTitle as CSSProperties}>A Personal, Infuriating Problem</h2>
          <div style={styles.quoteBox as CSSProperties}>
            <div style={styles.quoteEyebrow as CSSProperties}>THE FOUNDING CONVICTION</div>
            <blockquote style={styles.quote as CSSProperties}>
              &ldquo;In 2026, you are everything you&rsquo;ve accumulated &mdash; your knowledge, your career, your credentials. You should own that. Nobody should charge you to access what is already yours.&rdquo;
            </blockquote>
          </div>
          <p style={styles.text as CSSProperties}>
            It started with a simple, infuriating problem. Christopher Marziani needed access to his own professional credentials. Institutions that held his records &mdash; schools, licensing bodies, employers &mdash; wanted payment just to verify what he had already earned. Not to grant him anything new. Just to confirm what was already his.
          </p>
          <p style={styles.text as CSSProperties}>
            That friction sparked a bigger question: Why does identity work this way? Why does a person have to repeatedly hand their most sensitive data &mdash; their PII, their career history, their educational record &mdash; to third parties who store it, monetize it, lose it, or get it breached? Why isn&rsquo;t there a model where you own who you are, and institutions simply verify against what you hold?
          </p>
          <p style={styles.text as CSSProperties}>
            The answer Christopher couldn&rsquo;t find became the company he decided to build.
          </p>
        </section>

        <section style={styles.section as CSSProperties}>
          <div style={styles.sectionNum as CSSProperties}>§ 2 — THE IAM IDEA</div>
          <h2 style={styles.sectionTitle as CSSProperties}>Digital Wallet for Life Events</h2>
          <p style={styles.text as CSSProperties}>
            The first concept was called IAM &mdash; Identity and Access Management, but reframed around the individual. The vision: a digital wallet where you accumulate life events. Career milestones. Educational credentials. Licenses. Certifications. Each one verified once by the issuing institution, then cryptographically anchored to a blockchain.
          </p>
          <p style={styles.text as CSSProperties}>
            Verified forever. Owned by you. Never needing re-verification.
          </p>
          <p style={styles.text as CSSProperties}>
            The core insight was privacy by design. Instead of your PII living on someone else&rsquo;s server &mdash; sitting in a database farm waiting to be breached, sold, or scraped &mdash; the institution never needs to see it again after initial verification. They verify a hash. A mathematical fingerprint that confirms the credential is authentic without exposing the underlying data.
          </p>
          <p style={styles.text as CSSProperties}>
            You stay in control. The data never leaves your wallet.
          </p>
        </section>

        <section style={styles.section as CSSProperties}>
          <div style={styles.sectionNum as CSSProperties}>§ 3 — THE PIVOT SIGNAL</div>
          <h2 style={styles.sectionTitle as CSSProperties}>One Question Changed Everything</h2>
          <p style={styles.text as CSSProperties}>
            Parsing PDFs. That was the next frustration. Resume builders, career tools, document extraction &mdash; the mechanical grunt work of getting structured data out of unstructured files. Somewhere in that work, a conversation happened that changed the direction entirely.
          </p>
          <p style={styles.text as CSSProperties}>
            Someone pointed to a different kind of theft &mdash; not credential fraud, not identity theft in the traditional sense, but title theft. Property deeds being forged. Ownership records being quietly altered. Homeowners discovering their property had been transferred to someone else through fraudulent documents that slipped through systems designed to trust, not verify.
          </p>
          <div style={styles.quoteBox as CSSProperties}>
            <div style={styles.quoteEyebrow as CSSProperties}>THE QUESTION THAT PIVOTED EVERYTHING</div>
            <blockquote style={styles.quote as CSSProperties}>
              &ldquo;Couldn&rsquo;t you use your software to lock a deed so nothing could steal it?&rdquo;
            </blockquote>
          </div>
          <p style={styles.text as CSSProperties}>
            The answer was yes. And the implications were immediate. This wasn&rsquo;t just a mortgage problem. It was the same problem the IAM vision had identified &mdash; the gap between when something is collected and when its integrity can be proven. The document exists. But can you prove it hasn&rsquo;t changed since the moment it was created?
          </p>
        </section>

        <section style={styles.section as CSSProperties}>
          <div style={styles.sectionNum as CSSProperties}>§ 4 — THE INFRASTRUCTURE</div>
          <h2 style={styles.sectionTitle as CSSProperties}>TrustSignal Was Born From That Realization</h2>
          <p style={styles.text as CSSProperties}>
            Not a compliance tool. Not a marketplace or a dashboard. Infrastructure.
          </p>
          <p style={styles.text as CSSProperties}>
            The layer that sits at the moment of collection and generates a cryptographic receipt &mdash; a tamper-evident seal that makes evidence provably unchanged at any future audit, legal proceeding, regulatory review, or fraud investigation.
          </p>
          <p style={styles.text as CSSProperties}>
            The same principle that would have protected Christopher&rsquo;s credentials &mdash; hash the truth, anchor it, let the institution verify without touching the raw data &mdash; now protects deeds, clinical records, supply chain documents, HR evidence, forensic logs, and AI decision trails.
          </p>
          <p style={styles.text as CSSProperties}>
            One infrastructure layer. Eight industries with the same unsolved problem.
          </p>
          <p style={styles.text as CSSProperties}>
            The origin was personal. The frustration was real. The technology is the same. The market is every organization that collects evidence and needs to prove, months or years later, that nothing changed. That is not a niche. That is the entire compliance economy.
          </p>
        </section>

        <section style={styles.finalSection as CSSProperties}>
          <div style={styles.finalBox as CSSProperties}>
            <div style={styles.finalEyebrow as CSSProperties}>BUILDING THE INFRASTRUCTURE OF TOMORROW</div>
            <div style={styles.finalHeadline as CSSProperties}>The signal is evidence. The evidence is integrity.</div>
          </div>
        </section>
      </main>

      <TrustSignalFooter />
    </div>
  );
}

const styles = {
  main: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "6rem 1.5rem",
    fontFamily: "'DM Sans', sans-serif",
    color: PALETTE.body,
    lineHeight: 1.6,
  },
  header: {
    marginBottom: "5rem",
    textAlign: "left",
  },
  eyebrow: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "0.78rem",
    letterSpacing: "0.18em",
    color: PALETTE.muted,
    marginBottom: "1.5rem",
    fontWeight: 500,
  },
  headline: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: "clamp(2.4rem, 5vw, 4rem)",
    fontWeight: 400,
    lineHeight: 1.1,
    color: PALETTE.ink,
    margin: "0 0 1.5rem",
  },
  subheadline: {
    fontSize: "clamp(1.1rem, 1.8vw, 1.3rem)",
    color: PALETTE.body,
    maxWidth: "680px",
    marginBottom: "2rem",
  },
  meta: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "0.8rem",
    color: PALETTE.muted,
  },
  author: { fontWeight: 500, color: PALETTE.ink },
  date: { marginTop: "0.3rem" },
  section: {
    marginBottom: "4.5rem",
  },
  sectionNum: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "0.7rem",
    letterSpacing: "0.15em",
    color: PALETTE.muted,
    marginBottom: "1rem",
  },
  sectionTitle: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: "2rem",
    fontWeight: 400,
    color: PALETTE.ink,
    marginBottom: "1.5rem",
  },
  text: {
    fontSize: "1.05rem",
    marginBottom: "1.2rem",
    color: PALETTE.body,
  },
  quoteBox: {
    margin: "2.5rem 0",
    padding: "2rem",
    background: "rgba(18,19,22,0.03)",
    borderLeft: `3px solid ${PALETTE.blue}`,
  },
  quoteEyebrow: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "0.7rem",
    letterSpacing: "0.15em",
    color: PALETTE.muted,
    marginBottom: "1rem",
  },
  quote: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: "1.25rem",
    fontStyle: "italic",
    color: PALETTE.ink,
    margin: 0,
    padding: 0,
  },
  finalSection: {
    marginTop: "6rem",
    paddingTop: "4rem",
    borderTop: `1px solid ${PALETTE.line}`,
  },
  finalBox: {
    textAlign: "center",
    padding: "3rem",
    background: PALETTE.ink,
    color: "#FFFFFF",
  },
  finalEyebrow: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "0.7rem",
    letterSpacing: "0.2em",
    color: "rgba(255,255,255,0.5)",
    marginBottom: "1.2rem",
  },
  finalHeadline: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: "1.8rem",
    fontWeight: 400,
  },
};

const css = `
  ::selection { background: #4D5AF0; color: #FFFFFF; }
`;
