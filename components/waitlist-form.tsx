'use client'

import { useState } from 'react'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

interface WaitlistFormProps {
  /** Layout variant */
  variant?: 'hero' | 'section'
}

export function WaitlistForm({ variant = 'section' }: WaitlistFormProps) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<FormState>('idle')
  const [result, setResult] = useState<{ position: number; referral_code: string } | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const isHero = variant === 'hero'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setState('submitting')
    setErrorMsg('')

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error ?? 'Something went wrong.')
        setState('error')
        return
      }

      setResult({ position: data.position, referral_code: data.referral_code })
      setState('success')
    } catch {
      setErrorMsg('Network error. Please try again.')
      setState('error')
    }
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://doorsapp.co'
  const referralUrl = result
    ? `${origin}/?ref=${result.referral_code}`
    : ''

  if (state === 'success' && result) {
    return (
      <div
        className={`rounded-2xl p-6 ${isHero ? 'text-left' : 'text-center'}`}
        style={{
          background: 'rgba(34,197,94,0.06)',
          border: '1px solid rgba(34,197,94,0.2)',
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
            style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-bold text-[#F5F5F7]">
              You&apos;re #{result.position} on the list.
            </p>
            <p className="mt-1 text-sm" style={{ color: 'rgba(245,245,247,0.55)' }}>
              Share your link to move up. Every rep you refer bumps you 10 spots.
            </p>
            {/* Referral link */}
            <div
              className="mt-3 flex items-center gap-2 rounded-xl border px-3 py-2"
              style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}
            >
              <span className="flex-1 truncate text-xs font-mono" style={{ color: 'rgba(245,245,247,0.6)' }}>
                {referralUrl}
              </span>
              <button
                type="button"
                onClick={() => navigator.clipboard?.writeText(referralUrl)}
                className="shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors hover:bg-white/[0.08]"
                style={{ color: '#22c55e' }}
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-3 ${isHero ? 'sm:flex-row' : ''}`}>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className={`
          flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm
          text-[#F5F5F7] placeholder-[rgba(245,245,247,0.3)]
          focus:border-[#22c55e]/50 focus:outline-none focus:ring-1 focus:ring-[#22c55e]/30
          transition-colors
          ${isHero ? 'h-12' : ''}
        `}
      />
      <button
        type="submit"
        disabled={state === 'submitting'}
        className={`
          shrink-0 rounded-xl font-bold text-sm transition-all
          hover:opacity-90 active:scale-[0.98] disabled:opacity-50
          ${isHero ? 'h-12 px-6' : 'px-5 py-3'}
        `}
        style={{
          backgroundColor: '#22c55e',
          color: '#0A0A0F',
          boxShadow: state === 'submitting' ? 'none' : '0 0 24px rgba(34,197,94,0.25)',
        }}
      >
        {state === 'submitting' ? 'Joining…' : 'Join the Waitlist'}
      </button>
      {state === 'error' && errorMsg && (
        <p className="text-xs text-red-400 sm:col-span-2">{errorMsg}</p>
      )}
    </form>
  )
}
