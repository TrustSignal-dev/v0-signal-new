import React from 'react';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SavedReceiptStatus, type ReceiptCheckValue } from './saved-receipt-status';

// Status metadata only: no full receipt, signing keys, document or account fixture.
const checked: ReceiptCheckValue = {
  revoked: false,
  verification: { verified: true, integrityVerified: true, signatureVerified: true, signatureStatus: 'verified', proofStatus: 'not-applicable' },
};
const render = (value: ReceiptCheckValue | null, props: { checking?: boolean; unavailable?: boolean } = {}) =>
  renderToStaticMarkup(<SavedReceiptStatus value={value} {...props} />);

describe('saved receipt status', () => {
  it('separates automatic receipt verification from document comparison and optional anchoring', () => {
    const html = render(checked);
    expect(html).toContain('Receipt verified');
    expect(html).toContain('Document comparison is a separate check');
    expect(html).toContain('Anchoring is optional');
    expect(html).toContain('No confirmed anchor proof');
    expect(html).not.toContain('VERIFIED MATCH');
    expect(html).toContain('Check time unavailable');
    expect(html).not.toContain('<time');
  });
  it('uses only returned times and distinguishes check completion from response receipt', () => {
    const response = { ...checked, verificationContext: { checkedAt: '2026-09-27T00:01:00.000Z', environment: 'unconfirmed' as const } };
    expect(render(response)).toContain('Verification response received at:');
    const completed = { ...response, verification: { ...checked.verification, checkedAt: '2026-09-27T00:00:00.000Z' } };
    expect(render(completed)).toContain('Receipt checked at:');
    expect(render(completed)).toContain('dateTime="2026-09-27T00:00:00.000Z"');
    expect(render(completed)).not.toContain('dateTime="2026-09-27T00:01:00.000Z"');
  });
  it('suppresses prior success and time during a new check or failed request', () => {
    const previous = { ...checked, verification: { ...checked.verification, checkedAt: '2026-09-27T00:00:00.000Z' } };
    expect(render(previous, { checking: true })).toContain('Checking receipt');
    expect(render(previous, { unavailable: true })).toContain('Receipt unavailable');
    for (const props of [{ checking: true }, { unavailable: true }]) {
      expect(render(previous, props)).not.toContain('Receipt verified');
      expect(render(previous, props)).not.toContain('<time');
    }
  });
  it.each(['revoked', 'expired', 'superseded'] as const)('never labels %s receipts verified', (status) => {
    const html = render({ ...checked, lifecycle: { status } });
    expect(html).toContain('Receipt ' + status);
    expect(html).not.toContain('Receipt verified');
  });
  it('prioritizes revocation and rejects missing overall, signature or integrity success', () => {
    expect(render({ ...checked, revoked: true })).toContain('Receipt revoked');
    for (const field of ['signatureVerified', 'integrityVerified'] as const) {
      expect(render({ ...checked, verification: { ...checked.verification, [field]: false } })).toContain('Receipt not verified');
    }
    expect(render({ ...checked, verification: { ...checked.verification, signatureStatus: 'unknown' } })).toContain('Receipt not verified');
    expect(render({ ...checked, verification: { ...checked.verification, verified: false } })).toContain('Receipt unavailable');
    expect(render(null)).toContain('Receipt unavailable');
  });
  it('connects opening and private-link loading to the existing authenticated read', () => {
    const panel = readFileSync(new URL('./document-receipt-panel.tsx', import.meta.url), 'utf8');
    expect(panel).toContain('readDocumentReceipt(initialReceiptId)');
    expect(panel).toContain('readDocumentReceipt(id)');
    expect(panel).toContain('setCheckingReceipt(true)');
    expect(panel).toContain('setCheckingReceipt(false)');
    expect(panel).toContain('<SavedReceiptStatus value={receipt} checking={checkingReceipt} unavailable={Boolean(error)}');
    expect(panel).toContain("presentation.status === 'NOT CHECKED' ? 'Document not checked'");
  });
});
