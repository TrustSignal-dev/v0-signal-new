import { describe, expect, it, beforeAll } from "vitest";
import { createPartnerAccessToken, verifyPartnerAccessToken } from "./partner-access";

describe("partner-access session tokens", () => {
  beforeAll(() => {
    process.env.DRATA_ACCESS_HMAC_SECRET = "test-secret-at-least-32-chars-long-!!";
  });

  it("creates and verifies a valid token", async () => {
    const partner = "drata";
    const token = await createPartnerAccessToken(partner);
    expect(token).toBeDefined();
    expect(token).toContain(".");

    const isValid = await verifyPartnerAccessToken(partner, token);
    expect(isValid).toBe(true);
  });

  it("rejects when token is missing", async () => {
    const isValid = await verifyPartnerAccessToken("drata", undefined);
    expect(isValid).toBe(false);
  });

  it("rejects token with invalid signature", async () => {
    const token = await createPartnerAccessToken("drata");
    const tamperedToken = token.slice(0, -5) + "abcde";
    const isValid = await verifyPartnerAccessToken("drata", tamperedToken);
    expect(isValid).toBe(false);
  });

  it("rejects expired token", async () => {
    const partner = "drata";
    const secret = process.env.DRATA_ACCESS_HMAC_SECRET!;
    
    // Manually create an expired token
    const iat = Math.floor(Date.now() / 1000) - 3600 * 24; // 1 day ago
    const exp = iat + 3600; // expired 23 hours ago
    const payload = JSON.stringify({ partner, iat, exp });
    
    // We need to sign it - let's use a helper if we had one, or just mock the logic
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
    const signature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    
    const base64Payload = Buffer.from(payload).toString("base64url");
    const expiredToken = `${base64Payload}.${signature}`;

    const isValid = await verifyPartnerAccessToken(partner, expiredToken);
    expect(isValid).toBe(false);
  });

  it("rejects malformed payload", async () => {
    const secret = process.env.DRATA_ACCESS_HMAC_SECRET!;
    const payload = "not-json";
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
    const signature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    
    const base64Payload = Buffer.from(payload).toString("base64url");
    const malformedToken = `${base64Payload}.${signature}`;

    const isValid = await verifyPartnerAccessToken("drata", malformedToken);
    expect(isValid).toBe(false);
  });
});
