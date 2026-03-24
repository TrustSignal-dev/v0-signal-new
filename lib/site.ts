export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://trustsignal.dev";
export const TRUSTSIGNAL_APP_URL =
  process.env.NEXT_PUBLIC_TRUSTSIGNAL_APP_URL || "https://app.trustsignal.dev";

export const CONTACT_EMAIL = "info@trustsignal.dev";
export const TRUSTSIGNAL_GITHUB_URL =
  "https://github.com/TrustSignal-dev/TrustSignal";
export const TRUSTSIGNAL_REVIEW_REPO_URL =
  process.env.NEXT_PUBLIC_REVIEW_REPO_URL ||
  "https://github.com/TrustSignal-dev/TrustSignal-docs";

export const PRIMARY_NAV_LINKS = [
  { name: "Problem", href: "#problem" },
  { name: "Integrity Model", href: "#integrity-model" },
  { name: "Integration Fit", href: "#integration" },
  { name: "Partner Demos", href: "/partner-access" },
  { name: "Claims Boundary", href: "#claims-boundary" },
  { name: "Pilot Request", href: "#pilot-request" },
] as const;

export const DEVELOPER_DOC_LINKS = [
  {
    name: "Developer Overview",
    href: "/docs",
    description: "Start at the main docs hub.",
  },
  {
    name: "Verification Lifecycle",
    href: "/docs/verification",
    description: "Artifact submission, receipts, and later comparison.",
  },
  {
    name: "API Overview",
    href: "/docs/api",
    description: "Public request and response model.",
  },
  {
    name: "Security Model",
    href: "/docs/security",
    description: "Claims boundary and public-safe controls.",
  },
  {
    name: "Architecture",
    href: "/docs/architecture",
    description: "Workflow fit and trust-boundary framing.",
  },
  {
    name: "Threat Model",
    href: "/docs/threat-model",
    description: "Threat assumptions and review posture.",
  },
] as const;

export const ACCOUNT_LINKS = {
  signUp: "/sign-up",
  signIn: "/sign-in",
  getApiKey: "/get-your-api-key",
} as const;

export function buildTrustSignalAppUrl(path = "/") {
  return new URL(path, TRUSTSIGNAL_APP_URL).toString();
}
