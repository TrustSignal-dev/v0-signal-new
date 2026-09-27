import { NextResponse } from 'next/server';
import { documentEnvelopeSchema, documentListSchema, documentRequestSchema } from './document-receipts';
import { requireAuthenticatedSession } from './auth/require-user';
import { resolveTrustedAppOrigin } from './auth/origin';
import { getTrustSignalApiUrl } from './trustsignal-api';
import { receiptIssuerEnvironment } from './document-receipt-environment';

export async function documentReceiptProxy(request: Request, receiptId?: string) {
  const auth = await requireAuthenticatedSession();
  if (!auth.ok) return auth.response;
  const creating = request.method === 'POST';
  let body: string | undefined;
  if (creating) {
    if (request.headers.get('origin') !== resolveTrustedAppOrigin(request.url)) {
      return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
    }
    if (!request.headers.get('content-type')?.startsWith('application/json')) {
      return NextResponse.json({ error: 'JSON fingerprint required' }, { status: 415 });
    }
    const reader = request.body?.getReader();
    if (!reader) return NextResponse.json({ error: 'Missing fingerprint' }, { status: 400 });
    let text = ''; let total = 0;
    const decoder = new TextDecoder();
    try {
      for (;;) {
        const chunk = await reader.read();
        if (chunk.done) break;
        total += chunk.value.byteLength;
        if (total > 1024) {
          await reader.cancel();
          return NextResponse.json({ error: 'Fingerprint request too large' }, { status: 413 });
        }
        text += decoder.decode(chunk.value, { stream: true });
      }
      text += decoder.decode();
      const parsed = documentRequestSchema.safeParse(JSON.parse(text));
      if (!parsed.success) return NextResponse.json({ error: 'Invalid fingerprint' }, { status: 400 });
      body = JSON.stringify(parsed.data);
    } catch { return NextResponse.json({ error: 'Invalid fingerprint' }, { status: 400 }); }
    finally { reader.releaseLock(); }
  }
  if (receiptId && !/^[0-9a-f-]{36}$/i.test(receiptId)) return NextResponse.json({ error: 'Invalid receipt ID' }, { status: 400 });
  let upstream: Response;
  try {
    upstream = await fetch(getTrustSignalApiUrl() + '/api/v1/user/document-receipts' + (receiptId ? '/' + encodeURIComponent(receiptId) : ''), {
      method: creating ? 'POST' : 'GET', body, cache: 'no-store',
      headers: { accept: 'application/json', authorization: 'Bearer ' + auth.context.accessToken, ...(creating ? { 'content-type': 'application/json' } : {}) },
      signal: AbortSignal.timeout(15_000),
    });
  } catch { return NextResponse.json({ error: 'Document receipt service unavailable' }, { status: 503 }); }
  if (!upstream.ok) {
    const status = [400, 401, 403, 404, 409, 413, 429, 503].includes(upstream.status) ? upstream.status : 502;
    return NextResponse.json({ error: 'Document receipt request failed' }, { status });
  }
  const data = await upstream.json().catch(() => null);
  const result = creating || receiptId ? documentEnvelopeSchema.safeParse(data) : documentListSchema.safeParse(data);
  if (!result.success) return NextResponse.json({ error: 'Invalid receipt service response' }, { status: 502 });
  const response = 'receipt' in result.data ? {
    ...result.data,
    verificationContext: {
      checkedAt: new Date().toISOString(),
      environment: receiptIssuerEnvironment(result.data.receipt.receiptSignature.kid, process.env.TRUSTSIGNAL_RECEIPT_ISSUERS),
    },
  } : result.data;
  return NextResponse.json(response, { status: creating ? upstream.status : 200, headers: { 'cache-control': 'no-store' } });
}
