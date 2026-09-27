import { z } from 'zod';

const keySchema = z.object({
  id: z.string(), name: z.string(), key_prefix: z.string(), scopes: z.array(z.string()),
  created_at: z.string(), last_used_at: z.string().nullable(), revoked_at: z.string().nullable(),
});
const receiptSchema = z.object({
  receiptId: z.string(), status: z.enum(['clean', 'failure', 'revoked', 'compliance_gap']),
  riskScore: z.number(), createdAt: z.string(), anchorStatus: z.string(), revoked: z.boolean(),
});
const verificationSchema = z.object({
  verified: z.boolean(), integrityVerified: z.boolean(), signatureVerified: z.boolean(),
  proofVerified: z.boolean(), revoked: z.boolean(), signatureStatus: z.string(), storedHash: z.string(),
});
export type DashboardKey = z.infer<typeof keySchema>;
export type DashboardReceipt = z.infer<typeof receiptSchema>;
export type DashboardVerification = z.infer<typeof verificationSchema>;

export class DashboardSessionError extends Error {
  constructor() {
    super('Your session has expired. Please sign in again.');
    this.name = 'DashboardSessionError';
  }
}

async function request(path: string, init: RequestInit = {}): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(path, {
      ...init, credentials: 'same-origin', cache: 'no-store',
      headers: { accept: 'application/json', ...init.headers },
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new Error('The service could not be reached. Please try again.');
  }
  if (response.status === 401) throw new DashboardSessionError();
  if (response.status === 429) throw new Error('Too many requests. Please wait before trying again.');
  if (response.status === 404) throw new Error('This record was not found in your account.');
  if (response.status === 403) throw new Error('Your account does not have access to this action.');
  if (!response.ok) throw new Error('The service is temporarily unavailable. Please try again.');
  return response;
}

async function parse<T>(response: Response, schema: z.ZodType<T>): Promise<T> {
  const parsed = schema.safeParse(await response.json().catch(() => null));
  if (!parsed.success) throw new Error('The service returned an invalid response. Please try again.');
  return parsed.data;
}

export async function listDashboardKeys() {
  return (await parse(await request('/api/keys'), z.object({ keys: z.array(keySchema) }))).keys;
}
export async function listDashboardReceipts() {
  return (await parse(await request('/api/receipts'), z.object({ receipts: z.array(receiptSchema) }))).receipts;
}
export async function createDashboardKey(name: string) {
  return (await parse(await request('/api/keys', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name, scopes: ['read', 'verify'] }),
  }), z.object({ key: keySchema.extend({ plaintext: z.string().min(1) }) }))).key;
}
export async function revokeDashboardKey(id: string) {
  await request(`/api/keys/${encodeURIComponent(id)}/revoke`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ reason: 'revoked_by_user' }),
  });
}
export async function verifyDashboardReceipt(id: string) {
  const result = await parse(await request(`/api/receipts/${encodeURIComponent(id)}/verify`, { method: 'POST' }), verificationSchema);
  return { ...result, verified: result.verified && result.integrityVerified && result.signatureVerified && result.proofVerified && !result.revoked };
}

export function dashboardError(error: unknown) {
  return error instanceof Error ? error.message : 'The service is unavailable. Please try again.';
}
