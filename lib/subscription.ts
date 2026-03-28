import { PLANS } from './stripe'

export async function getUserPlan(supabase: {
  from: (table: string) => {
    select: (cols: string) => {
      eq: (col: string, val: string) => {
        single: () => Promise<{ data: { plan?: string; stripe_customer_id?: string; subscription_status?: string } | null }>
      }
    }
  }
}, userId: string): Promise<'free' | 'pro'> {
  const { data } = await supabase
    .from('profiles')
    .select('plan, stripe_customer_id, subscription_status')
    .eq('id', userId)
    .single()

  if (data?.subscription_status === 'active' && data?.plan === 'pro') return 'pro'
  return 'free'
}

export function canAccessFeature(_plan: 'free' | 'pro', _feature: string): boolean {
  // During beta, everyone gets everything
  return true
  // After beta:
  // if (plan === 'pro') return true
  // return (PLANS.free.features as readonly string[]).includes(feature)
}

// Re-export for convenience
export { PLANS }
