import { z } from 'zod';
import { documentEnvelopeSchema, readDocumentReceipt, type DocumentEnvelope } from './document-receipts';
import { receiptPresentation, type ArtifactObservation } from './document-receipt-status';

export type DocumentReport = DocumentEnvelope & {
  report: {
    schemaVersion: '1.1';
    title: 'Artifact integrity receipt';
    generatedAt: string;
    trustContext: 'sandbox' | 'unconfirmed' | 'production';
    signatureScope: 'receipt-only';
    verificationSource: 'authenticated-api';
    fraudAssessment: { status: 'not-performed'; score: null; findings: [] };
    artifactObservation?: ArtifactObservation;
    presentation: ReturnType<typeof receiptPresentation>;
  };
};
export type ReportOptions = { generatedAt?: Date; localReview?: boolean; artifact?: ArtifactObservation };
const artifactSchema = z.object({
  sha256: z.string().regex(/^[a-f0-9]{64}$/), sizeBytes: z.number().int().min(0).max(25 * 1024 * 1024),
  mediaType: z.string().max(100).regex(/^[a-z0-9.+-]+\/[a-z0-9.+-]+$/i).optional(),
  name: z.string().min(1).max(255).optional(),
}).strict();

export function buildDocumentReport(value: unknown, options: ReportOptions = {}): DocumentReport {
  const envelope = documentEnvelopeSchema.parse(value);
  const generatedAt = options.generatedAt ?? new Date();
  if (options.localReview) envelope.verificationContext = { checkedAt: envelope.verificationContext?.checkedAt ?? generatedAt.toISOString(), environment: 'sandbox' };
  const artifact = options.artifact ? artifactSchema.parse(options.artifact) : undefined;
  return {
    ...documentEnvelopeSchema.parse(envelope),
    // This presentation context is outside the signed receipt. Never reinterpret riskScore: 0 as fraud analysis.
    report: {
      schemaVersion: '1.1', title: 'Artifact integrity receipt',
      generatedAt: generatedAt.toISOString(),
      trustContext: envelope.verificationContext?.environment ?? 'unconfirmed',
      signatureScope: 'receipt-only', verificationSource: 'authenticated-api',
      fraudAssessment: { status: 'not-performed', score: null, findings: [] },
      ...(artifact ? { artifactObservation: artifact } : {}),
      presentation: receiptPresentation(envelope, artifact),
    },
  };
}

export async function loadDocumentReport(receiptId: string, options: ReportOptions = {}): Promise<DocumentReport> {
  return buildDocumentReport(await readDocumentReceipt(receiptId), options);
}

export function documentReportJson(report: DocumentReport): string {
  return JSON.stringify(report, null, 2) + '\n';
}

export function documentReportFilename(report: DocumentReport, extension: 'json' | 'pdf'): string {
  return 'trustsignal-report-' + report.receipt.receiptId + '.' + extension;
}
