import type { Metadata } from "next";
import { AccountAccessPage } from "@/components/account-access-page";
import { DeveloperAccessRequestForm } from "@/components/developer-access-request-form";
import { createPageMetadata } from "@/lib/seo";
import {
  ACCOUNT_LINKS,
  buildTrustSignalAppUrl,
  getDeveloperAccessFallback,
  HAS_TRUSTSIGNAL_APP,
} from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "Sign Up",
  description:
    "Create or request TrustSignal developer access. Public self-serve availability depends on deployment configuration.",
  path: "/sign-up",
  keywords: ["TrustSignal sign up", "developer account", "API key onboarding"],
});

export default function SignUpPage() {
  if (!HAS_TRUSTSIGNAL_APP) {
    return <DeveloperAccessRequestForm />;
  }

  return (
    <AccountAccessPage
      eyebrow="TrustSignal account setup"
      title="Open the TrustSignal signup path."
      description="Use the configured authenticated TrustSignal surface to create an account, verify your email, and manage API access when that surface is deployed."
      primaryHref={buildTrustSignalAppUrl("/sign-up", getDeveloperAccessFallback())}
      primaryLabel={HAS_TRUSTSIGNAL_APP ? "Create account" : "Request developer access"}
      secondaryHref={ACCOUNT_LINKS.signIn}
      secondaryLabel="Already have an account?"
      steps={[
        "Open the configured authenticated TrustSignal signup surface.",
        "Verify your email and finish the setup if the deployed auth flow is enabled.",
        "Open the API key dashboard only when that authenticated surface is available.",
      ]}
      callout={
        <>
          <p>The public website explains the product and docs.</p>
          <p>
            {HAS_TRUSTSIGNAL_APP
              ? "A separate authenticated TrustSignal surface is configured for signup, sign-in, and key issuance."
              : "The dedicated app is not deployed yet, so this route currently falls back to the on-site access request form."}
          </p>
        </>
      }
      icon="signup"
    />
  );
}
