'use server';

import { createHash, randomBytes } from 'node:crypto';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export type CustomerApiKey = {
  id: string;
  name: string;
  key_prefix: string;
  scopes: string[];
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
};

type ApiResult<T> = T | { error: string };

async function getAuthenticatedUserId(): Promise<string> {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    throw new Error('unauthenticated');
  }
  return user.id;
}

function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is required');
  return url.replace(/\/$/, '');
}

function getServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
  return key;
}

function serviceRoleHeaders() {
  return {
    apikey: getServiceRoleKey(),
    Authorization: `Bearer ${getServiceRoleKey()}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation'
  };
}

/**
 * List all non-revoked API keys belonging to the authenticated customer.
 */
export async function listApiKeys(): Promise<ApiResult<{ keys: CustomerApiKey[] }>> {
  try {
    const userId = await getAuthenticatedUserId();
    const url = `${getSupabaseUrl()}/rest/v1/api_keys?user_id=eq.${userId}&select=id,name,key_prefix,scopes,created_at,last_used_at,revoked_at&order=created_at.desc`;
    const res = await fetch(url, { headers: serviceRoleHeaders(), cache: 'no-store' });
    if (!res.ok) {
      const text = await res.text();
      return { error: `Failed to load keys: ${text}` };
    }
    const rows = await res.json() as CustomerApiKey[];
    return { keys: rows };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Create a new API key for the authenticated customer.
 * Returns the raw secret once — caller must display and discard.
 */
export async function createApiKey(name: string): Promise<ApiResult<{ id: string; secret: string }>> {
  if (!name || name.trim().length < 1 || name.trim().length > 120) {
    return { error: 'Key name must be 1–120 characters' };
  }

  try {
    const userId = await getAuthenticatedUserId();

    const rawSecret = randomBytes(32).toString('hex');
    const prefix = `ts_${rawSecret.slice(0, 8)}`;
    const keyHash = createHash('sha256').update(rawSecret).digest('hex');
    const secret = `${prefix}_${rawSecret.slice(8)}`;

    const payload = {
      user_id: userId,
      name: name.trim(),
      key_prefix: prefix,
      key_hash: keyHash,
      scopes: ['verify', 'read'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const res = await fetch(`${getSupabaseUrl()}/rest/v1/api_keys`, {
      method: 'POST',
      headers: serviceRoleHeaders(),
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const text = await res.text();
      return { error: `Failed to create key: ${text}` };
    }

    const [row] = await res.json() as Array<{ id: string }>;
    return { id: row.id, secret };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export type UsageStat = {
  plan: string;
  used: number;
  limit: number | null;
  remaining: number | null;
  resetAt: string | null;
};

/**
 * Get the current month's verification usage for the authenticated customer.
 * Calls GET /api/v1/usage on the TrustSignal API using the first active read-scoped key.
 *
 * Falls back gracefully when TRUSTSIGNAL_API_BASE_URL is not configured.
 */
export async function getUsage(): Promise<ApiResult<UsageStat>> {
  try {
    const baseUrl = process.env.TRUSTSIGNAL_API_BASE_URL?.trim();
    if (!baseUrl) {
      return { error: 'TRUSTSIGNAL_API_BASE_URL is not configured' };
    }

    // Use the service-level API key configured for the dashboard (internal read key)
    const apiKey = process.env.TRUSTSIGNAL_DASHBOARD_API_KEY?.trim();
    if (!apiKey) {
      return { error: 'TRUSTSIGNAL_DASHBOARD_API_KEY is not configured' };
    }

    const res = await fetch(`${baseUrl}/api/v1/usage`, {
      headers: { 'x-api-key': apiKey },
      cache: 'no-store'
    });
    if (!res.ok) {
      const text = await res.text();
      return { error: `Usage fetch failed: ${text}` };
    }
    const data = await res.json() as UsageStat;
    return data;
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Revoke an API key — only if it belongs to the authenticated customer.
 */
export async function revokeApiKey(keyId: string): Promise<ApiResult<{ ok: true }>> {
  try {
    const userId = await getAuthenticatedUserId();

    const res = await fetch(
      `${getSupabaseUrl()}/rest/v1/api_keys?id=eq.${keyId}&user_id=eq.${userId}&revoked_at=is.null`,
      {
        method: 'PATCH',
        headers: { ...serviceRoleHeaders(), Prefer: 'return=minimal' },
        body: JSON.stringify({ revoked_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      }
    );

    if (!res.ok) {
      const text = await res.text();
      return { error: `Failed to revoke key: ${text}` };
    }

    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
