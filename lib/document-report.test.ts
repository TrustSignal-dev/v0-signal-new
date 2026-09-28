import { afterEach, describe, expect, it, vi } from 'vitest';
import { PDFArray, PDFDict, PDFDocument, PDFName, PDFRawStream, decodePDFRawStream } from 'pdf-lib';
import { buildDocumentReport, documentReportJson, loadDocumentReport } from './document-report';
import { renderDocumentReportPdf } from './document-report-pdf';
import { DashboardSessionError } from './dashboard-api';
import type { DocumentEnvelope } from './document-receipts';

// Shape-only synthetic receipt; cryptographic signing is tested by the private API suites.
function envelope(): DocumentEnvelope {
  return {
    kind: 'document-integrity', document: { algorithm: 'sha256', sha256: 'a'.repeat(64), sizeBytes: 56 }, revoked: false,
    receipt: {
      receiptVersion: '1.0', receiptId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', createdAt: '2026-09-26T00:00:00.000Z',
      policyProfile: 'document-digest-v1', inputsCommitment: 'a'.repeat(64),
      checks: [{ checkId: 'document-digest-v1', status: 'PASS', details: '{}' }], decision: 'FLAG',
      reasons: ['Fingerprint only'], riskScore: 0, verifierId: 'trustsignal', signing_key_id: 'synthetic',
      receiptHash: '0x' + 'b'.repeat(64), receiptSignature: { signature: 'synthetic-shape-only', alg: 'EdDSA', kid: 'synthetic' },
    },
    verification: { verified: true, integrityVerified: true, signatureVerified: true, signatureStatus: 'verified', proofStatus: 'not-applicable' },
  };
}
const options = { generatedAt: new Date('2026-09-26T12:00:00.000Z'), localReview: true };
afterEach(() => vi.unstubAllGlobals());

describe('machine-readable document reports', () => {
  it('preserves the signed payload and explicitly separates unsigned report context and absent fraud analysis', () => {
    const input = envelope();
    const original = JSON.stringify(input);
    const report = buildDocumentReport(input, options);
    expect(JSON.stringify(input)).toBe(original);
    expect(report.receipt).toEqual(input.receipt);
    expect(JSON.parse(documentReportJson(report)).report).toMatchObject({
      schemaVersion: '1.1', title: 'Artifact integrity receipt', generatedAt: options.generatedAt.toISOString(),
      trustContext: 'sandbox', signatureScope: 'receipt-only', verificationSource: 'authenticated-api',
      fraudAssessment: { status: 'not-performed', score: null, findings: [] },
      presentation: { status: 'NOT CHECKED', environment: 'Sandbox' },
    });
    expect(buildDocumentReport(input).report.trustContext).toBe('unconfirmed');
  });
  it.each(['revoked', 'signature', 'integrity', 'overall'] as const)('exports an explicit non-passing %s diagnostic, never a valid receipt claim', (field) => {
    const value = envelope();
    if (field === 'revoked') value.revoked = true;
    if (field === 'signature') value.verification.signatureVerified = false;
    if (field === 'integrity') value.verification.integrityVerified = false;
    if (field === 'overall') value.verification.verified = false;
    const report = buildDocumentReport(value, { artifact: { sha256: 'a'.repeat(64), sizeBytes: 56 } });
    expect(report.report.presentation.status).toBe(field === 'revoked' ? 'REVOKED' : field === 'overall' ? 'UNAVAILABLE' : 'INVALID RECEIPT');
    expect(report.report.presentation.claimBoundary).not.toContain('current lifecycle status passed');
  });
  it('rejects a mismatch instead of rendering the wrong document fingerprint', () => {
    expect(() => buildDocumentReport({ ...envelope(), document: { ...envelope().document, sha256: 'b'.repeat(64) } })).toThrow();
  });
  it('fetches a fresh owner receipt for every export and preserves session expiry', async () => {
    const fetch = vi.fn(async () => Response.json(envelope()));
    vi.stubGlobal('fetch', fetch);
    const id = envelope().receipt.receiptId;
    await loadDocumentReport(id, options); await loadDocumentReport(id, options);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls[0]).toEqual(['/api/document-receipts/' + id, expect.objectContaining({ credentials: 'same-origin', cache: 'no-store' })]);
    fetch.mockResolvedValueOnce(Response.json({}, { status: 401 }));
    await expect(loadDocumentReport(id)).rejects.toBeInstanceOf(DashboardSessionError);
    fetch.mockResolvedValueOnce(Response.json({}, { status: 503 }));
    await expect(loadDocumentReport(id)).rejects.toThrow('unavailable');
  });
});

describe('human PDF report', () => {
  it('creates a uniform Letter page containing the exact JSON report as an attachment', async () => {
    const report = buildDocumentReport(envelope(), options);
    const pdf = await PDFDocument.load(await renderDocumentReportPdf(report));
    expect(pdf.getPageCount()).toBe(1);
    expect(pdf.getPage(0).getSize()).toEqual({ width: 612, height: 792 });
    expect(pdf.getTitle()).toBe('TrustSignal | Artifact integrity receipt');
    const names = pdf.catalog.lookup(PDFName.of('Names'), PDFDict);
    const attachments = names.lookup(PDFName.of('EmbeddedFiles'), PDFDict).lookup(PDFName.of('Names'), PDFArray);
    const spec = attachments.lookup(1, PDFDict);
    const stream = spec.lookup(PDFName.of('EF'), PDFDict).lookup(PDFName.of('F'), PDFRawStream);
    expect(new TextDecoder().decode(decodePDFRawStream(stream).decode())).toBe(documentReportJson(report));
    expect(names.get(PDFName.of('JavaScript'))).toBeUndefined();
    expect(pdf.catalog.get(PDFName.of('OpenAction'))).toBeUndefined();
  });
  it('revalidates a report before printing any passed status', async () => {
    const report = buildDocumentReport(envelope(), options);
    report.revoked = true;
    const pdf = await PDFDocument.load(await renderDocumentReportPdf(report));
    const files = pdf.catalog.lookup(PDFName.of('Names'), PDFDict).lookup(PDFName.of('EmbeddedFiles'), PDFDict).lookup(PDFName.of('Names'), PDFArray);
    const stream = files.lookup(1, PDFDict).lookup(PDFName.of('EF'), PDFDict).lookup(PDFName.of('F'), PDFRawStream);
    const attached = JSON.parse(new TextDecoder().decode(decodePDFRawStream(stream).decode()));
    expect(attached.report.presentation.status).toBe('REVOKED');
    expect(attached.report.presentation.claimBoundary).not.toContain('current lifecycle status passed');
  });
});
