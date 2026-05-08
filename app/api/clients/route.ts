import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const API = process.env.TRUSTSIGNAL_API_URL ?? "https://api.trustsignal.dev";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = (await req.json()) as { name?: string; jwks?: unknown };

  const res = await fetch(`${API}/api/v1/clients`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clientType: "machine",
      userEmail: user.email,
      name: body.name,
      jwks: body.jwks,
    }),
  });

  const data = await res.json() as Record<string, unknown>;

  if (!res.ok) {
    const msg = typeof data.error === "string" ? data.error : "Client registration failed";
    return NextResponse.json({ error: msg }, { status: res.status });
  }

  return NextResponse.json(data, { status: 201 });
}
