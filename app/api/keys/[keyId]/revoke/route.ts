import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedSession } from "@/lib/auth/require-user";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getTrustSignalApiUrl } from "@/lib/trustsignal-api";

type Params = {
  params: Promise<{
    keyId: string;
  }>;
};

export async function POST(req: NextRequest, { params }: Params) {
  const auth = await requireAuthenticatedSession();
  if (!auth.ok) {
    return auth.response;
  }

  const limit = enforceRateLimit({
    key: `keys:revoke:${auth.context.user.id}`,
    max: 20,
    windowMs: 60_000,
  });

  if (!limit.ok) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const { keyId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(keyId)) {
    return NextResponse.json(
      { error: "Invalid API key ID" },
      { status: 400 },
    );
  }

  let response: Response;
  try {
    response = await fetch(
      `${getTrustSignalApiUrl()}/api/v1/user/api-keys/${encodeURIComponent(keyId)}`,
      {
        method: "DELETE",
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
      { error: "API key service is unavailable" },
      { status: 503 },
    );
  }

  if (!response.ok) {
    const status = [400, 401, 403, 404, 429, 503].includes(response.status)
      ? response.status
      : 502;
    return NextResponse.json({ error: "Could not revoke API key" }, { status });
  }

  return new NextResponse(null, { status: 204 });
}
