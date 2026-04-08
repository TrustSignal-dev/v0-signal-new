import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getStripe, PLANS } from '@/lib/stripe';

/**
 * POST /api/stripe/create-checkout
 *
 * Creates a Stripe Checkout session for the authenticated customer.
 * On success, redirects to Stripe's hosted checkout page.
 *
 * Body: { plan: 'pro' }
 */
export async function POST(request: Request) {
  const { origin } = new URL(request.url);

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  let plan: string;
  try {
    const body = await request.json() as { plan?: string };
    plan = body.plan ?? 'pro';
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const planConfig = PLANS[plan as keyof typeof PLANS];
  if (!planConfig || !planConfig.stripePriceId) {
    return NextResponse.json({ error: 'invalid_plan' }, { status: 400 });
  }

  // Resolve or create the Stripe customer ID for this user.
  const stripe = getStripe();
  const serviceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceUrl || !serviceKey) {
    return NextResponse.json({ error: 'server_config_error' }, { status: 500 });
  }

  // Fetch existing customer record (may have a stripe_customer_id).
  const dbRes = await fetch(
    `${serviceUrl}/rest/v1/customers?user_id=eq.${user.id}&select=id,stripe_customer_id`,
    {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`
      },
      cache: 'no-store'
    }
  );

  type CustomerRow = { id: string; stripe_customer_id: string | null };
  const [customerRow] = (dbRes.ok ? await dbRes.json() as CustomerRow[] : []);

  let stripeCustomerId = customerRow?.stripe_customer_id ?? null;

  if (!stripeCustomerId) {
    // Create a new Stripe customer and save the ID.
    const stripeCustomer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: { supabase_user_id: user.id }
    });
    stripeCustomerId = stripeCustomer.id;

    if (customerRow?.id) {
      await fetch(
        `${serviceUrl}/rest/v1/customers?id=eq.${customerRow.id}`,
        {
          method: 'PATCH',
          headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal'
          },
          body: JSON.stringify({ stripe_customer_id: stripeCustomerId })
        }
      );
    }
  }

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    mode: 'subscription',
    line_items: [{ price: planConfig.stripePriceId, quantity: 1 }],
    success_url: `${origin}/dashboard?checkout=success`,
    cancel_url: `${origin}/dashboard?checkout=cancelled`,
    metadata: { supabase_user_id: user.id, plan }
  });

  if (!session.url) {
    return NextResponse.json({ error: 'checkout_failed' }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
