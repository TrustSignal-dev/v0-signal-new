import { afterEach, describe, expect, it } from "vitest";
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

  it("does not upload generic documents to a nonexistent upstream route", () => {
    const route = readFileSync(
      join(process.cwd(), "app/api/receipts/create/route.ts"),
      "utf8",
    );

    expect(route.includes("/api/v1/receipts")).toBe(false);
    expect(route.includes("generic_receipt_contract_unavailable")).toBe(true);
  });
});
