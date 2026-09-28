import { describe, expect, it } from 'vitest';
import { receiptPresentation } from './document-receipt-status';
import { syntheticDocumentReceipt } from './document-report-fixture';

describe('shared receipt status language', () => {
  const artifact = { sha256: 'a'.repeat(64), sizeBytes: 56, mediaType: 'application/pdf' };
  it('requires an actual artifact comparison before claiming VERIFIED MATCH', () => {
    expect(receiptPresentation(syntheticDocumentReceipt()).status).toBe('NOT CHECKED');
    expect(receiptPresentation(syntheticDocumentReceipt(), artifact).status).toBe('VERIFIED MATCH');
  });
  it('distinguishes digest and byte-size mismatches', () => {
    expect(receiptPresentation(syntheticDocumentReceipt(), { ...artifact, sha256: 'b'.repeat(64) }).status).toBe('MISMATCH');
    expect(receiptPresentation(syntheticDocumentReceipt(), { ...artifact, sizeBytes: 57 }).status).toBe('MISMATCH');
  });
  it('never lets a matching file override invalid signatures, revocation or service failures', () => {
    const value = syntheticDocumentReceipt();
    expect(receiptPresentation({ ...value, verification: { ...value.verification, signatureVerified: false } }, artifact).status).toBe('INVALID RECEIPT');
    expect(receiptPresentation({ ...value, revoked: true }, artifact).status).toBe('REVOKED');
    expect(receiptPresentation({ ...value, verification: { ...value.verification, verified: false } }, artifact).status).toBe('UNAVAILABLE');
    expect(receiptPresentation(null, artifact).status).toBe('UNAVAILABLE');
  });
  it('represents supersession separately and does not fabricate a revocation time', () => {
    const value = syntheticDocumentReceipt();
    expect(receiptPresentation({ ...value, lifecycle: { status: 'superseded' } }, artifact).status).toBe('SUPERSEDED');
    expect(receiptPresentation({ ...value, revoked: true }, artifact).message).not.toContain(' on ');
  });
  it('keeps sandbox reliance separate from a technically successful match', () => {
    const value = syntheticDocumentReceipt();
    const view = receiptPresentation({ ...value, verificationContext: { checkedAt: value.receipt.createdAt, environment: 'sandbox' } }, artifact);
    expect(view.status).toBe('VERIFIED MATCH');
    expect(view.environment).toBe('Sandbox');
    expect(view.environmentMessage).toContain('not for production reliance');
    expect(receiptPresentation(value, artifact).environment).toBe('Unconfirmed');
  });
  it('uses the actual algorithm and preserves the exact valid-result limitation text', () => {
    const value = syntheticDocumentReceipt();
    value.receipt.receiptSignature.alg = 'ES256';
    const view = receiptPresentation(value, artifact);
    expect(view.signatureAlgorithm).toBe('ES256 (ECDSA P-256 / SHA-256)');
    expect(view.claimBoundary).toBe('This receipt confirms that the submitted artifact matches the recorded fingerprint and that the receipt’s signature and current lifecycle status passed verification at the time shown above. It does not certify that the original content was true, complete, authorized, compliant, or legally admissible. Unless an independent timestamp proof is explicitly shown, the receipt records TrustSignal’s service issue time and is not an independently trusted proof of when the underlying artifact was created.');
  });
});
