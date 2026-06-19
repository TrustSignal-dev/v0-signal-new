import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  ShieldCheck,
  ScanLine,
  Scale,
  Gauge,
  FileLock2,
  Workflow,
} from "lucide-react";
import TrustSignalFooter from "@/components/landing/TrustSignalFooter";
import TrustSignalNav from "@/components/landing/TrustSignalNav";
import { absoluteUrl, createPageMetadata, organizationJsonLd } from "@/lib/seo";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "Verified AI Evidence for Insurance Carriers",
  description:
    "Make TrustSignal verification a condition of, or discount qualifier for, affirmative AI policies. Every covered account ships fraud-scored, tamper-evident evidence carriers can verify in seconds.",
  path: "/insurance",
  keywords: [
    "AI liability insurance",
    "affirmative AI coverage",
    "AI E&O underwriting",
    "verified AI evidence",
    "insurance carrier AI risk",
    "claims leakage AI fraud",
    "tamper-evident AI receipts",
    "condition of coverage verification",
  ],
});

const PALETTE = {
  paper: "#FAFAF8",
  ink: "#121316",
  body: "#2a2b30",
  blue: "#4D5AF0",
  red: "#F23A17",
  line: "rgba(18,19,22,0.12)",
  muted: "rgba(18,19,22,0.60)",
};

const carrierValue = [
  {
    icon: Scale,
    title: "Underwritable risk",
    description:
      "Every covered AI output produces a cryptographically sealed, fraud-scored receipt at generation time — converting unverifiable AI exposure into risk you can actually price.",
  },
  {
    icon: ScanLine,
    title: "Instant verification",
    description:
      "Adjusters and counsel verify a receipt in seconds via API or web, confirming the evidence existed when the insured says it did and has not been altered.",
  },
  {
    icon: FileLock2,
    title: "Defensible denials",
    description:
      "When receipts are missing or don't match, you can decline or right-size a claim on sealed, objective facts instead of “we don't believe your logs” — reducing bad-faith exposure.",
  },
] as const;

const rolloutPhases = [
  {
    phase: "Phase 1",
    title: "90-day evidence pilot",
    description:
      "Require TrustSignal on 5–50 new or renewing policies in a high-risk AI segment. Track claim frequency, verification time, and fraud-flag rate to produce a loss-ratio or LAE proof point.",
  },
  {
    phase: "Phase 2",
    title: "Endorsement language",
    description:
      "Add a verified-AI endorsement to the pilot segment — first as an optional discount qualifier (lower resistance), then as a condition of coverage for the highest-risk accounts.",
  },
  {
    phase: "Phase 3",
    title: "Portfolio rollout",
    description:
      "Bake verification into base AI E&O policy language and launch a “verified AI” product line that competitors can't match without rebuilding their evidence stack.",
  },
] as const;

const faqs = [
  {
    q: "Won't requiring this burden my insureds and shrink my book?",
    a: "Integration is a lightweight API hook around existing logs and outputs, with a web UI for non-technical accounts. Insureds benefit through better terms or qualification for coverage at all. Pilot telemetry is designed to measure adoption friction directly.",
  },
  {
    q: "What about PII or sensitive content?",
    a: "TrustSignal never sees the content. The API seals a hash of the output plus a fraud score and timestamp — not the output itself. The insured's data never leaves their environment; only cryptographic fingerprints and metadata are sealed.",
  },
  {
    q: "What does “tamper-evident” actually mean?",
    a: "Each receipt is a zero-knowledge proof over the output hash, fraud score, and timestamp. Altering any field breaks the cryptographic seal and is detectable in seconds. It cannot be forged without breaking the proof system.",
  },
  {
    q: "What if the insured cancels mid-policy?",
    a: "Policy language can require active sealing. If the verification heartbeat stops, the carrier is alerted and can trigger an audit or non-renewal. Past receipts remain verifiable permanently.",
  },
  {
    q: "Is the fraud score a guarantee?",
    a: "No. The fraud score is a risk signal (0–100), not a binary determination. It is an input to a claims decision, not the sole determinant — which keeps it defensible and avoids creating new liability.",
  },
  {
    q: "What if TrustSignal goes away?",
    a: "Receipts are self-verifying. Even if TrustSignal ceased to exist, any receipt can be verified with open-source tooling — verification does not depend on us being online.",
  },
] as const;

const FRAUNCES = "'Fraunces', Georgia, serif";
const DMSANS = "'DM Sans', sans-serif";
const DMMONO = "'DM Mono', monospace";

const insuranceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "TrustSignal for Insurance Carriers",
  serviceType: "Verified AI evidence for affirmative AI coverage",
  provider: {
    "@type": "Organization",
    name: "TrustSignal",
    url: organizationJsonLd.url,
  },
  areaServed: "US",
  description:
    "Cryptographically sealed, fraud-scored AI evidence that carriers can require as a condition of, or discount qualifier for, affirmative AI policies and verify in seconds at claim time.",
  url: absoluteUrl("/insurance"),
};

export default function InsurancePage() {
  return (
    <main
      id="top"
      style={{
        backgroundColor: PALETTE.paper,
        minHeight: "100vh",
        position: "relative",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400&family=DM+Sans:wght@400;500&family=DM+Mono:wght@400;500&display=swap"
      />
      <style>{`
        ::selection { background: #4D5AF0; color: #FFFFFF; }
        html { scroll-behavior: smooth; }
        .ins-grid {
          display: grid;
          gap: 1px;
          background-color: ${PALETTE.line};
          border: 1px solid ${PALETTE.line};
          grid-template-columns: 1fr;
        }
        @media (min-width: 768px) {
          .ins-grid { grid-template-columns: repeat(3, 1fr); }
        }
        .ins-hero {
          display: grid;
          gap: 3rem;
          grid-template-columns: 1fr;
        }
        @media (min-width: 1024px) {
          .ins-hero {
            grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
            gap: 5rem;
            align-items: center;
          }
        }
        .ins-econ {
          display: grid;
          gap: 1px;
          background-color: ${PALETTE.line};
          border: 1px solid ${PALETTE.line};
          grid-template-columns: 1fr;
        }
        @media (min-width: 640px) {
          .ins-econ { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1024px) {
          .ins-econ { grid-template-columns: repeat(4, 1fr); }
        }
        .ins-cta-btn:hover { background: ${PALETTE.blue} !important; }
        .ins-links a:hover { color: ${PALETTE.blue} !important; }
      `}</style>

      <TrustSignalNav />

      {/* Hero */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          borderBottom: `1px solid ${PALETTE.line}`,
          paddingTop: "6rem",
          paddingBottom: "5rem",
        }}
      >
        <div style={{ margin: "0 auto", maxWidth: "1240px", padding: "0 1.5rem" }}>
          <div className="ins-hero">
            <div>
              <span
                style={{
                  fontFamily: DMMONO,
                  fontSize: "0.78rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.18em",
                  color: PALETTE.muted,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  marginBottom: "1.5rem",
                  fontWeight: 500,
                }}
              >
                <ShieldCheck size={14} color={PALETTE.blue} />
                FOR INSURANCE CARRIERS
              </span>
              <h1
                style={{
                  fontFamily: FRAUNCES,
                  fontSize: "clamp(2.4rem, 5.5vw, 4.2rem)",
                  lineHeight: 1.05,
                  color: PALETTE.ink,
                  fontWeight: 400,
                  margin: "0 0 1.75rem 0",
                  letterSpacing: "-0.01em",
                }}
              >
                Verified AI evidence as a condition of coverage.
              </h1>
              <p
                style={{
                  fontFamily: DMSANS,
                  fontSize: "clamp(1.1rem, 1.8vw, 1.25rem)",
                  lineHeight: 1.6,
                  color: PALETTE.body,
                  margin: "0 0 2.25rem 0",
                  maxWidth: "640px",
                }}
              >
                Make TrustSignal verification a condition of, or a discount
                qualifier for, your affirmative AI policies. Every covered
                account ships fraud-scored, tamper-evident evidence you can
                verify in seconds &mdash; turning unverifiable AI risk into risk
                you can underwrite.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                <a
                  href={`mailto:${CONTACT_EMAIL}?subject=Carrier%20briefing%20%E2%80%94%20TrustSignal%20verified%20AI`}
                  className="ins-cta-btn"
                  style={{
                    fontFamily: DMSANS,
                    fontSize: "0.95rem",
                    fontWeight: 500,
                    color: "#FFFFFF",
                    background: PALETTE.ink,
                    padding: "0.85rem 1.5rem",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    transition: "background 0.18s ease",
                  }}
                >
                  Book a carrier briefing
                  <ArrowUpRight size={16} />
                </a>
                <Link
                  href="/what-is-trustsignal"
                  style={{
                    fontFamily: DMSANS,
                    fontSize: "0.95rem",
                    fontWeight: 500,
                    color: PALETTE.ink,
                    border: `1px solid ${PALETTE.line}`,
                    padding: "0.85rem 1.5rem",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  How it works
                </Link>
              </div>
            </div>

            <div
              style={{
                border: `1px solid ${PALETTE.line}`,
                backgroundColor: "#FFFFFF",
                padding: "2.4rem",
              }}
            >
              <span
                style={{
                  fontFamily: DMMONO,
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.16em",
                  color: PALETTE.muted,
                }}
              >
                The integrity gap
              </span>
              <p
                style={{
                  fontFamily: FRAUNCES,
                  fontSize: "1.5rem",
                  lineHeight: 1.3,
                  color: PALETTE.ink,
                  fontWeight: 400,
                  margin: "1rem 0 1.25rem 0",
                }}
              >
                You are underwriting AI risk the way cyber was underwritten in
                2010 &mdash; pricing exposure you can&apos;t measure.
              </p>
              <ul
                style={{
                  fontFamily: DMSANS,
                  fontSize: "0.95rem",
                  lineHeight: 1.6,
                  color: PALETTE.muted,
                  margin: 0,
                  paddingLeft: "1.1rem",
                }}
              >
                <li style={{ marginBottom: "0.7rem" }}>
                  Insureds submit &ldquo;AI said this&rdquo; evidence that can be
                  doctored, backdated, or fabricated after an incident.
                </li>
                <li style={{ marginBottom: "0.7rem" }}>
                  No tamper detection means loss leakage through inflated or
                  fraudulent claims.
                </li>
                <li>
                  Adjusters spend days reconstructing timelines from logs that
                  can&apos;t be trusted.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Why make it a condition */}
      <section style={{ borderBottom: `1px solid ${PALETTE.line}`, padding: "5.5rem 0" }}>
        <div style={{ margin: "0 auto", maxWidth: "1240px", padding: "0 1.5rem" }}>
          <h2
            style={{
              fontFamily: FRAUNCES,
              fontSize: "clamp(1.9rem, 3.5vw, 2.8rem)",
              lineHeight: 1.1,
              color: PALETTE.ink,
              fontWeight: 400,
              margin: "0 0 1rem 0",
              maxWidth: "780px",
            }}
          >
            Why make TrustSignal a condition of coverage
          </h2>
          <p
            style={{
              fontFamily: DMSANS,
              fontSize: "1.1rem",
              lineHeight: 1.6,
              color: PALETTE.body,
              margin: "0 0 3rem 0",
              maxWidth: "720px",
            }}
          >
            Instead of taking an insured&apos;s AI logs on faith, every covered
            output carries a cryptographic receipt &mdash; sealed hash,
            timestamp, and fraud score &mdash; you can verify without touching
            any underlying PII or model content.
          </p>
          <div className="ins-grid">
            {carrierValue.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  style={{ backgroundColor: PALETTE.paper, padding: "2.4rem" }}
                >
                  <div
                    style={{
                      display: "flex",
                      height: "2.75rem",
                      width: "2.75rem",
                      alignItems: "center",
                      justifyContent: "center",
                      border: `1px solid ${PALETTE.line}`,
                      backgroundColor: PALETTE.paper,
                    }}
                  >
                    <Icon size={20} color={PALETTE.ink} style={{ opacity: 0.7 }} />
                  </div>
                  <h3
                    style={{
                      fontFamily: FRAUNCES,
                      fontSize: "1.5rem",
                      color: PALETTE.ink,
                      fontWeight: 400,
                      marginTop: "1.4rem",
                      marginBottom: "0.8rem",
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: DMSANS,
                      fontSize: "0.94rem",
                      lineHeight: 1.6,
                      color: PALETTE.muted,
                      margin: 0,
                    }}
                  >
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Economics — modeled scenarios */}
      <section style={{ borderBottom: `1px solid ${PALETTE.line}`, padding: "5.5rem 0" }}>
        <div style={{ margin: "0 auto", maxWidth: "1240px", padding: "0 1.5rem" }}>
          <span
            style={{
              fontFamily: DMMONO,
              fontSize: "0.7rem",
              textTransform: "uppercase",
              letterSpacing: "0.16em",
              color: PALETTE.muted,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "1rem",
            }}
          >
            <Gauge size={14} color={PALETTE.blue} />
            The economics for your portfolio
          </span>
          <h2
            style={{
              fontFamily: FRAUNCES,
              fontSize: "clamp(1.9rem, 3.5vw, 2.8rem)",
              lineHeight: 1.1,
              color: PALETTE.ink,
              fontWeight: 400,
              margin: "0 0 1rem 0",
              maxWidth: "820px",
            }}
          >
            For AI claims, your cost is skewed toward proof, not payouts.
          </h2>
          <p
            style={{
              fontFamily: DMSANS,
              fontSize: "1.05rem",
              lineHeight: 1.6,
              color: PALETTE.body,
              margin: "0 0 2.5rem 0",
              maxWidth: "760px",
            }}
          >
            The figures below are deliberately conservative{" "}
            <strong style={{ color: PALETTE.ink }}>modeled scenarios</strong>,
            not historical loss-ratio data. The first 6&ndash;12 month pilot is
            designed to replace these assumptions with your portfolio&apos;s
            observed leakage, severity, and loss-adjustment-expense deltas.
          </p>

          <div className="ins-econ">
            {[
              {
                stat: "~$100k",
                label: "per contested claim",
                detail:
                  "Modeled forensic + discovery spend to reconstruct what an AI system did and when.",
              },
              {
                stat: "< $1",
                label: "per verification",
                detail:
                  "A receipt-backed verification call plus minutes of adjuster time replaces weeks of forensics.",
              },
              {
                stat: "~$575k",
                label: "preserved / 100 claims",
                detail:
                  "Assuming a 50% reduction in AI-related leakage at a $115k average claim size.",
              },
              {
                stat: "10–15%",
                label: "“verified AI” discount",
                detail:
                  "A pricing band you can offer while still improving combined ratio, because leakage and LAE drop.",
              },
            ].map((m) => (
              <div
                key={m.label}
                style={{ backgroundColor: PALETTE.paper, padding: "2rem 1.75rem" }}
              >
                <div
                  style={{
                    fontFamily: FRAUNCES,
                    fontSize: "2.4rem",
                    color: PALETTE.ink,
                    fontWeight: 500,
                    lineHeight: 1,
                  }}
                >
                  {m.stat}
                </div>
                <div
                  style={{
                    fontFamily: DMMONO,
                    fontSize: "0.72rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    color: PALETTE.blue,
                    margin: "0.6rem 0 0.9rem 0",
                  }}
                >
                  {m.label}
                </div>
                <p
                  style={{
                    fontFamily: DMSANS,
                    fontSize: "0.88rem",
                    lineHeight: 1.55,
                    color: PALETTE.muted,
                    margin: 0,
                  }}
                >
                  {m.detail}
                </p>
              </div>
            ))}
          </div>

          <p
            style={{
              fontFamily: DMSANS,
              fontSize: "0.85rem",
              lineHeight: 1.6,
              color: PALETTE.muted,
              margin: "1.5rem 0 0 0",
              maxWidth: "820px",
              fontStyle: "italic",
            }}
          >
            For a carrier processing ~50 disputed AI claims a year, those
            operational savings compound to over $8M across the portfolio in our
            scenarios &mdash; before counting lower bad-faith exposure or
            regulatory fines. All figures are forward-looking models, validated
            per-portfolio during the pilot.
          </p>
        </div>
      </section>

      {/* Frictionless for your book — insureds */}
      <section style={{ borderBottom: `1px solid ${PALETTE.line}`, padding: "5.5rem 0" }}>
        <div style={{ margin: "0 auto", maxWidth: "860px", padding: "0 1.5rem" }}>
          <span
            style={{
              fontFamily: DMMONO,
              fontSize: "0.7rem",
              textTransform: "uppercase",
              letterSpacing: "0.16em",
              color: PALETTE.muted,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "1.25rem",
            }}
          >
            <Workflow size={14} color={PALETTE.blue} />
            Frictionless for your book
          </span>
          <h2
            style={{
              fontFamily: FRAUNCES,
              fontSize: "clamp(1.8rem, 3.2vw, 2.5rem)",
              lineHeight: 1.12,
              color: PALETTE.ink,
              fontWeight: 400,
              margin: "0 0 1.5rem 0",
            }}
          >
            Low adoption friction is what makes a mandate realistic.
          </h2>
          <div
            className="ins-links"
            style={{
              fontFamily: DMSANS,
              fontSize: "1.05rem",
              lineHeight: 1.7,
              color: PALETTE.body,
            }}
          >
            <p style={{ marginBottom: "1.5rem" }}>
              Requiring verification only works if it doesn&apos;t burden your
              insureds. TrustSignal integrates as a thin evidence layer around
              the AI systems they already run: a lightweight API hook for
              technical teams, or a web UI and proxy gateway for everyone else.
              The content never leaves their environment &mdash; only sealed
              hashes and metadata.
            </p>
            <p style={{ marginBottom: "1.5rem" }}>
              Insureds comply because it helps them too. Sealed evidence
              qualifies them for coverage or a lower premium, and it defends them
              against false third-party claims with the same cryptographic
              receipt you rely on. The{" "}
              <Link
                href="/what-is-trustsignal"
                style={{
                  color: PALETTE.ink,
                  fontWeight: 500,
                  textDecoration: "underline",
                  textUnderlineOffset: "4px",
                }}
              >
                product overview
              </Link>{" "}
              explains the receipt and verification lifecycle in full, and the{" "}
              <Link
                href="/#developers"
                style={{
                  color: PALETTE.ink,
                  fontWeight: 500,
                  textDecoration: "underline",
                  textUnderlineOffset: "4px",
                }}
              >
                developer documentation
              </Link>{" "}
              covers the integration path.
            </p>
          </div>
        </div>
      </section>

      {/* Rollout path */}
      <section style={{ borderBottom: `1px solid ${PALETTE.line}`, padding: "5.5rem 0" }}>
        <div style={{ margin: "0 auto", maxWidth: "1240px", padding: "0 1.5rem" }}>
          <h2
            style={{
              fontFamily: FRAUNCES,
              fontSize: "clamp(1.9rem, 3.5vw, 2.8rem)",
              lineHeight: 1.1,
              color: PALETTE.ink,
              fontWeight: 400,
              margin: "0 0 1rem 0",
            }}
          >
            How to make it a condition
          </h2>
          <p
            style={{
              fontFamily: DMSANS,
              fontSize: "1.1rem",
              lineHeight: 1.6,
              color: PALETTE.body,
              margin: "0 0 3rem 0",
              maxWidth: "720px",
            }}
          >
            You don&apos;t flip the whole book on day one. The path from pilot to
            portfolio is staged so each step earns the next.
          </p>
          <div className="ins-grid">
            {rolloutPhases.map((p) => (
              <div
                key={p.phase}
                style={{ backgroundColor: PALETTE.paper, padding: "2.4rem" }}
              >
                <span
                  style={{
                    fontFamily: DMMONO,
                    fontSize: "0.72rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                    color: PALETTE.red,
                  }}
                >
                  {p.phase}
                </span>
                <h3
                  style={{
                    fontFamily: FRAUNCES,
                    fontSize: "1.5rem",
                    color: PALETTE.ink,
                    fontWeight: 400,
                    marginTop: "0.8rem",
                    marginBottom: "0.8rem",
                  }}
                >
                  {p.title}
                </h3>
                <p
                  style={{
                    fontFamily: DMSANS,
                    fontSize: "0.94rem",
                    lineHeight: 1.6,
                    color: PALETTE.muted,
                    margin: 0,
                  }}
                >
                  {p.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ borderBottom: `1px solid ${PALETTE.line}`, padding: "5.5rem 0" }}>
        <div style={{ margin: "0 auto", maxWidth: "860px", padding: "0 1.5rem" }}>
          <h2
            style={{
              fontFamily: FRAUNCES,
              fontSize: "clamp(1.8rem, 3.2vw, 2.5rem)",
              lineHeight: 1.12,
              color: PALETTE.ink,
              fontWeight: 400,
              margin: "0 0 2.5rem 0",
            }}
          >
            Carrier questions
          </h2>
          <div>
            {faqs.map((item) => (
              <div
                key={item.q}
                style={{
                  borderTop: `1px solid ${PALETTE.line}`,
                  padding: "1.75rem 0",
                }}
              >
                <h3
                  style={{
                    fontFamily: FRAUNCES,
                    fontSize: "1.25rem",
                    color: PALETTE.ink,
                    fontWeight: 500,
                    margin: "0 0 0.7rem 0",
                  }}
                >
                  {item.q}
                </h3>
                <p
                  style={{
                    fontFamily: DMSANS,
                    fontSize: "1rem",
                    lineHeight: 1.65,
                    color: PALETTE.body,
                    margin: 0,
                  }}
                >
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding: "5.5rem 0 7rem" }}>
        <div
          style={{
            margin: "0 auto",
            maxWidth: "860px",
            padding: "0 1.5rem",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontFamily: FRAUNCES,
              fontSize: "clamp(2rem, 4vw, 3rem)",
              lineHeight: 1.1,
              color: PALETTE.ink,
              fontWeight: 400,
              margin: "0 0 1.25rem 0",
            }}
          >
            Run a 90-day pilot on your highest-risk AI accounts.
          </h2>
          <p
            style={{
              fontFamily: DMSANS,
              fontSize: "1.1rem",
              lineHeight: 1.6,
              color: PALETTE.body,
              margin: "0 auto 2.25rem",
              maxWidth: "560px",
            }}
          >
            Replace modeled savings with your actual numbers. Book a carrier
            briefing to review the integration path, sample receipts, and pilot
            structure.
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=Carrier%20briefing%20%E2%80%94%20TrustSignal%20verified%20AI`}
            className="ins-cta-btn"
            style={{
              fontFamily: DMSANS,
              fontSize: "0.98rem",
              fontWeight: 500,
              color: "#FFFFFF",
              background: PALETTE.ink,
              padding: "0.95rem 1.8rem",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.45rem",
              transition: "background 0.18s ease",
            }}
          >
            Book a carrier briefing
            <ArrowUpRight size={16} />
          </a>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(insuranceJsonLd) }}
      />

      <TrustSignalFooter />
    </main>
  );
}
