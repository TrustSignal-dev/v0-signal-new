import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authFailure } from "@/lib/auth/feedback";
import { createSupabaseRouteClient } from "@/lib/supabase/route";

const credentialsSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(1024),
});
const headers = { "cache-control": "private, no-store" };

export async function POST(req: NextRequest) {
  const input = credentialsSchema.safeParse(await req.json().catch(() => null));
  if (!input.success) {
    return NextResponse.json({ error: "A valid email and password are required." }, { status: 400, headers });
  }
  try {
    const { supabase, applyAuthCookies } = createSupabaseRouteClient(req);
    const { data, error } = await supabase.auth.signInWithPassword(input.data);
    if (error || !data.user || !data.session) {
      const failure = authFailure(error ?? {});
      return applyAuthCookies(NextResponse.json({ error: failure.error }, { status: failure.status, headers }));
    }
    return applyAuthCookies(NextResponse.json({
      ok: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        displayName: data.user.user_metadata?.full_name ?? data.user.user_metadata?.name ?? null,
      },
    }, { headers }));
  } catch {
    return NextResponse.json(
      { error: "Sign-in service is temporarily unavailable. Please try again shortly." },
      { status: 503, headers },
    );
  }
}
