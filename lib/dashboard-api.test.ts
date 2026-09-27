import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDashboardKey, DashboardSessionError, listDashboardKeys, listDashboardReceipts, verifyDashboardReceipt } from './dashboard-api';

afterEach(() => vi.unstubAllGlobals());

describe('authenticated dashboard API contract', () => {
  it('uses the same-origin session proxy with no browser-side backend credential', async () => {
    const request = vi.fn().mockResolvedValue(Response.json({ keys: [] }));
    vi.stubGlobal('fetch', request);
    expect(await listDashboardKeys()).toEqual([]);
    expect(request).toHaveBeenCalledWith('/api/keys', expect.objectContaining({ cache: 'no-store', credentials: 'same-origin' }));
    expect(request.mock.calls[0][1].headers).not.toHaveProperty('authorization');
  });

  it('never treats an outage or malformed payload as an empty successful account', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ error: 'private detail' }, { status: 503 })));
    await expect(listDashboardReceipts()).rejects.toThrow('temporarily unavailable');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ receipts: [{ receiptId: 'incomplete' }] })));
    await expect(listDashboardReceipts()).rejects.toThrow('invalid response');
  });

  it('gives actionable session and rate-limit errors without echoing upstream details', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ error: 'private detail' }, { status: 401 })));
    await expect(listDashboardKeys()).rejects.toThrow('sign in again');
    await expect(listDashboardKeys()).rejects.toBeInstanceOf(DashboardSessionError);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 429 })));
    await expect(listDashboardKeys()).rejects.toThrow('Too many requests');
  });

  it('creates keys through the existing endpoint, with least-privilege scopes', async () => {
    const key = { id: 'key-1', name: 'Synthetic key', key_prefix: 'ts_live_demo', scopes: ['read', 'verify'], created_at: '2026-09-26T00:00:00Z', last_used_at: null, revoked_at: null, plaintext: 'synthetic-only' };
    const request = vi.fn().mockResolvedValue(Response.json({ key }, { status: 201 }));
    vi.stubGlobal('fetch', request);
    expect((await createDashboardKey('Synthetic key')).plaintext).toBe('synthetic-only');
    expect(JSON.parse(request.mock.calls[0][1].body)).toEqual({ name: 'Synthetic key', scopes: ['read', 'verify'] });
  });

  it('only accepts verification success when the complete proof succeeds and is not revoked', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ verified: true })));
    await expect(verifyDashboardReceipt('synthetic-id')).rejects.toThrow('invalid response');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ verified: true, integrityVerified: true, signatureVerified: false, proofVerified: true, revoked: false, signatureStatus: 'invalid', storedHash: '0x123' })));
    expect((await verifyDashboardReceipt('synthetic-id')).verified).toBe(false);
  });
});
