import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { DoorVisit, TerritoryDoor } from '@/lib/types'
import { bridgeDoorKnockToCrm } from '@/lib/crm-bridge'
import type { DoorContactInfo } from '@/components/door-log-overlay'

type Context = { params: Promise<{ name: string; id: string }> }

export async function PATCH(request: NextRequest, { params }: Context) {
  const { name: encodedName, id } = await params
  const territoryName = decodeURIComponent(encodedName)

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { visit, contact } = body as { visit: DoorVisit; contact?: DoorContactInfo }

  if (!visit) {
    return NextResponse.json({ error: 'visit is required' }, { status: 400 })
  }

  // Fetch existing door to append visit
  const { data: existingDoor, error: fetchErr } = await supabase
    .from('doors_territory_doors')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (fetchErr || !existingDoor) {
    return NextResponse.json({ error: 'Door not found' }, { status: 404 })
  }

  const door = existingDoor as TerritoryDoor
  const updatedVisits = [...(door.visits ?? []), visit]

  function visitToStatus(v: DoorVisit): string {
    if (v.not_interested) return 'not_interested'
    if (v.closed) return 'closed'
    if (v.pitched) return 'pitched'
    if (v.answered) return 'answered'
    return 'not_home'
  }

  // Contact fields — keep whatever was already saved unless this visit
  // provided a (non-blank) update.
  const contactName = contact?.name?.trim() || door.contact_name || null
  const contactPhone = contact?.phone?.trim() || door.contact_phone || null

  const { data, error } = await supabase
    .from('doors_territory_doors')
    .update({
      visits: updatedVisits,
      status: visitToStatus(visit),
      total_visits: updatedVisits.length,
      updated_at: new Date().toISOString(),
      contact_name: contactName,
      contact_phone: contactPhone,
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Bridge to the CRM — only if we haven't already created a job for this
  // door (avoids duplicate clients/jobs on repeat revisits) and there's a
  // contact to bridge.
  const hasContact = Boolean(contactName || contactPhone)
  if (hasContact && !door.crm_job_id) {
    let contactAddress = door.contact_address
    if (!contactAddress) {
      const { data: territory } = await supabase
        .from('territories')
        .select('address')
        .eq('user_id', user.id)
        .eq('name', territoryName)
        .single()
      contactAddress = territory?.address ?? null
    }

    const bridged = await bridgeDoorKnockToCrm({
      contactName,
      contactPhone,
      contactAddress,
      territoryName,
      doorId: id,
      closed: Boolean(visit.closed),
      revenue: visit.revenue ?? null,
      notes: visit.notes ?? null,
    })
    if (bridged) {
      await supabase
        .from('doors_territory_doors')
        .update({ crm_client_id: bridged.client_id, crm_job_id: bridged.job_id })
        .eq('id', id)
        .eq('user_id', user.id)
      data.crm_client_id = bridged.client_id
      data.crm_job_id = bridged.job_id
    }
  }

  return NextResponse.json(data)
}

export async function DELETE(
  _req: NextRequest,
  { params }: Context
) {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabase
    .from('doors_territory_doors')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
