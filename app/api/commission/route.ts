import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { TerritoryDoor } from '@/lib/types'

interface CommissionStructure {
  type: 'flat' | 'percentage' | 'tiered'
  rate: number
  minimum?: number
  tiers?: Array<{ min_deals: number; rate: number }>
}

interface CommissionPeriod {
  closes: number
  revenue: number
  earned: number
}

interface CommissionResponse {
  structure: CommissionStructure
  currency: string
  today: CommissionPeriod
  thisWeek: CommissionPeriod
  thisMonth: CommissionPeriod
  projected: number
}

function calcEarnings(structure: CommissionStructure, closes: number, revenue: number): number {
  if (structure.type === 'flat') {
    return closes * structure.rate
  }
  if (structure.type === 'percentage') {
    return revenue * (structure.rate / 100)
  }
  if (structure.type === 'tiered' && structure.tiers && structure.tiers.length > 0) {
    const sortedTiers = [...structure.tiers].sort((a, b) => b.min_deals - a.min_deals)
    const matchedTier = sortedTiers.find((t) => closes >= t.min_deals)
    return matchedTier ? closes * matchedTier.rate : closes * structure.rate
  }
  return 0
}

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Read commission structure from profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('commission_structure, commission_currency')
    .eq('id', user.id)
    .single()

  const structure: CommissionStructure = (profile?.commission_structure as CommissionStructure) ?? {
    type: 'flat',
    rate: 0,
  }
  const currency = (profile?.commission_currency as string) ?? 'USD'

  // Date ranges
  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]

  // Week start (Monday)
  const dayOfWeek = now.getDay()
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - daysToMonday)
  const weekStartStr = weekStart.toISOString().split('T')[0]

  // Month start
  const monthStartStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

  // Fetch all doors with visits
  const { data: doors, error: doorsError } = await supabase
    .from('doors_territory_doors')
    .select('visits')
    .eq('user_id', user.id)

  if (doorsError) {
    return NextResponse.json({ error: doorsError.message }, { status: 500 })
  }

  const allDoors = (doors as Pick<TerritoryDoor, 'visits'>[]) ?? []

  // Aggregate by period
  const today: CommissionPeriod = { closes: 0, revenue: 0, earned: 0 }
  const thisWeek: CommissionPeriod = { closes: 0, revenue: 0, earned: 0 }
  const thisMonth: CommissionPeriod = { closes: 0, revenue: 0, earned: 0 }

  for (const door of allDoors) {
    for (const visit of door.visits) {
      if (!visit.closed) continue
      const rev = visit.revenue ?? 0

      if (visit.date === todayStr) {
        today.closes++
        today.revenue += rev
      }
      if (visit.date >= weekStartStr) {
        thisWeek.closes++
        thisWeek.revenue += rev
      }
      if (visit.date >= monthStartStr) {
        thisMonth.closes++
        thisMonth.revenue += rev
      }
    }
  }

  today.earned = calcEarnings(structure, today.closes, today.revenue)
  thisWeek.earned = calcEarnings(structure, thisWeek.closes, thisWeek.revenue)
  thisMonth.earned = calcEarnings(structure, thisMonth.closes, thisMonth.revenue)

  // Projected: extrapolate thisMonth based on days elapsed
  const dayOfMonth = now.getDate()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const projected =
    dayOfMonth > 0 ? Math.round((thisMonth.earned / dayOfMonth) * daysInMonth) : 0

  const response: CommissionResponse = {
    structure,
    currency,
    today,
    thisWeek,
    thisMonth,
    projected,
  }

  return NextResponse.json(response)
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { structure, currency } = body

  // Validate structure
  if (!structure || typeof structure !== 'object') {
    return NextResponse.json({ error: 'Invalid commission structure' }, { status: 400 })
  }

  if (!['flat', 'percentage', 'tiered'].includes(structure.type)) {
    return NextResponse.json({ error: 'Invalid commission type' }, { status: 400 })
  }

  if (typeof structure.rate !== 'number' || structure.rate < 0) {
    return NextResponse.json({ error: 'Invalid commission rate' }, { status: 400 })
  }

  const updateData: Record<string, unknown> = { commission_structure: structure }
  if (currency && typeof currency === 'string') {
    updateData.commission_currency = currency
  }

  const { error } = await supabase.from('profiles').update(updateData).eq('id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
