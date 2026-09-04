import { NextResponse } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  MAX_ARTIFACT_BASE64_LENGTH,
  MAX_ARTIFACT_BYTES,
  encodedBase64Length,
} from "@/lib/artifact-verification";

const { getTrustSignalApiUrlMock, requireAuthenticatedSessionMock } = vi.hoisted(() => ({
  getTrustSignalApiUrlMock: vi.fn(),
  requireAuthenticatedSessionMock: vi.fn(),
}));

vi.mock("@/lib/auth/require-user", () => ({
  requireAuthenticatedSession: requireAuthenticatedSessionMock,
}));

vi.mock("@/lib/trustsignal-api", () => ({
  getTrustSignalApiUrl: getTrustSignalApiUrlMock,
}));

import { POST } from "./route";

const RECEIPT_ID = "11111111-1111-4111-8111-111111111111";
const CONTEXT = { params: Promise.resolve({ receiptId: RECEIPT_ID }) };

function requestWithArtifact(size: number) {
  const form = new FormData();
  form.set(
    "artifact",
    new File([new Uint8Array(size)], "candidate.pdf", { type: "application/pdf" }),
  );

  return {
    formData: vi.fn().mockResolvedValue(form),
  } as unknown as Request;
}

describe("POST /api/receipts/:receiptId/verify-artifact", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
    getTrustSignalApiUrlMock.mockReturnValue("https://api.example.test");
    requireAuthenticatedSessionMock.mockResolvedValue({
      ok: true,
      context: {
        accessToken: "session-access-token",
        user: { id: "user-1" },
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("derives the exact raw-byte ceiling from the API base64-text ceiling", () => {
    expect(MAX_ARTIFACT_BYTES).toBe(15 * 1024 * 1024);
    expect(encodedBase64Length(MAX_ARTIFACT_BYTES)).toBe(
      MAX_ARTIFACT_BASE64_LENGTH,
    );
    expect(encodedBase64Length(MAX_ARTIFACT_BYTES + 1)).toBe(
      MAX_ARTIFACT_BASE64_LENGTH + 4,
    );
  });

  it.each([
    ["just below", MAX_ARTIFACT_BYTES - 1],
    ["at", MAX_ARTIFACT_BYTES],
  ])("forwards an artifact %s the raw-byte ceiling", async (_label, size) => {
    vi.mocked(fetch).mockResolvedValueOnce(
      Response.json({ artifactMatch: { status: "MATCH", matched: true } }),
    );

    const response = await POST(requestWithArtifact(size), CONTEXT);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      artifactMatch: { status: "MATCH", matched: true },
    });
    expect(fetch).toHaveBeenCalledTimes(1);

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe(
      `https://api.example.test/api/v1/user/receipts/${RECEIPT_ID}/verify-artifact`,
    );
    expect(init).toMatchObject({
      method: "POST",
      cache: "no-store",
      headers: {
        accept: "application/json",
        authorization: "Bearer session-access-token",
        "content-type": "application/json",
      },
    });
    expect((init?.headers as Record<string, string>)["x-api-key"]).toBeUndefined();

    const payload = JSON.parse(String(init?.body)) as { artifactBase64: string };
    expect(payload.artifactBase64).toHaveLength(encodedBase64Length(size));
    expect(Buffer.from(payload.artifactBase64, "base64")).toHaveLength(size);
  });

  it("rejects an artifact one byte above the raw-byte ceiling before provider egress", async () => {
    const response = await POST(requestWithArtifact(MAX_ARTIFACT_BYTES + 1), CONTEXT);

    expect(response.status).toBe(413);
    expect(await response.json()).toEqual({
      error: "Artifact exceeds the 15 MiB limit",
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("fails closed on authentication before parsing or forwarding the upload", async () => {
    const formData = vi.fn();
    requireAuthenticatedSessionMock.mockResolvedValueOnce({
      ok: false,
      response: NextResponse.json({ error: "Not authenticated" }, { status: 401 }),
    });

    const response = await POST({ formData } as unknown as Request, CONTEXT);

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Not authenticated" });
    expect(formData).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("preserves a documented upstream error code and status", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      Response.json({ error: "receipt_not_found" }, { status: 404 }),
    );

    const response = await POST(requestWithArtifact(1), CONTEXT);

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "receipt_not_found" });
  });

  it("maps unexpected upstream failures to a stable error without exposing details", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      Response.json({ error: "raw internal upstream detail" }, { status: 500 }),
    );

    const response = await POST(requestWithArtifact(1), CONTEXT);

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: "Artifact verification failed" });
  });

  it("maps a malformed allowed-status response to its stable fallback", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(Response.json(null, { status: 429 }));

    const response = await POST(requestWithArtifact(1), CONTEXT);

    expect(response.status).toBe(429);
    expect(await response.json()).toEqual({
      error: "Artifact verification rate limit exceeded",
    });
  });

  it("maps network failures to a stable unavailable response", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("network details must not escape"));

    const response = await POST(requestWithArtifact(1), CONTEXT);

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: "Artifact verification service is unavailable",
    });
  });
});
