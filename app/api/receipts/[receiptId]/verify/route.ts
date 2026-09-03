import { NextResponse } from "next/server";
import { requireAuthenticatedSession } from "@/lib/auth/require-user";
import { getTrustSignalApiUrl } from "@/lib/trustsignal-api";

export async function POST(
  _request: Request,
  context: { params: Promise<{ receiptId: string }> },
) {
  const auth = await requireAuthenticatedSession();
  if (!auth.ok) {
    return auth.response;
  }

  const { receiptId } = await context.params;
  if (!receiptId) {
    return NextResponse.json({ error: "Missing receiptId" }, { status: 400 });
  }

  let response: Response;
  try {
    response = await fetch(
      `${getTrustSignalApiUrl()}/api/v1/user/receipts/${encodeURIComponent(receiptId)}/verify`,
      {
        method: "POST",
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
      { error: "Receipt verification service is unavailable" },
      { status: 503 },
    );
  }

  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;

  if (!response.ok) {
    const message =
      (typeof data.error === "string" && data.error) ||
      (typeof data.message === "string" && data.message) ||
      "Receipt verification failed";

    const status = [400, 401, 404, 429, 503].includes(response.status)
      ? response.status
      : 502;
    return NextResponse.json({ error: message }, { status });
  }

  return NextResponse.json(data, { status: 200 });
}
