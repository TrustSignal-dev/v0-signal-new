import { NextRequest, NextResponse } from "next/server";
import {
  buildApiKeyCreatedEvent,
  buildApiKeyMetadata,
  generateApiKeySecret,
} from "@/lib/api-keys";
import { canManageApiKeys } from "@/lib/auth/permissions";
import { requireAuthenticatedContext } from "@/lib/auth/require-user";
import { enforceRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ApiKeyRow = Record<string, unknown>;

function pickString(row: ApiKeyRow, keys: string[], fallback = "") {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }
  return fallback;
}

function pickStringOrNull(row: ApiKeyRow, keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }
  return null;
}

function pickStringArray(row: ApiKeyRow, keys: string[], fallback: string[] = []) {
  for (const key of keys) {
    const value = row[key];
    if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
      return value as string[];
    }
  }
  return fallback;
}

function normalizeApiKey(row: ApiKeyRow) {
  return {
    id: pickString(row, ["id"]),
    name: pickString(row, ["name", "key_name", "label", "display_name"], "API key"),
    key_prefix: pickString(row, ["key_prefix", "prefix", "token_prefix"], ""),
    last4: pickStringOrNull(row, ["last4", "key_last4", "suffix"]),
    scopes: pickStringArray(row, ["scopes"]),
    created_at: pickString(row, ["created_at"]),
    last_used_at: pickStringOrNull(row, ["last_used_at"]),
    revoked_at: pickStringOrNull(row, ["revoked_at"]),
    revoked_reason: pickStringOrNull(row, ["revoked_reason"]),
    created_by: pickStringOrNull(row, ["created_by"]),
    revoked_by: pickStringOrNull(row, ["revoked_by"]),
  };
}

export async function GET() {
  const auth = await requireAuthenticatedContext();
  if (!auth.ok) {
    return auth.response;
  }

  const supabase = await createSupabaseServerClient();
  let { data, error } = await supabase
    .from("api_keys")
    .select("*")
    .eq("account_id", auth.context.account.accountId)
    .order("created_at", { ascending: false });

  // Fall back for deployments where created_at is unavailable in the exposed schema.
  if (error?.code === "42703") {
    ({ data, error } = await supabase
      .from("api_keys")
      .select("*")
      .eq("account_id", auth.context.account.accountId));
  }

  if (error) {
    return NextResponse.json(
      { error: `Failed to fetch API keys: ${error.message}` },
      { status: 400 },
    );
  }

  return NextResponse.json({ keys: (data ?? []).map((row) => normalizeApiKey(row as ApiKeyRow)) });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuthenticatedContext();
  if (!auth.ok) {
    return auth.response;
  }

  if (!canManageApiKeys(auth.context.account.role)) {
    return NextResponse.json(
      { error: "Insufficient permissions to create API keys" },
      { status: 403 },
    );
  }

  const limit = enforceRateLimit({
    key: `keys:create:${auth.context.user.id}`,
    max: 10,
    windowMs: 60_000,
  });

  if (!limit.ok) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const body = (await req.json()) as { name?: string; scopes?: string[] };
  const name = body.name?.trim();
  const scopes = Array.isArray(body.scopes) ? body.scopes : ["verify:write", "verify:read"];

  if (!name || name.length < 1 || name.length > 120) {
    return NextResponse.json({ error: "Name must be 1-120 characters" }, { status: 400 });
  }

  const secret = generateApiKeySecret();
  const metadata = buildApiKeyMetadata(secret);
  const supabase = await createSupabaseServerClient();

  const baseInsert = {
    account_id: auth.context.account.accountId,
    key_hash: metadata.keyHash,
    scopes,
    created_by: auth.context.user.id,
  };

  const insertVariants: Array<Record<string, unknown>> = [
    { ...baseInsert, name, key_prefix: metadata.keyPrefix, last4: metadata.last4 },
    { ...baseInsert, key_name: name, key_prefix: metadata.keyPrefix, last4: metadata.last4 },
    { ...baseInsert, name, prefix: metadata.keyPrefix, last4: metadata.last4 },
    { ...baseInsert, label: name, prefix: metadata.keyPrefix, last4: metadata.last4 },
    baseInsert,
  ];

  let inserted: ApiKeyRow | null = null;
  let insertError: { code?: string; message: string } | null = null;

  for (const payload of insertVariants) {
    const attempt = await supabase.from("api_keys").insert(payload).select("*").single();
    if (attempt.data) {
      inserted = attempt.data as ApiKeyRow;
      insertError = null;
      break;
    }

    if (!attempt.error) {
      continue;
    }

    insertError = { code: attempt.error.code, message: attempt.error.message };

    // Try next shape when a column is unknown or a required renamed field is missing.
    if (attempt.error.code === "42703" || attempt.error.code === "23502") {
      continue;
    }

    break;
  }

  if (insertError || !inserted) {
    return NextResponse.json(
      {
        error: `Could not create API key${insertError ? `: ${insertError.message}` : ""}`,
      },
      { status: 400 },
    );
  }

  await supabase.from("api_key_events").insert(
    buildApiKeyCreatedEvent({
      accountId: auth.context.account.accountId,
      apiKeyId: pickString(inserted, ["id"]),
      actorUserId: auth.context.user.id,
      name,
      scopes,
    }),
  );

  return NextResponse.json(
    {
      key: {
        ...normalizeApiKey(inserted),
        plaintext: secret,
      },
    },
    { status: 201 },
  );
}
