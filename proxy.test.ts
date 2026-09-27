import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

const { createServerClient } = vi.hoisted(() => ({ createServerClient: vi.fn() }));
vi.mock('@supabase/ssr', () => ({ createServerClient }));
afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); vi.clearAllMocks(); });

describe('dashboard session gate', () => {
  it('preserves the key destination when configuration is missing and stays closed', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '');
    const { proxy } = await import('./proxy');
    const response = await proxy(new NextRequest('https://trustsignal.invalid/dashboard?section=api-keys'));
    const destination = new URL(response.headers.get('location')!);
    expect(response.status).toBe(307);
    expect(destination.pathname).toBe('/sign-in');
    expect(destination.searchParams.get('next')).toBe('/dashboard?section=api-keys');
    expect(destination.searchParams.has('section')).toBe(false);
  });

  it('carries refreshed cookies and no-cache headers even when redirecting to sign-in', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://synthetic.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'synthetic-public-key');
    createServerClient.mockImplementation((_url, _key, options) => ({
      auth: { getUser: async () => {
        options.cookies.setAll([{ name: 'synthetic-session', value: '', options: { maxAge: 0 } }], { 'Cache-Control': 'private, no-store', Pragma: 'no-cache' });
        return { data: { user: null }, error: null };
      } },
    }));
    const { proxy } = await import('./proxy');
    const response = await proxy(new NextRequest('https://trustsignal.invalid/dashboard?section=api-keys'));
    expect(response.status).toBe(307);
    expect(new URL(response.headers.get('location')!).searchParams.get('next')).toBe('/dashboard?section=api-keys');
    expect(response.cookies.get('synthetic-session')?.value).toBe('');
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('pragma')).toBe('no-cache');
  });
});
