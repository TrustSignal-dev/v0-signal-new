import { createHash, randomBytes } from "node:crypto";

const KEY_PREFIX = "tsk_live";

export function generateApiKeySecret() {
  const body = randomBytes(24).toString("base64url");
  return `${KEY_PREFIX}_${body}`;
}

export function buildApiKeyMetadata(secret: string) {
  const pepper = process.env.API_KEY_PEPPER ?? "";
  const hash = createHash("sha256").update(`${secret}:${pepper}`).digest("hex");

  return {
    keyPrefix: secret.slice(0, 16),
    last4: secret.slice(-4),
    keyHash: hash,
  };
}

export function buildApiKeyCreatedEvent(params: {
  accountId: string;
  apiKeyId: string;
  actorUserId: string;
  name: string;
  scopes: string[];
}) {
  return {
    account_id: params.accountId,
    api_key_id: params.apiKeyId,
    actor_user_id: params.actorUserId,
    action: "created" as const,
    receipt_id: null,
    metadata: {
      name: params.name,
      scopes: params.scopes,
    },
  };
}

export function buildApiKeyRevokedEvent(params: {
  accountId: string;
  apiKeyId: string;
  actorUserId: string;
  reason: string;
  revokedAt: string;
}) {
  return {
    account_id: params.accountId,
    api_key_id: params.apiKeyId,
    actor_user_id: params.actorUserId,
    action: "revoked" as const,
    receipt_id: null,
    metadata: {
      reason: params.reason,
      revoked_at: params.revokedAt,
    },
  };
}
