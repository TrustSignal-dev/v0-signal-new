export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://trustsignal.dev";

export const CONTACT_EMAIL = "info@trustsignal.dev";
export const TRUSTSIGNAL_REVIEW_REPO_URL =
  process.env.NEXT_PUBLIC_REVIEW_REPO_URL ||
  "https://github.com/TrustSignal-dev/TrustSignal-docs";

export const PRIMARY_NAV_LINKS = [
  { name: "Workflows", href: "#workflows" },
  { name: "Integration", href: "#integration" },
  { name: "Security", href: "#security" },
  { name: "Architecture", href: "#architecture" },
  { name: "Pilot Request", href: "#pilot-request" },
] as const;
