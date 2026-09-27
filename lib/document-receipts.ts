import { z } from 'zod';
import { DashboardSessionError } from './dashboard-api';
export const MAX_DOCUMENT_BYTES = 25 * 1024 * 1024;
const hash = z.string().regex(/^[a-f0-9]{64}$/);
export const documentRequestSchema = z.object({
  requestId: z.string().uuid(), sha256: hash,
  sizeBytes: z.number().int().min(0).max(MAX_DOCUMENT_BYTES),
}).strict();
export const documentEnvelopeSchema = z.object({
  kind: z.literal('document-integrity'),
  document: z.object({ algorithm: z.literal('sha256'), sha256: hash, sizeBytes: z.number().int().min(0).max(MAX_DOCUMENT_BYTES) }).strict(),
  receipt: z.object({
    receiptVersion: z.literal('1.0'), receiptId: z.string().uuid(), createdAt: z.string().datetime(),
    policyProfile: z.literal('document-digest-v1'), inputsCommitment: hash,
    checks: z.array(z.object({ checkId: z.string(), status: z.enum(['PASS', 'FAIL', 'WARN']), details: z.string() })).length(1),
    decision: z.literal('FLAG'), reasons: z.array(z.string()), riskScore: z.literal(0), verifierId: z.literal('trustsignal'),
    signing_key_id: z.string().min(1), receiptHash: z.string().regex(/^0x[a-f0-9]{64}$/),
    receiptSignature: z.object({ signature: z.string().min(1), alg: z.enum(['ES256', 'EdDSA']), kid: z.string().min(1) }),
  }).strict(),
  revoked: z.boolean(),
  lifecycle: z.object({
    status: z.enum(['active', 'revoked', 'superseded', 'expired']),
    changedAt: z.string().datetime().optional(),
  }).strict().optional(),
  verificationContext: z.object({
    checkedAt: z.string().datetime(),
    environment: z.enum(['production', 'sandbox', 'unconfirmed']),
  }).strict().optional(),
  verification: z.object({
    verified: z.boolean(), integrityVerified: z.boolean(), signatureVerified: z.boolean(),
    signatureStatus: z.string(), proofStatus: z.literal('not-applicable'),
  }).strict(),
  replayed: z.boolean().optional(),
}).refine((value) => value.document.sha256 === value.receipt.inputsCommitment);
export type DocumentEnvelope = z.infer<typeof documentEnvelopeSchema>;
export const documentListSchema = z.object({ receipts: z.array(z.object({
  receiptId: z.string().uuid(), createdAt: z.string().datetime(), revoked: z.boolean(),
})) });
export type DocumentSummary = z.infer<typeof documentListSchema>['receipts'][number];
export async function fingerprintFile(file: Pick<File, 'size' | 'arrayBuffer'>) {
  if (file.size > MAX_DOCUMENT_BYTES) throw new Error('Choose a file no larger than 25 MiB.');
  const bytes = await file.arrayBuffer();
  if (bytes.byteLength !== file.size) throw new Error('The file could not be read completely. Select it again.');
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return { sha256: Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join(''), sizeBytes: bytes.byteLength };
}
export function receiptCanBeUsed(value: DocumentEnvelope) {
  return value.verification.verified && value.verification.integrityVerified &&
    value.verification.signatureVerified && value.verification.signatureStatus === 'verified' && !value.revoked &&
    (!value.lifecycle || value.lifecycle.status === 'active');
}
async function request(path: string, init: RequestInit = {}) {
  let response: Response;
  try { response = await fetch(path, { ...init, credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(20_000) }); }
  catch { throw new Error('Receipt service could not be reached. Retry with the same selected file.'); }
  if (response.status === 401) throw new DashboardSessionError();
  if (response.status === 429) throw new Error('The account or request limit was reached. Please try later.');
  if (response.status === 409) throw new Error('This receipt request conflicts with an existing record. Select the file again.');
  if (response.status === 404) throw new Error('This receipt was not found in your account.');
  if (!response.ok) throw new Error('The receipt service is unavailable. Retry with the same selected file.');
  return response.json();
}
export async function issueDocumentReceipt(input: z.infer<typeof documentRequestSchema>) {
  const valid = documentRequestSchema.parse(input);
  const receipt = documentEnvelopeSchema.parse(await request('/api/receipts/create', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(valid),
  }));
  if (receipt.receipt.receiptId !== valid.requestId || receipt.document.sha256 !== valid.sha256 ||
      receipt.document.sizeBytes !== valid.sizeBytes || !receiptCanBeUsed(receipt)) {
    throw new Error('The issued receipt could not be confirmed. Retry with the same selected file.');
  }
  return receipt;
}
export async function listDocumentReceipts() {
  return documentListSchema.parse(await request('/api/document-receipts')).receipts;
}
export async function readDocumentReceipt(id: string) {
  const receipt = documentEnvelopeSchema.parse(await request('/api/document-receipts/' + encodeURIComponent(id)));
  if (receipt.receipt.receiptId !== id) throw new Error('The service returned a different receipt.');
  return receipt;
}
