"use client";

import { useState } from "react";

/**
 * TrustSignal — "Request a Pilot" form
 * Fully inline-styled to match the design system.
 * Submits to /api/pilot-request → forwards to christopher@trustsignal.dev
 */

const PALETTE = {
  paper: "#FAFAF8",
  ink: "#121316",
  body: "#2a2b30",
  blue: "#4D5AF0",
  red: "#F23A17",
  muted: "rgba(18,19,22,0.60)",
  line: "rgba(18,19,22,0.12)",
  error: "#B91C1C",
};

function validate(values) {
  const errors = {};
  if (!values.name || values.name.trim().length < 2) errors.name = "Enter your name.";
  if (!values.company || values.company.trim().length < 2) errors.company = "Enter your company name.";
  if (!values.address || values.address.trim().length < 5) errors.address = "Enter a business address.";
  if (!values.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = "Enter a valid email address.";
  if (!values.phone || values.phone.trim().length < 7) errors.phone = "Enter a phone number.";
  return errors;
}

export default function TrustSignalPilotForm() {
  const [values, setValues] = useState({ name: "", company: "", address: "", email: "", phone: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [focused, setFocused] = useState(null);

  const set = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(values);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/pilot-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Submission failed.");
      setIsSubmitted(true);
    } catch {
      setSubmitError("Request could not be saved right now. Email christopher@trustsignal.dev and we will respond manually.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div style={s.card}>
        <p style={s.successLabel}>REQUEST SENT</p>
        <h3 style={s.successHead}>We have your information.</h3>
        <p style={s.successBody}>
          TrustSignal will respond within 24–48 hours with the next step for your pilot or integration review.
        </p>
        <button type="button" style={s.outlineBtn} onClick={() => { setIsSubmitted(false); setValues({ name: "", company: "", address: "", email: "", phone: "" }); }}>
          Send another request
        </button>
      </div>
    );
  }

  const fieldStyle = (field) => ({
    ...s.input,
    borderColor: errors[field] ? PALETTE.error : focused === field ? PALETTE.ink : "rgba(18,19,22,0.18)",
    outline: "none",
  });

  return (
    <div style={s.card}>
      <form onSubmit={onSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
        <Field label="Name" error={errors.name}>
          <input
            value={values.name}
            onChange={set("name")}
            onFocus={() => setFocused("name")}
            onBlur={() => setFocused(null)}
            style={fieldStyle("name")}
            autoComplete="name"
            placeholder="Your full name"
          />
        </Field>

        <Field label="Company" error={errors.company}>
          <input
            value={values.company}
            onChange={set("company")}
            onFocus={() => setFocused("company")}
            onBlur={() => setFocused(null)}
            style={fieldStyle("company")}
            autoComplete="organization"
            placeholder="Company or organization name"
          />
        </Field>

        <Field label="Business Address" error={errors.address}>
          <input
            value={values.address}
            onChange={set("address")}
            onFocus={() => setFocused("address")}
            onBlur={() => setFocused(null)}
            style={fieldStyle("address")}
            autoComplete="street-address"
            placeholder="Street address, city, state"
          />
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem" }}>
          <Field label="Email" error={errors.email}>
            <input
              value={values.email}
              onChange={set("email")}
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused(null)}
              style={fieldStyle("email")}
              autoComplete="email"
              inputMode="email"
              placeholder="name@company.com"
            />
          </Field>
          <Field label="Phone" error={errors.phone}>
            <input
              value={values.phone}
              onChange={set("phone")}
              onFocus={() => setFocused("phone")}
              onBlur={() => setFocused(null)}
              style={fieldStyle("phone")}
              autoComplete="tel"
              inputMode="tel"
              placeholder="(555) 555-5555"
            />
          </Field>
        </div>

        {submitError && <p style={s.submitError}>{submitError}</p>}

        <div style={{ marginTop: "0.4rem" }}>
          <button type="submit" disabled={isSubmitting} style={isSubmitting ? { ...s.primaryBtn, opacity: 0.6, cursor: "not-allowed" } : s.primaryBtn} className="ts-pilot-btn">
            {isSubmitting ? "Sending request…" : "Send pilot request"}
          </button>
          <p style={s.disclaimer}>
            By sending this request, you agree that TrustSignal may contact you about pilot planning, integration review, and service follow-up.
          </p>
        </div>
      </form>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <label style={{ display: "block" }}>
      <span style={s.label}>{label}</span>
      <div style={{ marginTop: "0.35rem" }}>{children}</div>
      {error && <span style={s.errorText}>{error}</span>}
    </label>
  );
}

const s = {
  card: {
    border: `1px solid rgba(18,19,22,0.12)`,
    background: "#FFFFFF",
    padding: "2.4rem",
    boxShadow: "0 20px 60px rgba(0,0,0,0.06)",
  },
  input: {
    display: "block",
    width: "100%",
    height: "48px",
    padding: "0 1rem",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "0.95rem",
    color: "#121316",
    background: "#FAFAF8",
    border: "1px solid rgba(18,19,22,0.18)",
    borderRadius: "1px",
    transition: "border-color 0.15s ease",
    boxSizing: "border-box",
  },
  label: {
    display: "block",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "0.88rem",
    fontWeight: 500,
    color: "#121316",
  },
  errorText: {
    display: "block",
    marginTop: "0.3rem",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "0.8rem",
    color: "#B91C1C",
  },
  submitError: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "0.88rem",
    color: "#B91C1C",
    margin: 0,
    lineHeight: 1.5,
  },
  primaryBtn: {
    display: "block",
    width: "100%",
    height: "52px",
    background: "#4D5AF0",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "1px",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    fontSize: "1rem",
    letterSpacing: "0.01em",
    cursor: "pointer",
    transition: "background 0.15s ease, transform 0.12s ease",
  },
  outlineBtn: {
    display: "inline-block",
    marginTop: "1.2rem",
    padding: "0.7rem 1.4rem",
    background: "transparent",
    color: "#121316",
    border: "1px solid rgba(18,19,22,0.22)",
    borderRadius: "999px",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    fontSize: "0.92rem",
    cursor: "pointer",
  },
  disclaimer: {
    marginTop: "0.9rem",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "0.78rem",
    lineHeight: 1.55,
    color: "rgba(18,19,22,0.50)",
  },
  successLabel: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "0.78rem",
    letterSpacing: "0.18em",
    color: "rgba(18,19,22,0.60)",
    marginBottom: "1rem",
  },
  successHead: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontWeight: 400,
    fontSize: "1.9rem",
    lineHeight: 1.1,
    color: "#121316",
    margin: "0 0 0.8rem",
  },
  successBody: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "1rem",
    lineHeight: 1.6,
    color: "rgba(18,19,22,0.60)",
    margin: 0,
  },
};
