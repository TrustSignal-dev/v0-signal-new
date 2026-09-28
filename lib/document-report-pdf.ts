import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage, type RGB } from 'pdf-lib';
import { buildDocumentReport, documentReportFilename, documentReportJson, type DocumentReport } from './document-report';
import type { ReceiptStatus } from './document-receipt-status';

/**
 * Evidence attestation receipt (template v2, "Receipt Template Spec").
 * The PDF is an unsigned presentation. The original signed receipt travels as the JSON attachment.
 * Rules enforced here: the match sentence appears only after an actual document comparison; checks are
 * rendered from receipt.checks exactly; source and receipt fingerprints stay in separate rows; no key or
 * signature values are printed; the environment badge is red unless the exporter confirmed production.
 */
export const RECEIPT_PDF_TITLE = 'TrustSignal | Evidence attestation receipt';
export const MATCH_STATEMENT = 'This evidence matches the cryptographically sealed record.';
export const NOT_CHECKED_STATEMENT = 'Document match not checked.';

const CHECK_NAMES: Record<string, string> = { 'document-digest-v1': 'Document fingerprint' };
export const checkDisplayName = (checkId: string) => CHECK_NAMES[checkId] ?? checkId;

const W = 612, H = 792, M = 48, R = W - M, CW = R - M;

/** Tile grid for receipt.checks: four columns, as many rows as the receipt needs, no fixed set. */
export function checkGrid(count: number, width = CW, gap = 10) {
  const perRow = 4;
  return { perRow, gap, tileWidth: (width - gap * (perRow - 1)) / perRow, rows: Math.ceil(count / perRow), tileHeight: 58 };
}
const ink = rgb(0.082, 0.09, 0.102), muted = rgb(0.373, 0.4, 0.44), faint = rgb(0.54, 0.565, 0.6);
const line = rgb(0.85, 0.863, 0.878), green = rgb(0.122, 0.541, 0.4), red = rgb(0.702, 0.149, 0.118), white = rgb(1, 1, 1);

// Standard PDF fonts encode WinAnsi only. Anything else is replaced so a file name can never break rendering.
const printable = (value: string) => value.replace(/[^\x20-\x7e‘’“”•–—·©]/g, '?');

export function longDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { date: 'Unavailable', time: '' };
  return {
    date: date.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'long', day: 'numeric', year: 'numeric' }),
    time: date.toISOString().slice(11, 19) + ' UTC',
  };
}
const stamp = (value?: string) => { if (!value) return 'time unavailable'; const d = longDate(value); return d.time ? `${d.date}, ${d.time}` : d.date; };

type Statement = { tone: 'match' | 'neutral' | 'error'; label: string; headline: string; detail: string };
export function receiptStatement(report: DocumentReport): Statement {
  const status: ReceiptStatus = report.report.presentation.status;
  const checkedAt = report.verification.checkedAt ?? report.verificationContext?.checkedAt;
  const compared = stamp(report.report.generatedAt);
  const receiptCheck = checkedAt ? `Receipt verified ${stamp(checkedAt)}.` : 'Receipt verified; check time unavailable.';
  const limit = 'It is not a compliance or risk determination.';
  switch (status) {
    case 'VERIFIED MATCH': return { tone: 'match', label: 'SEALED RECORD', headline: MATCH_STATEMENT, detail: `Document compared ${compared}. ${receiptCheck} ${limit}` };
    case 'NOT CHECKED': return { tone: 'neutral', label: 'RECEIPT VERIFIED', headline: NOT_CHECKED_STATEMENT, detail: `${receiptCheck} No document was compared with this record. Keep your own copy; this receipt does not stand in for it.` };
    case 'MISMATCH': return { tone: 'error', label: 'MISMATCH', headline: 'This document is not the one sealed in this record.', detail: `Document compared ${compared}. Both fingerprints are listed under Technical details.` };
    case 'INVALID RECEIPT': return { tone: 'error', label: 'INVALID SIGNATURE', headline: 'This record could not be verified.', detail: 'No match claim is made, regardless of any file fingerprint.' };
    case 'REVOKED': {
      const at = report.lifecycle?.changedAt;
      return { tone: 'error', label: 'REVOKED', headline: at ? `This receipt was revoked on ${longDate(at).date}.` : 'This receipt was revoked.', detail: 'No match claim is made. Do not use it as an active integrity record.' };
    }
    case 'SUPERSEDED': return { tone: 'error', label: 'SUPERSEDED', headline: 'A newer receipt replaced this record.', detail: 'No match claim is made. Verify the replacement receipt before relying on it.' };
    case 'EXPIRED': return { tone: 'error', label: 'EXPIRED', headline: 'This receipt has expired.', detail: 'No match claim is made. Do not use it as an active integrity record.' };
    default: return { tone: 'neutral', label: 'UNAVAILABLE', headline: 'Verification is currently unavailable.', detail: 'No match claim is made. Try again later; a cached result is never shown.' };
  }
}

export async function renderDocumentReportPdf(input: DocumentReport): Promise<Uint8Array<ArrayBuffer>> {
  // Rebuild from the envelope so every status shown is revalidated rather than trusted from the caller.
  const report = buildDocumentReport(input, { generatedAt: new Date(input.report.generatedAt), artifact: input.report.artifactObservation });
  const view = report.report.presentation;
  const artifact = report.report.artifactObservation;
  const production = report.report.trustContext === 'production';
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([W, H]);
  const sans = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const mono = await pdf.embedFont(StandardFonts.Courier);
  const d = new Drawer(page, bold);

  pdf.setTitle(RECEIPT_PDF_TITLE); pdf.setAuthor('TrustSignal');
  pdf.setSubject('Unsigned receipt presentation. The original signed receipt is the attached JSON.');
  pdf.setCreator('TrustSignal receipt template 2.0'); pdf.setProducer('TrustSignal'); pdf.setLanguage('en-US');
  pdf.setCreationDate(new Date(report.report.generatedAt)); pdf.setModificationDate(new Date(report.report.generatedAt));

  // Header: pixel mark, wordmark, environment badge.
  const mark: Array<[number, number, RGB]> = [[0, 1, ink], [1, 0, ink], [1, 2, ink], [2, 1, green], [2, 2, ink], [3, 1, ink]];
  for (const [row, col, color] of mark) page.drawRectangle({ x: M + col * 6.5, y: H - 44 - row * 6.5, width: 6.5, height: 6.5, color });
  d.text('TrustSignal', M + 28, H - 50, 15, bold);
  d.spaced('EVIDENCE ATTESTATION RECEIPT', M + 28, H - 62, 5.6, mono, muted, 1.4);
  if (!production) {
    const label = report.report.trustContext === 'sandbox' ? 'TEST ENVIRONMENT - NOT FOR RELIANCE' : 'ENVIRONMENT UNCONFIRMED';
    const width = d.spacedWidth(label, 7, mono, 1) + 30;
    page.drawRectangle({ x: R - width, y: H - 64, width, height: 20, borderColor: red, borderWidth: 0.9 });
    page.drawRectangle({ x: R - width + 9, y: H - 57, width: 6, height: 6, color: red });
    d.spaced(label, R - width + 21, H - 56.5, 7, mono, red, 1);
  } else {
    const label = 'PRODUCTION';
    const width = d.spacedWidth(label, 7, mono, 1) + 18;
    page.drawRectangle({ x: R - width, y: H - 64, width, height: 20, borderColor: line, borderWidth: 0.9 });
    d.spaced(label, R - width + 9, H - 56.5, 7, mono, muted, 1);
  }
  page.drawRectangle({ x: M, y: H - 82, width: CW, height: 1.6, color: ink });

  // Evidence and record identity (left column).
  const left = 300;
  d.label('SOURCE EVIDENCE', M, H - 108);
  const name = artifact?.name?.trim() || 'Unnamed evidence file';
  let y = H - 130;
  for (const part of d.wrap(name, left, 20, bold, true, 2)) { d.text(part, M, y, 20, bold); y -= 22; }
  const nameNote = artifact?.name ? 'Name as selected on this device - not part of the signed record' : 'File name not recorded';
  d.text(`${nameNote}  ·  ${report.document.sizeBytes.toLocaleString('en-US')} bytes`, M, y + 5, 7.8, sans, muted);
  y -= 22;
  const issued = longDate(report.receipt.createdAt);
  d.label('ISSUED', M, y); d.label('RECEIPT STATUS', M + 172, y);
  d.text(issued.date, M, y - 16, 11.5, sans); d.text(issued.time, M, y - 29, 7.8, mono, muted);
  d.text(view.lifecycle.toUpperCase(), M + 172, y - 16, 9, mono, view.lifecycle === 'Active' ? ink : red);
  y -= 50;
  d.label('RECEIPT ID', M, y);
  d.text(report.receipt.receiptId, M, y - 15, 9.6, mono);
  const leftBottom = y - 26;

  // Statement box (right column).
  const s = receiptStatement(report);
  const bx = M + 330, bw = R - bx, top = H - 100;
  const accent = s.tone === 'match' ? green : s.tone === 'error' ? red : faint;
  const headline = d.wrap(s.headline, bw - 34, 11.5, bold, false, 4);
  const detail = d.wrap(s.detail, bw - 34, 7, sans, false, 6);
  const bh = 50 + headline.length * 14 + detail.length * 9.5;
  page.drawRectangle({ x: bx, y: top - bh, width: bw, height: bh, borderColor: ink, borderWidth: 1.3 });
  d.statusSquare(bx + 17, top - 29, 10, s.tone, accent);
  d.spaced(s.label, bx + 33, top - 27, 6.6, bold, s.tone === 'neutral' ? muted : accent, 1.2);
  let by = top - 50;
  for (const part of headline) { d.text(part, bx + 17, by, 11.5, bold); by -= 14; }
  by -= 4;
  for (const part of detail) { d.text(part, bx + 17, by, 7, sans, muted); by -= 9.5; }

  y = Math.min(leftBottom, top - bh) - 16;
  d.rule(y);

  // Checks performed: exactly receipt.checks, in order.
  y -= 22;
  d.label('CHECKS PERFORMED', M, y);
  const profile = 'policy profile · ' + report.receipt.policyProfile;
  d.text(profile, R - mono.widthOfTextAtSize(printable(profile), 6.8), y, 6.8, mono, muted);
  y -= 12;
  const checks = report.receipt.checks;
  const { perRow, gap, tileWidth: tw, tileHeight: th, rows: checkRows } = checkGrid(checks.length);
  checks.forEach((check, i) => {
    const col = i % perRow, row = Math.floor(i / perRow);
    const tx = M + col * (tw + gap), ty = y - row * (th + gap) - th;
    page.drawRectangle({ x: tx, y: ty, width: tw, height: th, borderColor: line, borderWidth: 0.9 });
    d.text(String(i + 1).padStart(2, '0'), tx + 11, ty + th - 15, 6.5, mono, faint);
    const tone = check.status === 'PASS' ? 'match' : check.status === 'FAIL' ? 'error' : 'neutral';
    d.statusSquare(tx + tw - 22, ty + th - 21, 11, tone, check.status === 'PASS' ? green : check.status === 'FAIL' ? red : faint);
    d.text(d.wrap(checkDisplayName(check.checkId), tw - 22, 9.5, bold, true, 1)[0], tx + 11, ty + th - 33, 9.5, bold);
    d.text(check.status, tx + 11, ty + 10, 7.2, mono, check.status === 'PASS' ? green : check.status === 'FAIL' ? red : muted);
  });
  y -= checkRows * (th + gap) - gap + 14;
  d.text('Only the checks listed were performed. The set is defined by the policy profile for this evidence type.', M, y, 7.4, sans, muted);
  y -= 16;
  d.rule(y);

  // Technical details: two distinct fingerprints, identifiers only, never key or signature values.
  y -= 22;
  d.label('TECHNICAL DETAILS', M, y);
  y -= 16;
  const alg = report.receipt.receiptSignature.alg === 'ES256' ? 'ES256 · ECDSA P-256 / SHA-256' : report.receipt.receiptSignature.alg === 'EdDSA' ? 'EdDSA · Ed25519' : report.receipt.receiptSignature.alg;
  const keyNote = production ? '' : report.report.trustContext === 'sandbox' ? '(test key)' : '(key environment unconfirmed)';
  const checkedAt = report.verification.checkedAt ?? report.verificationContext?.checkedAt;
  const signatureState = view.checks.find((c) => c.name === 'Receipt signature')?.result === 'Valid' ? 'Signature valid' : 'Signature not validated';
  const rows: Array<[string, string, { note?: string; noteColor?: RGB }?]> = [
    ['Verifier', report.receipt.verifierId],
    ['Policy profile', report.receipt.policyProfile],
    ['Receipt version', report.receipt.receiptVersion],
    ['Policy result', report.receipt.decision + ' · risk score ' + report.receipt.riskScore, { note: '- not a compliance finding', noteColor: faint }],
    ['Signature', alg, keyNote ? { note: keyNote, noteColor: red } : undefined],
    ['Signing-key ID', report.receipt.receiptSignature.kid],
    ['Source evidence fingerprint', report.document.sha256],
    ['Receipt fingerprint', report.receipt.receiptHash],
    ...(view.status === 'MISMATCH' && artifact ? [['Supplied file fingerprint', artifact.sha256] as [string, string]] : []),
    ['Receipt check', `${signatureState} · ${checkedAt ? stamp(checkedAt) : 'check time unavailable'}`],
    ['Verification material', 'Attached signed receipt JSON', { note: '(receipt.receiptSignature.signature · receipt.receiptSignature.kid)', noteColor: faint }],
  ];
  const vx = M + 132, vw = R - vx;
  for (const [label, value, extra] of rows) {
    d.text(label, M, y, 8, sans, muted);
    const parts = d.wrap(value, vw, 7.8, mono, true, 3);
    parts.forEach((part, i) => d.text(part, vx, y - i * 10, 7.8, mono));
    if (extra?.note) {
      const last = parts[parts.length - 1];
      const after = vx + mono.widthOfTextAtSize(printable(last), 7.8) + 6;
      if (after + mono.widthOfTextAtSize(printable(extra.note), 7.2) <= R) d.text(extra.note, after, y - (parts.length - 1) * 10, 7.2, mono, extra.noteColor);
      else { d.text(extra.note, vx, y - parts.length * 10, 7.2, mono, extra.noteColor); y -= 10; }
    }
    y -= Math.max(1, parts.length) * 10 + 7;
  }
  if (y < 110) throw new Error('Receipt content exceeds the one-page layout.');

  // Footer.
  d.rule(96);
  const footer = 'This receipt records that the source evidence file, identified by its fingerprint, was sealed and signed by the verifier at the time of issue. Recompute the fingerprint of the evidence file and verify the signature in the attached receipt JSON to confirm a match. It is not a compliance or risk determination; evidence acceptance remains the decision of the reviewing organization.';
  d.wrap(footer, 330, 6.8, sans, false, 6).forEach((part, i) => d.text(part, M, 80 - i * 9, 6.8, sans, muted));
  const copy = '© ' + new Date(report.report.generatedAt).getUTCFullYear() + ' TrustSignal';
  d.text(copy, R - mono.widthOfTextAtSize(printable(copy), 6.8), 44, 6.8, mono, muted);
  const generated = 'Presentation generated ' + stamp(report.report.generatedAt) + ' · page 1 of 1';
  d.text(generated, R - sans.widthOfTextAtSize(printable(generated), 6.2), 33, 6.2, sans, faint);

  await pdf.attach(new TextEncoder().encode(documentReportJson(report)), documentReportFilename(report, 'json'), {
    mimeType: 'application/json', description: 'Original signed receipt and explicitly unsigned verification report',
    creationDate: new Date(report.report.generatedAt), modificationDate: new Date(report.report.generatedAt),
  });
  return new Uint8Array(await pdf.save());
}

class Drawer {
  constructor(private page: PDFPage, private labelFont: PDFFont) {}
  text(value: string, x: number, y: number, size: number, font: PDFFont, color: RGB = ink) {
    this.page.drawText(printable(value), { x, y, size, font, color });
  }
  label(value: string, x: number, y: number) {
    this.spaced(value, x, y, 7, this.labelFont, muted, 1.3);
  }
  spacedWidth(value: string, size: number, font: PDFFont, tracking: number) {
    const text = printable(value);
    return font.widthOfTextAtSize(text, size) + tracking * Math.max(0, text.length - 1);
  }
  spaced(value: string, x: number, y: number, size: number, font: PDFFont, color: RGB, tracking: number) {
    let cx = x;
    for (const char of printable(value)) {
      this.page.drawText(char, { x: cx, y, size, font, color });
      cx += font.widthOfTextAtSize(char, size) + tracking;
    }
  }
  rule(y: number) { this.page.drawLine({ start: { x: M, y }, end: { x: R, y }, thickness: 0.7, color: line }); }
  statusSquare(x: number, y: number, size: number, tone: 'match' | 'neutral' | 'error', color: RGB) {
    if (tone === 'neutral') { this.page.drawRectangle({ x, y, width: size, height: size, borderColor: color, borderWidth: 0.9 }); return; }
    this.page.drawRectangle({ x, y, width: size, height: size, color });
    const u = size / 10;
    if (tone === 'match') {
      this.page.drawLine({ start: { x: x + 2.4 * u, y: y + 5.2 * u }, end: { x: x + 4.3 * u, y: y + 3.2 * u }, thickness: 1.3 * u, color: white });
      this.page.drawLine({ start: { x: x + 4.3 * u, y: y + 3.2 * u }, end: { x: x + 7.8 * u, y: y + 7.2 * u }, thickness: 1.3 * u, color: white });
    } else {
      this.page.drawLine({ start: { x: x + 3 * u, y: y + 3 * u }, end: { x: x + 7 * u, y: y + 7 * u }, thickness: 1.3 * u, color: white });
      this.page.drawLine({ start: { x: x + 3 * u, y: y + 7 * u }, end: { x: x + 7 * u, y: y + 3 * u }, thickness: 1.3 * u, color: white });
    }
  }
  /** Word wrap; breakAnywhere splits long tokens (file names, hashes). Overflow is ellipsised, never silently dropped. */
  wrap(value: string, width: number, size: number, font: PDFFont, breakAnywhere: boolean, maxLines: number) {
    const lines: string[] = [];
    let current = '';
    const fits = (s: string) => font.widthOfTextAtSize(s, size) <= width;
    // Each piece records whether it continues the previous token (no space) — long tokens prefer to break after - _ . /
    const pieces = printable(value).split(/\s+/).filter(Boolean).flatMap((word) =>
      (breakAnywhere && !fits(word) ? word.split(/(?<=[-_./])/) : [word]).map((text, i) => ({ text, glued: i > 0 })));
    for (const { text, glued } of pieces) {
      const candidate = current ? current + (glued ? '' : ' ') + text : text;
      if (fits(candidate)) { current = candidate; continue; }
      if (current) { lines.push(current); current = ''; }
      if (fits(text) || !breakAnywhere) { current = text; continue; }
      for (const char of text) {
        if (!fits(current + char)) { lines.push(current); current = ''; }
        current += char;
      }
    }
    if (current) lines.push(current);
    if (lines.length > maxLines) {
      const kept = lines.slice(0, maxLines);
      let last = kept[maxLines - 1];
      while (last && !fits(last + '...')) last = last.slice(0, -1);
      kept[maxLines - 1] = last + '...';
      return kept;
    }
    return lines;
  }
}
