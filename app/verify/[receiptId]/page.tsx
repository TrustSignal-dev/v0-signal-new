import { redirect, notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { PrivateReceiptVerification } from '../private-receipt-verification';

export const metadata = { title: 'Verify a receipt | TrustSignal', robots: { index: false, follow: false } };

export default async function VerifyReceiptPage({ params }: { params: Promise<{ receiptId: string }> }) {
  const { receiptId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in?next=' + encodeURIComponent('/verify/' + receiptId));
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(receiptId)) notFound();
  return <PrivateReceiptVerification receiptId={receiptId} />;
}
