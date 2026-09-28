import { describe, expect, it } from 'vitest';
import { receiptIssuerEnvironment } from './document-receipt-environment';
describe('issuing environment provenance', () => {
  it('requires an exact server-configured key identity and fails closed on missing or invalid configuration', () => {
    expect(receiptIssuerEnvironment('key-1', '{"key-1":"production","test-1":"sandbox"}')).toBe('production');
    expect(receiptIssuerEnvironment('test-1', '{"test-1":"sandbox"}')).toBe('sandbox');
    for (const config of [undefined, '{invalid', '{"key-1":"prod"}', '{}']) expect(receiptIssuerEnvironment('key-1', config)).toBe('unconfirmed');
    expect(receiptIssuerEnvironment('key-1-other', '{"key-1":"production"}')).toBe('unconfirmed');
    expect(receiptIssuerEnvironment('constructor', '{}')).toBe('unconfirmed');
  });
});
