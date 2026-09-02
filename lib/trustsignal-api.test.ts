import { afterEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  getTrustSignalApiUrl,
  getTrustSignalDashboardApiKey,
} from "./trustsignal-api";

const originalApiUrl = process.env.TRUSTSIGNAL_API_URL;
const originalLegacyApiUrl = process.env.TRUSTSIGNAL_API_BASE_URL;
const originalDashboardKey = process.env.TRUSTSIGNAL_DASHBOARD_API_KEY;

afterEach(() => {
  if (originalApiUrl === undefined) delete process.env.TRUSTSIGNAL_API_URL;
  else process.env.TRUSTSIGNAL_API_URL = originalApiUrl;

  if (originalLegacyApiUrl === undefined) delete process.env.TRUSTSIGNAL_API_BASE_URL;
  else process.env.TRUSTSIGNAL_API_BASE_URL = originalLegacyApiUrl;

  if (originalDashboardKey === undefined) delete process.env.TRUSTSIGNAL_DASHBOARD_API_KEY;
  else process.env.TRUSTSIGNAL_DASHBOARD_API_KEY = originalDashboardKey;
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

  it("fails closed when the dashboard credential is absent", () => {
    delete process.env.TRUSTSIGNAL_DASHBOARD_API_KEY;
    expect(getTrustSignalDashboardApiKey()).toBeNull();
  });

  it("never accepts a browser-supplied upstream API key or request body", () => {
    const route = readFileSync(
      join(process.cwd(), "app/api/receipts/[receiptId]/verify/route.ts"),
      "utf8",
    );

    expect(route.includes("body.apiKey")).toBe(false);
    expect(route.includes("body: JSON.stringify")).toBe(false);
    expect(route.includes("getTrustSignalDashboardApiKey()")).toBe(true);
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
