import { NextRequest, NextResponse } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { signInWithPassword, signUp, applyAuthCookies } = vi.hoisted(() => ({
  signInWithPassword: vi.fn(), signUp: vi.fn(), applyAuthCookies: vi.fn(),
}));
vi.mock('@/lib/supabase/route', () => ({
  createSupabaseRouteClient: () => ({
    supabase: { auth: { signInWithPassword, signUp } }, applyAuthCookies,
  }),
}));
vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: async () => ({ auth: { signInWithPassword, signUp } }),
}));

import { POST as login } from './login/route';
import { POST as register } from './register/route';

function request(path: string, body: unknown) {
  return new NextRequest(`https://trustsignal.example.test/api/auth/${path}`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
  });
}
const credentials = { email: 'synthetic@example.test', password: 'synthetic-password-only' };

describe('password authentication routes', () => {
  afterEach(() => vi.unstubAllEnvs());
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('TRUSTSIGNAL_APP_ORIGIN', 'https://trustsignal.example.test');
    signInWithPassword.mockResolvedValue({ data: { user: { id: 'synthetic-user' }, session: {} }, error: null });
    signUp.mockResolvedValue({ data: { user: { id: 'synthetic-user' }, session: null }, error: null });
    applyAuthCookies.mockImplementation((response: NextResponse) => {
      response.cookies.set('test-session-marker', 'synthetic');
      return response;
    });
  });

  it('commits login cookies on a non-cacheable successful response', async () => {
    const response = await login(request('login', credentials));
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.cookies.get('test-session-marker')?.value).toBe('synthetic');
    expect(await response.json()).toEqual({ ok: true, user: { id: 'synthetic-user', displayName: null } });
  });

  it('distinguishes unconfirmed email from an incorrect password without leaking provider details', async () => {
    signInWithPassword.mockResolvedValue({ data: { user: null }, error: { status: 400, code: 'email_not_confirmed', message: 'private provider detail' } });
    const response = await login(request('login', credentials));
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: 'Check your email and confirm your account before signing in.' });
  });

  it.each([login, register])('returns a safe unavailable response if the auth service fails', async (route) => {
    signInWithPassword.mockRejectedValue(new Error('private credential or host'));
    signUp.mockRejectedValue(new Error('private credential or host'));
    const response = await route(request('login', credentials));
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain('private');
  });

  it.each([login, register])('validates input before contacting Supabase', async (route) => {
    const response = await route(request('login', { email: [], password: {} }));
    expect(response.status).toBe(400);
    expect(signInWithPassword).not.toHaveBeenCalled();
    expect(signUp).not.toHaveBeenCalled();
  });

  it('returns signup confirmation to the same-origin callback with the key destination', async () => {
    const response = await register(request('register', { ...credentials, next: '/dashboard?section=api-keys' }));
    expect(response.status).toBe(201);
    expect(signUp).toHaveBeenCalledWith(expect.objectContaining({ options: expect.objectContaining({
      emailRedirectTo: 'https://trustsignal.example.test/auth/callback?next=%2Fdashboard%3Fsection%3Dapi-keys',
    }) }));
    expect(applyAuthCookies).toHaveBeenCalled();
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(await response.json()).toEqual({ ok: true, requiresEmailVerification: true });
  });

  it('rejects an external email-confirmation destination', async () => {
    await register(request('register', { ...credentials, next: 'https://attacker.example' }));
    expect(signUp).toHaveBeenCalledWith(expect.objectContaining({ options: expect.objectContaining({
      emailRedirectTo: 'https://trustsignal.example.test/auth/callback?next=%2Fdashboard',
    }) }));
  });
});
