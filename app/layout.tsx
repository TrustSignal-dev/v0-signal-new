import React from "react";
import type { Metadata } from "next";
import { Fraunces, Geist, Montserrat } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SITE_URL } from "@/lib/site";
import {
  DEFAULT_KEYWORDS,
  absoluteUrl,
  organizationJsonLd,
} from "@/lib/seo";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600", "700"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["500", "600", "700"],
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  weight: ["400", "500", "700", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "TrustSignal | Evidence Integrity Infrastructure for Compliance Workflows",
    template: "%s | TrustSignal",
  },
  description:
    "TrustSignal issues signed verification receipts so compliance and audit teams can prove when evidence was created, where it came from, and whether it has changed.",
  keywords: [...DEFAULT_KEYWORDS],
  applicationName: "TrustSignal",
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
        url: absoluteUrl("/api/og"),
        width: 1200,
        height: 630,
        alt: "TrustSignal — evidence integrity infrastructure for compliance workflows",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TrustSignal | Evidence Integrity Infrastructure for Compliance Workflows",
    description:
      "TrustSignal issues signed verification receipts so compliance and audit teams can prove when evidence was created, where it came from, and whether it has changed.",
    images: [absoluteUrl("/api/og")],
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body
        className={`${fraunces.variable} ${montserrat.variable} ${geist.variable} font-sans antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
