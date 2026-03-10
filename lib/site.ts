export const CONTACT_EMAIL = "info@trustsignal.dev";
export const TRUSTSIGNAL_REVIEW_REPO_URL =
  process.env.NEXT_PUBLIC_REVIEW_REPO_URL ||
  "https://github.com/TrustSignal-dev/TrustSignal-docs";

export const PRIMARY_NAV_LINKS = [
  { name: "Problem", href: "#problem" },
  { name: "Demo", href: "#demo" },
  { name: "Integration", href: "#integration" },
  { name: "Architecture", href: "#architecture" },
  { name: "Pilot Request", href: "#pilot-request" },
] as const;
