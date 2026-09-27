import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { syntheticDocumentReceipt } from '../lib/document-report-fixture';
import { buildDocumentReport } from '../lib/document-report';
import { renderDocumentReportPdf } from '../lib/document-report-pdf';

describe('receipt layout stress proof', () => {
  it('renders one page for valid, mismatch, invalid, revoked and unconfirmed outcomes', async () => {
    for (const state of ['match', 'mismatch', 'invalid', 'revoked', 'unconfirmed'] as const) {
      const receipt = syntheticDocumentReceipt();
      receipt.verificationContext = { checkedAt: '2026-09-26T18:04:03.634Z', environment: state === 'unconfirmed' ? 'unconfirmed' : 'sandbox' };
      if (state === 'invalid') receipt.verification.signatureVerified = false;
      if (state === 'revoked') { receipt.revoked = true; receipt.lifecycle = { status: 'revoked', changedAt: '2026-09-26T18:03:00.000Z' }; }
      const report = buildDocumentReport(receipt, {
        generatedAt: new Date('2026-09-26T18:04:03.634Z'),
        artifact: { sha256: state === 'mismatch' ? 'c'.repeat(64) : 'a'.repeat(64), sizeBytes: 56, mediaType: 'application/pdf' },
      });
      const bytes = await renderDocumentReportPdf(report);
      expect((await PDFDocument.load(bytes)).getPageCount()).toBe(1);
      if (process.env.RECEIPT_PROOF_DIR) {
        await mkdir(process.env.RECEIPT_PROOF_DIR, { recursive: true });
        await writeFile(join(process.env.RECEIPT_PROOF_DIR, `synthetic-receipt-v11-${state}.pdf`), bytes);
      }
    }
  });
});
