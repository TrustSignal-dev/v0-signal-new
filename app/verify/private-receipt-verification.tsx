'use client';
import Link from 'next/link';
import { useCallback, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { DocumentReceiptPanel } from '../dashboard/document-receipt-panel';
import '../dashboard/operations-dashboard.css';

export function PrivateReceiptVerification({ receiptId }: { receiptId: string }) {
  const [expired, setExpired] = useState(false);
  const expire = useCallback(() => setExpired(true), []);
  return <main className="ops-console receipt-private-page"><div className="ops-content">
    <Link href="/dashboard?section=receipts"><ArrowLeft size={16} aria-hidden /> Back to workspace</Link>
    <h1>Verify a receipt</h1>
    {expired ? <p role="alert">Your session expired. <Link href={'/sign-in?next=' + encodeURIComponent('/verify/' + receiptId)}>Sign in again</Link></p>
      : <DocumentReceiptPanel key={receiptId} initialReceiptId={receiptId} onSessionExpired={expire} />}
  </div></main>;
}
