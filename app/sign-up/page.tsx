import type { Metadata } from "next";
import { AccountAccessPage } from "@/components/account-access-page";
import { createPageMetadata } from "@/lib/seo";
import { ACCOUNT_LINKS } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
    title: "Sign Up",
    description:
          "Start TrustSignal account access with GitHub OAuth and continue to the authenticated dashboard.",
    path: "/sign-up",
    keywords: ["TrustSignal sign up", "developer account", "API key onboarding"],
});

export default function SignUpPage() {
    return (
          <AccountAccessPage
                  eyebrow="TrustSignal account setup"
                  title="Create your TrustSignal account"
                  description="Continue with GitHub to create or access your TrustSignal account and land in the authenticated dashboard."
                  primaryHref="/auth/sign-in?next=/dashboard"
                  primaryLabel="Continue with GitHub"
                  secondaryHref={ACCOUNT_LINKS.signIn}
                  secondaryLabel="Already have an account?"
                  steps={[
                            "Continue with GitHub to create or access your TrustSignal account.",
                            "After auth completes, you will be redirected to the dashboard.",
                            "Generate and rotate API keys from the authenticated dashboard.",
                          ]}
                  callout="The public site remains your docs and product entry point. Account creation and sign-in are handled by the built-in Supabase OAuth flow in this deployment."
                  icon="signup"
                />
        );
}
