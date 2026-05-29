import type { Metadata } from "next";
import TrustSignalPage from "@/components/landing/TrustSignalPage";
import { DEFAULT_OG_IMAGE, DEFAULT_KEYWORDS, absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    absolute: "TrustSignal | Evidence Integrity Infrastructure for Compliance Workflows",
  },
  description:
    "TrustSignal issues signed cryptographic receipts so compliance and audit teams can prove when evidence was collected, where it came from, and whether it has changed — across any high-trust workflow.",
  keywords: [
    ...DEFAULT_KEYWORDS,
    "compliance workflow",
    "signed receipts",
    "verification signals",
    "verifiable provenance",
  ],
  alternates: {
    canonical: absoluteUrl("/"),
  },
  openGraph: {
    title: "TrustSignal | Evidence Integrity Infrastructure for Compliance Workflows",
    description:
      "TrustSignal issues signed verification receipts so compliance and audit teams can prove when evidence was created, where it came from, and whether it has changed.",
    url: absoluteUrl("/"),
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
    title: "TrustSignal | Evidence Integrity Infrastructure for Compliance Workflows",
    description:
      "TrustSignal issues signed verification receipts so compliance and audit teams can prove when evidence was created, where it came from, and whether it has changed.",
    images: [absoluteUrl(DEFAULT_OG_IMAGE)],
  },
};

export default function Home() {
  return <TrustSignalPage />;
}
