import { describe, expect, it } from "vitest";
import {
  buildApiKeyCreatedEvent,
  buildApiKeyMetadata,
  buildApiKeyRevokedEvent,
  generateApiKeySecret,
} from "./api-keys";

describe("api key lifecycle helpers", () => {
  it("generates prefixed API key secrets", () => {
    const secret = generateApiKeySecret();
    expect(secret.startsWith("tsk_live_")).toBe(true);
    expect(secret.length).toBeGreaterThan(25);
  });

  it("produces stable metadata for a given secret", () => {
    process.env.API_KEY_PEPPER = "pepper-for-tests";
    const secret = "tsk_live_example_secret_value";

    const one = buildApiKeyMetadata(secret);
    const two = buildApiKeyMetadata(secret);

    expect(one.keyHash).toBe(two.keyHash);
    expect(one.keyPrefix).toBe(secret.slice(0, 16));
    expect(one.last4).toBe(secret.slice(-4));
  });

  it("builds created/revoked event payloads with required fields", () => {
    const created = buildApiKeyCreatedEvent({
      accountId: "acct_1",
      apiKeyId: "key_1",
      actorUserId: "user_1",
      name: "Prod key",
      scopes: ["verify:read"],
    });

    expect(created.action).toBe("created");
    expect(created.receipt_id).toBeNull();
    expect(created.api_key_id).toBe("key_1");

    const revoked = buildApiKeyRevokedEvent({
      accountId: "acct_1",
      apiKeyId: "key_1",
      actorUserId: "user_1",
      reason: "rotation",
      revokedAt: "2026-04-27T00:00:00.000Z",
    });

    expect(revoked.action).toBe("revoked");
    expect(revoked.receipt_id).toBeNull();
    expect(revoked.metadata.reason).toBe("rotation");
  });
});
