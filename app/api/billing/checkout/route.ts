import { NextRequest, NextResponse } from "next/server";
import { canManageBilling } from "@/lib/auth/permissions";
import { requireAuthenticatedContext } from "@/lib/auth/require-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getStripeServerClient } from "@/lib/stripe/server";

export async function POST(req: NextRequest) {
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

  const stripePriceId = process.env.STRIPE_PRICE_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!stripePriceId || !appUrl) {
    return NextResponse.json(
      { error: "Stripe billing is not configured" },
      { status: 500 },
    );
  }

  const body = (await req.json().catch(() => ({}))) as { returnTo?: string };
  const returnTo = body.returnTo?.startsWith("/") ? body.returnTo : "/get-your-api-key";

  const supabase = await createSupabaseServerClient();
  const stripe = getStripeServerClient();

  const { data: account } = await supabase
    .from("accounts")
    .select("id, name")
    .eq("id", auth.context.account.accountId)
    .single();

  if (!account) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  const { data: currentSubscription } = await supabase
    .from("subscriptions")
    .select("account_id, stripe_customer_id")
    .eq("account_id", auth.context.account.accountId)
    .maybeSingle();

  let customerId = currentSubscription?.stripe_customer_id ?? null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: auth.context.user.email,
      name: account.name,
      metadata: {
        account_id: auth.context.account.accountId,
      },
    });

    customerId = customer.id;

    await supabase.from("subscriptions").upsert(
      {
        account_id: auth.context.account.accountId,
        stripe_customer_id: customerId,
        plan: "free",
        status: "inactive",
      },
      { onConflict: "account_id" },
    );
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: stripePriceId, quantity: 1 }],
    success_url: `${appUrl}${returnTo}?billing=success`,
    cancel_url: `${appUrl}${returnTo}?billing=canceled`,
    allow_promotion_codes: true,
    subscription_data: {
      metadata: {
        account_id: auth.context.account.accountId,
      },
    },
    metadata: {
      account_id: auth.context.account.accountId,
    },
  });

  return NextResponse.json({ url: session.url });
}
