import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { verifyAdminSessionValue, adminCookieName } from "@/lib/admin-auth";
import { revokeAdminApiKey } from "@/lib/admin-data";

export async function POST(
  _request: Request,
  context: { params: Promise<{ keyId: string }> }
) {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(adminCookieName)?.value;
  if (!verifyAdminSessionValue(sessionValue)) {
    return NextResponse.json({ error: "admin_session_required" }, { status: 401 });
  }

  const { keyId } = await context.params;
  await revokeAdminApiKey(keyId);
  return NextResponse.json({ ok: true });
}
