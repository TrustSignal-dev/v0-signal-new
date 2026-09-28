import type { DocumentEnvelope } from './document-receipts';

// Synthetic shape only. Never import into a production page or service.
export function syntheticDocumentReceipt(): DocumentEnvelope {
  return {
    kind: 'document-integrity', document: { algorithm: 'sha256', sha256: 'a'.repeat(64), sizeBytes: 56 }, revoked: false,
    receipt: {
      receiptVersion: '1.0', receiptId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', createdAt: '2026-09-26T17:21:07.419Z',
      policyProfile: 'document-digest-v1', inputsCommitment: 'a'.repeat(64),
      checks: [{ checkId: 'document-digest-v1', status: 'PASS', details: '{}' }], decision: 'FLAG',
      reasons: ['Fingerprint only'], riskScore: 0, verifierId: 'trustsignal', signing_key_id: 'synthetic-sandbox-key',
      receiptHash: '0x' + 'b'.repeat(64), receiptSignature: { signature: 'synthetic-shape-only-not-a-real-signature', alg: 'ES256', kid: 'synthetic-sandbox-key' },
    },
    verification: { verified: true, integrityVerified: true, signatureVerified: true, signatureStatus: 'verified', proofStatus: 'not-applicable' },
  };
}
