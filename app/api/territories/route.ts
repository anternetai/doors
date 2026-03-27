import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { computeKpis } from '@/lib/kpis'
import type { TerritoryDoor } from '@/lib/types'

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: territories, error: tErr } = await supabase
    .from('territories')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (tErr) {
    return NextResponse.json({ error: tErr.message }, { status: 500 })
  }

  // Fetch all doors for this user's territories in one query
  const territoryIds = (territories ?? []).map((t) => t.id)

  let allDoors: TerritoryDoor[] = []
  if (territoryIds.length > 0) {
    const { data: doors } = await supabase
      .from('territory_doors')
      .select('*')
      .in('neighborhood', territoryIds)
      .eq('user_id', user.id)
    allDoors = (doors as TerritoryDoor[]) ?? []
  }

  const result = (territories ?? []).map((t) => {
    const doors = allDoors.filter((d) => d.neighborhood === t.id)
    const kpis = computeKpis(doors)
    return { ...t, kpis }
  })

  return NextResponse.json(result)
}

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
  const { name, address } = body

  if (!name || typeof name !== 'string') {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  // Geocode address via Nominatim (if provided)
  let center_lat: number | null = null
  let center_lng: number | null = null

  if (address) {
    try {
      const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`
      const res = await fetch(geocodeUrl, {
        headers: { 'User-Agent': 'DoorsApp/1.0' },
      })
      const data = await res.json()
      if (data.length > 0) {
        center_lat = parseFloat(data[0].lat)
        center_lng = parseFloat(data[0].lon)
      }
    } catch {
      // Geocoding failed — no center set
    }
  }

  const { data, error } = await supabase
    .from('territories')
    .insert({
      user_id: user.id,
      name: name.trim(),
      address: address?.trim() ?? null,
      center_lat,
      center_lng,
      zoom_level: 16,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
