import { NextResponse } from 'next/server';
import { resolveTrustedAppOrigin } from '@/lib/auth/origin';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const origin = resolveTrustedAppOrigin(request.url);
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(`${origin}/sign-in`);
}
