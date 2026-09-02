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
  });

  it("returns OAuth users to the deployment that initiated sign-in", () => {
    const route = readFileSync(join(process.cwd(), "app/api/auth/oauth/route.ts"), "utf8");

    expect(route.includes("req.nextUrl.origin")).toBe(true);
    expect(route.includes("NEXT_PUBLIC_APP_URL")).toBe(false);
    expect(route.includes('!next.startsWith("//")')).toBe(true);
  });
});
