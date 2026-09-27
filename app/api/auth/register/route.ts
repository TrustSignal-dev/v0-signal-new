import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authFailure } from "@/lib/auth/feedback";
import { resolveTrustedAppOrigin } from "@/lib/auth/origin";
import { sanitizeNextPath } from "@/lib/auth/redirect";
import { createSupabaseRouteClient } from "@/lib/supabase/route";

const registrationSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(12).max(1024),
  displayName: z.string().trim().max(100).optional(),
  next: z.string().max(2048).optional(),
});
const headers = { "cache-control": "private, no-store" };

export async function POST(req: NextRequest) {
  const input = registrationSchema.safeParse(await req.json().catch(() => null));
  if (!input.success) {
    return NextResponse.json(
      { error: "Enter a valid email and a password of at least 12 characters." },
      { status: 400, headers },
    );
  }
  try {
    const { email, password, displayName, next } = input.data;
    const origin = resolveTrustedAppOrigin(req.url);
    const destination = sanitizeNextPath(next);
    const { supabase, applyAuthCookies } = createSupabaseRouteClient(req);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: displayName },
        emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(destination)}`,
      },
    });
    if (error) {
      const failure = authFailure(error, true);
      return applyAuthCookies(NextResponse.json({ error: failure.error }, { status: failure.status, headers }));
    }
    return applyAuthCookies(NextResponse.json(
      { ok: true, requiresEmailVerification: !data.session },
      { status: 201, headers },
    ));
  } catch {
    return NextResponse.json(
      { error: "Sign-in service is temporarily unavailable. Please try again shortly." },
      { status: 503, headers },
    );
  }
}
