import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const BETA_SPOTS_TOTAL = 25

async function createSupabaseClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {
          // service role client — no cookie mutations needed
        },
      },
    }
  )
}

// GET — return spots remaining
export async function GET() {
  try {
    const supabase = await createSupabaseClient()
    const { count, error } = await supabase
      .from('beta_applications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'accepted')

    if (error) throw error

    const spotsRemaining = Math.max(0, BETA_SPOTS_TOTAL - (count ?? 0))
    return NextResponse.json({ spots_remaining: spotsRemaining, total: BETA_SPOTS_TOTAL })
  } catch (err) {
    console.error('[beta GET]', err)
    return NextResponse.json({ spots_remaining: BETA_SPOTS_TOTAL, total: BETA_SPOTS_TOTAL })
  }
}

// POST — submit beta application
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const name = (body.name ?? '').trim()
    const email = (body.email ?? '').trim().toLowerCase()
    const industry = (body.industry ?? '').trim()
    const doorsPerWeek = body.doors_per_week ? parseInt(body.doors_per_week, 10) : null
    const reason = (body.reason ?? '').trim() || null

    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }
    if (!industry) return NextResponse.json({ error: 'Industry is required' }, { status: 400 })

    const supabase = await createSupabaseClient()

    // Check if already applied
    const { data: existing } = await supabase
      .from('beta_applications')
      .select('id, status')
      .eq('email', email)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({
        success: true,
        already_applied: true,
        status: existing.status,
      })
    }

    const { error: insertError } = await supabase.from('beta_applications').insert({
      name,
      email,
      industry,
      doors_per_week: doorsPerWeek,
      reason,
      status: 'pending',
    })

    if (insertError) {
      if (insertError.code === '23505') {
        return NextResponse.json({ success: true, already_applied: true, status: 'pending' })
      }
      throw insertError
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[beta POST]', err)
    return NextResponse.json({ error: 'Something went wrong. Try again.' }, { status: 500 })
  }
}
