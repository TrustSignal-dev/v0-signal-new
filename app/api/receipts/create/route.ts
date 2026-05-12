import { NextResponse } from "next/server";
import { requireAuthenticatedContext } from "@/lib/auth/require-user";

const API_BASE_URL = process.env.TRUSTSIGNAL_API_BASE_URL;
const DASHBOARD_API_KEY = process.env.TRUSTSIGNAL_DASHBOARD_API_KEY;

export async function POST(request: Request) {
  const auth = await requireAuthenticatedContext();
  if (!auth.ok) {
    return auth.response;
  }

  if (!API_BASE_URL) {
    return NextResponse.json(
      { error: "TRUSTSIGNAL_API_BASE_URL is not configured" },
      { status: 500 },
    );
  }

  if (!DASHBOARD_API_KEY) {
    return NextResponse.json(
      { error: "TRUSTSIGNAL_DASHBOARD_API_KEY is not configured" },
      { status: 500 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  const outbound = new FormData();
  outbound.set("file", file, file.name || "document.bin");

  const response = await fetch(`${API_BASE_URL.replace(/\/$/, "")}/api/v1/receipts`, {
    method: "POST",
    headers: {
      "x-api-key": DASHBOARD_API_KEY,
    },
    body: outbound,
  });

  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;

  if (!response.ok) {
    const message =
      (typeof payload.error === "string" && payload.error) ||
      (typeof payload.message === "string" && payload.message) ||
      "Receipt creation failed";

    return NextResponse.json(
      {
        error: message,
        details: payload,
      },
      { status: response.status },
    );
  }

  return NextResponse.json(payload, { status: 200 });
}
