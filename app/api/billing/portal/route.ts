import { NextResponse } from "next/server";
import { canManageBilling } from "@/lib/auth/permissions";
import { requireAuthenticatedContext } from "@/lib/auth/require-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getStripeServerClient } from "@/lib/stripe/server";

export async function POST() {
  const auth = await requireAuthenticatedContext();
  if (!auth.ok) {
    return auth.response;
  }

  if (!canManageBilling(auth.context.account.role)) {
    return NextResponse.json(
      { error: "Insufficient permissions to manage billing" },
      { status: 403 },
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    return NextResponse.json({ error: "NEXT_PUBLIC_APP_URL is not set" }, { status: 500 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("account_id", auth.context.account.accountId)
    .maybeSingle();

  if (!subscription?.stripe_customer_id) {
    return NextResponse.json({ error: "No Stripe customer on this account" }, { status: 404 });
  }

  const stripe = getStripeServerClient();
  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${appUrl}/get-your-api-key`,
  });

  return NextResponse.json({ url: session.url });
}
