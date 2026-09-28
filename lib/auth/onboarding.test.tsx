import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getUser, push } = vi.hoisted(() => ({ getUser: vi.fn(), push: vi.fn() }));
vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: async () => ({ auth: { getUser } }),
}));
vi.mock('next/navigation', () => ({
  redirect: (path: string) => { throw new Error(`redirect:${path}`); },
  useRouter: () => ({ push, refresh: vi.fn() }),
}));

import GetYourApiKeyPage from '../../app/get-your-api-key/page';
import SignInPage from '../../app/sign-in/page';
import SignUpPage from '../../app/sign-up/page';
import TrustSignalNav from '../../components/landing/TrustSignalNav';
import { SignInForm } from '../../components/sign-in-form';
import { SignUpForm } from '../../components/sign-up-form';
import DashboardPage from '../../app/dashboard/page';
import { OperationsDashboard } from '../../app/dashboard/operations-dashboard';

const next = '/dashboard?section=api-keys';
const props = { searchParams: Promise.resolve({ next }) };

describe('API key onboarding', () => {
  beforeEach(() => getUser.mockResolvedValue({ data: { user: null } }));

  it('displays safe OAuth feedback without reflecting provider errors', async () => {
    const page = await SignInPage({ searchParams: Promise.resolve({ error: 'oauth_failed' }) });
    expect(renderToStaticMarkup(page)).toContain('role="alert"');
    expect(renderToStaticMarkup(page)).toContain('Sign-in could not be completed');
    const arbitrary = await SignInPage({ searchParams: Promise.resolve({ error: 'private-provider-message' }) });
    expect(renderToStaticMarkup(arbitrary)).not.toContain('private-provider-message');
  });

  it('exposes a homepage key link outside the hidden mobile navigation', () => {
    const html = renderToStaticMarkup(createElement(TrustSignalNav));
    expect(html).toMatch(/<a[^>]*class="ts-navcta"[^>]*href="\/get-your-api-key"/);
    expect(html).toContain('Get an API key');
  });

  it('routes the old key-generator URL to authenticated dashboard key management', async () => {
    await expect(GetYourApiKeyPage()).rejects.toThrow(`redirect:${next}`);
  });

  it('keeps the selected dashboard behind validated authentication', async () => {
    await expect(DashboardPage({ searchParams: Promise.resolve({ section: 'api-keys' }) }))
      .rejects.toThrow(`redirect:/sign-in?next=${encodeURIComponent(next)}`);
    getUser.mockResolvedValue({ data: { user: { id: 'synthetic-user', email: 'synthetic@example.test' } } });
    const page = await DashboardPage({ searchParams: Promise.resolve({ section: 'api-keys' }) });
    expect(page.type).toBe(OperationsDashboard);
    expect(page.props.section).toBe('api-keys');
  });

  it.each(['api-keys', 'settings'])('replaces account state on identity changes in %s', async (section) => {
    const pages = [];
    for (const id of ['synthetic-owner-a', 'synthetic-owner-b']) {
      getUser.mockResolvedValue({ data: { user: { id, email: `${id}@example.test` } } });
      pages.push(await DashboardPage({ searchParams: Promise.resolve({ section }) }));
    }
    // React discards component state when its reconciliation key changes.
    expect(pages[0].key).not.toBe(pages[1].key);
    expect(pages[0].key).toBeTruthy();
    expect(pages[1].props.user.email).toBe('synthetic-owner-b@example.test');
  });

  it('does not render prototype data or a healthy status before the API responds', () => {
    const html = renderToStaticMarkup(createElement(OperationsDashboard, { user: { email: 'synthetic@example.test' } }));
    expect(html).toContain('Operations');
    expect(html).toContain('Checking');
    expect(html).toContain('Not connected');
    expect(html).not.toContain('1,284,902');
    expect(html).not.toContain('ACME');
    expect(html).not.toContain('>Connected<');
  });

  it.each([['sign in', SignInPage], ['sign up', SignUpPage]])(
    'preserves the destination for an existing session on %s', async (_name, Page) => {
      getUser.mockResolvedValue({ data: { user: { id: 'synthetic-user' } } });
      await expect(Page(props)).rejects.toThrow(`redirect:${next}`);
      await expect(Page({ searchParams: Promise.resolve({ next: '//attacker.example' }) }))
        .rejects.toThrow('redirect:/dashboard');
    },
  );

  it.each([['sign in', SignInForm, '/sign-up'], ['sign up', SignUpForm, '/sign-in']])(
    'preserves the destination across OAuth and the alternate %s form', (_name, Form, alternate) => {
      const html = renderToStaticMarkup(createElement(Form, { nextPath: next }));
      expect(html).toContain(`provider=google&amp;next=${encodeURIComponent(next)}`);
      expect(html).toContain(`provider=github&amp;next=${encodeURIComponent(next)}`);
      expect(html).toContain(`${alternate}?next=${encodeURIComponent(next)}`);
    },
  );
});
