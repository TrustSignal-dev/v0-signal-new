import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { verifyAdminSessionValue, adminCookieName } from "@/lib/admin-auth";
import { fetchReceiptById } from "@/lib/admin-data";

export async function GET(
  _request: Request,
  context: { params: Promise<{ receiptId: string }> }
) {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(adminCookieName)?.value;
  if (!verifyAdminSessionValue(sessionValue)) {
    return NextResponse.json({ error: "admin_session_required" }, { status: 401 });
  }

  const { receiptId } = await context.params;
  const receipt = await fetchReceiptById(receiptId);
  if (!receipt) {
    return NextResponse.json({ error: "receipt_not_found" }, { status: 404 });
  }

  return NextResponse.json(receipt);
}
