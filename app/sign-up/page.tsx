import type { Metadata } from "next";
import { AccountAccessPage } from "@/components/account-access-page";
import { createPageMetadata } from "@/lib/seo";
import { ACCOUNT_LINKS, buildTrustSignalAppUrl } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "Sign Up",
  description:
    "Create a TrustSignal account to access the central developer app and manage API keys for TrustSignal services.",
  path: "/sign-up",
  keywords: ["TrustSignal sign up", "developer account", "API key onboarding"],
});

export default function SignUpPage() {
  return (
    <AccountAccessPage
      eyebrow="TrustSignal account setup"
      title="Create your TrustSignal developer account."
      description="Use the central TrustSignal app to create an account, verify your email, and manage the API keys used by TrustSignal services."
      primaryHref={buildTrustSignalAppUrl("/sign-up")}
      primaryLabel="Create account"
      secondaryHref={ACCOUNT_LINKS.signIn}
      secondaryLabel="Already have an account?"
      steps={[
        "Create your account in the TrustSignal app.",
        "Verify your email and finish the initial setup.",
        "Open the API key dashboard to generate your first key.",
      ]}
      callout={
        <>
          <p>The public website explains the product and docs.</p>
          <p>The authenticated app owns signup, sign-in, and API key issuance for the TrustSignal platform.</p>
        </>
      }
      icon="signup"
    />
  );
}
