import { NextResponse } from "next/server";
import { requireAuthenticatedSession } from "@/lib/auth/require-user";
import { getTrustSignalApiUrl } from "@/lib/trustsignal-api";

const MAX_ARTIFACT_BYTES = 20 * 1024 * 1024;

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
    return NextResponse.json({ error: "Artifact exceeds the 20 MB limit" }, { status: 413 });
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

  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    const message = typeof data.error === "string" ? data.error : "Artifact verification failed";
    const status = [400, 401, 404, 413, 429, 503].includes(response.status)
      ? response.status
      : 502;
    return NextResponse.json({ error: message }, { status });
  }

  return NextResponse.json(data, { status: 200 });
}
