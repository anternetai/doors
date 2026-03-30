import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { TerritoryDoor, DoorVisit } from '@/lib/types'
import { SupabaseClient } from '@supabase/supabase-js'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
const GEMINI_MODEL = 'gemini-2.5-flash-preview-05-20'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`

const SYSTEM_PROMPT = `You are Doors, an AI sales coach built into a door-to-door sales tracker app. You help field sales reps knock more doors, close more deals, and earn more money.

Your personality: direct, motivating, data-driven. No fluff. Talk like a coach on the field, not a chatbot. Keep responses SHORT — under 3 sentences unless explaining something complex.

You have tools to check real data: territories, stats, commission, door logs. ALWAYS use tools to answer data questions — never guess or make up numbers.

Key behaviors:
- When asked "how am I doing?" → use get_today_stats and give a quick breakdown
- When asked about commission → use get_commission_summary, if rate is 0, walk them through setup conversationally
- When asked where to knock → use recommend_territory based on data
- When asked to log a door → use log_door with the details they provide
- When asked about revisits → use get_revisits_due
- When someone says hello/hi → be friendly but brief, tell them what you can help with

Commission setup flow (when rate is 0 or they ask to set up):
1. Ask: flat per deal, percentage of revenue, or tiered?
2. Get the rate/amount
3. Confirm and save with set_commission_structure

Territory recommendations: consider contact rate, close rate, total doors knocked, and time of day.

You are coaching a real sales rep in the field. Every response should feel like it comes from someone who's knocked doors themselves.`

// --- Gemini tool definitions ---

const geminiTools = [
  {
    function_declarations: [
      {
        name: 'get_territories',
        description: 'Get all territories for the current user with KPIs (doors, contact rate, close rate, revenue)',
        parameters: { type: 'OBJECT', properties: {}, required: [] },
      },
      {
        name: 'get_territory_detail',
        description: 'Get detailed info about a specific territory including all doors, KPIs, and recommendations',
        parameters: {
          type: 'OBJECT',
          properties: { name: { type: 'STRING', description: 'Name of the territory' } },
          required: ['name'],
        },
      },
      {
        name: 'get_today_stats',
        description: "Get today's door-knocking stats: knocked, answered, pitched, closed, revenue",
        parameters: { type: 'OBJECT', properties: {}, required: [] },
      },
      {
        name: 'get_revisits_due',
        description: "Find doors that haven't been visited in 3+ days that need follow-up",
        parameters: { type: 'OBJECT', properties: {}, required: [] },
      },
      {
        name: 'get_commission_summary',
        description: "Get the user's commission structure and earnings for today, this week, this month",
        parameters: { type: 'OBJECT', properties: {}, required: [] },
      },
      {
        name: 'set_commission_structure',
        description: "Save the user's commission structure after confirming with them",
        parameters: {
          type: 'OBJECT',
          properties: {
            type: { type: 'STRING', description: 'flat, percentage, or tiered' },
            rate: { type: 'NUMBER', description: 'Dollar amount (flat) or percentage 0-100 (percentage)' },
            minimum: { type: 'NUMBER', description: 'Optional minimum earnings' },
          },
          required: ['type', 'rate'],
        },
      },
      {
        name: 'recommend_territory',
        description: 'Analyze all territories and recommend the best one to knock right now',
        parameters: { type: 'OBJECT', properties: {}, required: [] },
      },
      {
        name: 'log_door',
        description: 'Log a door visit via conversation',
        parameters: {
          type: 'OBJECT',
          properties: {
            territory_name: { type: 'STRING', description: 'Territory name' },
            answered: { type: 'BOOLEAN', description: 'Did someone answer?' },
            pitched: { type: 'BOOLEAN', description: 'Did you pitch?' },
            closed: { type: 'BOOLEAN', description: 'Did you close?' },
            revenue: { type: 'NUMBER', description: 'Revenue in dollars' },
            notes: { type: 'STRING', description: 'Notes about this door' },
          },
          required: ['territory_name', 'answered'],
        },
      },
    ],
  },
]

// --- Tool implementation functions (unchanged from before) ---

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

async function getTerritoryDetail(supabase: SupabaseClient, userId: string, params: { name: string }) {
  const { data: territory } = await supabase
    .from('territories')
    .select('*')
    .eq('user_id', userId)
    .ilike('name', params.name)
    .single()

  if (!territory) return { error: `Territory "${params.name}" not found` }

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
  const { data: doors } = await supabase.from('doors_territory_doors').select('visits').eq('user_id', userId)

  const stats = { knocked: 0, answered: 0, pitched: 0, closed: 0, revenue: 0 }
  for (const door of (doors as Pick<TerritoryDoor, 'visits'>[]) ?? []) {
    for (const visit of door.visits) {
      if (visit.date !== today) continue
      stats.knocked++
      if (visit.answered) stats.answered++
      if (visit.pitched) stats.pitched++
      if (visit.closed) { stats.closed++; if (visit.revenue) stats.revenue += visit.revenue }
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
    const lastVisit = door.visits.reduce((a: DoorVisit, b: DoorVisit) => (a.date > b.date ? a : b))
    if (lastVisit.date <= cutoffDate) {
      revisits.push({ id: door.id, territory: door.territories?.name ?? 'Unknown', last_visited: lastVisit.date, status: door.status, notes: door.notes })
    }
  }
  return { revisits_due: revisits.length, doors: revisits.slice(0, 10) }
}

async function getCommissionSummary(supabase: SupabaseClient, userId: string) {
  const { data: profile } = await supabase.from('profiles').select('commission_structure, commission_currency').eq('id', userId).single()
  const structure: CommissionStructure = (profile?.commission_structure as CommissionStructure) ?? { type: 'flat', rate: 0 }
  const currency = (profile?.commission_currency as string) ?? 'USD'

  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1))
  const weekStartStr = weekStart.toISOString().split('T')[0]
  const monthStartStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

  const { data: doors } = await supabase.from('doors_territory_doors').select('visits').eq('user_id', userId)

  let todayCloses = 0, todayRevenue = 0, weekCloses = 0, weekRevenue = 0, monthCloses = 0, monthRevenue = 0
  for (const door of (doors as Pick<TerritoryDoor, 'visits'>[]) ?? []) {
    for (const visit of door.visits) {
      if (!visit.closed) continue
      const rev = visit.revenue ?? 0
      if (visit.date === todayStr) { todayCloses++; todayRevenue += rev }
      if (visit.date >= weekStartStr) { weekCloses++; weekRevenue += rev }
      if (visit.date >= monthStartStr) { monthCloses++; monthRevenue += rev }
    }
  }

  function calc(closes: number, revenue: number): number {
    if (structure.type === 'flat') return closes * structure.rate
    if (structure.type === 'percentage') return revenue * (structure.rate / 100)
    return 0
  }

  return {
    structure, currency,
    today: { closes: todayCloses, revenue: todayRevenue, earned: calc(todayCloses, todayRevenue) },
    this_week: { closes: weekCloses, revenue: weekRevenue, earned: calc(weekCloses, weekRevenue) },
    this_month: { closes: monthCloses, revenue: monthRevenue, earned: calc(monthCloses, monthRevenue) },
  }
}

async function setCommissionStructure(supabase: SupabaseClient, userId: string, params: CommissionStructure) {
  const { error } = await supabase.from('profiles').update({ commission_structure: params }).eq('id', userId)
  if (error) return { success: false, error: error.message }
  return { success: true, saved: params }
}

async function recommendTerritory(supabase: SupabaseClient, userId: string) {
  const { territories } = await getTerritories(supabase, userId)
  if (!territories || territories.length === 0) return { recommendation: null, reason: 'No territories found.' }

  const scored = territories.map((t) => {
    const kpis = t.kpis
    const baseScore = kpis.close_rate * kpis.contact_rate
    const dataBonus = Math.min(kpis.total_doors, 20) / 20
    return { name: t.name, score: baseScore * 0.7 + dataBonus * 0.3, kpis }
  })
  scored.sort((a, b) => b.score - a.score)
  const best = scored[0]

  return {
    recommendation: best.name,
    reason: `${Math.round(best.kpis.contact_rate * 100)}% contact, ${Math.round(best.kpis.close_rate * 100)}% close`,
    all: scored.map((s) => ({ name: s.name, contact: Math.round(s.kpis.contact_rate * 100) + '%', close: Math.round(s.kpis.close_rate * 100) + '%' })),
  }
}

async function logDoor(supabase: SupabaseClient, userId: string, params: { territory_name: string; answered: boolean; pitched?: boolean; closed?: boolean; revenue?: number; notes?: string }) {
  const { data: territory } = await supabase.from('territories').select('*').eq('user_id', userId).ilike('name', params.territory_name).single()
  if (!territory) return { success: false, error: `Territory "${params.territory_name}" not found` }

  const today = new Date().toISOString().split('T')[0]
  const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
  const visit: DoorVisit = { date: today, time: now, answered: params.answered, pitched: params.pitched ?? false, closed: params.closed ?? false, notes: params.notes, revenue: params.revenue }

  let status = 'not_home'
  if (params.closed) status = 'closed'
  else if (params.pitched) status = 'pitched'
  else if (params.answered) status = 'answered'

  const lat = territory.center_lat ?? 35.2271
  const lng = territory.center_lng ?? -80.8431

  const { data: newDoor, error } = await supabase.from('doors_territory_doors').insert({ user_id: userId, territory_id: territory.id, lat, lng, visits: [visit], status, total_visits: 1, notes: params.notes ?? null }).select().single()
  if (error) return { success: false, error: error.message }
  return { success: true, door_id: newDoor.id, territory: territory.name, visit }
}

// --- KPI helper ---

function computeKpisFromDoors(doors: TerritoryDoor[]) {
  let doors_answered = 0, doors_pitched = 0, doors_closed = 0, total_revenue = 0
  for (const door of doors) {
    for (const visit of door.visits) {
      if (visit.answered) doors_answered++
      if (visit.pitched) doors_pitched++
      if (visit.closed) { doors_closed++; if (visit.revenue) total_revenue += visit.revenue }
    }
  }
  const total_doors = doors.length
  return {
    total_doors, doors_answered, doors_pitched, doors_closed, total_revenue,
    contact_rate: total_doors > 0 ? doors_answered / total_doors : 0,
    pitch_rate: doors_answered > 0 ? doors_pitched / doors_answered : 0,
    close_rate: doors_pitched > 0 ? doors_closed / doors_pitched : 0,
  }
}

// --- Tool executor ---

async function executeTool(toolName: string, toolInput: Record<string, unknown>, supabase: SupabaseClient, userId: string): Promise<unknown> {
  switch (toolName) {
    case 'get_territories': return getTerritories(supabase, userId)
    case 'get_territory_detail': return getTerritoryDetail(supabase, userId, toolInput as { name: string })
    case 'get_today_stats': return getTodayStats(supabase, userId)
    case 'get_revisits_due': return getRevisitsDue(supabase, userId)
    case 'get_commission_summary': return getCommissionSummary(supabase, userId)
    case 'set_commission_structure': return setCommissionStructure(supabase, userId, toolInput as unknown as CommissionStructure)
    case 'recommend_territory': return recommendTerritory(supabase, userId)
    case 'log_door': return logDoor(supabase, userId, toolInput as { territory_name: string; answered: boolean; pitched?: boolean; closed?: boolean; revenue?: number; notes?: string })
    default: return { error: `Unknown tool: ${toolName}` }
  }
}

// --- Route handler ---

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { message } = body
  if (!message || typeof message !== 'string') return NextResponse.json({ error: 'Message is required' }, { status: 400 })

  if (!GEMINI_API_KEY) return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 })

  // Build Gemini request
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contents: Array<{ role: string; parts: any[] }> = [{ role: 'user', parts: [{ text: message }] }]
  let finalText = ''
  let iterations = 0
  const MAX_ITERATIONS = 6

  try {
    while (iterations < MAX_ITERATIONS) {
      iterations++

      const geminiBody = {
        contents,
        tools: geminiTools,
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
      }

      const res = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiBody),
      })

      if (!res.ok) {
        const errText = await res.text()
        console.error('[Agent] Gemini error:', res.status, errText)
        return NextResponse.json({ response: `Gemini error ${res.status}: ${errText.substring(0, 200)}` }, { status: 200 })
      }

      const data = await res.json()
      const candidate = data.candidates?.[0]
      if (!candidate) {
        finalText = 'No response generated.'
        break
      }

      const parts = candidate.content?.parts ?? []

      // Check for function calls
      const functionCalls = parts.filter((p: { functionCall?: unknown }) => p.functionCall)

      if (functionCalls.length === 0) {
        // No function calls — extract text
        const textPart = parts.find((p: { text?: string }) => p.text)
        finalText = textPart?.text ?? 'Done.'
        break
      }

      // Add assistant response to contents
      contents.push({ role: 'model', parts })

      // Execute all function calls
      const functionResponses = []
      for (const fc of functionCalls) {
        const { name, args } = fc.functionCall
        const result = await executeTool(name, args ?? {}, supabase, user.id)
        functionResponses.push({
          functionResponse: {
            name,
            response: { result },
          },
        })
      }

      // Add function responses
      contents.push({ role: 'user', parts: functionResponses })

      // Check if we should stop
      if (candidate.finishReason === 'STOP' && functionCalls.length === 0) break
    }
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    console.error('[Agent] Error:', errMsg)
    return NextResponse.json({ response: `Error: ${errMsg.substring(0, 200)}` }, { status: 200 })
  }

  return NextResponse.json({ response: finalText })
}
