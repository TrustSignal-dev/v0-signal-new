import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { CustomerDashboard } from './customer-dashboard';

export const metadata: Metadata = {
  title: 'Authenticated Dashboard — TrustSignal',
  description: 'Authenticated TrustSignal dashboard for API keys and verification receipts when the deployed access surface is enabled.',
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
