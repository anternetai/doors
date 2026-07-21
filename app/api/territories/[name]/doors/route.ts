import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { DoorVisit } from '@/lib/types'
import { bridgeDoorKnockToCrm } from '@/lib/crm-bridge'
import type { DoorContactInfo } from '@/components/door-log-overlay'

async function getTerritory(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  name: string
) {
  return supabase
    .from('territories')
    .select('*')
    .eq('user_id', userId)
    .eq('name', name)
    .single()
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

  const { data: territory, error: tErr } = await getTerritory(supabase, user.id, name)

  if (tErr || !territory) {
    return NextResponse.json({ error: 'Territory not found' }, { status: 404 })
  }

  const { data: doors, error } = await supabase
    .from('doors_territory_doors')
    .select('*')
    .eq('territory_id', territory.id)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(doors ?? [])
}

export async function POST(
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

  const { data: territory, error: tErr } = await getTerritory(supabase, user.id, name)

  if (tErr || !territory) {
    return NextResponse.json({ error: 'Territory not found' }, { status: 404 })
  }

  const body = await request.json()
  const { lat, lng, visit, contact } = body as {
    lat: number
    lng: number
    visit: DoorVisit
    contact?: DoorContactInfo
  }

  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 })
  }

  // Determine initial status from the visit
  function visitToStatus(v: DoorVisit): string {
    if (v.not_interested) return 'not_interested'
    if (v.closed) return 'closed'
    if (v.pitched) return 'pitched'
    if (v.answered) return 'answered'
    return 'not_home'
  }

  const { data: door, error } = await supabase
    .from('doors_territory_doors')
    .insert({
      user_id: user.id,
      territory_id: territory.id,
      lat,
      lng,
      visits: visit ? [visit] : [],
      status: visit ? visitToStatus(visit) : 'not_home',
      total_visits: visit ? 1 : 0,
      notes: null,
      contact_name: contact?.name ?? null,
      contact_phone: contact?.phone ?? null,
      contact_address: territory.address ?? null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Bridge to the CRM — best-effort, never blocks the door save. Only fires
  // when a contact was actually captured (name and/or phone).
  if (contact && (contact.name?.trim() || contact.phone?.trim())) {
    const bridged = await bridgeDoorKnockToCrm({
      contactName: contact.name,
      contactPhone: contact.phone,
      contactAddress: territory.address,
      territoryName: name,
      doorId: door.id,
      closed: Boolean(visit?.closed),
      revenue: visit?.revenue ?? null,
      notes: visit?.notes ?? null,
    })
    if (bridged) {
      await supabase
        .from('doors_territory_doors')
        .update({ crm_client_id: bridged.client_id, crm_job_id: bridged.job_id })
        .eq('id', door.id)
        .eq('user_id', user.id)
      door.crm_client_id = bridged.client_id
      door.crm_job_id = bridged.job_id
    }
  }

  return NextResponse.json(door, { status: 201 })
}
