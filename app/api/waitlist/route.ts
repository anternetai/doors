import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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

function generateReferralCode(email: string): string {
  // Short deterministic-ish code: first 3 chars of email + random 4-char hex
  const prefix = email.replace(/[^a-z0-9]/gi, '').slice(0, 3).toUpperCase()
  const suffix = Math.random().toString(16).slice(2, 6).toUpperCase()
  return `${prefix}${suffix}`
}

// GET — return total waitlist count
export async function GET() {
  try {
    const supabase = await createSupabaseClient()
    const { count, error } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })

    if (error) throw error

    return NextResponse.json({ count: count ?? 0 })
  } catch (err) {
    console.error('[waitlist GET]', err)
    return NextResponse.json({ count: 0 })
  }
}

// POST — add email to waitlist
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = (body.email ?? '').trim().toLowerCase()
    const referredBy = (body.referred_by ?? '').trim() || null

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    const supabase = await createSupabaseClient()

    // Check if already on waitlist
    const { data: existing } = await supabase
      .from('waitlist')
      .select('id, position, referral_code')
      .eq('email', email)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({
        success: true,
        position: existing.position,
        referral_code: existing.referral_code,
        already_joined: true,
      })
    }

    // Get next position
    const { count } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })

    const position = (count ?? 0) + 1

    // Generate unique referral code
    let referralCode = generateReferralCode(email)
    // Ensure uniqueness
    let attempts = 0
    while (attempts < 5) {
      const { data: codeConflict } = await supabase
        .from('waitlist')
        .select('id')
        .eq('referral_code', referralCode)
        .maybeSingle()
      if (!codeConflict) break
      referralCode = generateReferralCode(email + attempts)
      attempts++
    }

    const { error: insertError } = await supabase.from('waitlist').insert({
      email,
      position,
      referral_code: referralCode,
      referred_by: referredBy,
    })

    if (insertError) {
      // Could be a race condition dupe — return existing
      if (insertError.code === '23505') {
        const { data: raceEntry } = await supabase
          .from('waitlist')
          .select('position, referral_code')
          .eq('email', email)
          .maybeSingle()
        return NextResponse.json({
          success: true,
          position: raceEntry?.position ?? position,
          referral_code: raceEntry?.referral_code ?? referralCode,
          already_joined: true,
        })
      }
      throw insertError
    }

    return NextResponse.json({
      success: true,
      position,
      referral_code: referralCode,
    })
  } catch (err) {
    console.error('[waitlist POST]', err)
    return NextResponse.json({ error: 'Something went wrong. Try again.' }, { status: 500 })
  }
}
