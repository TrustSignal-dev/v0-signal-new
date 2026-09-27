import { z } from 'zod';

// Match historical signing keys against server configuration, never a URL or client claim.
export function receiptIssuerEnvironment(kid: string, configuration: string | undefined) {
  const parsed = z.record(z.enum(['production', 'sandbox'])).safeParse((() => {
    try { return JSON.parse(configuration ?? '{}'); } catch { return null; }
  })());
  if (!parsed.success || !Object.hasOwn(parsed.data, kid)) return 'unconfirmed' as const;
  return parsed.data[kid];
}
