import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { TerritoryDoor, DoorVisit } from '@/lib/types'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get all territories and doors
  const { data: territories } = await supabase
    .from('territories')
    .select('*')
    .eq('user_id', user.id)

  const { data: doors } = await supabase
    .from('doors_territory_doors')
    .select('*')
    .eq('user_id', user.id)

  if (!territories || !doors) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }

  // Build territory name lookup
  const territoryNames: Record<string, string> = {}
  for (const t of territories) {
    territoryNames[t.id] = t.name
  }

  // Analyze per territory
  const territoryInsights = territories.map((t) => {
    const territoryDoors = doors.filter((d: TerritoryDoor) => d.territory_id === t.id)
    const totalDoors = territoryDoors.length

    let answered = 0, pitched = 0, closed = 0, notInterested = 0, revenue = 0
    const visitDates: string[] = []

    for (const door of territoryDoors) {
      const visits = (door.visits || []) as DoorVisit[]
      for (const v of visits) {
        if (v.date) visitDates.push(v.date)
        if (v.answered) answered++
        if (v.pitched) pitched++
        if (v.closed) closed++
        if (v.not_interested) notInterested++
        if (v.revenue) revenue += v.revenue
      }
    }

    const contactRate = totalDoors > 0 ? answered / totalDoors : 0
    const pitchRate = answered > 0 ? pitched / answered : 0
    const closeRate = pitched > 0 ? closed / pitched : 0
    const revenuePerDoor = totalDoors > 0 ? revenue / totalDoors : 0

    // Grade: A-F based on weighted score
    const score = (contactRate * 25) + (pitchRate * 25) + (closeRate * 30) + (Math.min(revenuePerDoor / 15, 1) * 20)
    const grade = score >= 80 ? 'A' : score >= 65 ? 'B' : score >= 50 ? 'C' : score >= 35 ? 'D' : 'F'

    // Find best day of week
    const dayCount: Record<string, number> = {}
    for (const dateStr of visitDates) {
      const day = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long' })
      dayCount[day] = (dayCount[day] || 0) + 1
    }
    const bestDay = Object.entries(dayCount).sort(([, a], [, b]) => b - a)[0]?.[0] || null

    return {
      name: t.name,
      grade,
      score: Math.round(score),
      totalDoors,
      contactRate,
      pitchRate,
      closeRate,
      revenue,
      revenuePerDoor,
      bestDay,
    }
  })

  // Overall insights
  const totalDoors = doors.length
  const allVisits = doors.flatMap((d: TerritoryDoor) => (d.visits || []) as DoorVisit[])
  const totalAnswered = allVisits.filter((v: DoorVisit) => v.answered).length
  const totalPitched = allVisits.filter((v: DoorVisit) => v.pitched).length
  const totalClosed = allVisits.filter((v: DoorVisit) => v.closed).length
  const totalRevenue = allVisits.reduce((sum: number, v: DoorVisit) => sum + (v.revenue || 0), 0)

  // Today's activity
  const today = new Date().toISOString().split('T')[0]
  const todayVisits = allVisits.filter((v: DoorVisit) => v.date === today)
  const todayDoors = todayVisits.length
  const todayAnswered = todayVisits.filter((v: DoorVisit) => v.answered).length
  const todayClosed = todayVisits.filter((v: DoorVisit) => v.closed).length
  const todayRevenue = todayVisits.reduce((sum: number, v: DoorVisit) => sum + (v.revenue || 0), 0)

  // Streak calculation
  let streak = 0
  const dateSet = new Set(allVisits.map((v: DoorVisit) => v.date).filter(Boolean))
  const checkDate = new Date()
  // Check if today has activity, if not start from yesterday
  if (!dateSet.has(checkDate.toISOString().split('T')[0])) {
    checkDate.setDate(checkDate.getDate() - 1)
  }
  while (dateSet.has(checkDate.toISOString().split('T')[0])) {
    streak++
    checkDate.setDate(checkDate.getDate() - 1)
  }

  // Action items
  const actions: string[] = []
  const sortedTerritories = [...territoryInsights].sort((a, b) => b.score - a.score)
  const bestTerritory = sortedTerritories[0]
  const worstTerritory = sortedTerritories[sortedTerritories.length - 1]

  if (bestTerritory && worstTerritory && bestTerritory.name !== worstTerritory.name) {
    actions.push(`Focus on ${bestTerritory.name} (${bestTerritory.grade}) — it's your highest performer. Deprioritize ${worstTerritory.name} (${worstTerritory.grade}).`)
  }

  const overallContactRate = totalDoors > 0 ? totalAnswered / totalDoors : 0
  if (overallContactRate < 0.20) {
    actions.push('Contact rate is below 20%. Try knocking between 4-7pm weekdays or Saturday 10am-4pm.')
  }

  const overallPitchRate = totalAnswered > 0 ? totalPitched / totalAnswered : 0
  if (overallPitchRate < 0.50) {
    actions.push('Pitch rate is below 50%. Work on your opener — you\'re losing people before the pitch.')
  }

  if (todayDoors === 0) {
    actions.push('No doors knocked today. Get after it.')
  } else if (todayDoors < 20) {
    actions.push(`${todayDoors} doors today. Push to 30+ to maximize your territory coverage.`)
  }

  if (streak >= 5) {
    actions.push(`🔥 ${streak}-day streak! Keep the momentum.`)
  }

  return NextResponse.json({
    overall: {
      totalDoors,
      totalAnswered,
      totalPitched,
      totalClosed,
      totalRevenue,
      contactRate: overallContactRate,
      pitchRate: overallPitchRate,
      closeRate: totalPitched > 0 ? totalClosed / totalPitched : 0,
      streak,
    },
    today: {
      doors: todayDoors,
      answered: todayAnswered,
      closed: todayClosed,
      revenue: todayRevenue,
    },
    territories: territoryInsights,
    actions,
  })
}
