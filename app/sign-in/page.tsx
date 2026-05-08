import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createPageMetadata } from "@/lib/seo";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SignInForm } from "@/components/sign-in-form";

export const metadata: Metadata = createPageMetadata({
  title: "Sign In",
  description:
    "Sign in to TrustSignal to manage your developer account and API keys.",
  path: "/sign-in",
  keywords: ["TrustSignal sign in", "developer login", "API key dashboard"],
});

export default async function SignInPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }
  return <SignInForm />;
}
