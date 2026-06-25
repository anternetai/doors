import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

interface ExtraLine {
  name: string
  price: number
  description?: string
}

interface QuoteRequest {
  client_name: string
  client_phone?: string
  client_email?: string
  address: string
  total: number
  description: string
  extra_lines?: ExtraLine[]
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await req.json()) as QuoteRequest
  const { client_name, client_phone, client_email, address, total, description, extra_lines = [] } = body

  const hasWindows = total > 0
  const hasExtras = extra_lines.some((l) => l.name?.trim() && l.price > 0)
  if (!client_name?.trim() || !address?.trim() || (!hasWindows && !hasExtras)) {
    return NextResponse.json(
      { error: "client_name, address, and at least one service are required" },
      { status: 400 }
    )
  }

  const crmUrl = process.env.CRM_QUOTE_URL || "https://www.drsqueegeeclt.com"

  const validExtra = extra_lines.filter((l) => l.name?.trim() && l.price > 0).map((l) => ({
    name: l.name.trim(),
    price: Number(l.price),
    ...(l.description?.trim() && { description: l.description.trim() }),
  }))

  // Only include Window Cleaning line if windows were actually tallied
  const services = [
    ...(total > 0 ? [{ name: "Window Cleaning", price: Number(total), description }] : []),
    ...validExtra,
  ]

  if (services.length === 0) {
    return NextResponse.json({ error: "No services to quote" }, { status: 400 })
  }

  try {
    const res = await fetch(`${crmUrl}/api/squeegee/from-field`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_name: client_name.trim(),
        client_phone: client_phone?.trim() || undefined,
        client_email: client_email?.trim() || undefined,
        address: address.trim(),
        services,
      }),
    })

    const data = (await res.json()) as { token?: string; job_id?: string; quote_url?: string; error?: string }
    if (!res.ok || !data.token) {
      return NextResponse.json(
        { error: data.error || "Failed to create quote" },
        { status: 502 }
      )
    }

    return NextResponse.json({
      token: data.token,
      job_id: data.job_id,
      url: data.quote_url ?? `${crmUrl}/q/${data.token}`,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Bridge error"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
