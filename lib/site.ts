export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://trustsignal.dev";

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
  { name: "For Developers", href: "#developers" },
  { name: "Claims Boundary", href: "#claims-boundary" },
  { name: "Pilot Request", href: "#pilot-request" },
] as const;
