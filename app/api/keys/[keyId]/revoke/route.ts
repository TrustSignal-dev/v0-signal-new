import { NextRequest, NextResponse } from "next/server";
import { buildApiKeyRevokedEvent } from "@/lib/api-keys";
import { canManageApiKeys } from "@/lib/auth/permissions";
import { requireAuthenticatedContext } from "@/lib/auth/require-user";
import { enforceRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Params = {
  params: Promise<{
    keyId: string;
  }>;
};

export async function POST(req: NextRequest, { params }: Params) {
  const auth = await requireAuthenticatedContext();
  if (!auth.ok) {
    return auth.response;
  }

  if (!canManageApiKeys(auth.context.account.role)) {
    return NextResponse.json(
      { error: "Insufficient permissions to revoke API keys" },
      { status: 403 },
    );
  }

  const limit = enforceRateLimit({
    key: `keys:revoke:${auth.context.user.id}`,
    max: 20,
    windowMs: 60_000,
  });

  if (!limit.ok) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const { keyId } = await params;
  const body = (await req.json().catch(() => ({}))) as { reason?: string };
  const reason = body.reason?.trim() || "revoked_by_user";

  const supabase = await createSupabaseServerClient();
  const now = new Date().toISOString();

  const { data: revoked, error } = await supabase
    .from("api_keys")
    .update({
      revoked_at: now,
      revoked_by: auth.context.user.id,
      revoked_reason: reason,
    })
    .eq("id", keyId)
    .eq("account_id", auth.context.account.accountId)
    .is("revoked_at", null)
    .select("id, revoked_at, revoked_reason")
    .single();

  if (error || !revoked) {
    return NextResponse.json(
      { error: "API key not found or already revoked" },
      { status: 404 },
    );
  }

  await supabase.from("api_key_events").insert(
    buildApiKeyRevokedEvent({
      accountId: auth.context.account.accountId,
      apiKeyId: revoked.id,
      actorUserId: auth.context.user.id,
      reason,
      revokedAt: revoked.revoked_at,
    }),
  );

  return NextResponse.json({ key: revoked });
}
