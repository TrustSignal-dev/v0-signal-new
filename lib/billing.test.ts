import { describe, expect, it } from "vitest";
import Stripe from "stripe";
import { mapStripeSubscriptionStatus, parseWebhookEvent } from "./billing";

describe("billing helpers", () => {
  it("maps Stripe subscription statuses", () => {
    expect(mapStripeSubscriptionStatus("trialing")).toBe("trial");
    expect(mapStripeSubscriptionStatus("active")).toBe("active");
    expect(mapStripeSubscriptionStatus("past_due")).toBe("past_due");
    expect(mapStripeSubscriptionStatus("canceled")).toBe("canceled");
  });

  it("verifies webhook signatures and rejects invalid signatures", () => {
    const stripe = new Stripe("sk_test_123");
    const secret = "whsec_test_secret";
    const payload = JSON.stringify({ id: "evt_1", object: "event", type: "ping", data: { object: {} } });

    const signature = Stripe.webhooks.generateTestHeaderString({
      payload,
      secret,
    });

    const event = parseWebhookEvent({
      body: payload,
      signature,
      secret,
      stripe,
    });

    expect(event.id).toBe("evt_1");

    expect(() =>
      parseWebhookEvent({
        body: payload,
        signature: `${signature}x`,
        secret,
        stripe,
      }),
    ).toThrowError();
  });
});
