import { NextRequest, NextResponse } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { authenticate } = vi.hoisted(() => ({ authenticate: vi.fn() }));
vi.mock('@/lib/auth/require-user', () => ({ requireAuthenticatedSession: authenticate }));
vi.mock('@/lib/rate-limit', () => ({ enforceRateLimit: () => ({ ok: true }) }));
import { GET, POST } from './route';

const record = { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', name: 'Synthetic application', prefix: 'ts_live_test', scopes: ['read', 'verify'], createdAt: '2026-09-26T00:00:00Z', lastUsedAt: null, revokedAt: null };
beforeEach(() => authenticate.mockResolvedValue({ ok: true, context: { user: { id: 'synthetic-user' }, accessToken: 'synthetic-token' } }));
afterEach(() => vi.unstubAllGlobals());

describe('dashboard API-key proxy', () => {
  it('rejects anonymous access without contacting the upstream API', async () => {
    const request = vi.fn(); vi.stubGlobal('fetch', request);
    authenticate.mockResolvedValue({ ok: false, response: NextResponse.json({ error: 'Not authenticated' }, { status: 401 }) });
    expect((await GET()).status).toBe(401);
    expect(request).not.toHaveBeenCalled();
  });
  it('uses the validated session token and normalizes the core key contract', async () => {
    const request = vi.fn().mockResolvedValue(Response.json({ keys: [record] }));
    vi.stubGlobal('fetch', request);
    const response = await GET();
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(request).toHaveBeenCalledWith(expect.stringContaining('/api/v1/user/api-keys'), expect.objectContaining({ headers: expect.objectContaining({ authorization: 'Bearer synthetic-token' }), cache: 'no-store' }));
    expect((await response.json()).keys[0]).toMatchObject({ id: record.id, key_prefix: record.prefix, revoked_at: null });
  });
  it('creates only allowed scopes and forwards the one-time key with the expected shape', async () => {
    const request = vi.fn().mockResolvedValue(Response.json({ key: 'synthetic-only', record }, { status: 201 }));
    vi.stubGlobal('fetch', request);
    const response = await POST(new NextRequest('https://trustsignal.invalid/api/keys', { method: 'POST', body: JSON.stringify({ name: record.name, scopes: ['admin'] }) }));
    expect(response.status).toBe(201);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(JSON.parse(request.mock.calls[0][1].body)).toEqual({ name: record.name, scopes: ['read', 'verify'] });
    expect((await response.json()).key).toMatchObject({ plaintext: 'synthetic-only', key_prefix: record.prefix });
  });
  it('rejects malformed key names without calling the API', async () => {
    const request = vi.fn(); vi.stubGlobal('fetch', request);
    const response = await POST(new NextRequest('https://trustsignal.invalid/api/keys', { method: 'POST', body: JSON.stringify({ name: {} }) }));
    expect(response.status).toBe(400);
    expect(request).not.toHaveBeenCalled();
  });
  it('returns a safe service error without disclosing upstream internals', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ error: 'private database detail' }, { status: 503 })));
    const response = await GET();
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: 'Unable to load API keys' });
  });
});
