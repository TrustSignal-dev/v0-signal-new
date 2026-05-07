import type { Metadata } from "next";
import { AccountAccessPage } from "@/components/account-access-page";
import { createPageMetadata } from "@/lib/seo";
import { ACCOUNT_LINKS } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
    title: "Sign In",
    description:
          "Sign in to TrustSignal with GitHub OAuth and continue to your authenticated dashboard.",
    path: "/sign-in",
    keywords: ["TrustSignal sign in", "developer login", "API key dashboard"],
});

export default function SignInPage() {
    return (
          <AccountAccessPage
                  eyebrow="TrustSignal account access"
                  title="Sign in to your TrustSignal dashboard"
                  description="Use GitHub OAuth to access your TrustSignal dashboard and manage API keys."
                  primaryHref="/auth/sign-in?next=/dashboard"
                  primaryLabel="Continue with GitHub"
                  secondaryHref={ACCOUNT_LINKS.getApiKey}
                  secondaryLabel="Need an API key?"
                  steps={[
                            "Continue with GitHub to authenticate.",
                            "After auth completes, you will be redirected to the dashboard.",
                            "Manage API keys and usage from the authenticated dashboard.",
                          ]}
                  callout="Authentication and key management are handled in the authenticated TrustSignal surface. The public site remains the docs and discovery layer."
                  icon="signin"
                />
        );
}
