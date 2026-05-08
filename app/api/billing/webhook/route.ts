import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { mapStripeSubscriptionStatus, parseWebhookEvent } from "@/lib/billing";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStripeServerClient } from "@/lib/stripe/server";

function toIsoOrNull(unixSeconds?: number | null) {
  if (!unixSeconds) {
    return null;
  }
  return new Date(unixSeconds * 1000).toISOString();
}

async function syncSubscription(stripeSubscription: Stripe.Subscription) {
  const customerMetaAccountId =
    typeof stripeSubscription.customer === "string"
      ? null
      : "metadata" in stripeSubscription.customer
        ? stripeSubscription.customer.metadata.account_id
        : null;

  const accountId =
    stripeSubscription.metadata.account_id ??
    customerMetaAccountId;

  if (!accountId) {
    return;
  }

  const plan = stripeSubscription.items.data[0]?.price.nickname ?? "paid";
  const status = mapStripeSubscriptionStatus(stripeSubscription.status);
  const admin = createSupabaseAdminClient();

  await admin.from("subscriptions").upsert(
    {
      account_id: accountId,
      stripe_customer_id:
        typeof stripeSubscription.customer === "string"
          ? stripeSubscription.customer
          : stripeSubscription.customer.id,
      stripe_subscription_id: stripeSubscription.id,
      plan,
      status,
      current_period_end: toIsoOrNull(
        stripeSubscription.items.data[0]?.current_period_end ?? null,
      ),
      cancel_at_period_end: stripeSubscription.cancel_at_period_end,
    },
    { onConflict: "account_id" },
  );

  await admin
    .from("accounts")
    .update({ billing_plan: plan, billing_status: status })
    .eq("id", accountId);
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook is not configured" }, { status: 400 });
  }

  const body = await req.text();
  const stripe = getStripeServerClient();

  let event: Stripe.Event;
  try {
    event = parseWebhookEvent({
      body,
      signature,
      secret: webhookSecret,
      stripe,
    });
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    await syncSubscription(event.data.object as Stripe.Subscription);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.subscription && typeof session.subscription === "string") {
      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      await syncSubscription(subscription);
    }
  }

  return NextResponse.json({ received: true });
}
