"use client";

import { useState } from "react";

/**
 * TrustSignal — "Request a Pilot" form section
 * Matches the new design language: inline styles, FAFAF8 paper, Fraunces / DM Sans / DM Mono,
 * Electric Blue #4D5AF0 actions, Signal Red #F23A17 accents.
 */

const PALETTE = {
  paper: "#FAFAF8",
  ink: "#121316",
  body: "#2a2b30",
  blue: "#4D5AF0",
  red: "#F23A17",
  muted: "rgba(18,19,22,0.60)",
  line: "rgba(18,19,22,0.12)",
  inputBg: "#FFFFFF",
};

export default function TrustSignalPilotForm() {
  const [values, setValues] = useState({ name: "", company: "", address: "", email: "", phone: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState(null);

  function validate(v) {
    const e = {};
    if (!v.name.trim() || v.name.trim().length < 2) e.name = "Enter your name.";
    if (!v.company.trim() || v.company.trim().length < 2) e.company = "Enter your company name.";
    if (!v.address.trim() || v.address.trim().length < 5) e.address = "Enter a mailing address.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) e.email = "Enter a valid email address.";
    if (!v.phone.trim() || v.phone.trim().length < 7) e.phone = "Enter a phone number.";
    return e;
  }

  function handleChange(e) {
    setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(values);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    setServerError(null);
    try {
      const res = await fetch("/api/pilot-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
      setValues({ name: "", company: "", address: "", email: "", phone: "" });
    } catch {
      setServerError("The request could not be saved right now. Email info@trustsignal.dev and we will respond manually.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section style={s.section} id="pilot-request">
      <style>{css}</style>
      <div style={s.inner}>

        {/* Left — copy */}
        <div style={s.copy}>
          <span style={s.eyebrow}>PILOT REQUEST</span>
          <h2 style={s.heading}>
            Start a lightweight pilot<br />
            <span style={s.headingAccent}>in 90 days.</span>
          </h2>
          <p style={s.sub}>
            Share the basics and TrustSignal will follow up with next steps. No payment or
            system access is requested through this form.
          </p>
          <ul style={s.notes} aria-label="Process notes">
            {[
              "Responses reviewed directly by the TrustSignal team.",
              "No workflow change required to run a pilot.",
              "Receipts remain permanently verifiable after cancellation.",
            ].map((n) => (
              <li key={n} style={s.noteItem}>
                <span style={s.dash} aria-hidden="true">—</span>
                {n}
              </li>
            ))}
          </ul>
        </div>

        {/* Right — form */}
        <div style={s.card}>
          {submitted ? (
            <div style={s.successBox}>
              <p style={s.successEyebrow}>REQUEST SENT</p>
              <h3 style={s.successHeading}>We have your information.</h3>
              <p style={s.successBody}>
                TrustSignal will respond within 24–48 hours with the next step for your
                pilot or integration review.
              </p>
              <button type="button" style={s.ghostBtn} className="ts-ghost" onClick={() => setSubmitted(false)}>
                Send another request
              </button>
            </div>
          ) : (
            <form style={s.form} onSubmit={handleSubmit} noValidate>
              <Field label="Name" name="name" value={values.name} onChange={handleChange}
                placeholder="Your name" autoComplete="name" error={errors.name} />
              <Field label="Company" name="company" value={values.company} onChange={handleChange}
                placeholder="Company name" autoComplete="organization" error={errors.company} />
              <Field label="Address" name="address" value={values.address} onChange={handleChange}
                placeholder="Business address" autoComplete="street-address" error={errors.address} />
              <div style={s.grid2}>
                <Field label="Email" name="email" value={values.email} onChange={handleChange}
                  placeholder="name@company.com" autoComplete="email" inputMode="email" error={errors.email} />
                <Field label="Phone" name="phone" value={values.phone} onChange={handleChange}
                  placeholder="(555) 555-5555" autoComplete="tel" inputMode="tel" error={errors.phone} />
              </div>

              {serverError && <p style={s.serverError}>{serverError}</p>}

              <div style={{ marginTop: "1.5rem" }}>
                <button type="submit" disabled={submitting} style={s.submitBtn} className="ts-submit">
                  {submitting ? "Sending…" : "Send pilot request"}
                </button>
                <p style={s.disclaimer}>
                  By sending this request, you agree that TrustSignal may contact you about
                  pilot planning, integration review, and service follow-up.
                </p>
              </div>
            </form>
          )}
        </div>

      </div>
    </section>
  );
}

function Field({ label, name, value, onChange, placeholder, autoComplete, inputMode, error }) {
  return (
    <label style={fieldS.wrap}>
      <span style={fieldS.label}>{label}</span>
      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        style={{ ...fieldS.input, ...(error ? fieldS.inputError : {}) }}
        className="ts-input"
      />
      {error && <span style={fieldS.errorMsg}>{error}</span>}
    </label>
  );
}

const s = {
  section: {
    background: PALETTE.paper,
    padding: "6rem 1.5rem",
    fontFamily: "'DM Sans', sans-serif",
    WebkitFontSmoothing: "antialiased",
    borderTop: `1px solid ${PALETTE.line}`,
  },
  inner: {
    maxWidth: "1100px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "4rem",
    alignItems: "start",
  },
  copy: { color: PALETTE.body },
  eyebrow: {
    display: "block",
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
    fontSize: "clamp(2rem, 4vw, 3rem)",
    lineHeight: 1.08,
    letterSpacing: "-0.01em",
    color: PALETTE.ink,
    margin: 0,
  },
  headingAccent: { color: PALETTE.red, fontStyle: "italic" },
  sub: {
    fontSize: "clamp(1rem, 1.5vw, 1.12rem)",
    lineHeight: 1.65,
    color: PALETTE.muted,
    margin: "1.4rem 0 0",
    maxWidth: "420px",
  },
  notes: {
    listStyle: "none",
    padding: 0,
    margin: "2rem 0 0",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  noteItem: {
    display: "flex",
    gap: "0.75rem",
    fontFamily: "'DM Mono', monospace",
    fontSize: "0.8rem",
    lineHeight: 1.5,
    color: PALETTE.muted,
    alignItems: "flex-start",
  },
  dash: { color: PALETTE.blue, flexShrink: 0, fontWeight: 700 },
  card: {
    background: "#FFFFFF",
    border: `1px solid ${PALETTE.line}`,
    padding: "2.5rem",
    boxShadow: "0 16px 64px rgba(18,19,22,0.06)",
  },
  form: { display: "flex", flexDirection: "column", gap: "1.1rem" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.1rem" },
  serverError: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "0.78rem",
    color: "#c0392b",
    margin: "0.5rem 0 0",
  },
  submitBtn: {
    width: "100%",
    height: "3rem",
    background: PALETTE.blue,
    color: "#FFFFFF",
    border: "none",
    borderRadius: "2px",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    fontSize: "1rem",
    cursor: "pointer",
    letterSpacing: "0.01em",
    transition: "background 0.15s ease, transform 0.15s ease",
  },
  disclaimer: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "0.72rem",
    lineHeight: 1.5,
    color: PALETTE.muted,
    margin: "0.75rem 0 0",
  },
  successBox: { display: "flex", flexDirection: "column", gap: "1rem" },
  successEyebrow: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "0.75rem",
    letterSpacing: "0.18em",
    color: PALETTE.muted,
    margin: 0,
  },
  successHeading: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontWeight: 400,
    fontSize: "clamp(1.5rem, 3vw, 2rem)",
    color: PALETTE.ink,
    margin: 0,
  },
  successBody: {
    fontSize: "0.95rem",
    lineHeight: 1.6,
    color: PALETTE.muted,
    margin: 0,
  },
  ghostBtn: {
    background: "transparent",
    border: `1px solid ${PALETTE.line}`,
    borderRadius: "2px",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "0.9rem",
    color: PALETTE.body,
    padding: "0.6rem 1.2rem",
    cursor: "pointer",
    transition: "border-color 0.15s ease",
    alignSelf: "flex-start",
  },
};

const fieldS = {
  wrap: { display: "flex", flexDirection: "column", gap: "0.4rem" },
  label: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "0.85rem",
    fontWeight: 500,
    color: PALETTE.ink,
  },
  input: {
    height: "3rem",
    width: "100%",
    border: `1px solid ${PALETTE.line}`,
    background: PALETTE.inputBg,
    padding: "0 1rem",
    fontSize: "0.9rem",
    fontFamily: "'DM Sans', sans-serif",
    color: PALETTE.ink,
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s ease",
    borderRadius: 0,
  },
  inputError: { borderColor: "#c0392b" },
  errorMsg: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "0.72rem",
    color: "#c0392b",
  },
};

const css = `
  .ts-input:focus { border-color: #4D5AF0 !important; }
  .ts-submit:hover:not(:disabled) { background: #3A46D8 !important; transform: translateY(-1px); }
  .ts-submit:disabled { opacity: 0.6; cursor: not-allowed; }
  .ts-ghost:hover { border-color: #121316 !important; }
  @media (max-width: 560px) {
    .ts-grid2 { grid-template-columns: 1fr !important; }
  }
`;
