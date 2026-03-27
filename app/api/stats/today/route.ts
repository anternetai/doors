import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { TerritoryDoor } from '@/lib/types'

export interface TodayStats {
  knocked: number
  answered: number
  pitched: number
  closed: number
  revenue: number
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

  // Today's date in YYYY-MM-DD (server local — we use ISO which is UTC, acceptable for stats)
  const today = new Date().toISOString().split('T')[0]

  // Fetch all doors for this user
  const { data: doors, error } = await supabase
    .from('doors_territory_doors')
    .select('visits')
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const stats: TodayStats = { knocked: 0, answered: 0, pitched: 0, closed: 0, revenue: 0 }

  for (const door of (doors as Pick<TerritoryDoor, 'visits'>[]) ?? []) {
    for (const visit of door.visits) {
      if (visit.date !== today) continue
      stats.knocked++
      if (visit.answered) stats.answered++
      if (visit.pitched) stats.pitched++
      if (visit.closed) {
        stats.closed++
        if (visit.revenue) stats.revenue += visit.revenue
      }
    }
  }

  return NextResponse.json(stats)
}
