import React from 'react';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));
import { OperationsDashboard } from './operations-dashboard';
describe('document receipt entry', () => {
  it('exposes both machine-readable and human report downloads', () => {
    const source = readFileSync(new URL('./document-receipt-panel.tsx', import.meta.url), 'utf8');
    expect(source).toContain('Download JSON report');
    expect(source).toContain('Download PDF report');
  });
  it('offers file selection and a receipt action from the dashboard', () => {
    const html = renderToStaticMarkup(<OperationsDashboard user={{ email: 'synthetic@example.test' }} />);
    expect(html).toContain('Upload a document');
    expect(html).toContain('type="file"');
    expect(html).toContain('Get receipt');
    expect(html).toContain('class="ops-panel ops-document-panel"');
    expect(html).not.toContain('class="receipt-report');
  });
  it('preserves the existing light dashboard styling', () => {
    const css = readFileSync(new URL('./operations-dashboard.css', import.meta.url), 'utf8');
    expect(css).toContain('--ops-paper:#fafaf8');
    expect(css).toContain('background:#f2f1ec');
    expect(css).toContain('var(--font-fraunces),Georgia,serif');
    expect(css).not.toContain('--ops-paper:#101316');
    expect(css).not.toContain('background:#52dbc7');
  });
});
