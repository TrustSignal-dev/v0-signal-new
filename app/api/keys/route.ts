import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedSession } from "@/lib/auth/require-user";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getTrustSignalApiUrl } from "@/lib/trustsignal-api";

type CoreApiKeyRecord = {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
};

function normalizeApiKey(row: CoreApiKeyRecord) {
  return {
    id: row.id,
    name: row.name,
    key_prefix: row.prefix,
    scopes: row.scopes,
    created_at: row.createdAt,
    last_used_at: row.lastUsedAt,
    revoked_at: row.revokedAt,
  };
}

async function requestApi(
  path: string,
  accessToken: string,
  init: RequestInit = {},
) {
  return fetch(`${getTrustSignalApiUrl()}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      accept: "application/json",
      authorization: `Bearer ${accessToken}`,
      ...init.headers,
    },
    signal: AbortSignal.timeout(5_000),
  });
}

function safeUpstreamStatus(status: number) {
  return [400, 401, 403, 429, 503].includes(status) ? status : 502;
}

export async function GET() {
  const auth = await requireAuthenticatedSession();
  if (!auth.ok) {
    return auth.response;
  }

  let response: Response;
  try {
    response = await requestApi(
      "/api/v1/user/api-keys",
      auth.context.accessToken,
    );
  } catch {
    return NextResponse.json(
      { error: "API key service is unavailable" },
      { status: 503 },
    );
  }

  if (!response.ok) {
    return NextResponse.json(
      { error: "Unable to load API keys" },
      { status: safeUpstreamStatus(response.status) },
    );
  }

  const payload = (await response.json().catch(() => null)) as {
    keys?: CoreApiKeyRecord[];
  } | null;
  if (!payload || !Array.isArray(payload.keys)) {
    return NextResponse.json(
      { error: "API key service returned an invalid response" },
      { status: 502 },
    );
  }

  return NextResponse.json({ keys: payload.keys.map(normalizeApiKey) });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuthenticatedSession();
  if (!auth.ok) {
    return auth.response;
  }

  const limit = enforceRateLimit({
    key: `keys:create:${auth.context.user.id}`,
    max: 10,
    windowMs: 60_000,
  });

  if (!limit.ok) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const body = (await req.json()) as { name?: string; scopes?: string[] };
  const name = body.name?.trim();

  if (!name || name.length < 3 || name.length > 64) {
    return NextResponse.json({ error: "Name must be 3-64 characters" }, { status: 400 });
  }

  let response: Response;
  try {
    response = await requestApi(
      "/api/v1/user/api-keys",
      auth.context.accessToken,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, scopes: ["read", "verify"] }),
      },
    );
  } catch {
    return NextResponse.json(
      { error: "API key service is unavailable" },
      { status: 503 },
    );
  }

  if (!response.ok) {
    return NextResponse.json(
      { error: "Could not create API key" },
      { status: safeUpstreamStatus(response.status) },
    );
  }

  const payload = (await response.json().catch(() => null)) as {
    key?: string;
    record?: CoreApiKeyRecord;
  } | null;
  if (!payload?.key || !payload.record) {
    return NextResponse.json(
      { error: "API key service returned an invalid response" },
      { status: 502 },
    );
  }

  return NextResponse.json(
    {
      key: {
        ...normalizeApiKey(payload.record),
        plaintext: payload.key,
      },
    },
    { status: 201 },
  );
}
