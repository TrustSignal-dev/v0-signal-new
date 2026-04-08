import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Initiates the GitHub OAuth flow via Supabase Auth.
 * Called from the sign-in page via a form action or direct link.
 *
 * After GitHub completes, Supabase redirects to /auth/callback?code=...
 */
export async function GET(request: Request) {
  const { origin, searchParams } = new URL(request.url);
  const next = searchParams.get('next') ?? '/dashboard';

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      scopes: 'read:user user:email'
    }
  });

  if (error || !data.url) {
    console.error('[auth/sign-in] OAuth initiation failed:', error?.message);
    return NextResponse.redirect(`${origin}/sign-in?error=oauth_init_failed`);
  }

  return NextResponse.redirect(data.url);
}
