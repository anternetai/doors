import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { DoorVisit, TerritoryDoor } from '@/lib/types'

type Context = { params: Promise<{ name: string; id: string }> }

export async function PATCH(request: NextRequest, { params }: Context) {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { visit } = body as { visit: DoorVisit }

  if (!visit) {
    return NextResponse.json({ error: 'visit is required' }, { status: 400 })
  }

  // Fetch existing door to append visit
  const { data: existingDoor, error: fetchErr } = await supabase
    .from('territory_doors')
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

  const { data, error } = await supabase
    .from('territory_doors')
    .update({
      visits: updatedVisits,
      status: visitToStatus(visit),
      total_visits: updatedVisits.length,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
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
    .from('territory_doors')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
