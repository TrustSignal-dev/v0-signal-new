"use client";

import TrustSignalPilot from "./TrustSignalPilot";
import TrustSignalPilotForm from "./TrustSignalPilotForm";

/**
 * TrustSignal — combined pilot section
 * Renders "How a Pilot Works" above the request form.
 * Both use inline styles matching the design system.
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

export default function TrustSignalPilotSection() {
  return (
    <>
      {/* How a Pilot Works */}
      <TrustSignalPilot />

      {/* Request form */}
      <section
        id="pilot-request"
        style={{
          background: PALETTE.paper,
          padding: "6rem 1.5rem",
          fontFamily: "'DM Sans', sans-serif",
          borderTop: `1px solid ${PALETTE.line}`,
          scrollMarginTop: "80px",
        }}
      >
        <style>{formSectionCss}</style>
        <div
          style={{
            maxWidth: "1100px",
            width: "100%",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "5rem",
            alignItems: "start",
          }}
          className="ts-pilot-grid"
        >
          {/* Left — copy */}
          <div>
            <span
              style={{
                display: "block",
                fontFamily: "'DM Mono', monospace",
                fontSize: "0.78rem",
                letterSpacing: "0.18em",
                color: PALETTE.muted,
                marginBottom: "1.4rem",
                fontWeight: 500,
              }}
            >
              PILOT REQUEST
            </span>
            <h2
              style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontOpticalSizing: "auto",
                fontWeight: 400,
                fontSize: "clamp(2rem, 4vw, 3.2rem)",
                lineHeight: 1.06,
                letterSpacing: "-0.01em",
                color: PALETTE.ink,
                margin: "0 0 1.4rem",
              }}
            >
              Start a lightweight pilot.{" "}
              <span style={{ color: PALETTE.red, fontStyle: "italic" }}>
                No IT changes required.
              </span>
            </h2>
            <p
              style={{
                fontSize: "clamp(1rem, 1.4vw, 1.12rem)",
                lineHeight: 1.65,
                color: PALETTE.body,
                margin: "0 0 2rem",
                maxWidth: "480px",
              }}
            >
              Share the basics and TrustSignal will follow up within 24–48 hours
              with next steps for your pilot. No payment or system access is
              requested through this form.
            </p>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "0.7rem",
              }}
            >
              {[
                "90-day pilot, fixed fee, non-refundable",
                "Up to 3,000 tamper-evident receipts",
                "25 NFC wallet cards included",
                "No workflow changes for your team",
                "Receipts permanently verifiable",
              ].map((item) => (
                <li
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.7rem",
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "0.82rem",
                    lineHeight: 1.55,
                    color: PALETTE.body,
                  }}
                >
                  <span style={{ color: PALETTE.blue, fontWeight: 700, flexShrink: 0 }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right — form */}
          <TrustSignalPilotForm />
        </div>
      </section>
    </>
  );
}

const formSectionCss = `
  @media (max-width: 820px) {
    .ts-pilot-grid { grid-template-columns: 1fr !important; gap: 2.4rem !important; }
  }
  .ts-pilot-btn:hover:not(:disabled) { background: #3A46D8 !important; transform: translateY(-1px); }
`;
