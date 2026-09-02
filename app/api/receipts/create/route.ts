import { NextResponse } from "next/server";
import { requireAuthenticatedContext } from "@/lib/auth/require-user";

export async function POST() {
  const auth = await requireAuthenticatedContext();
  if (!auth.ok) {
    return auth.response;
  }

  return NextResponse.json(
    {
      error: "Dashboard receipt creation is not available for generic documents yet.",
      code: "generic_receipt_contract_unavailable",
    },
    { status: 501 },
  );
}
