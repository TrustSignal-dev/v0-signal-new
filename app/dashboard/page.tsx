import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { CustomerDashboard } from './customer-dashboard';
import { OperationsDashboard } from './operations-dashboard';

export const metadata: Metadata = {
  title: 'Dashboard — TrustSignal',
  description: 'Manage your TrustSignal API keys and verification receipts.',
  robots: { index: false }
};

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ section?: string | string[] }> }) {
  const { section } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const nextPath = typeof section === 'string' ? `/dashboard?section=${encodeURIComponent(section)}` : '/dashboard';
    redirect(`/sign-in?next=${encodeURIComponent(nextPath)}`);
  }

  if (section === 'billing' || section === 'team' || section === 'settings' || section === 'audit' || section === 'integrations') {
    return <CustomerDashboard key={`${user.id}:${section}`} user={{ email: user.email ?? '' }} initialSection={section} />;
  }
  const activeSection = section === 'api-keys' || section === 'receipts' ? section : 'overview';
  return <OperationsDashboard key={`${user.id}:${activeSection}`} user={{ email: user.email ?? '' }} section={activeSection} />;
}
