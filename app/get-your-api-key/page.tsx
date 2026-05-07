import type { Metadata } from "next";
import { AccountAccessPage } from "@/components/account-access-page";
import { createPageMetadata } from "@/lib/seo";
import { ACCOUNT_LINKS } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
    title: "Get Your API Key",
    description:
          "Open the authenticated dashboard to generate and rotate TrustSignal API keys.",
    path: "/get-your-api-key",
    keywords: ["TrustSignal API key", "developer portal", "key management"],
});

export default function GetYourApiKeyPage() {
    return (
          <AccountAccessPage
                  eyebrow="TrustSignal developer access"
                  title="Open your API key dashboard"
                  description="Sign in with GitHub to open the authenticated dashboard where API keys are generated and rotated."
                  primaryHref="/auth/sign-in?next=/dashboard"
                  primaryLabel="Open API key dashboard"
                  secondaryHref={ACCOUNT_LINKS.signUp}
                  secondaryLabel="Need an account first?"
                  steps={[
                            "Continue with GitHub OAuth.",
                            "Land in the authenticated dashboard.",
                            "Generate, copy, and rotate API keys from dashboard settings.",
                          ]}
                  callout="API keys are managed in the authenticated TrustSignal dashboard, not on anonymous marketing pages."
                  icon="key"
                />
        );
}
