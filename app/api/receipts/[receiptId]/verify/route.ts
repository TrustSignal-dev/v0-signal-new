import { NextResponse } from "next/server";
import { requireAuthenticatedContext } from "@/lib/auth/require-user";
import {
  getTrustSignalApiUrl,
  getTrustSignalDashboardApiKey,
} from "@/lib/trustsignal-api";

export async function POST(
  _request: Request,
  context: { params: Promise<{ receiptId: string }> },
) {
  const auth = await requireAuthenticatedContext();
  if (!auth.ok) {
    return auth.response;
  }

  const { receiptId } = await context.params;
  if (!receiptId) {
    return NextResponse.json({ error: "Missing receiptId" }, { status: 400 });
  }

  const apiKey = getTrustSignalDashboardApiKey();
  if (!apiKey) {
    return NextResponse.json(
      {
        error: "Receipt verification is not configured for this environment.",
        code: "dashboard_api_key_unavailable",
      },
      { status: 503 },
    );
  }

  const response = await fetch(
    `${getTrustSignalApiUrl()}/api/v1/receipt/${encodeURIComponent(receiptId)}/verify`,
    {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
      },
    },
  );

  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;

  if (!response.ok) {
    const message =
      (typeof data.error === "string" && data.error) ||
      (typeof data.message === "string" && data.message) ||
      "Receipt verification failed";

    return NextResponse.json({ error: message, details: data }, { status: response.status });
  }

  return NextResponse.json(data, { status: 200 });
}
