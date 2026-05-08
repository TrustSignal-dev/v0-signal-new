import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { email, password, displayName } = (await req.json()) as {
    email?: string;
    password?: string;
    displayName?: string;
  };

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: displayName,
      },
    },
  });

  if (error) {
    return NextResponse.json(
      { error: error.message ?? "Registration failed" },
      { status: 400 },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      requiresEmailVerification: data.user ? !data.session : true,
    },
    { status: 201 },
  );
}
