import type { Metadata } from "next";
import { AccountAccessPage } from "@/components/account-access-page";
import { createPageMetadata } from "@/lib/seo";
import { ACCOUNT_LINKS, buildTrustSignalAppUrl } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "Sign In",
  description:
    "Sign in to the TrustSignal app to manage your developer account and API keys.",
  path: "/sign-in",
  keywords: ["TrustSignal sign in", "developer login", "API key dashboard"],
});

export default function SignInPage() {
  return (
    <AccountAccessPage
      eyebrow="TrustSignal account access"
      title="Sign in to manage your TrustSignal keys."
      description="The public site routes developers into the central TrustSignal app, where account access, key rotation, and usage review live."
      primaryHref={buildTrustSignalAppUrl("/sign-in")}
      primaryLabel="Sign in"
      secondaryHref={ACCOUNT_LINKS.getApiKey}
      secondaryLabel="Need an API key?"
      steps={[
        "Open the TrustSignal app sign-in page.",
        "Complete email or password login in the app.",
        "Manage your API keys from the central dashboard.",
      ]}
      callout={
        <>
          <p>Key issuance is intentionally centralized.</p>
          <p>The public website should not become a second source of truth for API credentials.</p>
        </>
      }
      icon="signin"
    />
  );
}
