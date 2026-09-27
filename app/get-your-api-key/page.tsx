import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Get an API Key",
  description:
    "Sign in to create and manage your TrustSignal API keys.",
  path: "/get-your-api-key",
  keywords: ["TrustSignal API access", "API keys"],
});

export default async function GetYourApiKeyPage() {
  // The dashboard and its API routes enforce the authenticated session.
  redirect("/dashboard?section=api-keys");
}
