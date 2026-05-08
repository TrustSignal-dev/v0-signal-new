import { NextRequest, NextResponse } from "next/server";
import type { Provider } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const ALLOWED_PROVIDERS = new Set<Provider>(["google", "github"]);

export async function POST(req: NextRequest) {
  const { provider, next } = (await req.json()) as {
    provider?: string;
    next?: string;
  };

  if (!provider || !ALLOWED_PROVIDERS.has(provider as Provider)) {
    return NextResponse.json({ error: "Unsupported OAuth provider" }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    return NextResponse.json({ error: "NEXT_PUBLIC_APP_URL is not set" }, { status: 500 });
  }

  const redirectTo = new URL("/auth/callback", appUrl);
  if (next) {
    redirectTo.searchParams.set("next", next);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider as Provider,
    options: {
      redirectTo: redirectTo.toString(),
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error || !data.url) {
    return NextResponse.json({ error: error?.message ?? "OAuth start failed" }, { status: 400 });
  }

  return NextResponse.json({ url: data.url });
}
