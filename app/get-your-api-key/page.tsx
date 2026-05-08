import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createPageMetadata } from "@/lib/seo";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ApiKeyGenerator } from "@/components/api-key-generator";

export const metadata: Metadata = createPageMetadata({
  title: "Get API Access",
  description:
    "Generate an Ed25519 key pair and register your TrustSignal machine client to start making API calls.",
  path: "/get-your-api-key",
  keywords: ["TrustSignal API access", "machine clients", "short-lived access tokens"],
});

export default async function GetYourApiKeyPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const displayName =
    user.user_metadata?.full_name ?? user.user_metadata?.name ?? undefined;

  return <ApiKeyGenerator email={user.email ?? ""} displayName={displayName} />;
}
