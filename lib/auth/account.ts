import type { SupabaseClient, User } from "@supabase/supabase-js";

export type AccountContext = {
  accountId: string;
  role: "owner" | "admin" | "member";
};

export async function resolvePrimaryAccount(
  supabase: SupabaseClient,
  user: User,
): Promise<AccountContext | null> {
  const { data, error } = await supabase
    .from("account_members")
    .select("account_id, role")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  if (data.role !== "owner" && data.role !== "admin" && data.role !== "member") {
    return null;
  }

  return {
    accountId: data.account_id,
    role: data.role,
  };
}
