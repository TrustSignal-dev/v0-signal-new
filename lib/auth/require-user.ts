import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  resolvePrimaryAccount,
  type AccountContext,
} from "@/lib/auth/account";

export type AuthenticatedContext = {
  user: User;
  account: AccountContext;
};

export async function requireAuthenticatedContext(): Promise<
  { ok: true; context: AuthenticatedContext } | { ok: false; response: NextResponse }
> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Not authenticated" }, { status: 401 }),
    };
  }

  const account = await resolvePrimaryAccount(supabase, user);
  if (!account) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "No account is associated with this user" },
        { status: 403 },
      ),
    };
  }

  return { ok: true, context: { user, account } };
}
