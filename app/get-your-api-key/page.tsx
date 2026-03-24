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
  title: "Get Your API Key",
  description:
    "Get your TrustSignal API key through the central developer app and use it across TrustSignal services.",
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
      title="Get your API key through the TrustSignal app."
      description="TrustSignal API keys are issued in one central account system and then used by the TrustSignal API, TrustSignal Verify Artifact, and related application surfaces."
      primaryHref={fallbackHref}
      primaryLabel={HAS_TRUSTSIGNAL_APP ? "Open API key dashboard" : "Sign up for access"}
      secondaryHref={ACCOUNT_LINKS.signUp}
      secondaryLabel={HAS_TRUSTSIGNAL_APP ? "Need an account first?" : "Developer signup details"}
      steps={[
        "Create or sign in to your TrustSignal account.",
        "Open the API key dashboard in the TrustSignal app.",
        "Generate, copy, and store the key securely because the raw value is shown once.",
      ]}
      callout={
        <>
          <p>One API key system supports multiple TrustSignal properties.</p>
          <p>
            {HAS_TRUSTSIGNAL_APP
              ? "Validation belongs in the API repos; this website is the discovery and routing surface."
              : "The app domain is not active yet, so TrustSignal now routes API access requests into a dedicated on-site signup flow."}
          </p>
        </>
      }
      icon="key"
    />
  );
}
