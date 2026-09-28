// Local-only browser fixture. No provider credentials, real accounts, or persistence.
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';

const fixturePort = 3318;
const user = { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', aud: 'authenticated', role: 'authenticated', email: 'synthetic@example.test', app_metadata: {}, user_metadata: {}, created_at: '2026-09-26T00:00:00Z' };
const b64 = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
const token = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: user.id, aud: 'authenticated', exp: Math.floor(Date.now()/1000)+3600, iat: Math.floor(Date.now()/1000), role: 'authenticated' })}.c3ludGhldGlj`;
const keys = [];
const documents = new Map();
let failReads = false;
let sessionExpired = false;
const receiptId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const server = createServer(async (req, res) => {
  let raw = '';
  for await (const chunk of req) raw += chunk;
  const body = raw ? JSON.parse(raw) : {};
  const pathname = new URL(req.url, 'http://127.0.0.1').pathname;
  const send = (status, data) => { res.writeHead(status, { 'content-type': 'application/json' }); res.end(data === undefined ? '' : JSON.stringify(data)); };
  if (pathname === '/__test/fail') { failReads = body.enabled; return send(200, { ok: true }); }
  if (pathname === '/__test/session') { sessionExpired = body.expired; return send(200, { ok: true }); }
  if (pathname === '/auth/v1/token') {
    if (body.email !== user.email || body.password !== 'synthetic-password-only') return send(401, { message: 'Synthetic credentials required' });
    sessionExpired = false;
    return send(200, { access_token: token, refresh_token: 'synthetic-refresh-only', token_type: 'bearer', expires_in: 3600, user });
  }
  if (sessionExpired) return send(401, { error: 'synthetic_session_expired' });
  if (req.headers.authorization !== `Bearer ${token}`) return send(401, { error: 'unauthorized' });
  if (pathname === '/auth/v1/user') return send(200, user);
  if (pathname === '/auth/v1/logout') return send(204);
  if (failReads && req.method === 'GET') return send(503, { error: 'synthetic_outage' });
  if (pathname === '/api/v1/user/api-keys') {
    if (req.method === 'GET') return send(200, { keys });
    const record = { id: randomUUID(), name: body.name, prefix: 'ts_live_test', scopes: ['read', 'verify'], createdAt: new Date().toISOString(), lastUsedAt: null, revokedAt: null };
    keys.unshift(record);
    return send(201, { key: 'synthetic-only-not-a-real-api-key', record });
  }
  if (pathname.startsWith('/api/v1/user/api-keys/') && req.method === 'DELETE') {
    const key = keys.find((item) => item.id === pathname.split('/').at(-1));
    if (!key) return send(404, { error: 'not_found' });
    key.revokedAt = new Date().toISOString(); return send(204);
  }
  if (pathname === '/api/v1/user/document-receipts') {
    if (req.method === 'GET') return send(200, { receipts: [...documents.values()].map(({ receipt, revoked }) => ({ receiptId: receipt.receiptId, createdAt: receipt.createdAt, revoked })) });
    if (!/^[a-f0-9]{64}$/.test(body.sha256) || !Number.isInteger(body.sizeBytes)) return send(400, { error: 'invalid_digest' });
    const record = {
      kind: 'document-integrity', document: { algorithm: 'sha256', sha256: body.sha256, sizeBytes: body.sizeBytes }, revoked: false,
      receipt: {
        receiptVersion: '1.0', receiptId: body.requestId, createdAt: new Date().toISOString(), policyProfile: 'document-digest-v1',
        inputsCommitment: body.sha256, checks: [{ checkId: 'document-digest-v1', status: 'PASS', details: '{}' }],
        decision: 'FLAG', reasons: ['Synthetic UI fixture only; not cryptographic proof'], riskScore: 0, verifierId: 'trustsignal',
        signing_key_id: 'synthetic-browser', receiptHash: '0x' + 'b'.repeat(64),
        receiptSignature: { signature: 'synthetic-shape-only', alg: 'ES256', kid: 'synthetic-browser' },
      },
      verification: { verified: true, integrityVerified: true, signatureVerified: true, signatureStatus: 'verified', proofStatus: 'not-applicable' },
    };
    documents.set(body.requestId, record);
    return send(201, record);
  }
  if (pathname.startsWith('/api/v1/user/document-receipts/')) {
    const record = documents.get(pathname.split('/').at(-1));
    return send(record ? 200 : 404, record ?? { error: 'not_found' });
  }
  if (pathname === '/api/v1/user/receipts') return send(200, { receipts: [{ receiptId, status: 'clean', riskScore: 0, createdAt: '2026-09-26T00:00:00Z', anchorStatus: 'not_anchored', revoked: false }] });
  if (pathname === `/api/v1/user/receipts/${receiptId}/verify`) return send(200, { verified: true, integrityVerified: true, signatureVerified: true, proofVerified: true, revoked: false, signatureStatus: 'verified', storedHash: 'synthetic-hash-only' });
  send(404, { error: 'not_found' });
});
server.listen(fixturePort, '127.0.0.1', () => {
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => /^(path|systemroot|temp|tmp|userprofile|appdata|localappdata|comspec|pathext|programfiles|systemdrive)$/i.test(key)));
  const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev', '--hostname', '127.0.0.1', '--port', '3317'], {
    stdio: 'inherit', env: { ...env, NEXT_TELEMETRY_DISABLED: '1', TRUSTSIGNAL_LOCAL_REVIEW: 'synthetic', TRUSTSIGNAL_RECEIPT_ISSUERS: JSON.stringify({ 'synthetic-browser': 'sandbox' }), NEXT_PUBLIC_SUPABASE_URL: `http://127.0.0.1:${fixturePort}`, NEXT_PUBLIC_SUPABASE_ANON_KEY: 'synthetic-anon-only', TRUSTSIGNAL_API_URL: `http://127.0.0.1:${fixturePort}` },
  });
  console.log('Synthetic browser fixture: http://127.0.0.1:3317');
  const stop = () => { child.kill(); server.close(); };
  process.on('SIGINT', stop); process.on('SIGTERM', stop);
  child.on('exit', () => server.close());
});
