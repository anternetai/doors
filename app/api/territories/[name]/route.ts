import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { computeKpis, computeRecommendations } from '@/lib/kpis'
import type { TerritoryDoor } from '@/lib/types'

async function getTerritoryByName(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  name: string
) {
  const { data, error } = await supabase
    .from('territories')
    .select('*')
    .eq('user_id', userId)
    .eq('name', name)
    .single()

  return { data, error }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name: encodedName } = await params
  const name = decodeURIComponent(encodedName)

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: territory, error: tErr } = await getTerritoryByName(supabase, user.id, name)

  if (tErr || !territory) {
    return NextResponse.json({ error: 'Territory not found' }, { status: 404 })
  }

  const { data: doors } = await supabase
    .from('territory_doors')
    .select('*')
    .eq('neighborhood', territory.id)
    .eq('user_id', user.id)

  const typedDoors = (doors as TerritoryDoor[]) ?? []
  const kpis = computeKpis(typedDoors)
  const recommendations = computeRecommendations(kpis)

  return NextResponse.json({ ...territory, kpis, recommendations })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name: encodedName } = await params
  const name = decodeURIComponent(encodedName)

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: territory, error: tErr } = await getTerritoryByName(supabase, user.id, name)

  if (tErr || !territory) {
    return NextResponse.json({ error: 'Territory not found' }, { status: 404 })
  }

  const body = await request.json()
  const updates: Record<string, unknown> = {}

  if (body.name !== undefined) updates.name = body.name
  if (body.address !== undefined) updates.address = body.address
  if (body.center_lat !== undefined) updates.center_lat = body.center_lat
  if (body.center_lng !== undefined) updates.center_lng = body.center_lng
  if (body.zoom_level !== undefined) updates.zoom_level = body.zoom_level

  const { data, error } = await supabase
    .from('territories')
    .update(updates)
    .eq('id', territory.id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name: encodedName } = await params
  const name = decodeURIComponent(encodedName)

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: territory, error: tErr } = await getTerritoryByName(supabase, user.id, name)

  if (tErr || !territory) {
    return NextResponse.json({ error: 'Territory not found' }, { status: 404 })
  }

  // Cascade delete doors first
  await supabase
    .from('territory_doors')
    .delete()
    .eq('neighborhood', territory.id)
    .eq('user_id', user.id)

  const { error } = await supabase
    .from('territories')
    .delete()
    .eq('id', territory.id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
