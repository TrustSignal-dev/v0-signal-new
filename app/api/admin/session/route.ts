import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  adminCookieName,
  createAdminSessionValue,
  validateAdminPassword,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { password?: string } | null;
  const password = body?.password ?? "";

  if (!validateAdminPassword(password)) {
    return NextResponse.json({ error: "invalid_admin_password" }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(adminCookieName, createAdminSessionValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(adminCookieName);
  return NextResponse.json({ ok: true });
}
