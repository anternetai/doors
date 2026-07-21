// Bridges a door-knock contact/close into the Dr. Squeegee CRM (dr-squeegee
// repo, same shared Supabase, separate app). Mirrors the existing in-field
// quote bridge (app/api/quote/route.ts -> dr-squeegee's /api/squeegee/from-field)
// — same target app, same "fire a POST, never block the door save on it" shape.
//
// Fires when a door visit either captures a contact (name/phone) or closes —
// per the CRM's door-log-overlay UI, contact fields only show once someone
// answered, so in practice this only fires for real conversations.

export interface DoorKnockBridgeInput {
  contactName?: string | null
  contactPhone?: string | null
  contactAddress?: string | null
  territoryName: string
  doorId: string
  closed: boolean
  revenue?: number | null
  notes?: string | null
}

export interface DoorKnockBridgeResult {
  client_id: string
  job_id: string | null
}

export async function bridgeDoorKnockToCrm(
  input: DoorKnockBridgeInput
): Promise<DoorKnockBridgeResult | null> {
  const hasContact = Boolean(input.contactName?.trim() || input.contactPhone?.trim())
  if (!hasContact) return null // nothing to bridge — no name/phone was captured

  const crmUrl = process.env.CRM_QUOTE_URL || 'https://www.drsqueegeeclt.com'

  try {
    const res = await fetch(`${crmUrl}/api/squeegee/from-door-knock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-bridge-secret': process.env.BRIDGE_SECRET || '',
      },
      body: JSON.stringify({
        client_name: input.contactName?.trim() || undefined,
        client_phone: input.contactPhone?.trim() || undefined,
        address: input.contactAddress?.trim() || undefined,
        territory_name: input.territoryName,
        door_id: input.doorId,
        closed: input.closed,
        revenue: input.revenue ?? undefined,
        notes: input.notes ?? undefined,
      }),
    })
    if (!res.ok) {
      console.error('[crm-bridge] from-door-knock responded', res.status)
      return null
    }
    const data = (await res.json()) as { client_id?: string; job_id?: string | null }
    if (!data.client_id) return null
    return { client_id: data.client_id, job_id: data.job_id ?? null }
  } catch (err) {
    // Best-effort — never let a CRM bridge failure block saving the door visit.
    console.error('[crm-bridge] from-door-knock threw', err)
    return null
  }
}
