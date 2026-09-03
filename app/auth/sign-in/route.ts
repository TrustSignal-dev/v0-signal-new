import { NextResponse } from 'next/server';
import type { Provider } from '@supabase/supabase-js';
import { resolveTrustedAppOrigin } from '@/lib/auth/origin';
import { sanitizeNextPath } from '@/lib/auth/redirect';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const ALLOWED_PROVIDERS = new Set<Provider>(["google", "github"]);

/**
 * Initiates an allowed OAuth flow via a direct server redirect.
 *
 * The response commits Supabase's PKCE verifier cookie before the browser
 * leaves TrustSignal. After the provider completes, Supabase redirects to
 * /auth/callback?code=...
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = resolveTrustedAppOrigin(request.url);
  const next = sanitizeNextPath(searchParams.get('next'));
  const provider = searchParams.get('provider') ?? 'github';

  if (!ALLOWED_PROVIDERS.has(provider as Provider)) {
    return NextResponse.redirect(`${origin}/sign-in?error=oauth_provider_unsupported`);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider as Provider,
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      ...(provider === 'github' ? { scopes: 'read:user user:email' } : {}),
    }
  });

  if (error || !data.url) {
    console.error('[auth/sign-in] OAuth initiation failed');
    return NextResponse.redirect(`${origin}/sign-in?error=oauth_init_failed`);
  }

  return NextResponse.redirect(data.url);
}
