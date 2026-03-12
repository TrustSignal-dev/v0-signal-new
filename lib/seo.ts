import type { Metadata } from "next";
import { CONTACT_EMAIL, SITE_URL, TRUSTSIGNAL_REVIEW_REPO_URL } from "@/lib/site";

export const DEFAULT_KEYWORDS = [
  "TrustSignal",
  "evidence integrity infrastructure",
  "compliance artifacts",
  "signed verification receipts",
  "verifiable provenance",
  "tamper-evident audit trail",
  "audit-ready verification",
  "compliance workflow integration",
  "security review infrastructure",
  "compliance evidence",
] as const;

export const DEFAULT_OG_IMAGE = "/placeholder-logo.png";

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

export function createPageMetadata({
  title,
  description,
  path,
  keywords = [],
  noIndex = false,
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  noIndex?: boolean;
}): Metadata {
  const url = absoluteUrl(path);
  const mergedKeywords = [...DEFAULT_KEYWORDS, ...keywords];

  return {
    title,
    description,
    keywords: mergedKeywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "TrustSignal",
      locale: "en_US",
      type: "website",
      images: [
        {
          url: absoluteUrl(DEFAULT_OG_IMAGE),
          width: 1200,
          height: 630,
          alt: "TrustSignal",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl(DEFAULT_OG_IMAGE)],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : undefined,
  };
}

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "TrustSignal",
  url: SITE_URL,
  logo: absoluteUrl("/placeholder-logo.png"),
  sameAs: [TRUSTSIGNAL_REVIEW_REPO_URL],
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "sales",
      email: CONTACT_EMAIL,
      availableLanguage: ["English"],
    },
  ],
  description:
    "TrustSignal is evidence integrity infrastructure for compliance artifacts, signed receipts, provenance, and audit-ready verification.",
};
