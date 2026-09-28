import type { DocumentEnvelope } from './document-receipts';

export type ArtifactObservation = { sha256: string; sizeBytes: number; mediaType?: string };
export type ReceiptStatus = 'VERIFIED MATCH' | 'MISMATCH' | 'INVALID RECEIPT' | 'REVOKED' | 'SUPERSEDED' | 'EXPIRED' | 'UNAVAILABLE' | 'NOT CHECKED';
export const SANDBOX_MESSAGE = 'This receipt was issued in a test environment and is not for production reliance.';
export const CLAIM_LIMITATION = 'It does not certify that the original content was true, complete, authorized, compliant, or legally admissible. Unless an independent timestamp proof is explicitly shown, the receipt records TrustSignal’s service issue time and is not an independently trusted proof of when the underlying artifact was created.';
export const VALID_CLAIM = 'This receipt confirms that the submitted artifact matches the recorded fingerprint and that the receipt’s signature and current lifecycle status passed verification at the time shown above. ' + CLAIM_LIMITATION;
const messages: Record<ReceiptStatus, string> = {
  'VERIFIED MATCH': 'The submitted artifact matches this signed receipt.',
  MISMATCH: 'The submitted artifact does not match the fingerprint recorded in this receipt.',
  'INVALID RECEIPT': 'The receipt signature or integrity could not be validated. Do not rely on this receipt.',
  REVOKED: 'This receipt was revoked. Do not use it as an active integrity record.',
  SUPERSEDED: 'A newer receipt replaced this record. Verify the replacement receipt before relying on it.',
  EXPIRED: 'This receipt has expired. Do not use it as an active integrity record.',
  UNAVAILABLE: 'TrustSignal could not verify this receipt at this time. Check service status, access rights, and receipt details.',
  'NOT CHECKED': 'Select an artifact to compare with the fingerprint recorded in this receipt.',
};

export function receiptPresentation(receipt: DocumentEnvelope | null, artifact?: ArtifactObservation) {
  let status: ReceiptStatus = 'UNAVAILABLE';
  if (receipt) {
    const v = receipt.verification;
    if (!v.signatureVerified || v.signatureStatus !== 'verified' || !v.integrityVerified) status = 'INVALID RECEIPT';
    else if (receipt.revoked || receipt.lifecycle?.status === 'revoked') status = 'REVOKED';
    else if (receipt.lifecycle?.status === 'superseded') status = 'SUPERSEDED';
    else if (receipt.lifecycle?.status === 'expired') status = 'EXPIRED';
    else if (!v.verified) status = 'UNAVAILABLE';
    else if (!artifact) status = 'NOT CHECKED';
    else status = artifact.sha256 === receipt.document.sha256 && artifact.sizeBytes === receipt.document.sizeBytes ? 'VERIFIED MATCH' : 'MISMATCH';
  }
  const environment = receipt?.verificationContext?.environment;
  const lifecycle = receipt?.revoked ? 'revoked' : receipt?.lifecycle?.status ?? (receipt ? 'active' : 'unknown');
  const algorithm = receipt?.receipt.receiptSignature.alg;
  const signatureAlgorithm = algorithm === 'ES256' ? 'ES256 (ECDSA P-256 / SHA-256)' : algorithm === 'EdDSA' ? 'Ed25519' : 'Unknown';
  const signatureValid = receipt?.verification.signatureVerified && receipt.verification.signatureStatus === 'verified' && receipt.verification.integrityVerified;
  const message = status === 'REVOKED' && receipt?.lifecycle?.changedAt
    ? `This receipt was revoked on ${utcTime(receipt.lifecycle.changedAt)}. Do not use it as an active integrity record.`
    : status === 'INVALID RECEIPT' && !receipt?.verification.signatureVerified
      ? 'The receipt signature could not be validated. Do not rely on this receipt.' : messages[status];
  return {
    status, message, signatureAlgorithm,
    tone: status === 'VERIFIED MATCH' ? 'valid' : ['MISMATCH', 'INVALID RECEIPT', 'REVOKED', 'SUPERSEDED', 'EXPIRED'].includes(status) ? 'error' : 'caution',
    environment: environment === 'production' ? 'Production' : environment === 'sandbox' ? 'Sandbox' : 'Unconfirmed',
    environmentMessage: environment === 'sandbox' ? SANDBOX_MESSAGE : environment !== 'production'
      ? 'Issuing environment has not been confirmed. Do not assume production provenance.' : null,
    lifecycle: lifecycle[0].toUpperCase() + lifecycle.slice(1),
    checks: [
      { name: 'Artifact match', result: !artifact ? 'Not checked' : status === 'VERIFIED MATCH' ? 'Match' : status === 'MISMATCH' ? 'Mismatch' : 'Not confirmed', meaning: !artifact ? 'No artifact supplied for this check' : status === 'VERIFIED MATCH' ? 'Submitted artifact matches the recorded fingerprint' : status === 'MISMATCH' ? 'Submitted artifact differs from the recorded fingerprint' : 'Receipt verification must pass first' },
      { name: 'Receipt signature', result: signatureValid ? 'Valid' : 'Not validated', meaning: signatureValid ? `${signatureAlgorithm} signature verified` : 'Do not rely on the receipt signature' },
      { name: 'Receipt lifecycle', result: lifecycle[0].toUpperCase() + lifecycle.slice(1), meaning: lifecycle === 'active' ? 'Receipt is not revoked in the current service response' : 'Do not use as an active integrity record' },
    ],
    claimBoundary: status === 'VERIFIED MATCH' ? VALID_CLAIM : 'This report records the verification outcome shown above; it does not establish a verified artifact match. ' + CLAIM_LIMITATION,
  };
}

export function utcTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Unavailable' : date.toISOString().replace('T', ' ').replace('Z', ' UTC');
}
