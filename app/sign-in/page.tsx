import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createPageMetadata } from "@/lib/seo";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SignInForm } from "@/components/sign-in-form";
import { sanitizeNextPath } from "@/lib/auth/redirect";
import { signInFeedback } from "@/lib/auth/feedback";

export const metadata: Metadata = createPageMetadata({
  title: "Sign In",
  description:
    "Sign in to TrustSignal to manage your developer account and API keys.",
  path: "/sign-in",
  keywords: ["TrustSignal sign in", "developer login", "API key dashboard"],
});

export default async function SignInPage({ searchParams }: {
  searchParams: Promise<{ next?: string | string[]; error?: string | string[] }>;
}) {
  const query = await searchParams;
  const nextPath = sanitizeNextPath(typeof query.next === "string" ? query.next : undefined);
  const initialError = signInFeedback(typeof query.error === "string" ? query.error : undefined);
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(nextPath);
  }
  return <SignInForm nextPath={nextPath} initialError={initialError} />;
}
