import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createPageMetadata } from "@/lib/seo";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SignUpForm } from "@/components/sign-up-form";
import { sanitizeNextPath } from "@/lib/auth/redirect";

export const metadata: Metadata = createPageMetadata({
  title: "Sign Up",
  description:
    "Create a TrustSignal account to manage API keys and verification receipts.",
  path: "/sign-up",
  keywords: ["TrustSignal sign up", "developer account", "API key onboarding"],
});

export default async function SignUpPage({
  searchParams,
}: { searchParams: Promise<{ next?: string | string[] }> }) {
  const query = await searchParams;
  const nextPath = sanitizeNextPath(typeof query.next === "string" ? query.next : undefined);
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(nextPath);
  }
  return <SignUpForm nextPath={nextPath} />;
}
