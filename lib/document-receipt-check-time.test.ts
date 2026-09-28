import { describe, expect, it } from 'vitest';
import { documentEnvelopeSchema } from './document-receipts';

// Validation-only metadata. No receipt, document, credential or signing fixture.
const verification = {
  verified: false, integrityVerified: false, signatureVerified: false,
  signatureStatus: 'not-verified', proofStatus: 'not-applicable',
};
const schema = documentEnvelopeSchema.innerType().shape.verification;

describe('receipt check-time compatibility', () => {
  it('accepts the existing unsigned API check-completion field', () => {
    expect(schema.safeParse({ ...verification, checkedAt: '2026-09-27T00:00:00.000Z' }).success).toBe(true);
  });
  it('keeps older deployed responses compatible without inventing a time', () => {
    const result = schema.parse(verification);
    expect(result).not.toHaveProperty('checkedAt');
  });
  it('rejects malformed time and undeclared success claims', () => {
    expect(schema.safeParse({ ...verification, checkedAt: 'yesterday' }).success).toBe(false);
    expect(schema.safeParse({ ...verification, documentMatch: true }).success).toBe(false);
    expect(schema.safeParse({ ...verification, anchorConfirmed: true }).success).toBe(false);
  });
});
