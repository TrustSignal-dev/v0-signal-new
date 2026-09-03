import { NextResponse } from 'next/server';
import { resolveTrustedAppOrigin } from '@/lib/auth/origin';
import { sanitizeNextPath } from '@/lib/auth/redirect';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * OAuth callback handler.
 * Supabase redirects here after GitHub (or any OAuth provider) completes.
 * We exchange the code for a session, then redirect to the customer dashboard.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = resolveTrustedAppOrigin(request.url);
  const code = searchParams.get('code');
  const next = sanitizeNextPath(searchParams.get('next'));

  if (!code) {
    return NextResponse.redirect(`${origin}/sign-in?error=missing_code`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('[auth/callback] OAuth exchange failed');
    return NextResponse.redirect(`${origin}/sign-in?error=oauth_failed`);
  }

  return NextResponse.redirect(new URL(next, origin));
}
