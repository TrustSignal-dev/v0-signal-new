import React from "react";
import type { Metadata } from "next";
import { Instrument_Sans, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SITE_URL } from "@/lib/site";
import {
  DEFAULT_KEYWORDS,
  absoluteUrl,
  organizationJsonLd,
} from "@/lib/seo";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument-serif",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "TrustSignal | Evidence Integrity Infrastructure",
    template: "%s | TrustSignal",
  },
  description:
    "Evidence integrity infrastructure for compliance artifacts. Generate signed verification receipts, preserve provenance, and verify records without replacing existing workflows.",
  keywords: [...DEFAULT_KEYWORDS],
  applicationName: "TrustSignal",
  alternates: {
    canonical: absoluteUrl("/"),
  },
  openGraph: {
    title: "TrustSignal | Evidence Integrity Infrastructure",
    description:
      "Evidence integrity infrastructure for compliance artifacts. Generate signed verification receipts, preserve provenance, and verify records without replacing existing workflows.",
    url: absoluteUrl("/"),
    siteName: "TrustSignal",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: absoluteUrl("/placeholder-logo.png"),
        width: 1200,
        height: 630,
        alt: "TrustSignal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TrustSignal | Evidence Integrity Infrastructure",
    description:
      "Evidence integrity infrastructure for compliance artifacts. Generate signed verification receipts, preserve provenance, and verify records without replacing existing workflows.",
    images: [absoluteUrl("/placeholder-logo.png")],
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-light-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${instrumentSans.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
