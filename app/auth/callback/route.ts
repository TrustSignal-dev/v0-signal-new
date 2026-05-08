import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get("code");
  const nextPath = requestUrl.searchParams.get("next") ?? "/dashboard";

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    return NextResponse.redirect(new URL("/sign-in?error=server_config", requestUrl.origin));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/sign-in?error=missing_code", appUrl));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/sign-in?error=oauth_failed", appUrl));
  }

  const safeTarget = nextPath.startsWith("/") ? nextPath : "/dashboard";
  return NextResponse.redirect(new URL(safeTarget, appUrl));
}
