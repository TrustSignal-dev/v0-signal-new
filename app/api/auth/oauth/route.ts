import { NextRequest, NextResponse } from "next/server";
import type { Provider } from "@supabase/supabase-js";
import { sanitizeNextPath } from "@/lib/auth/redirect";
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

  const nextPath = sanitizeNextPath(next);
  const redirectTo = new URL("/auth/callback", req.nextUrl.origin);
  redirectTo.searchParams.set("next", nextPath);

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
