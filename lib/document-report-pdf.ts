import { PDFDocument, StandardFonts, rgb, type PDFFont } from 'pdf-lib';
import { buildDocumentReport, documentReportFilename, documentReportJson, type DocumentReport } from './document-report';
import { utcTime } from './document-receipt-status';

/** PDF presentation is unsigned; the original signed receipt is in its JSON attachment. */
export async function renderDocumentReportPdf(input: DocumentReport): Promise<Uint8Array<ArrayBuffer>> {
  const report = buildDocumentReport(input, { generatedAt: new Date(input.report.generatedAt), artifact: input.report.artifactObservation });
  const view = report.report.presentation;
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([612, 792]);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const mono = await pdf.embedFont(StandardFonts.Courier);
  const ink = rgb(.93, .95, .96), muted = rgb(.64, .70, .74), background = rgb(.055, .067, .079);
  const panel = rgb(.09, .11, .13), line = rgb(.20, .24, .27);
  const teal = rgb(.27, .89, .81), amber = rgb(.98, .76, .36), red = rgb(1, .48, .48);
  const accent = view.tone === 'valid' ? teal : view.tone === 'error' ? red : amber;
  const printable = (value: string) => value.replace(/[^\x20-\x7e\u2018\u2019\u201c\u201d\u2022]/g, '?');
  function text(value: string, x: number, y: number, size = 9, font = regular, color = ink) {
    page.drawText(printable(value), { x, y, size, font, color });
  }
  function wrap(value: string, width: number, size: number, font: PDFFont) {
    const lines: string[] = []; let current = '';
    for (const word of printable(value).split(/\s+/)) {
      if (current && font.widthOfTextAtSize(current + ' ' + word, size) > width) { lines.push(current); current = ''; }
      if (font.widthOfTextAtSize(word, size) > width) {
        for (const char of word) {
          if (font.widthOfTextAtSize(current + char, size) > width) { lines.push(current); current = ''; }
          current += char;
        }
      } else current += (current ? ' ' : '') + word;
    }
    if (current) lines.push(current);
    return lines;
  }
  function paragraph(value: string, x: number, y: number, width = 540, size = 8.5, color = muted, maxLines = 5) {
    const lines = wrap(value, width, size, regular);
    if (lines.length > maxLines) throw new Error('Receipt text exceeds the one-page layout.');
    lines.forEach((part, index) => text(part, x, y - index * (size + 3), size, regular, color));
  }
  function section(value: string, y: number) { text(value, 36, y, 8, bold, muted); }
  function field(label: string, value: string, x: number, y: number) {
    text(label, x, y, 7.5, regular, muted);
    const display = value.length > 54 ? value.slice(0, 48) + '...' : value;
    const size = Math.min(9, 255 / Math.max(1, mono.widthOfTextAtSize(display, 1)));
    text(display, x, y - 13, size, mono);
  }
  pdf.setTitle('TrustSignal | Artifact integrity receipt'); pdf.setAuthor('TrustSignal');
  pdf.setSubject('Receipt format 1.1. Unsigned verification report with original signed JSON receipt.');
  pdf.setCreator('TrustSignal receipt report 1.1'); pdf.setLanguage('en-US');
  pdf.setCreationDate(new Date(report.report.generatedAt)); pdf.setModificationDate(new Date(report.report.generatedAt));
  page.drawRectangle({ x: 0, y: 0, width: 612, height: 792, color: background });
  text('TrustSignal', 36, 754, 20, bold, ink);
  text('ARTIFACT INTEGRITY RECEIPT', 369, 759, 9, bold, muted);
  text('Receipt format v1.1', 466, 744, 8, mono, muted);
  page.drawLine({ start: { x: 36, y: 733 }, end: { x: 576, y: 733 }, thickness: .6, color: line });

  page.drawRectangle({ x: 36, y: 654, width: 540, height: 65, color: panel, borderColor: accent, borderWidth: .8 });
  text(view.status, 50, 695, 19, bold, accent);
  paragraph(view.message, 50, 679, 510, 9, ink, 2);
  if (view.status === 'VERIFIED MATCH') text('Receipt signature valid  /  Receipt active', 50, 663, 8, mono, muted);
  if (view.environmentMessage) {
    page.drawRectangle({ x: 36, y: 609, width: 540, height: 36, color: panel, borderColor: amber, borderWidth: .6 });
    text(view.environment === 'Sandbox' ? 'SANDBOX RECEIPT' : 'ENVIRONMENT UNCONFIRMED', 46, 632, 8, bold, amber);
    paragraph(view.environmentMessage, 46, 620, 520, 8, muted, 1);
  } else text('PRODUCTION  /  Issuing key matched to server-configured provenance', 36, 629, 8, mono, muted);

  section('WHAT THIS RESULT MEANS', 592);
  paragraph(view.status === 'VERIFIED MATCH'
    ? 'The artifact supplied for verification matches the SHA-256 fingerprint recorded in this signed receipt. TrustSignal verified the receipt signature and checked its current lifecycle status.'
    : view.message, 36, 578, 540, 9, ink, 3);
  section('ARTIFACT AND RECEIPT', 538);
  field('Receipt ID', report.receipt.receiptId, 36, 522); field('Receipt status', view.lifecycle, 318, 522);
  field('Receipt issued by TrustSignal', utcTime(report.receipt.createdAt), 36, 491);
  field('Verification response received', report.verificationContext ? utcTime(report.verificationContext.checkedAt) : 'Not recorded', 318, 491);
  field('Artifact type (display metadata - not signed)', report.report.artifactObservation?.mediaType ?? 'Not supplied', 36, 460);
  field('Artifact size', report.document.sizeBytes.toLocaleString('en-US') + ' bytes', 318, 460);
  field('Receipt profile', report.receipt.policyProfile, 36, 429); field('Environment', view.environment, 318, 429);

  page.drawRectangle({ x: 36, y: 337, width: 540, height: 62, color: panel, borderColor: line, borderWidth: .6 });
  text('ARTIFACT FINGERPRINT  /  SHA-256', 48, 383, 8, bold, muted);
  text(report.document.sha256, 48, 365, 10, mono, ink);
  paragraph(view.status === 'VERIFIED MATCH' ? 'Calculated from the selected artifact bytes. Verification compares those bytes with the recorded fingerprint.'
    : 'Recorded artifact fingerprint. Select an artifact to calculate and compare its fingerprint.', 48, 350, 516, 8, muted, 1);

  section('VERIFICATION CHECKS', 319);
  view.checks.forEach((check, i) => {
    const y = 301 - i * 18;
    text(check.name, 36, y, 8.5, regular); text(check.result, 166, y, 8.5, bold, accent);
    paragraph(check.meaning, 264, y, 312, 7.8, muted, 1);
  });
  page.drawLine({ start: { x: 36, y: 249 }, end: { x: 576, y: 249 }, thickness: .6, color: line });
  section('ADVANCED VERIFICATION DETAILS', 233);
  text('Signature algorithm: ' + view.signatureAlgorithm, 36, 217, 8, mono);
  const kid = report.receipt.receiptSignature.kid;
  text('Signing key ID: ' + (kid.length > 78 ? kid.slice(0, 60) + '... (full ID in JSON)' : kid), 36, 204, 8, mono);
  text('Receipt schema: ' + report.receipt.receiptVersion + '  /  Canonicalization: RFC 8785 (JCS)', 36, 191, 8, mono);
  text('Signed receipt digest: ' + report.receipt.receiptHash, 36, 178, 7.7, mono);
  text('Signed receipt package: attached JSON. Report metadata and PDF are not signed.', 36, 165, 8, regular, muted);
  paragraph(view.claimBoundary, 36, 133, 540, 8, muted, 6);
  page.drawLine({ start: { x: 36, y: 58 }, end: { x: 576, y: 58 }, thickness: .6, color: line });
  text('Verify this receipt: trustsignal.dev/verify/' + report.receipt.receiptId, 36, 44, 8, mono);
  text('Private workspace access required. JSON available from the issuing workspace.', 36, 31, 8, regular, muted);
  text('TrustSignal  /  Evidence integrity infrastructure', 36, 18, 8, bold, muted);
  text('1 / 1', 554, 18, 8, mono, muted);

  await pdf.attach(new TextEncoder().encode(documentReportJson(report)), documentReportFilename(report, 'json'), {
    mimeType: 'application/json', description: 'Original signed receipt and explicitly unsigned verification report',
    creationDate: new Date(report.report.generatedAt), modificationDate: new Date(report.report.generatedAt),
  });
  return new Uint8Array(await pdf.save());
}
