import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  getTrustSignalApiUrl,
} from "./trustsignal-api";

const originalApiUrl = process.env.TRUSTSIGNAL_API_URL;
const originalLegacyApiUrl = process.env.TRUSTSIGNAL_API_BASE_URL;

afterEach(() => {
  if (originalApiUrl === undefined) delete process.env.TRUSTSIGNAL_API_URL;
  else process.env.TRUSTSIGNAL_API_URL = originalApiUrl;

  if (originalLegacyApiUrl === undefined) delete process.env.TRUSTSIGNAL_API_BASE_URL;
  else process.env.TRUSTSIGNAL_API_BASE_URL = originalLegacyApiUrl;

  vi.unstubAllEnvs();

});

describe("TrustSignal API server configuration", () => {
  it("prefers the canonical server-only URL and removes a trailing slash", () => {
    process.env.TRUSTSIGNAL_API_URL = "https://staging-api.example.test/";
    process.env.TRUSTSIGNAL_API_BASE_URL = "https://legacy.example.test";

    expect(getTrustSignalApiUrl()).toBe("https://staging-api.example.test");
  });

  it("supports the legacy URL during environment migration", () => {
    delete process.env.TRUSTSIGNAL_API_URL;
    process.env.TRUSTSIGNAL_API_BASE_URL = "https://legacy.example.test/";

    expect(getTrustSignalApiUrl()).toBe("https://legacy.example.test");
  });

  it("fails closed in production instead of silently targeting the live API", () => {
    delete process.env.TRUSTSIGNAL_API_URL;
    delete process.env.TRUSTSIGNAL_API_BASE_URL;
    vi.stubEnv("NODE_ENV", "production");

    expect(() => getTrustSignalApiUrl()).toThrow("TRUSTSIGNAL_API_URL is required");
  });

  it("uses the signed-in bearer identity for receipt verification", () => {
    const route = readFileSync(
      join(process.cwd(), "app/api/receipts/[receiptId]/verify/route.ts"),
      "utf8",
    );

    expect(route.includes("body.apiKey")).toBe(false);
    expect(route.includes("body: JSON.stringify")).toBe(false);
    expect(route.includes("requireAuthenticatedSession()")).toBe(true);
    expect(route.includes("authorization: `Bearer ${auth.context.accessToken}`")).toBe(true);
    expect(route.includes("/api/v1/user/receipts/")).toBe(true);
    expect(route.includes("getTrustSignalDashboardApiKey()")).toBe(false);
    expect(route.includes("x-api-key")).toBe(false);
  });

  it("lists persistent receipts through the signed-in user endpoint", () => {
    const route = readFileSync(
      join(process.cwd(), "app/api/receipts/route.ts"),
      "utf8",
    );

    expect(route.includes("requireAuthenticatedSession()")).toBe(true);
    expect(route.includes("authorization: `Bearer ${auth.context.accessToken}`")).toBe(true);
    expect(route.includes("/api/v1/user/receipts?limit=50")).toBe(true);
    expect(route.includes("x-api-key")).toBe(false);
  });

  it("uses the signed-in user endpoint for later artifact verification", () => {
    const route = readFileSync(
      join(process.cwd(), "app/api/receipts/[receiptId]/verify-artifact/route.ts"),
      "utf8",
    );

    expect(route.includes("requireAuthenticatedSession()")).toBe(true);
    expect(route.includes("authorization: `Bearer ${auth.context.accessToken}`")).toBe(true);
    expect(route.includes("/api/v1/user/receipts/")).toBe(true);
    expect(route.includes("/verify-artifact")).toBe(true);
    expect(route.includes("x-api-key")).toBe(false);
  });

  it("does not hardcode the production API in the demo proxy", () => {
    const route = readFileSync(
      join(process.cwd(), "app/api/demo-proxy/route.ts"),
      "utf8",
    );

    expect(route.includes('const API_BASE = "https://api.trustsignal.dev"')).toBe(false);
    expect(route.includes("getTrustSignalApiUrl()")).toBe(true);
  });

  it("does not upload generic documents to a nonexistent upstream route", () => {
    const route = readFileSync(
      join(process.cwd(), "app/api/receipts/create/route.ts"),
      "utf8",
    );

    expect(route.includes("/api/v1/receipts")).toBe(false);
    expect(route.includes("generic_receipt_contract_unavailable")).toBe(true);
  });
});
