import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { CustomerDashboard } from './customer-dashboard';

export const metadata: Metadata = {
  title: 'Dashboard — TrustSignal',
  description: 'Manage your TrustSignal API keys and verification receipts.',
  robots: { index: false }
};

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  return <CustomerDashboard user={{ id: user.id, email: user.email ?? '' }} />;
}
