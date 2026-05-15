import { NextRequest, NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/rate-limit";

const API_BASE = "https://api.trustsignal.dev";

// API paths confirmed against openapi.yaml (TrustSignal/openapi.yaml):
//
//   "anchor" → POST /api/v1/verify
//     Creates a verification receipt. Accepts VerificationRequest JSON.
//     Returns VerificationResponse including receiptId.
//
//   "verify" → POST /api/v1/receipt/{receiptId}/verify
//     Re-verifies a stored receipt. No request body.
//     Returns VerificationStatus { verified, integrityVerified, … }.
//
//   "ingest" → no real API endpoint (the API anchors in one shot via /api/v1/verify).
//     The proxy returns a synthetic response so the demo UI can show the payload preview step.

const VALID_ACTIONS = ["ingest", "anchor", "verify"] as const;
type Action = (typeof VALID_ACTIONS)[number];

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

  if (typeof action !== "string" || !(VALID_ACTIONS as readonly string[]).includes(action)) {
    return NextResponse.json(
      { error: `invalid action. must be one of: ${VALID_ACTIONS.join(", ")}` },
      { status: 400 },
    );
  }

  // "ingest" has no upstream endpoint — the API issues receipts in one shot via /api/v1/verify.
  // Return a synthetic acknowledgement so the demo can show the payload-preview step.
  if (action === "ingest") {
    const p = (payload ?? {}) as Record<string, unknown>;
    return NextResponse.json({
      status: "prepared",
      doc_hash: typeof p.doc_hash === "string" ? p.doc_hash : null,
      transaction_type: typeof p.transaction_type === "string" ? p.transaction_type : null,
      bundle_id: typeof p.bundle_id === "string" ? p.bundle_id : null,
      message: "Payload prepared. Ready to anchor.",
    });
  }

  // "anchor" → POST /api/v1/verify (VerificationRequest → VerificationResponse)
  if (action === "anchor") {
    let upstream: Response;
    try {
      upstream = await fetch(`${API_BASE}/api/v1/verify`, {
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

  // "verify" → POST /api/v1/receipt/{receiptId}/verify (no body)
  // Expects payload to include receipt_id.
  const p = (payload ?? {}) as Record<string, unknown>;
  const receiptId = typeof p.receipt_id === "string" ? p.receipt_id.trim() : null;

  if (!receiptId) {
    return NextResponse.json({ error: "payload.receipt_id is required for action verify" }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(
      `${API_BASE}/api/v1/receipt/${encodeURIComponent(receiptId)}/verify`,
      {
        method: "POST",
        headers: { "x-api-key": demoApiKey },
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "upstream request failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const data = (await upstream.json().catch(() => ({}))) as Record<string, unknown>;
  return NextResponse.json(data, { status: upstream.status });
}
