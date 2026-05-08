import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createPageMetadata } from "@/lib/seo";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SignUpForm } from "@/components/sign-up-form";

export const metadata: Metadata = createPageMetadata({
  title: "Sign Up",
  description:
    "Create a TrustSignal account to get API access and manage machine clients.",
  path: "/sign-up",
  keywords: ["TrustSignal sign up", "developer account", "API key onboarding"],
});

export default async function SignUpPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }
  return <SignUpForm />;
}
