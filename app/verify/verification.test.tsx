import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
const { getUser } = vi.hoisted(() => ({ getUser: vi.fn() }));
vi.mock('@/lib/supabase/server', () => ({ createSupabaseServerClient: async () => ({ auth: { getUser } }) }));
vi.mock('next/navigation', () => ({ redirect: (url: string) => { throw new Error('redirect:' + url); }, notFound: () => { throw new Error('not-found'); } }));
import VerifyReceiptPage from './[receiptId]/page';
import { ArtifactReceiptView } from '../dashboard/artifact-receipt-view';
import { syntheticDocumentReceipt } from '@/lib/document-report-fixture';
const receipt = syntheticDocumentReceipt();

describe('private artifact verification', () => {
  it('requires a verified session and keeps the receipt destination', async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    await expect(VerifyReceiptPage({ params: Promise.resolve({ receiptId: receipt.receipt.receiptId }) })).rejects.toThrow('redirect:/sign-in?next=%2Fverify%2F' + receipt.receipt.receiptId);
    getUser.mockResolvedValue({ data: { user: { id: 'synthetic-user' } } });
    expect((await VerifyReceiptPage({ params: Promise.resolve({ receiptId: receipt.receipt.receiptId }) })).props.receiptId).toBe(receipt.receipt.receiptId);
    await expect(VerifyReceiptPage({ params: Promise.resolve({ receiptId: 'not-a-receipt' }) })).rejects.toThrow('not-found');
  });
  it('shows no match without file bytes and does not invent signed context', () => {
    const html = renderToStaticMarkup(createElement(ArtifactReceiptView, { receipt }));
    expect(html).toContain('NOT CHECKED'); expect(html).not.toContain('VERIFIED MATCH');
    expect(html).not.toContain('SIGNED EVENT CONTEXT'); expect(html).toContain('<details');
    expect(html).toContain('display metadata - not signed');
  });
  it('uses the same mismatch language without saying the displayed recorded hash was computed from the different file', () => {
    const html = renderToStaticMarkup(createElement(ArtifactReceiptView, { receipt, artifact: { sha256: 'c'.repeat(64), sizeBytes: 56 } }));
    expect(html).toContain('MISMATCH'); expect(html).not.toContain('Calculated from the selected artifact bytes.');
    expect(html).not.toContain('current lifecycle status passed');
  });
});
