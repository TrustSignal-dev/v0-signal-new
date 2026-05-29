import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, FileCheck2, Fingerprint, Shield } from "lucide-react";
import TrustSignalFooter from "@/components/landing/TrustSignalFooter";
import TrustSignalNav from "@/components/landing/TrustSignalNav";
import { createPageMetadata, organizationJsonLd } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "What Is TrustSignal?",
  description:
    "Learn what TrustSignal is: evidence integrity infrastructure for compliance artifacts, signed receipts, provenance, and audit-ready verification.",
  path: "/what-is-trustsignal",
  keywords: [
    "what is trustsignal",
    "evidence integrity",
    "compliance artifact verification",
    "verifiable provenance",
  ],
});

const foundations = [
  {
    icon: Shield,
    title: "Evidence integrity",
    description:
      "TrustSignal preserves the integrity of compliance artifacts from the moment they enter review.",
  },
  {
    icon: FileCheck2,
    title: "Signed receipts",
    description:
      "Each attestation produces a signed receipt that can be stored beside the original artifact.",
  },
  {
    icon: Fingerprint,
    title: "Verifiable provenance",
    description:
      "Receipt metadata captures source, control context, and timestamps for later verification.",
  },
] as const;

const PALETTE = {
  paper: "#FAFAF8",
  ink: "#121316",
  body: "#2a2b30",
  blue: "#4D5AF0",
  red: "#F23A17",
  line: "rgba(18,19,22,0.12)",
  muted: "rgba(18,19,22,0.60)",
};

export default function WhatIsTrustSignalPage() {
  return (
    <main id="top" style={{ backgroundColor: PALETTE.paper, minHeight: '100vh', position: 'relative', WebkitFontSmoothing: 'antialiased' }}>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400&family=DM+Sans:wght@400;500&family=DM+Mono:wght@400;500&display=swap"
      />
      <style>{`
        ::selection { background: #4D5AF0; color: #FFFFFF; }
        html { scroll-behavior: smooth; }
        .foundations-grid {
          display: grid;
          gap: 1px;
          background-color: ${PALETTE.line};
          border: 1px solid ${PALETTE.line};
        }
        .hero-layout {
          display: grid;
          gap: 3.5rem;
          grid-template-columns: 1fr;
        }
        @media (min-width: 1024px) {
          .hero-layout {
            grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
            gap: 5rem;
          }
        }
        .content-links a:hover {
          color: ${PALETTE.blue} !important;
        }
      `}</style>
      
      <TrustSignalNav />

      <section style={{ 
        position: 'relative', 
        overflow: 'hidden', 
        borderBottom: `1px solid ${PALETTE.line}`, 
        paddingTop: '6rem', 
        paddingBottom: '5rem' 
      }}>
        <div style={{ margin: '0 auto', maxWidth: '1240px', padding: '0 1.5rem' }}>
          <div className="hero-layout">
            <div style={{ paddingTop: '2rem' }}>
              <span style={{ 
                fontFamily: "'DM Mono', monospace", 
                fontSize: '0.78rem', 
                textTransform: 'uppercase', 
                letterSpacing: '0.18em', 
                color: PALETTE.muted, 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.6rem', 
                marginBottom: '1.5rem',
                fontWeight: 500
              }}>
                <Shield size={14} color={PALETTE.blue} />
                TRUSTSIGNAL
              </span>
              <h1 style={{ 
                fontFamily: "'Fraunces', Georgia, serif", 
                fontSize: 'clamp(2.5rem, 6vw, 4.4rem)', 
                lineHeight: 1.04, 
                color: PALETTE.ink, 
                fontWeight: 400, 
                margin: '0 0 2rem 0',
                letterSpacing: '-0.01em'
              }}>
                What is TrustSignal?
              </h1>
              <p style={{ 
                fontFamily: "'DM Sans', sans-serif", 
                fontSize: 'clamp(1.1rem, 1.8vw, 1.25rem)', 
                lineHeight: 1.6, 
                color: PALETTE.body, 
                margin: 0,
                maxWidth: '620px'
              }}>
                TrustSignal is evidence integrity infrastructure for compliance
                artifacts. It issues signed receipts at ingestion, preserves
                verifiable provenance, and gives teams a reliable way to confirm
                that an artifact still matches the record that was originally
                reviewed.
              </p>
            </div>

            <div className="foundations-grid">
              {foundations.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    style={{ 
                      backgroundColor: PALETTE.paper, 
                      padding: '2.4rem' 
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      height: '2.75rem', 
                      width: '2.75rem', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      border: `1px solid ${PALETTE.line}`, 
                      backgroundColor: PALETTE.paper 
                    }}>
                      <Icon size={20} color={PALETTE.ink} style={{ opacity: 0.7 }} />
                    </div>
                    <h2 style={{ 
                      fontFamily: "'Fraunces', Georgia, serif", 
                      fontSize: '1.6rem', 
                      color: PALETTE.ink, 
                      fontWeight: 400, 
                      marginTop: '1.4rem',
                      marginBottom: '0.8rem'
                    }}>
                      {item.title}
                    </h2>
                    <p style={{ 
                      fontFamily: "'DM Sans', sans-serif", 
                      fontSize: '0.94rem', 
                      lineHeight: 1.6, 
                      color: PALETTE.muted, 
                      margin: 0 
                    }}>
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '6rem 0 8rem' }}>
        <div style={{ margin: '0 auto', maxWidth: '860px', padding: '0 1.5rem' }}>
          <div style={{ 
            fontFamily: "'DM Sans', sans-serif", 
            fontSize: 'clamp(1.05rem, 1.6vw, 1.15rem)', 
            lineHeight: 1.7, 
            color: PALETTE.body 
          }} className="content-links">
            <p style={{ marginBottom: '2rem' }}>
              At a practical level, TrustSignal sits behind an existing
              compliance workflow rather than replacing it. A platform, internal
              system, or evidence collector continues to gather documents,
              exports, and snapshots in the normal way. TrustSignal adds a
              signed receipt when the artifact is ingested, so the artifact hash
              and related metadata are recorded at the moment the record enters
              review. That receipt becomes a durable reference point for later
              verification.
            </p>

            <p style={{ marginBottom: '2rem' }}>
              This matters because many compliance programs depend on artifacts
              that move through multiple systems, reviewers, and retention
              stages. Screenshots, documents, or exported control evidence can
              drift after collection, either through accidental changes or
              deliberate tampering. TrustSignal addresses that integrity gap by
              attaching signed receipts to compliance artifacts and preserving
              the provenance needed to evaluate them later. Instead of relying
              only on process history, teams can compare the current artifact to
              the receipted record and detect whether it still matches.
            </p>

            <p style={{ marginBottom: '2rem' }}>
              TrustSignal also applies ZKML integrity verification at the point
              of receipt issuance. This means the integrity signal is not only a
              hash comparison — it is a cryptographically provable attestation
              that can be evaluated independently from the collection workflow.
            </p>

            <p style={{ marginBottom: '2rem' }}>
              For organizations that handle physical documents — universities
              issuing diplomas, title companies processing closings, notaries
              witnessing signatures — TrustSignal also supports NFC physical
              attestation. A pre-registered NFC sticker is tapped at the moment
              of physical document collection. The tap event — NFC tag ID,
              location, timestamp, and device identifier — is cryptographically
              bound to the receipt alongside the artifact hash and ZKML proof.
              This creates a single auditable record that covers both the digital
              integrity of the artifact and the physical presence event at
              collection. This is an Enterprise-tier capability. It does not
              replace the cryptographic receipt — it extends it with a physical
              chain of custody anchor that travels with the document from the
              moment of handoff.
            </p>

            <p style={{ marginBottom: '2rem' }}>
              Signed receipts are central to the product. A receipt records the
              evidence source, the artifact hash, the relevant control or review
              context, and the attestation timestamp. Because the receipt is
              signed, it can be checked independently from the original
              collection workflow. That makes TrustSignal useful for security
              reviewers, compliance buyers, partner evaluators, and technical
              teams who need a clear answer to a simple question: does the
              artifact under review still correspond to what was originally
              collected?
            </p>

            <p style={{ marginBottom: '2rem' }}>
              Verifiable provenance is equally important. TrustSignal is not
              only about detecting drift; it is also about preserving the chain
              of context around an artifact so later review remains meaningful.
              Source identifiers, timestamps, and control mappings help teams
              understand where a record came from, when it entered the workflow,
              and what it was supposed to represent. That combination of
              provenance and signed receipts supports audit readiness without
              forcing organizations to replatform their evidence systems.
            </p>

            <p style={{ marginBottom: '2rem' }}>
              For users who want the broader product overview, the{" "}
              <Link href="/" style={{ color: PALETTE.ink, fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: '4px' }}>
                homepage
              </Link>{" "}
              explains how TrustSignal fits alongside compliance platforms and
              internal workflows. The{" "}
              <Link
                href="/security"
                style={{ color: PALETTE.ink, fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: '4px' }}
              >
                security overview
              </Link>{" "}
              describes the public site boundary and operational safeguards. The{" "}
              <Link
                href="/#developers"
                style={{ color: PALETTE.ink, fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: '4px' }}
              >
                developers page
              </Link>{" "}
              is the intended destination for implementation-oriented material,
              and the public codebase is available in the{" "}
              <a
                href="https://github.com/TrustSignal-dev/TrustSignal"
                target="_blank"
                rel="noreferrer"
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.25rem', 
                  color: PALETTE.ink, 
                  fontWeight: 500,
                  textDecoration: 'underline', 
                  textUnderlineOffset: '4px' 
                }}
              >
                TrustSignal repository
                <ArrowUpRight size={14} color={PALETTE.red} />
              </a>
              .
            </p>

            <p style={{ margin: 0 }}>
              In short, TrustSignal is the integrity layer for compliance
              artifacts. It adds signed receipts, preserves verifiable
              provenance, and supports compliance artifact verification in a way
              that fits existing workflows. That definition is narrow by design:
              TrustSignal is not a replacement for your compliance platform, and
              it is not a generic document store. It is infrastructure for
              proving that important artifacts remain trustworthy after
              collection.
            </p>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />

      <TrustSignalFooter />
    </main>
  );
}
