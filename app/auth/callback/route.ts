import { NextRequest, NextResponse } from 'next/server';
import { resolveTrustedAppOrigin } from '@/lib/auth/origin';
import { sanitizeNextPath } from '@/lib/auth/redirect';
import { createSupabaseRouteClient } from '@/lib/supabase/route';

/**
 * OAuth callback handler.
 * Supabase redirects here after GitHub (or any OAuth provider) completes.
 * We exchange the code for a session, then redirect to the customer dashboard.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const origin = resolveTrustedAppOrigin(request.url);
  const code = searchParams.get('code');
  const next = sanitizeNextPath(searchParams.get('next'));

  if (!code) {
    return NextResponse.redirect(`${origin}/sign-in?error=missing_code`);
  }

  const { supabase, applyAuthCookies } = createSupabaseRouteClient(request);
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('[auth/callback] OAuth exchange failed', {
      code: error.code,
      name: error.name,
      status: error.status,
      verifierCookiePresent: request.cookies
        .getAll()
        .some(({ name }) => name.endsWith('-code-verifier')),
    });
    const response = NextResponse.redirect(`${origin}/sign-in?error=oauth_failed`);
    return applyAuthCookies(response);
  }

  const response = NextResponse.redirect(new URL(next, origin));
  return applyAuthCookies(response);
}
