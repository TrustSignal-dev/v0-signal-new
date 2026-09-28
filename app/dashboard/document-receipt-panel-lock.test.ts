import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Guard: the panel serialises actions with a lock. If an effect is cleaned up while a
// receipt check is in flight (route change, receipt ID cleared, unmount), the cancelled
// check never reaches its own release path. The cleanup must release the lock and the
// checking state, or every later "Open receipt" is ignored and the status shows
// "Checking receipt…" indefinitely.
describe('document receipt panel lock release', () => {
  const source = readFileSync(new URL('./document-receipt-panel.tsx', import.meta.url), 'utf8');
  const cleanups = source.match(/return \(\) => \{[^}]*\};/g) ?? [];

  it('releases the lock and checking state in every effect cleanup', () => {
    expect(cleanups.length).toBe(2);
    for (const cleanup of cleanups) {
      expect(cleanup).toContain('cancelled = true');
      expect(cleanup).toContain('locked.current = false');
      expect(cleanup).toContain('setBusy(false)');
      expect(cleanup).toContain('setCheckingReceipt(false)');
    }
  });

  it('keeps a single live status region for the receipt check', () => {
    expect(source.match(/role="status"/g)?.length ?? 0).toBeLessThanOrEqual(1);
  });
});
