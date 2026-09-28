import React from 'react';
import type { DocumentEnvelope } from '@/lib/document-receipts';
import { utcTime } from '@/lib/document-receipt-status';

export type ReceiptCheckValue = Pick<DocumentEnvelope, 'verification' | 'verificationContext' | 'revoked' | 'lifecycle'>;

export function SavedReceiptStatus({ value, checking = false, unavailable = false }: {
  value: ReceiptCheckValue | null;
  checking?: boolean;
  unavailable?: boolean;
}) {
  let label = 'Receipt unavailable';
  let detail = 'The current receipt check could not be completed. Do not rely on an earlier result.';
  const completed = !checking && !unavailable ? value : null;
  if (checking) {
    label = 'Checking receipt…';
    detail = 'Checking the saved receipt’s signature, integrity and current status.';
  } else if (completed) {
    const verification = completed.verification;
    if (completed.revoked || completed.lifecycle?.status === 'revoked') {
      label = 'Receipt revoked';
      detail = 'This receipt is no longer an active integrity record.';
    } else if (completed.lifecycle?.status === 'superseded' || completed.lifecycle?.status === 'expired') {
      label = completed.lifecycle.status === 'expired' ? 'Receipt expired' : 'Receipt superseded';
      detail = 'Do not rely on this receipt as a current integrity record.';
    } else if (!verification.signatureVerified || verification.signatureStatus !== 'verified' || !verification.integrityVerified) {
      label = 'Receipt not verified';
      detail = 'The receipt’s signature or integrity could not be validated. Do not rely on it.';
    } else if (verification.verified) {
      label = 'Receipt verified';
      detail = 'The saved receipt passed its signature, integrity and current-status checks. Document comparison is a separate check.';
    }
  }
  const checkedAt = completed?.verification.checkedAt;
  const receivedAt = completed?.verificationContext?.checkedAt;
  return <section className="ops-receipt-check" aria-label="Saved receipt verification" aria-live="polite" role="status">
    <strong>{label}</strong>
    <p>{detail}</p>
    {completed && <p>{checkedAt ? <>Receipt checked at: <time dateTime={checkedAt}>{utcTime(checkedAt)}</time></>
      : receivedAt ? <>Verification response received at: <time dateTime={receivedAt}>{utcTime(receivedAt)}</time></>
        : 'Check time unavailable.'}</p>}
    <p className="ops-muted">Anchoring is optional. No confirmed anchor proof is supplied with this document receipt.</p>
  </section>;
}
