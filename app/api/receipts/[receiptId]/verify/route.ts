import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedContext } from "@/lib/auth/require-user";

type VerifyReceiptRequest = {
  artifactHash?: string;
  artifactReference?: string;
  apiKey?: string;
};

const API = process.env.TRUSTSIGNAL_API_URL ?? "https://api.trustsignal.dev";

export async function POST(
  req: NextRequest,
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

  const body = (await req.json()) as VerifyReceiptRequest;
  const artifactHash = body.artifactHash?.trim();
  const artifactReference = body.artifactReference?.trim();
  const apiKey = body.apiKey?.trim() || process.env.TRUSTSIGNAL_DASHBOARD_API_KEY;

  if (!artifactHash) {
    return NextResponse.json({ error: "artifactHash is required" }, { status: 400 });
  }

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "No API key available. Provide apiKey in request body or set TRUSTSIGNAL_DASHBOARD_API_KEY.",
      },
      { status: 400 },
    );
  }

  const response = await fetch(
    `${API}/api/v1/receipt/${encodeURIComponent(receiptId)}/verify`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        artifact_hash: artifactHash,
        ...(artifactReference ? { artifact_reference: artifactReference } : {}),
      }),
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
