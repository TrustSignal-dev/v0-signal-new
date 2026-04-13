import type { Metadata } from "next";
import { AccountAccessPage } from "@/components/account-access-page";
import { createPageMetadata } from "@/lib/seo";
import {
  ACCOUNT_LINKS,
  buildTrustSignalAppUrl,
  getDeveloperAccessFallback,
  HAS_TRUSTSIGNAL_APP,
} from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "Sign In",
  description:
    "Sign in to the configured TrustSignal account surface to manage developer access and API keys, when deployed.",
  path: "/sign-in",
  keywords: ["TrustSignal sign in", "developer login", "API key dashboard"],
});

export default function SignInPage() {
  return (
    <AccountAccessPage
      eyebrow="TrustSignal account access"
      title="Sign in to manage your TrustSignal keys."
      description="The public site routes developers into the configured authenticated TrustSignal surface when available. Otherwise this path should remain manual or pilot-gated."
      primaryHref={buildTrustSignalAppUrl("/sign-in", getDeveloperAccessFallback())}
      primaryLabel={HAS_TRUSTSIGNAL_APP ? "Sign in" : "Request sign-in access"}
      secondaryHref={ACCOUNT_LINKS.getApiKey}
      secondaryLabel="Need an API key?"
      steps={[
        "Open the configured TrustSignal sign-in surface.",
        "Complete login using the deployed auth flow.",
        "Manage your API keys from the authenticated dashboard if that surface is enabled.",
      ]}
      callout={
        <>
          <p>Key issuance is intentionally centralized.</p>
          <p>
            {HAS_TRUSTSIGNAL_APP
              ? "The public website should not become a second source of truth for API credentials."
              : "Until the app is deployed, the public site should route access requests into the on-site form instead of a dead or local-mail link."}
          </p>
        </>
      }
      icon="signin"
    />
  );
}
