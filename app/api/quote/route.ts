import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

interface QuoteRequest {
  client_name: string
  client_phone?: string
  client_email?: string
  address: string
  total: number
  description: string
}

/**
 * Bridge: creates a Dr. Squeegee CRM quote from the in-field window tally.
 * Server-to-server call to the CRM's existing quote API (no CORS, reuses the
 * CRM's token generation + accept→invoice flow). Returns the shareable link.
 */
export async function POST(req: NextRequest) {
  // Only logged-in Doors users can create quotes.
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await req.json()) as QuoteRequest
  const { client_name, client_phone, client_email, address, total, description } = body

  if (!client_name?.trim() || !address?.trim() || !total || total <= 0) {
    return NextResponse.json(
      { error: "client_name, address, and a positive total are required" },
      { status: 400 }
    )
  }

  const crmUrl = process.env.CRM_QUOTE_URL || "https://www.drsqueegeeclt.com"

  try {
    const res = await fetch(`${crmUrl}/api/squeegee/quotes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_name: client_name.trim(),
        client_phone: client_phone?.trim() || undefined,
        client_email: client_email?.trim() || undefined,
        address: address.trim(),
        services: [
          { name: "Window Cleaning", price: Number(total), description },
        ],
      }),
    })

    const data = (await res.json()) as { quote?: { token: string }; error?: string }
    if (!res.ok || !data.quote?.token) {
      return NextResponse.json(
        { error: data.error || "Failed to create quote" },
        { status: 502 }
      )
    }

    const token = data.quote.token
    return NextResponse.json({
      token,
      url: `${crmUrl}/q/${token}`,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Bridge error"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
