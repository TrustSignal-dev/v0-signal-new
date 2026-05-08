import { NextResponse } from "next/server";
import { requireAuthenticatedContext } from "@/lib/auth/require-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const auth = await requireAuthenticatedContext();
  if (!auth.ok) {
    return auth.response;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select(
      "account_id, stripe_customer_id, stripe_subscription_id, plan, status, current_period_end, cancel_at_period_end",
    )
    .eq("account_id", auth.context.account.accountId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Failed to fetch billing status" }, { status: 400 });
  }

  return NextResponse.json({
    billing: data ?? {
      account_id: auth.context.account.accountId,
      plan: "free",
      status: "inactive",
      current_period_end: null,
      cancel_at_period_end: false,
      stripe_customer_id: null,
      stripe_subscription_id: null,
    },
  });
}
