import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { CustomerDashboard } from './customer-dashboard';

export const metadata: Metadata = {
  title: 'Dashboard — TrustSignal',
  description: 'Manage your TrustSignal API keys and verification receipts.',
  robots: { index: false }
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/sign-in');
  }

  return <CustomerDashboard user={{ id: user.id, email: user.email ?? '' }} />;
}
