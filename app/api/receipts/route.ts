import { NextResponse } from "next/server";
import { requireAuthenticatedSession } from "@/lib/auth/require-user";
import { getTrustSignalApiUrl } from "@/lib/trustsignal-api";

type CoreReceiptRecord = {
  receiptId: string;
  status: "clean" | "failure" | "revoked" | "compliance_gap";
  riskScore: number;
  createdAt: string;
  anchorStatus: string;
  revoked: boolean;
};

export async function GET() {
  const auth = await requireAuthenticatedSession();
  if (!auth.ok) {
    return auth.response;
  }

  let response: Response;
  try {
    response = await fetch(
      `${getTrustSignalApiUrl()}/api/v1/user/receipts?limit=50`,
      {
        cache: "no-store",
        headers: {
          accept: "application/json",
          authorization: `Bearer ${auth.context.accessToken}`,
        },
        signal: AbortSignal.timeout(5_000),
      },
    );
  } catch {
    return NextResponse.json(
      { error: "Receipt service is unavailable" },
      { status: 503 },
    );
  }

  if (!response.ok) {
    const status = [401, 403, 429, 503].includes(response.status)
      ? response.status
      : 502;
    return NextResponse.json({ error: "Unable to load receipts" }, { status });
  }

  const payload = (await response.json().catch(() => null)) as {
    receipts?: CoreReceiptRecord[];
  } | null;
  if (!payload || !Array.isArray(payload.receipts)) {
    return NextResponse.json(
      { error: "Receipt service returned an invalid response" },
      { status: 502 },
    );
  }

  return NextResponse.json({ receipts: payload.receipts });
}
