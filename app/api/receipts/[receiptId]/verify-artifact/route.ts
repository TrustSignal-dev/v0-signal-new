import { NextResponse } from "next/server";
import { requireAuthenticatedSession } from "@/lib/auth/require-user";
import { MAX_ARTIFACT_BYTES } from "@/lib/artifact-verification";
import { getTrustSignalApiUrl } from "@/lib/trustsignal-api";

const FORWARDED_ERROR_CODES_BY_STATUS: Partial<Record<number, ReadonlySet<string>>> = {
  400: new Set(["invalid_artifact_verification_payload", "invalid_receipt_id"]),
  401: new Set(["unauthorized"]),
  404: new Set(["receipt_not_found"]),
  503: new Set(["artifact_verification_unavailable", "identity_provider_unavailable"]),
};

const ERROR_FALLBACK_BY_STATUS: Record<number, string> = {
  400: "Invalid artifact verification request",
  401: "Not authenticated",
  404: "Receipt not found",
  413: "Artifact exceeds the verification limit",
  429: "Artifact verification rate limit exceeded",
  503: "Artifact verification service is unavailable",
};

export async function POST(
  request: Request,
  context: { params: Promise<{ receiptId: string }> },
) {
  const auth = await requireAuthenticatedSession();
  if (!auth.ok) return auth.response;

  const { receiptId } = await context.params;
  if (!receiptId) {
    return NextResponse.json({ error: "Missing receiptId" }, { status: 400 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  }

  const artifact = form.get("artifact");
  if (!(artifact instanceof File) || artifact.size === 0) {
    return NextResponse.json({ error: "An artifact file is required" }, { status: 400 });
  }
  if (artifact.size > MAX_ARTIFACT_BYTES) {
    return NextResponse.json({ error: "Artifact exceeds the 15 MiB limit" }, { status: 413 });
  }

  let response: Response;
  try {
    const artifactBase64 = Buffer.from(await artifact.arrayBuffer()).toString("base64");
    response = await fetch(
      `${getTrustSignalApiUrl()}/api/v1/user/receipts/${encodeURIComponent(receiptId)}/verify-artifact`,
      {
        method: "POST",
        cache: "no-store",
        headers: {
          accept: "application/json",
          authorization: `Bearer ${auth.context.accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ artifactBase64 }),
        signal: AbortSignal.timeout(35_000),
      },
    );
  } catch {
    return NextResponse.json(
      { error: "Artifact verification service is unavailable" },
      { status: 503 },
    );
  }

  const parsedData: unknown = await response.json().catch(() => ({}));
  const data: Record<string, unknown> = parsedData !== null
    && typeof parsedData === "object"
    && !Array.isArray(parsedData)
    ? parsedData as Record<string, unknown>
    : {};
  if (!response.ok) {
    const status = ERROR_FALLBACK_BY_STATUS[response.status] ? response.status : 502;
    if (status === 502) {
      return NextResponse.json({ error: "Artifact verification failed" }, { status });
    }

    const upstreamError = typeof data.error === "string" ? data.error : undefined;
    const error = upstreamError && FORWARDED_ERROR_CODES_BY_STATUS[status]?.has(upstreamError)
      ? upstreamError
      : ERROR_FALLBACK_BY_STATUS[status];
    return NextResponse.json({ error }, { status });
  }

  return NextResponse.json(data, { status: 200 });
}
