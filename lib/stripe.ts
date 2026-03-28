import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set')
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-03-25.dahlia',
    })
  }
  return _stripe
}

export const PLANS = {
  free: {
    name: 'Free',
    priceId: null,
    features: ['unlimited_territories', 'unlimited_doors', 'gps_tracking', 'basic_stats'],
  },
  pro: {
    name: 'Pro',
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    features: ['ai_insights', 'pitch_recording', 'photo_capture', 'share_cards', 'csv_export', 'sun_mode'],
  },
} as const

export type PlanType = keyof typeof PLANS

export function isPremiumFeature(feature: string): boolean {
  return (PLANS.pro.features as readonly string[]).includes(feature) &&
    !(PLANS.free.features as readonly string[]).includes(feature)
}
