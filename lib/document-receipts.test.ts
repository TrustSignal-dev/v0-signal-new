import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextResponse } from 'next/server';
import { fingerprintFile, MAX_DOCUMENT_BYTES, issueDocumentReceipt, receiptCanBeUsed, type DocumentEnvelope } from './document-receipts';
import { DashboardSessionError } from './dashboard-api';
const { authenticate } = vi.hoisted(() => ({ authenticate: vi.fn() }));
vi.mock('./auth/require-user', () => ({ requireAuthenticatedSession: authenticate }));
import { documentReceiptProxy } from './document-receipt-proxy';

const payload = { requestId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', sha256: 'a'.repeat(64), sizeBytes: 3 };
function request(body: unknown = payload, origin = 'https://example.test') {
  return new Request('https://example.test/api/receipts/create', { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: JSON.stringify(body) });
}
function envelope(): DocumentEnvelope {
  return {
    kind: 'document-integrity', document: { algorithm: 'sha256', sha256: payload.sha256, sizeBytes: 3 }, revoked: false,
    receipt: { receiptVersion: '1.0', receiptId: payload.requestId, createdAt: '2026-09-26T00:00:00.000Z', policyProfile: 'document-digest-v1',
      inputsCommitment: payload.sha256, checks: [{ checkId: 'document-digest-v1', status: 'PASS', details: '{}' }],
      decision: 'FLAG', reasons: ['Fingerprint only'], riskScore: 0, verifierId: 'trustsignal', signing_key_id: 'synthetic',
      receiptHash: '0x' + 'b'.repeat(64), receiptSignature: { signature: 'synthetic-shape-only', alg: 'EdDSA', kid: 'synthetic' } },
    verification: { verified: true, integrityVerified: true, signatureVerified: true, signatureStatus: 'verified', proofStatus: 'not-applicable' },
  };
}
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
describe('file fingerprint and receipt client', () => {
  it('hashes exact bytes for arbitrary file types, including empty files', async () => {
    const file = new File(['abc'], 'private-document.anything');
    expect(await fingerprintFile(file)).toEqual({ sha256: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad', sizeBytes: 3 });
    expect((await fingerprintFile(new File([], 'empty'))).sha256).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });
  it('rejects excessive files before reading their bytes', async () => {
    const read = vi.fn();
    await expect(fingerprintFile({ size: MAX_DOCUMENT_BYTES + 1, arrayBuffer: read })).rejects.toThrow('25 MiB');
    expect(read).not.toHaveBeenCalled();
  });
  it('sends only the digest contract and preserves the retry request ID', async () => {
    const fetch = vi.fn(async () => Response.json(envelope())); vi.stubGlobal('fetch', fetch);
    await issueDocumentReceipt(payload); await issueDocumentReceipt(payload);
    expect(fetch.mock.calls).toHaveLength(2);
    const init = vi.mocked(globalThis.fetch).mock.calls[0][1];
    expect(JSON.parse(init?.body as string)).toEqual(payload);
    expect(init).toMatchObject({ credentials: 'same-origin', cache: 'no-store' });
  });
  it('rejects a mismatched receipt and treats session expiry separately', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ ...envelope(), document: { ...envelope().document, sizeBytes: 5 } })));
    await expect(issueDocumentReceipt(payload)).rejects.toThrow('could not be confirmed');
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 401 })));
    await expect(issueDocumentReceipt(payload)).rejects.toBeInstanceOf(DashboardSessionError);
  });
  it('never treats a revoked, unsigned, or integrity-failed result as usable', () => {
    const value = envelope();
    expect(receiptCanBeUsed(value)).toBe(true);
    expect(receiptCanBeUsed({ ...value, revoked: true })).toBe(false);
    for (const status of ['revoked', 'superseded', 'expired'] as const) {
      expect(receiptCanBeUsed({ ...value, lifecycle: { status } })).toBe(false);
    }
    expect(receiptCanBeUsed({ ...value, verification: { ...value.verification, signatureVerified: false } })).toBe(false);
    expect(receiptCanBeUsed({ ...value, verification: { ...value.verification, integrityVerified: false } })).toBe(false);
  });
});
describe('document receipt proxy boundary', () => {
  it('rejects unauthenticated requests before parsing or forwarding', async () => {
    authenticate.mockResolvedValue({ ok: false, response: NextResponse.json({}, { status: 401 }) });
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    expect((await documentReceiptProxy(request())).status).toBe(401); expect(fetch).not.toHaveBeenCalled();
  });
  it('rejects cross-origin, extra private fields and oversized bodies', async () => {
    authenticate.mockResolvedValue({ ok: true, context: { accessToken: 'synthetic-session' } });
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    expect((await documentReceiptProxy(request(payload, 'https://other.test'))).status).toBe(403);
    expect((await documentReceiptProxy(request({ ...payload, filename: 'private.txt' }))).status).toBe(400);
    expect((await documentReceiptProxy(request({ ...payload, bytes: 'x'.repeat(2000) }))).status).toBe(413);
    expect(fetch).not.toHaveBeenCalled();
  });
  it('forwards validated bearer identity and a digest without raw document data', async () => {
    authenticate.mockResolvedValue({ ok: true, context: { accessToken: 'synthetic-session' } });
    const fetch = vi.fn(async () => Response.json(envelope(), { status: 201 })); vi.stubGlobal('fetch', fetch);
    const response = await documentReceiptProxy(request());
    expect(response.status).toBe(201);
    expect(vi.mocked(globalThis.fetch).mock.calls[0]).toEqual([expect.stringContaining('/api/v1/user/document-receipts'), expect.objectContaining({
      body: JSON.stringify(payload), headers: expect.objectContaining({ authorization: 'Bearer synthetic-session' }),
    })]);
    expect(response.headers.get('cache-control')).toBe('no-store');
  });
  it('uses the configured public origin when a reverse proxy presents an internal URL', async () => {
    authenticate.mockResolvedValue({ ok: true, context: { accessToken: 'synthetic-session' } });
    vi.stubEnv('TRUSTSIGNAL_APP_ORIGIN', 'https://example.test');
    vi.stubGlobal('fetch', vi.fn(async () => Response.json(envelope(), { status: 201 })));
    const proxied = new Request('http://localhost:3000/api/receipts/create', { method: 'POST', headers: { origin: 'https://example.test', 'content-type': 'application/json' }, body: JSON.stringify(payload) });
    expect((await documentReceiptProxy(proxied)).status).toBe(201);
  });
  it('replaces upstream environment claims with the reviewed issuer configuration', async () => {
    authenticate.mockResolvedValue({ ok: true, context: { accessToken: 'synthetic-session' } });
    vi.stubEnv('TRUSTSIGNAL_RECEIPT_ISSUERS', '');
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ ...envelope(), verificationContext: {
      checkedAt: '2020-01-01T00:00:00.000Z', environment: 'production',
    } })));
    const response = await documentReceiptProxy(request());
    const result = await response.json();
    expect(result.verificationContext.environment).toBe('unconfirmed');
    expect(result.verificationContext.checkedAt).not.toBe('2020-01-01T00:00:00.000Z');
    vi.stubEnv('TRUSTSIGNAL_RECEIPT_ISSUERS', JSON.stringify({ synthetic: 'sandbox' }));
    expect((await (await documentReceiptProxy(request())).json()).verificationContext.environment).toBe('sandbox');
  });
  it('keeps private receipt reads on the authenticated owner boundary and preserves denial', async () => {
    authenticate.mockResolvedValue({ ok: true, context: { accessToken: 'synthetic-other-owner' } });
    const fetch = vi.fn(async () => Response.json({ error: 'private internal owner detail' }, { status: 404 }));
    vi.stubGlobal('fetch', fetch);
    const response = await documentReceiptProxy(new Request('https://example.test/api/document-receipts/' + payload.requestId), payload.requestId);
    expect(response.status).toBe(404);
    expect(await response.text()).not.toContain('private internal owner detail');
    expect(vi.mocked(globalThis.fetch).mock.calls[0]).toEqual([
      expect.stringContaining('/api/v1/user/document-receipts/' + payload.requestId),
      expect.objectContaining({ method: 'GET', headers: expect.objectContaining({ authorization: 'Bearer synthetic-other-owner' }) }),
    ]);
  });
  it('does not echo upstream internals and rejects malformed success', async () => {
    authenticate.mockResolvedValue({ ok: true, context: { accessToken: 'synthetic-session' } });
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ error: 'private diagnostic' }, { status: 503 })));
    const response = await documentReceiptProxy(request());
    expect(await response.text()).not.toContain('private diagnostic');
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ verified: true })));
    expect((await documentReceiptProxy(request())).status).toBe(502);
  });
});
