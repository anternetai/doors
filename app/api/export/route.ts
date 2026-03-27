import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get all territories
  const { data: territories } = await supabase
    .from('territories')
    .select('*')
    .eq('user_id', user.id)

  // Get all doors
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

  // Build CSV rows — one row per door visit
  const headers = [
    'territory',
    'latitude',
    'longitude',
    'visit_date',
    'visit_time',
    'answered',
    'pitched',
    'closed',
    'not_interested',
    'revenue',
    'notes',
    'total_visits',
    'status',
  ]

  const rows: string[][] = []

  for (const door of doors) {
    const territoryName = territoryNames[door.territory_id] || 'Unknown'
    const visits = (door.visits || []) as Array<{
      date?: string
      time?: string
      answered?: boolean
      pitched?: boolean
      closed?: boolean
      not_interested?: boolean
      revenue?: number
      notes?: string
    }>

    if (visits.length === 0) {
      // Door with no visits — include it with empty visit fields
      rows.push([
        territoryName,
        String(door.lat),
        String(door.lng),
        '', '', '', '', '', '', '', '',
        String(door.total_visits || 0),
        door.status || 'not_home',
      ])
    } else {
      for (const v of visits) {
        rows.push([
          territoryName,
          String(door.lat),
          String(door.lng),
          v.date || '',
          v.time || '',
          v.answered ? 'Yes' : 'No',
          v.pitched ? 'Yes' : '',
          v.closed ? 'Yes' : '',
          v.not_interested ? 'Yes' : '',
          v.revenue ? String(v.revenue) : '',
          (v.notes || '').replace(/"/g, '""'),
          String(door.total_visits || 0),
          door.status || 'not_home',
        ])
      }
    }
  }

  // Build CSV string
  const csvLines = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => (cell.includes(',') || cell.includes('"') || cell.includes('\n') ? `"${cell}"` : cell)).join(',')
    ),
  ]
  const csv = csvLines.join('\n')

  const date = new Date().toISOString().split('T')[0]

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="doors-export-${date}.csv"`,
    },
  })
}
