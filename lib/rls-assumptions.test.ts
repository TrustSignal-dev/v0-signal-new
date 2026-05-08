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
});
