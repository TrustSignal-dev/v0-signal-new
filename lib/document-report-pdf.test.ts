import { describe, expect, it } from 'vitest';
import { PDFArray, PDFDocument, PDFName, PDFRawStream, decodePDFRawStream } from 'pdf-lib';
import { buildDocumentReport } from './document-report';
import { MATCH_STATEMENT, NOT_CHECKED_STATEMENT, checkDisplayName, checkGrid, renderDocumentReportPdf } from './document-report-pdf';
import type { DocumentEnvelope } from './document-receipts';
import type { ArtifactObservation } from './document-receipt-status';

// Shape-only synthetic receipt. Signatures are placeholders and are never verified here.
function envelope(overrides: Partial<DocumentEnvelope> = {}): DocumentEnvelope {
  return {
    kind: 'document-integrity', document: { algorithm: 'sha256', sha256: 'a'.repeat(64), sizeBytes: 4953 }, revoked: false,
    receipt: {
      receiptVersion: '1.0', receiptId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', createdAt: '2026-09-27T05:59:39.000Z',
      policyProfile: 'document-digest-v1', inputsCommitment: 'a'.repeat(64),
      checks: [{ checkId: 'document-digest-v1', status: 'PASS', details: '{}' }], decision: 'FLAG',
      reasons: ['Fingerprint only'], riskScore: 0, verifierId: 'trustsignal', signing_key_id: 'synthetic-key',
      receiptHash: '0x' + 'b'.repeat(64), receiptSignature: { signature: 'SYNTHETIC-SIGNATURE-VALUE', alg: 'ES256', kid: 'synthetic-key' },
    },
    verification: { verified: true, integrityVerified: true, signatureVerified: true, signatureStatus: 'verified', proofStatus: 'not-applicable', checkedAt: '2026-09-28T10:00:00.000Z' },
    ...overrides,
  };
}
const match: ArtifactObservation = { sha256: 'a'.repeat(64), sizeBytes: 4953, mediaType: 'application/pdf', name: 'synthetic-attestation.pdf' };

/** Visible page text: decodes every hex string drawn with the standard WinAnsi fonts. */
async function pageText(bytes: Uint8Array) {
  const pdf = await PDFDocument.load(bytes);
  const contents = pdf.getPage(0).node.Contents();
  const streams = contents instanceof PDFArray ? contents.asArray().map((ref) => pdf.context.lookup(ref, PDFRawStream)) : [contents as PDFRawStream];
  const raw = streams.map((stream) => new TextDecoder('latin1').decode(decodePDFRawStream(stream).decode())).join('\n');
  const decoder = new TextDecoder('windows-1252');
  const parts = [...raw.matchAll(/<([0-9A-Fa-f]*)>\s*Tj/g)].map((m) => decoder.decode(Uint8Array.from(m[1].match(/../g) ?? [], (h) => parseInt(h, 16))));
  // Letter-spaced labels are drawn one glyph at a time; collapse them back into words.
  return { pdf, text: parts.join(' '), parts, joined: parts.join('') };
}
async function render(value: DocumentEnvelope, artifact?: ArtifactObservation, environment: 'production' | 'sandbox' | 'unconfirmed' = 'production') {
  const report = buildDocumentReport({ ...value, verificationContext: { checkedAt: '2026-09-28T10:00:00.000Z', environment } }, { generatedAt: new Date('2026-09-28T10:05:00.000Z'), artifact });
  return pageText(await renderDocumentReportPdf(report));
}

describe('receipt template v2', () => {
  it('T1 renders the record fields from the receipt, one Letter page', async () => {
    const { pdf, text } = await render(envelope(), match);
    expect(pdf.getPageCount()).toBe(1);
    expect(pdf.getPage(0).getSize()).toEqual({ width: 612, height: 792 });
    for (const value of ['synthetic-attestation.pdf', '4,953 bytes', 'September 27, 2026', '05:59:39 UTC', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'document-digest-v1', 'synthetic-key', 'trustsignal'])
      expect(text).toContain(value);
  });

  it('T2 shows the red environment badge unless the exporter confirmed production', async () => {
    expect((await render(envelope(), match, 'sandbox')).joined).toContain('TEST ENVIRONMENT - NOT FOR RELIANCE');
    expect((await render(envelope(), match, 'unconfirmed')).joined).toContain('ENVIRONMENT UNCONFIRMED');
    expect((await render(envelope(), match, 'sandbox')).text).toContain('(test key)');
    const production = await render(envelope(), match, 'production');
    expect(production.joined).not.toContain('TEST ENVIRONMENT');
    expect(production.joined).not.toContain('UNCONFIRMED');
    expect(production.text).not.toContain('(test key)');
    // A production-looking key id on a sandbox receipt still shows the badge.
    const lookalike = envelope();
    lookalike.receipt.receiptSignature.kid = 'trustsignal-gcp-es256-production-v1';
    expect((await render(lookalike, match, 'sandbox')).joined).toContain('TEST ENVIRONMENT');
  });

  it('T3 renders exactly the checks in the receipt, with a data-driven grid and raw-id fallback', async () => {
    const one = await render(envelope(), match);
    expect(one.text).toContain('Document fingerprint');
    expect(one.parts).not.toContain('02');
    expect(checkDisplayName('an-unknown-check')).toBe('an-unknown-check');
    for (const count of [1, 2, 4, 6]) {
      const grid = checkGrid(count);
      expect(grid.perRow * grid.tileWidth + (grid.perRow - 1) * grid.gap).toBeCloseTo(516);
      expect(grid.rows).toBe(Math.ceil(count / grid.perRow));
      expect(grid.tileWidth).toBeGreaterThan(100);
    }
  });

  it('T4 keeps source and receipt fingerprints in separate labelled rows', async () => {
    const { text } = await render(envelope(), match);
    expect(text).toContain('Source evidence fingerprint');
    expect(text).toContain('Receipt fingerprint');
    expect(text).toContain('a'.repeat(64));
    expect(text).toContain('0x' + 'b'.repeat(64));
  });

  it('T5 never prints the signature value on the page', async () => {
    const { joined } = await render(envelope(), match);
    expect(joined).not.toContain('SYNTHETIC-SIGNATURE-VALUE');
    expect(joined).toContain('receipt.receiptSignature.signature');
  });

  it('T6 prints the match sentence only after a document comparison', async () => {
    const withoutFile = await render(envelope());
    expect(withoutFile.text).toContain(NOT_CHECKED_STATEMENT);
    expect(withoutFile.text).not.toContain(MATCH_STATEMENT);
    const withFile = await render(envelope(), match);
    expect(withFile.text.replace(/\s+/g, ' ')).toContain(MATCH_STATEMENT);
    expect(withFile.text).toContain('Document compared September 28, 2026, 10:05:00 UTC');
  });

  it('shows the mismatch state with both fingerprints and no match sentence', async () => {
    const { text } = await render(envelope(), { ...match, sha256: 'c'.repeat(64) });
    expect(text.replace(/\s+/g, ' ')).toContain('This document is not the one sealed in this record.');
    expect(text).toContain('Supplied file fingerprint');
    expect(text).toContain('c'.repeat(64));
    expect(text).not.toContain(MATCH_STATEMENT);
  });

  it.each([
    ['revoked', (v: DocumentEnvelope) => { v.revoked = true; v.lifecycle = { status: 'revoked', changedAt: '2026-09-28T09:00:00.000Z' }; }, 'This receipt was revoked on September 28, 2026.'],
    ['invalid', (v: DocumentEnvelope) => { v.verification.signatureVerified = false; }, 'This record could not be verified.'],
    ['unavailable', (v: DocumentEnvelope) => { v.verification.verified = false; }, 'Verification is currently unavailable.'],
  ])('never claims a match for a %s receipt', async (_name, mutate, headline) => {
    const value = envelope(); mutate(value);
    const { text } = await render(value, match);
    expect(text.replace(/\s+/g, ' ')).toContain(headline);
    expect(text).not.toContain(MATCH_STATEMENT);
  });

  it('keeps a very long or non-Latin file name on one page', async () => {
    const { pdf, text } = await render(envelope(), { ...match, name: 'Ω-' + 'very-long-evidence-file-name-'.repeat(8) + '.pdf' });
    expect(pdf.getPageCount()).toBe(1);
    expect(text).toContain('?-very-long');
  });

  it('attaches the JSON and adds no script or open action', async () => {
    const report = buildDocumentReport(envelope(), { generatedAt: new Date('2026-09-28T10:05:00.000Z'), artifact: match });
    const pdf = await PDFDocument.load(await renderDocumentReportPdf(report));
    expect(pdf.catalog.lookup(PDFName.of('Names'))).toBeDefined();
    expect(pdf.catalog.get(PDFName.of('OpenAction'))).toBeUndefined();
  });
});
