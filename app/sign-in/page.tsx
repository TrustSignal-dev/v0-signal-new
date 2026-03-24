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
      primaryHref={buildTrustSignalAppUrl(
        "/sign-in",
        getDeveloperAccessFallback("TrustSignal sign-in access"),
      )}
      primaryLabel={HAS_TRUSTSIGNAL_APP ? "Sign in" : "Request sign-in access"}
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
          <p>
            {HAS_TRUSTSIGNAL_APP
              ? "The public website should not become a second source of truth for API credentials."
              : "Until the app is deployed, the public site should route access requests somewhere that does not 404."}
          </p>
        </>
      }
      icon="signin"
    />
  );
}
