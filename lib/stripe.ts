import Stripe from 'stripe';

/**
 * Stripe client — server-only.
 * Never import this in client components or expose the secret key.
 */
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) throw new Error('STRIPE_SECRET_KEY is required');
  return new Stripe(key, { apiVersion: '2026-04-22.dahlia', typescript: true });
}

/**
 * Plan definitions — quota limits keyed by Stripe price ID.
 * Free plan uses a sentinel (no Stripe subscription required).
 */
export const PLANS = {
  free: {
    name: 'Free',
    monthlyVerificationLimit: 1_000,
    stripePriceId: null
  },
  pro: {
    name: 'Pro',
    monthlyVerificationLimit: 100_000,
    stripePriceId: process.env.STRIPE_PRICE_ID_PRO ?? null
  },
  enterprise: {
    name: 'Enterprise',
    monthlyVerificationLimit: Infinity,
    stripePriceId: null // Custom pricing — handled off-band
  }
} as const;

export type PlanKey = keyof typeof PLANS;

export function getPlanFromPriceId(priceId: string | null): PlanKey {
  if (!priceId) return 'free';
  for (const [key, plan] of Object.entries(PLANS)) {
    if (plan.stripePriceId === priceId) return key as PlanKey;
  }
  return 'free';
}
