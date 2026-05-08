import { createHash, randomBytes } from "node:crypto";

export type AdminApiKey = {
  id: string;
  user_id: string;
  name: string;
  key_prefix: string;
  scopes: string[];
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
};

function getSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is required");
  }
  return url.replace(/\/$/, "");
}

function getSupabaseServiceRoleKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required");
  }
  return key;
}

function getOperatorUserId() {
  const userId = process.env.TRUSTSIGNAL_OPERATOR_USER_ID?.trim();
  if (!userId) {
    throw new Error("TRUSTSIGNAL_OPERATOR_USER_ID is required");
  }
  return userId;
}

function getApiBaseUrl() {
  const apiBaseUrl =
    process.env.TRUSTSIGNAL_API_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_TRUSTSIGNAL_API_URL?.trim() ||
    "https://api.trustsignal.dev";
  return apiBaseUrl.replace(/\/$/, "");
}

function getAdminApiKey() {
  const key = process.env.TRUSTSIGNAL_ADMIN_API_KEY?.trim();
  if (!key) {
    throw new Error("TRUSTSIGNAL_ADMIN_API_KEY is required to look up receipts from /admin");
  }
  return key;
}

async function supabaseAdminFetch(path: string, init: RequestInit = {}) {
  const response = await fetch(`${getSupabaseUrl()}${path}`, {
    ...init,
    headers: {
      apikey: getSupabaseServiceRoleKey(),
      Authorization: `Bearer ${getSupabaseServiceRoleKey()}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`supabase_admin_fetch_failed:${response.status}`);
  }

  return response;
}

export async function listAdminApiKeys() {
  const response = await supabaseAdminFetch(
    "/rest/v1/api_keys?select=id,user_id,name,key_prefix,scopes,created_at,last_used_at,revoked_at&order=created_at.desc"
  );
  return (await response.json()) as AdminApiKey[];
}

export async function createAdminApiKey(input: { name: string; scopes: string[] }) {
  const rawKey = `ts_live_${randomBytes(24).toString("hex")}`;
  const keyHash = createHash("sha256").update(rawKey).digest("hex");
  const keyPrefix = rawKey.slice(0, 12);

  const response = await supabaseAdminFetch("/rest/v1/api_keys", {
    method: "POST",
    headers: {
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      user_id: getOperatorUserId(),
      name: input.name,
      key_prefix: keyPrefix,
      key_hash: keyHash,
      scopes: input.scopes,
    }),
  });

  const [created] = (await response.json()) as AdminApiKey[];
  return {
    rawKey,
    created,
  };
}

export async function revokeAdminApiKey(keyId: string) {
  await supabaseAdminFetch(`/rest/v1/api_keys?id=eq.${encodeURIComponent(keyId)}`, {
    method: "PATCH",
    headers: {
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      revoked_at: new Date().toISOString(),
    }),
  });
}

export async function fetchReceiptById(receiptId: string) {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/receipt/${encodeURIComponent(receiptId)}`, {
    headers: {
      "x-api-key": getAdminApiKey(),
    },
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`receipt_lookup_failed:${response.status}`);
  }

  return response.json();
}
