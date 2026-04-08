import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe, getPlanFromPriceId } from '@/lib/stripe';

/**
 * POST /api/stripe/webhook
 *
 * Receives Stripe webhook events and updates customer plan + quota.
 *
 * Handled events:
 *   - checkout.session.completed         — initial subscription created
 *   - customer.subscription.updated      — plan change
 *   - customer.subscription.deleted      — cancellation → downgrade to free
 *   - payment_intent.payment_failed      — log only (Stripe handles retry)
 *
 * Security: all events verified against STRIPE_WEBHOOK_SECRET.
 */
export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: 'missing_signature' }, { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('[stripe/webhook] signature verification failed:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'invalid_signature' }, { status: 400 });
  }

  const serviceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceUrl || !serviceKey) {
    console.error('[stripe/webhook] Supabase config missing');
    return NextResponse.json({ error: 'server_config_error' }, { status: 500 });
  }

  const headers = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
    Prefer: 'return=minimal'
  };

  async function updateCustomerPlan(stripeCustomerId: string, plan: string) {
    await fetch(
      `${serviceUrl}/rest/v1/customers?stripe_customer_id=eq.${stripeCustomerId}`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ plan })
      }
    );
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== 'subscription' || !session.customer) break;

      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      const priceId = subscription.items.data[0]?.price?.id ?? null;
      const plan = getPlanFromPriceId(priceId);

      await updateCustomerPlan(session.customer as string, plan);

      console.log('[stripe/webhook] checkout completed', { customer: session.customer, plan });
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const priceId = subscription.items.data[0]?.price?.id ?? null;
      const plan = subscription.status === 'active' ? getPlanFromPriceId(priceId) : 'free';

      await updateCustomerPlan(subscription.customer as string, plan);

      console.log('[stripe/webhook] subscription updated', { customer: subscription.customer, plan, status: subscription.status });
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      await updateCustomerPlan(subscription.customer as string, 'free');

      console.log('[stripe/webhook] subscription deleted, downgraded to free', { customer: subscription.customer });
      break;
    }

    case 'payment_intent.payment_failed': {
      const pi = event.data.object as Stripe.PaymentIntent;
      console.warn('[stripe/webhook] payment_intent.payment_failed', {
        customer: pi.customer,
        amount: pi.amount,
        error: pi.last_payment_error?.message
      });
      break;
    }

    default:
      // Unhandled event — acknowledge and move on.
      break;
  }

  return NextResponse.json({ received: true });
}
