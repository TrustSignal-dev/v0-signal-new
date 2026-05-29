"use client";

const PALETTE = {
  paper: "#FAFAF8",
  ink: "#121316",
  deep: "#0E0F12",
  blue: "#4D5AF0",
  lightMuted: "rgba(250,250,248,0.55)",
  lineDark: "rgba(250,250,248,0.12)",
};

const FOOTER_COLS = [
  { 
    head: "Product", 
    links: [
      { label: "How it works", href: "/#who-its-for" },
      { label: "Pricing", href: "/#pilot-request" },
      { label: "Developers", href: "/#developers" },
      { label: "Live demo", href: "/demo" }
    ] 
  },
  { 
    head: "Verticals", 
    links: [
      { label: "Healthcare staffing", href: "/#who-its-for" },
      { label: "Education", href: "/#who-its-for" },
      { label: "Mortgage & title", href: "/#who-its-for" },
      { label: "Government", href: "/#who-its-for" }
    ] 
  },
  { 
    head: "Company", 
    links: [
      { label: "Founder's story", href: "/founders-story" },
      { label: "Contact", href: "mailto:christopher@trustsignal.dev" }
    ] 
  },
];

export default function TrustSignalFooter() {
  return (
    <footer style={footStyles.footer}>
      <style>{footCss}</style>
      <div style={footStyles.inner}>
        <div style={footStyles.grid}>
          <div style={footStyles.brandCol}>
            <div style={footStyles.wordmark}>
              <span style={footStyles.mark} aria-hidden="true">—||—</span> TrustSignal
            </div>
            <p style={footStyles.tagline}>Evidence integrity infrastructure.</p>
            <p style={footStyles.prove}>Prove. Verify. Trust.</p>
            <p style={footStyles.contact}>
              <a href="mailto:christopher@trustsignal.dev" style={footStyles.contactLink} className="ts-footlink">
                christopher@trustsignal.dev
              </a>
              <br />Chicago, IL
            </p>
          </div>

          {FOOTER_COLS.map((col) => (
            <div key={col.head}>
              <div style={footStyles.colHead}>{col.head}</div>
              <ul style={footStyles.colList}>
                {col.links.map((l) => (
                  <li key={l.label} style={footStyles.colItem}>
                    <a href={l.href} style={footStyles.colLink} className="ts-footlink">{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={footStyles.bottom}>
          <span>© 2026 TrustSignal · Pre-Seed · Chicago, IL</span>
          <span style={footStyles.bottomNote}>Receipts remain verifiable even after cancellation.</span>
        </div>
      </div>
    </footer>
  );
}

const footStyles = {
  footer: {
    background: PALETTE.deep,
    color: PALETTE.paper,
    padding: "4.5rem 1.5rem 2.5rem",
    fontFamily: "'DM Sans', sans-serif",
    borderTop: `1px solid ${PALETTE.lineDark}`,
  },
  inner: { maxWidth: "1080px", margin: "0 auto" },
  grid: {
    display: "grid",
    gridTemplateColumns: "1.6fr 1fr 1fr 1fr",
    gap: "2.5rem",
  },
  brandCol: { maxWidth: "300px" },
  wordmark: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: "1.3rem",
    color: PALETTE.paper,
    fontWeight: 500,
  },
  mark: { fontFamily: "'DM Mono', monospace", color: PALETTE.blue, fontSize: "0.95rem" },
  tagline: { fontSize: "0.92rem", color: PALETTE.lightMuted, margin: "0.9rem 0 0" },
  prove: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "0.78rem",
    letterSpacing: "0.1em",
    color: PALETTE.lightMuted,
    margin: "0.4rem 0 0",
  },
  contact: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "0.78rem",
    lineHeight: 1.7,
    color: PALETTE.lightMuted,
    margin: "1.4rem 0 0",
  },
  contactLink: { color: PALETTE.lightMuted, textDecoration: "none" },
  colHead: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "0.74rem",
    letterSpacing: "0.12em",
    color: "rgba(250,250,248,0.4)",
    marginBottom: "1rem",
  },
  colList: { listStyle: "none", padding: 0, margin: 0 },
  colItem: { marginBottom: "0.7rem" },
  colLink: {
    fontSize: "0.9rem",
    color: PALETTE.lightMuted,
    textDecoration: "none",
    transition: "color 0.15s ease",
  },
  bottom: {
    marginTop: "3.5rem",
    paddingTop: "1.6rem",
    borderTop: `1px solid ${PALETTE.lineDark}`,
    display: "flex",
    flexWrap: "wrap",
    gap: "0.8rem",
    justifyContent: "space-between",
    fontFamily: "'DM Mono', monospace",
    fontSize: "0.74rem",
    color: "rgba(250,250,248,0.4)",
  },
  bottomNote: { color: "rgba(250,250,248,0.4)" },
};

const footCss = `
  .ts-footlink:hover { color: #FFFFFF !important; }
  @media (max-width: 760px) {
    footer > div > div:first-child { grid-template-columns: 1fr 1fr !important; gap: 2rem !important; }
  }
`;
