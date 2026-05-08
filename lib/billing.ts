import Stripe from "stripe";

export type BillingStatus = "trial" | "active" | "past_due" | "canceled" | "inactive";

export function mapStripeSubscriptionStatus(
  status: Stripe.Subscription.Status,
): BillingStatus {
  if (status === "trialing") {
    return "trial";
  }
  if (status === "active") {
    return "active";
  }
  if (status === "past_due") {
    return "past_due";
  }
  return "canceled";
}

export function parseWebhookEvent(params: {
  body: string;
  signature: string;
  secret: string;
  stripe: Stripe;
}) {
  return params.stripe.webhooks.constructEvent(
    params.body,
    params.signature,
    params.secret,
  );
}
