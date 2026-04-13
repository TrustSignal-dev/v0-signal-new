import type { Metadata } from "next";
import { AccountAccessPage } from "@/components/account-access-page";
import { createPageMetadata } from "@/lib/seo";
import {
  ACCOUNT_LINKS,
  buildTrustSignalAppUrl,
  HAS_TRUSTSIGNAL_APP,
} from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "Get Your API Key",
  description:
    "Get or request your TrustSignal API key through the configured authenticated surface. Public self-serve availability depends on deployment configuration.",
  path: "/get-your-api-key",
  keywords: ["TrustSignal API key", "developer portal", "central key management"],
});

export default function GetYourApiKeyPage() {
  const fallbackHref = HAS_TRUSTSIGNAL_APP
    ? buildTrustSignalAppUrl("/settings/api-keys", ACCOUNT_LINKS.signUp)
    : ACCOUNT_LINKS.signUp;

  return (
    <AccountAccessPage
      eyebrow="TrustSignal developer access"
      title="Request or open your TrustSignal API access path."
      description="TrustSignal API keys are issued through the configured authenticated surface when it is deployed. Otherwise this page should route developers into manual or pilot-gated access review. Higher-volume access should be handled through the current commercial onboarding path rather than assumed as self-serve."
      primaryHref={fallbackHref}
      primaryLabel={HAS_TRUSTSIGNAL_APP ? "Open API key dashboard" : "Sign up for access"}
      secondaryHref={ACCOUNT_LINKS.signUp}
      secondaryLabel={HAS_TRUSTSIGNAL_APP ? "Need an account first?" : "Developer signup details"}
      steps={[
        "Create or sign in to your TrustSignal account when the authenticated surface is deployed.",
        "Open the API key dashboard only in that authenticated surface.",
        "Generate, copy, and store the key securely if key issuance is enabled there.",
      ]}
      callout={
        <>
          <p>One API key system supports multiple TrustSignal properties.</p>
          <p>
            {HAS_TRUSTSIGNAL_APP
              ? "Validation belongs in the API repos; this website is the public discovery and routing surface."
              : "The app domain is not active yet, so TrustSignal now routes API access requests into a dedicated on-site signup flow."}
          </p>
          <p>Higher-volume access should be handled through commercial onboarding.</p>
        </>
      }
      icon="key"
    />
  );
}
