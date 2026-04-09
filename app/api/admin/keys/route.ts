import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { verifyAdminSessionValue, adminCookieName } from "@/lib/admin-auth";
import { createAdminApiKey, listAdminApiKeys } from "@/lib/admin-data";

async function assertAdminSession() {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(adminCookieName)?.value;
  if (!verifyAdminSessionValue(sessionValue)) {
    return NextResponse.json({ error: "admin_session_required" }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const unauthorized = await assertAdminSession();
  if (unauthorized) return unauthorized;

  const keys = await listAdminApiKeys();
  return NextResponse.json({ keys });
}

export async function POST(request: Request) {
  const unauthorized = await assertAdminSession();
  if (unauthorized) return unauthorized;

  const body = (await request.json().catch(() => null)) as {
    name?: string;
    scopes?: string[];
  } | null;

  const name = body?.name?.trim();
  const scopes = Array.isArray(body?.scopes)
    ? body!.scopes.map((scope) => String(scope).trim()).filter(Boolean)
    : [];

  if (!name) {
    return NextResponse.json({ error: "name_required" }, { status: 400 });
  }

  const created = await createAdminApiKey({
    name,
    scopes: scopes.length > 0 ? scopes : ["verify", "read", "anchor", "revoke"],
  });

  return NextResponse.json(created);
}
