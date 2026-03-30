import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import type { TerritoryDoor, DoorVisit } from '@/lib/types'
import { SupabaseClient } from '@supabase/supabase-js'

let _anthropic: Anthropic | null = null
function getAnthropic(): Anthropic {
  if (!_anthropic) {
    _anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    })
  }
  return _anthropic
}

const SYSTEM_PROMPT = `You are Doors, an AI sales coach built into a door-to-door sales tracker. You help reps knock more doors, close more deals, and earn more money.

Personality: direct, motivating, data-driven. No fluff. Talk like a coach, not a chatbot. Keep responses under 3 sentences unless explaining something complex.

You can check territories, stats, commission, recommend where to knock, and log doors. Use the tools available to you to answer questions with real data.

When setting up commission, walk through it conversationally:
1. Flat per deal, percentage, or tiered?
2. Get the rate
3. Confirm and save

When recommending a territory, consider contact rate, close rate, time of day, and recency.`

// --- Tool definitions ---

const tools: Anthropic.Tool[] = [
  {
    name: 'get_territories',
    description:
      'Get all territories for the current user with KPIs (contact rate, close rate, revenue, etc.)',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_territory_detail',
    description:
      'Get detailed info about a specific territory including all doors and computed KPIs plus recommendations.',
    input_schema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: 'Name of the territory' },
      },
      required: ['name'],
    },
  },
  {
    name: 'get_today_stats',
    description: "Get today's door-knocking stats: knocked, answered, pitched, closed, revenue.",
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_revisits_due',
    description:
      "Find doors that haven't been visited in 3+ days and aren't closed or not_interested. Good candidates for revisiting.",
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_commission_summary',
    description:
      "Get the user's commission structure and computed earnings for today, this week, and this month.",
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'set_commission_structure',
    description:
      "Save the user's commission structure. Use after confirming with the user what type and rate they want.",
    input_schema: {
      type: 'object' as const,
      properties: {
        type: {
          type: 'string',
          enum: ['flat', 'percentage', 'tiered'],
          description: 'flat = fixed $ per deal, percentage = % of revenue, tiered = multiple rates',
        },
        rate: {
          type: 'number',
          description: 'Dollar amount per deal (flat) or percentage rate 0-100 (percentage)',
        },
        minimum: {
          type: 'number',
          description: 'Optional minimum earnings per week/month',
        },
        tiers: {
          type: 'array',
          description: 'For tiered commission: array of {min_deals, rate} objects',
          items: {
            type: 'object',
            properties: {
              min_deals: { type: 'number' },
              rate: { type: 'number' },
            },
          },
        },
      },
      required: ['type', 'rate'],
    },
  },
  {
    name: 'recommend_territory',
    description:
      'Analyze all territories and recommend the best one to knock based on close rate, contact rate, and recency.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'log_door',
    description:
      'Log a door visit. Creates a door at the territory center if none exists, then records the visit.',
    input_schema: {
      type: 'object' as const,
      properties: {
        territory_name: {
          type: 'string',
          description: 'Name of the territory',
        },
        answered: {
          type: 'boolean',
          description: 'Did someone answer the door?',
        },
        pitched: {
          type: 'boolean',
          description: 'Did you pitch them?',
        },
        closed: {
          type: 'boolean',
          description: 'Did you close the deal?',
        },
        revenue: {
          type: 'number',
          description: 'Revenue from this deal in dollars',
        },
        notes: {
          type: 'string',
          description: 'Any notes about this door',
        },
      },
      required: ['territory_name', 'answered'],
    },
  },
]

// --- Tool implementation functions ---

interface CommissionStructure {
  type: 'flat' | 'percentage' | 'tiered'
  rate: number
  minimum?: number
  tiers?: Array<{ min_deals: number; rate: number }>
}

async function getTerritories(supabase: SupabaseClient, userId: string) {
  const { data: territories } = await supabase
    .from('territories')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (!territories || territories.length === 0) {
    return { territories: [] }
  }

  const territoryIds = territories.map((t) => t.id)
  const { data: doors } = await supabase
    .from('doors_territory_doors')
    .select('*')
    .in('territory_id', territoryIds)
    .eq('user_id', userId)

  const allDoors = (doors as TerritoryDoor[]) ?? []

  const result = territories.map((t) => {
    const tDoors = allDoors.filter((d) => d.territory_id === t.id)
    const kpis = computeKpisFromDoors(tDoors)
    return { ...t, kpis }
  })

  return { territories: result }
}

async function getTerritoryDetail(
  supabase: SupabaseClient,
  userId: string,
  params: { name: string }
) {
  const { data: territory } = await supabase
    .from('territories')
    .select('*')
    .eq('user_id', userId)
    .ilike('name', params.name)
    .single()

  if (!territory) {
    return { error: `Territory "${params.name}" not found` }
  }

  const { data: doors } = await supabase
    .from('doors_territory_doors')
    .select('*')
    .eq('territory_id', territory.id)
    .eq('user_id', userId)

  const allDoors = (doors as TerritoryDoor[]) ?? []
  const kpis = computeKpisFromDoors(allDoors)

  const recommendations = []
  if (kpis.total_doors >= 20 && kpis.contact_rate < 0.15) {
    recommendations.push('Territory saturated — contact rate under 15%. Move to a fresh block.')
  } else if (kpis.total_doors >= 10 && kpis.contact_rate < 0.2) {
    recommendations.push('Low contact rate. Try evenings or weekends.')
  }
  if (kpis.close_rate > 0.25) {
    recommendations.push(`Hot territory — closing ${Math.round(kpis.close_rate * 100)}% of pitches.`)
  }

  return { territory, kpis, total_doors: allDoors.length, recommendations }
}

async function getTodayStats(supabase: SupabaseClient, userId: string) {
  const today = new Date().toISOString().split('T')[0]

  const { data: doors } = await supabase
    .from('doors_territory_doors')
    .select('visits')
    .eq('user_id', userId)

  const stats = { knocked: 0, answered: 0, pitched: 0, closed: 0, revenue: 0 }

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

  return stats
}

async function getRevisitsDue(supabase: SupabaseClient, userId: string) {
  const threeDaysAgo = new Date()
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
  const cutoffDate = threeDaysAgo.toISOString().split('T')[0]

  const { data: doors } = await supabase
    .from('doors_territory_doors')
    .select('*, territories(name)')
    .eq('user_id', userId)
    .not('status', 'in', '("closed","not_interested")')

  const revisits = []
  for (const door of (doors as (TerritoryDoor & { territories: { name: string } | null })[]) ?? []) {
    if (door.visits.length === 0) continue
    const lastVisit = door.visits.reduce((a: DoorVisit, b: DoorVisit) =>
      a.date > b.date ? a : b
    )
    if (lastVisit.date <= cutoffDate) {
      revisits.push({
        id: door.id,
        territory: door.territories?.name ?? 'Unknown',
        last_visited: lastVisit.date,
        status: door.status,
        notes: door.notes,
      })
    }
  }

  return { revisits_due: revisits.length, doors: revisits.slice(0, 10) }
}

async function getCommissionSummary(supabase: SupabaseClient, userId: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('commission_structure, commission_currency')
    .eq('id', userId)
    .single()

  const structure: CommissionStructure = (profile?.commission_structure as CommissionStructure) ?? {
    type: 'flat',
    rate: 0,
  }
  const currency = (profile?.commission_currency as string) ?? 'USD'

  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]

  // Week start (Monday)
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1))
  const weekStartStr = weekStart.toISOString().split('T')[0]

  // Month start
  const monthStartStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

  const { data: doors } = await supabase
    .from('doors_territory_doors')
    .select('visits')
    .eq('user_id', userId)

  let todayCloses = 0
  let todayRevenue = 0
  let weekCloses = 0
  let weekRevenue = 0
  let monthCloses = 0
  let monthRevenue = 0

  for (const door of (doors as Pick<TerritoryDoor, 'visits'>[]) ?? []) {
    for (const visit of door.visits) {
      if (!visit.closed) continue
      const rev = visit.revenue ?? 0

      if (visit.date === todayStr) {
        todayCloses++
        todayRevenue += rev
      }
      if (visit.date >= weekStartStr) {
        weekCloses++
        weekRevenue += rev
      }
      if (visit.date >= monthStartStr) {
        monthCloses++
        monthRevenue += rev
      }
    }
  }

  function calc(closes: number, revenue: number): number {
    if (structure.type === 'flat') return closes * structure.rate
    if (structure.type === 'percentage') return revenue * (structure.rate / 100)
    if (structure.type === 'tiered' && structure.tiers) {
      const tier = [...structure.tiers]
        .sort((a, b) => b.min_deals - a.min_deals)
        .find((t) => closes >= t.min_deals)
      return tier ? closes * tier.rate : closes * structure.rate
    }
    return 0
  }

  return {
    structure,
    currency,
    today: { closes: todayCloses, revenue: todayRevenue, earned: calc(todayCloses, todayRevenue) },
    this_week: {
      closes: weekCloses,
      revenue: weekRevenue,
      earned: calc(weekCloses, weekRevenue),
    },
    this_month: {
      closes: monthCloses,
      revenue: monthRevenue,
      earned: calc(monthCloses, monthRevenue),
    },
  }
}

async function setCommissionStructure(
  supabase: SupabaseClient,
  userId: string,
  params: CommissionStructure
) {
  const { error } = await supabase
    .from('profiles')
    .update({ commission_structure: params })
    .eq('id', userId)

  if (error) return { success: false, error: error.message }
  return { success: true, saved: params }
}

async function recommendTerritory(supabase: SupabaseClient, userId: string) {
  const { territories } = await getTerritories(supabase, userId)

  if (!territories || territories.length === 0) {
    return { recommendation: null, reason: 'No territories found.' }
  }

  // Score: close_rate * contact_rate, with recency bonus
  const now = new Date()

  const scored = territories.map((t) => {
    const kpis = t.kpis
    const baseScore = kpis.close_rate * kpis.contact_rate
    // Favor territories with more data but not too many doors
    const dataBonus = Math.min(kpis.total_doors, 20) / 20
    return {
      name: t.name,
      score: baseScore * 0.7 + dataBonus * 0.3,
      kpis,
      last_used: t.updated_at ?? t.created_at,
    }
  })

  scored.sort((a, b) => b.score - a.score)
  const best = scored[0]

  return {
    recommendation: best.name,
    score: best.score,
    reason: `${Math.round(best.kpis.contact_rate * 100)}% contact rate, ${Math.round(best.kpis.close_rate * 100)}% close rate`,
    all_scored: scored.map((s) => ({
      name: s.name,
      contact_rate: Math.round(s.kpis.contact_rate * 100) + '%',
      close_rate: Math.round(s.kpis.close_rate * 100) + '%',
    })),
  }
}

async function logDoor(
  supabase: SupabaseClient,
  userId: string,
  params: {
    territory_name: string
    answered: boolean
    pitched?: boolean
    closed?: boolean
    revenue?: number
    notes?: string
  }
) {
  // Find territory
  const { data: territory } = await supabase
    .from('territories')
    .select('*')
    .eq('user_id', userId)
    .ilike('name', params.territory_name)
    .single()

  if (!territory) {
    return { success: false, error: `Territory "${params.territory_name}" not found` }
  }

  const today = new Date().toISOString().split('T')[0]
  const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })

  const visit: DoorVisit = {
    date: today,
    time: now,
    answered: params.answered,
    pitched: params.pitched ?? false,
    closed: params.closed ?? false,
    notes: params.notes,
    revenue: params.revenue,
  }

  // Determine status
  let status = 'not_home'
  if (params.closed) status = 'closed'
  else if (params.pitched) status = 'pitched'
  else if (params.answered) status = 'answered'

  // Use territory center coordinates (fallback to a default if none)
  const lat = territory.center_lat ?? 35.2271
  const lng = territory.center_lng ?? -80.8431

  const { data: newDoor, error } = await supabase
    .from('doors_territory_doors')
    .insert({
      user_id: userId,
      territory_id: territory.id,
      lat,
      lng,
      visits: [visit],
      status,
      total_visits: 1,
      notes: params.notes ?? null,
    })
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  return {
    success: true,
    door_id: newDoor.id,
    territory: territory.name,
    visit,
  }
}

// --- KPI helper ---

function computeKpisFromDoors(doors: TerritoryDoor[]) {
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

  const total_doors = doors.length
  const contact_rate = total_doors > 0 ? doors_answered / total_doors : 0
  const pitch_rate = doors_answered > 0 ? doors_pitched / doors_answered : 0
  const close_rate = doors_pitched > 0 ? doors_closed / doors_pitched : 0

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
  }
}

// --- Tool executor ---

async function executeTool(
  toolName: string,
  toolInput: Record<string, unknown>,
  supabase: SupabaseClient,
  userId: string
): Promise<unknown> {
  switch (toolName) {
    case 'get_territories':
      return getTerritories(supabase, userId)
    case 'get_territory_detail':
      return getTerritoryDetail(supabase, userId, toolInput as { name: string })
    case 'get_today_stats':
      return getTodayStats(supabase, userId)
    case 'get_revisits_due':
      return getRevisitsDue(supabase, userId)
    case 'get_commission_summary':
      return getCommissionSummary(supabase, userId)
    case 'set_commission_structure':
      return setCommissionStructure(supabase, userId, toolInput as unknown as CommissionStructure)
    case 'recommend_territory':
      return recommendTerritory(supabase, userId)
    case 'log_door':
      return logDoor(
        supabase,
        userId,
        toolInput as {
          territory_name: string
          answered: boolean
          pitched?: boolean
          closed?: boolean
          revenue?: number
          notes?: string
        }
      )
    default:
      return { error: `Unknown tool: ${toolName}` }
  }
}

// --- Route handler ---

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { message } = body

  if (!message || typeof message !== 'string') {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  // Build message history for this turn
  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: message },
  ]

  // Tool-use loop
  let finalText = ''
  let iterations = 0
  const MAX_ITERATIONS = 6

  while (iterations < MAX_ITERATIONS) {
    iterations++

    const response = await getAnthropic().messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools,
      messages,
    })

    // Check for tool use
    const toolUseBlocks = response.content.filter(
      (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
    )

    if (toolUseBlocks.length === 0) {
      // No more tool calls — extract final text
      const textBlock = response.content.find(
        (block): block is Anthropic.TextBlock => block.type === 'text'
      )
      finalText = textBlock?.text ?? 'Done.'
      break
    }

    // Append assistant's response to messages
    messages.push({ role: 'assistant', content: response.content })

    // Execute all tools and collect results
    const toolResults: Anthropic.ToolResultBlockParam[] = await Promise.all(
      toolUseBlocks.map(async (toolUse) => {
        const result = await executeTool(
          toolUse.name,
          toolUse.input as Record<string, unknown>,
          supabase,
          user.id
        )
        return {
          type: 'tool_result' as const,
          tool_use_id: toolUse.id,
          content: JSON.stringify(result),
        }
      })
    )

    // Append tool results
    messages.push({ role: 'user', content: toolResults })

    // If stop_reason was end_turn without tool use, break
    if (response.stop_reason === 'end_turn' && toolUseBlocks.length === 0) {
      break
    }
  }

  return NextResponse.json({ response: finalText })
}
