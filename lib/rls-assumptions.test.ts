import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("RLS enforcement assumptions", () => {
  it("only uses service-role Supabase client in webhook handler", () => {
    const projectRoot = process.cwd();
    const serverFiles = [
      "app/api/keys/route.ts",
      "app/api/keys/[keyId]/revoke/route.ts",
      "app/api/billing/checkout/route.ts",
      "app/api/billing/portal/route.ts",
      "app/api/billing/status/route.ts",
      "app/api/auth/login/route.ts",
      "app/api/auth/register/route.ts",
      "app/api/auth/me/route.ts",
      "app/api/auth/logout/route.ts",
      "app/api/auth/oauth/route.ts",
      "app/auth/callback/route.ts",
    ];

    for (const relPath of serverFiles) {
      const content = readFileSync(join(projectRoot, relPath), "utf8");
      expect(content.includes("createSupabaseAdminClient")).toBe(false);
      expect(content.includes("SUPABASE_SERVICE_ROLE_KEY")).toBe(false);
    }

    const webhookContent = readFileSync(
      join(projectRoot, "app/api/billing/webhook/route.ts"),
      "utf8",
    );
    expect(webhookContent.includes("createSupabaseAdminClient")).toBe(true);
  });

  it("keeps the customer dashboard behind Supabase auth and account-scoped key routes", () => {
    const projectRoot = process.cwd();
    const page = readFileSync(join(projectRoot, "app/dashboard/page.tsx"), "utf8");
    const dashboard = readFileSync(
      join(projectRoot, "app/dashboard/customer-dashboard.tsx"),
      "utf8",
    );

    expect(page.includes("supabase.auth.getUser()"), "dashboard must verify the session").toBe(
      true,
    );
    expect(page.includes("redirect('/sign-in')"), "unauthenticated users must be redirected").toBe(
      true,
    );
    expect(dashboard.includes("fetch('/api/keys'"), "key operations must use guarded routes").toBe(
      true,
    );
    expect(
      dashboard.includes("@/lib/customer-data"),
      "legacy service-role helper must stay removed",
    ).toBe(false);
    expect(dashboard.includes("SUPABASE_SERVICE_ROLE_KEY")).toBe(false);
    expect(
      dashboard.includes("/api/receipts/create"),
      "dashboard must not upload documents to an unsupported receipt route",
    ).toBe(false);
    expect(
      dashboard.includes("artifactHash"),
      "dashboard must not claim artifact comparison the API cannot perform",
    ).toBe(false);
    expect(
      dashboard.includes("fetch('/api/receipts'"),
      "receipt history must use the guarded tenant endpoint",
    ).toBe(true);
    expect(
      dashboard.includes("Persistent account history will appear here"),
      "dashboard must not describe tenant receipt history as unavailable",
    ).toBe(false);
  });

  it("keeps user API-key hashing inside the core API trust boundary", () => {
    const projectRoot = process.cwd();
    const keyRoute = readFileSync(join(projectRoot, "app/api/keys/route.ts"), "utf8");
    const revokeRoute = readFileSync(
      join(projectRoot, "app/api/keys/[keyId]/revoke/route.ts"),
      "utf8",
    );

    expect(keyRoute.includes("/api/v1/user/api-keys")).toBe(true);
    expect(keyRoute.includes("authorization: `Bearer ${accessToken}`")).toBe(true);
    expect(keyRoute.includes('scopes: ["read", "verify"]')).toBe(true);
    expect(keyRoute.includes('.from("api_keys")')).toBe(false);
    expect(keyRoute.includes("generateApiKeySecret")).toBe(false);
    expect(revokeRoute.includes('method: "DELETE"')).toBe(true);
    expect(revokeRoute.includes('.from("api_keys")')).toBe(false);
  });

  it("returns OAuth users to a trusted deployment origin", () => {
    const route = readFileSync(join(process.cwd(), "app/api/auth/oauth/route.ts"), "utf8");
    const callback = readFileSync(join(process.cwd(), "app/auth/callback/route.ts"), "utf8");
    const legacyStart = readFileSync(join(process.cwd(), "app/auth/sign-in/route.ts"), "utf8");

    expect(route.includes("resolveTrustedAppOrigin(req.url)")).toBe(true);
    expect(route.includes("sanitizeNextPath(next)")).toBe(true);
    expect(callback.includes("resolveTrustedAppOrigin(request.url)")).toBe(true);
    expect(callback.includes("sanitizeNextPath(searchParams.get('next'))")).toBe(true);
    expect(callback.includes("x-forwarded-host")).toBe(false);
    expect(legacyStart.includes("resolveTrustedAppOrigin(request.url)")).toBe(true);
    expect(legacyStart.includes("sanitizeNextPath(searchParams.get('next'))")).toBe(true);
  });

  it("starts browser OAuth through a direct server redirect", () => {
    const projectRoot = process.cwd();
    const signInForm = readFileSync(
      join(projectRoot, "components/sign-in-form.tsx"),
      "utf8",
    );
    const signUpForm = readFileSync(
      join(projectRoot, "components/sign-up-form.tsx"),
      "utf8",
    );
    const oauthStart = readFileSync(
      join(projectRoot, "app/auth/sign-in/route.ts"),
      "utf8",
    );

    for (const form of [signInForm, signUpForm]) {
      expect(form.includes('href="/auth/sign-in?provider=google&next=%2Fdashboard"')).toBe(true);
      expect(form.includes('href="/auth/sign-in?provider=github&next=%2Fdashboard"')).toBe(true);
      expect(form.includes('fetch("/api/auth/oauth"')).toBe(false);
      expect(form.includes("window.location.assign")).toBe(false);
    }

    expect(oauthStart.includes('new Set<Provider>(["google", "github"])')).toBe(true);
    expect(oauthStart.includes("ALLOWED_PROVIDERS.has(provider as Provider)")).toBe(true);
  });

  it("preserves PKCE and session cookies on OAuth redirect responses", () => {
    const projectRoot = process.cwd();
    const oauthStart = readFileSync(
      join(projectRoot, "app/auth/sign-in/route.ts"),
      "utf8",
    );
    const callback = readFileSync(
      join(projectRoot, "app/auth/callback/route.ts"),
      "utf8",
    );
    const routeClient = readFileSync(
      join(projectRoot, "lib/supabase/route.ts"),
      "utf8",
    );

    expect(oauthStart.includes("createSupabaseRouteClient(request)")).toBe(true);
    expect(oauthStart.includes("applyAuthCookies(NextResponse.redirect(data.url))")).toBe(true);
    expect(callback.includes("createSupabaseRouteClient(request)")).toBe(true);
    expect(callback.includes("applyAuthCookies(response)")).toBe(true);
    expect(routeClient.includes("request.cookies.getAll()")).toBe(true);
    expect(routeClient.includes("response.cookies.set(name, value, options)")).toBe(true);
    expect(routeClient.includes("response.headers.set(name, value)")).toBe(true);
  });
});
