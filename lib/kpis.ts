import type { TerritoryDoor, TerritoryKpis, Recommendation } from './types'

export function computeKpis(doors: TerritoryDoor[]): TerritoryKpis {
  const total_doors = doors.length
  let doors_answered = 0
  let doors_pitched = 0
  let doors_closed = 0
  let doors_not_interested = 0
  let total_revenue = 0

  for (const door of doors) {
    for (const visit of door.visits) {
      if (visit.answered) doors_answered++
      if (visit.pitched) doors_pitched++
      if (visit.closed) {
        doors_closed++
        if (visit.revenue) total_revenue += visit.revenue
      }
      if (visit.not_interested) doors_not_interested++
    }
  }

  const contact_rate = total_doors > 0 ? doors_answered / total_doors : 0
  const pitch_rate = doors_answered > 0 ? doors_pitched / doors_answered : 0
  const close_rate = doors_pitched > 0 ? doors_closed / doors_pitched : 0
  const avg_revenue_per_door = total_doors > 0 ? total_revenue / total_doors : 0

  return {
    total_doors,
    doors_answered,
    doors_pitched,
    doors_closed,
    doors_not_interested,
    contact_rate,
    pitch_rate,
    close_rate,
    total_revenue,
    avg_revenue_per_door,
  }
}

export function computeRecommendations(kpis: TerritoryKpis): Recommendation[] {
  const recs: Recommendation[] = []

  if (kpis.total_doors >= 20 && kpis.contact_rate < 0.15) {
    recs.push({
      type: 'warning',
      title: 'Territory Saturated',
      message: 'Very low contact rate. Consider moving to a fresh block.',
    })
  } else if (kpis.total_doors >= 10 && kpis.contact_rate < 0.20) {
    recs.push({
      type: 'info',
      title: 'Try Different Times',
      message: 'Contact rate is low. Try evenings or weekends when people are home.',
    })
  }

  if (kpis.doors_pitched >= 5 && kpis.pitch_rate < 0.50) {
    recs.push({
      type: 'info',
      title: 'Improve Your Opener',
      message: 'Less than half of conversations turn into pitches. Work on your opening line.',
    })
  }

  if (kpis.close_rate > 0.25) {
    recs.push({
      type: 'success',
      title: 'Crushing It',
      message: `You're closing ${Math.round(kpis.close_rate * 100)}% of your pitches. Keep it up!`,
    })
  }

  return recs
}
