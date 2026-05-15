import { NextRequest, NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/rate-limit";

const API_BASE = "https://api.trustsignal.dev";

// ⚠️  API endpoint paths below are assumed from context.
//     Confirm against the real OpenAPI spec before production use:
//       POST /api/v1/documents  — document ingest
//       POST /api/v1/receipts   — anchor / create receipt
//       POST /api/v1/verify     — verify a document against a receipt
const ENDPOINT_MAP = {
  ingest: "/api/v1/documents",
  anchor: "/api/v1/receipts",
  verify: "/api/v1/verify",
} as const;

type Action = keyof typeof ENDPOINT_MAP;

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = enforceRateLimit({ key: `demo-proxy:${ip}`, max: 30, windowMs: 60_000 });

  if (!rl.ok) {
    const retryAfter = Math.ceil((rl.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfter) },
      },
    );
  }

  const demoApiKey = process.env.DEMO_API_KEY;
  if (!demoApiKey) {
    return NextResponse.json({ error: "demo key not configured" }, { status: 500 });
  }

  let body: { action?: unknown; payload?: unknown };
  try {
    body = (await req.json()) as { action?: unknown; payload?: unknown };
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const { action, payload } = body;

  if (typeof action !== "string" || !(action in ENDPOINT_MAP)) {
    return NextResponse.json(
      { error: `invalid action. must be one of: ${Object.keys(ENDPOINT_MAP).join(", ")}` },
      { status: 400 },
    );
  }

  const endpoint = ENDPOINT_MAP[action as Action];

  let upstream: Response;
  try {
    upstream = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": demoApiKey,
      },
      body: JSON.stringify(payload ?? {}),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "upstream request failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const data = (await upstream.json().catch(() => ({}))) as Record<string, unknown>;
  return NextResponse.json(data, { status: upstream.status });
}
