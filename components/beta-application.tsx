'use client'

import { useEffect, useState } from 'react'

const BETA_TOTAL = 25

const INDUSTRIES = [
  { value: 'solar', label: 'Solar' },
  { value: 'roofing', label: 'Roofing' },
  { value: 'pest-control', label: 'Pest Control' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'security', label: 'Home Security / Alarms' },
  { value: 'pressure-washing', label: 'Pressure Washing' },
  { value: 'windows', label: 'Windows / Siding' },
  { value: 'fiber', label: 'Fiber / Telecom' },
  { value: 'other', label: 'Other' },
]

type FormState = 'idle' | 'submitting' | 'success' | 'already_applied' | 'error'

export function BetaApplication() {
  const [spotsRemaining, setSpotsRemaining] = useState<number>(BETA_TOTAL)
  const [form, setForm] = useState({
    name: '',
    email: '',
    industry: '',
    doors_per_week: '',
    reason: '',
  })
  const [state, setState] = useState<FormState>('idle')
  const [errorMsg, setErrorMsg] = useState<string>('')

  useEffect(() => {
    fetch('/api/beta')
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.spots_remaining === 'number') setSpotsRemaining(d.spots_remaining)
      })
      .catch(() => {})
  }, [])

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setState('submitting')
    setErrorMsg('')

    try {
      const res = await fetch('/api/beta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          industry: form.industry,
          doors_per_week: form.doors_per_week ? Number(form.doors_per_week) : null,
          reason: form.reason,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error ?? 'Something went wrong.')
        setState('error')
        return
      }

      if (data.already_applied) {
        setState('already_applied')
        return
      }

      setState('success')
    } catch {
      setErrorMsg('Network error. Please try again.')
      setState('error')
    }
  }

  const spotsLabel = spotsRemaining <= 0
    ? 'All beta spots claimed'
    : `${spotsRemaining} of ${BETA_TOTAL} spots remaining`

  const spotsColor = spotsRemaining <= 5
    ? '#f87171' // red when nearly gone
    : '#22c55e'

  if (state === 'success') {
    return (
      <div
        className="rounded-2xl p-8 text-center"
        style={{
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(34,197,94,0.3)',
          boxShadow: '0 0 40px rgba(34,197,94,0.08)',
        }}
      >
        <div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)' }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-[#F5F5F7]" style={{ letterSpacing: '-0.02em' }}>
          Application received.
        </h3>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: 'rgba(245,245,247,0.55)' }}>
          We&apos;ll review it and reach out within 48 hours. If you&apos;re selected,
          you&apos;ll get free Pro access for life.
        </p>
      </div>
    )
  }

  if (state === 'already_applied') {
    return (
      <div
        className="rounded-2xl p-8 text-center"
        style={{
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-[#F5F5F7]">Already applied.</h3>
        <p className="mt-3 text-sm" style={{ color: 'rgba(245,245,247,0.55)' }}>
          You&apos;re already in the queue. We&apos;ll be in touch within 48 hours.
        </p>
      </div>
    )
  }

  return (
    <div
      className="rounded-2xl p-7 sm:p-8"
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 0 40px rgba(34,197,94,0.06)',
      }}
    >
      {/* Header */}
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h3
            className="text-xl font-bold text-[#F5F5F7]"
            style={{ letterSpacing: '-0.02em' }}
          >
            Apply for the Beta
          </h3>
          <span
            className="rounded-full px-3 py-1 text-xs font-bold"
            style={{ backgroundColor: `${spotsColor}18`, color: spotsColor, border: `1px solid ${spotsColor}35` }}
          >
            {spotsLabel}
          </span>
        </div>
        <p className="text-sm" style={{ color: 'rgba(245,245,247,0.5)' }}>
          25 spots. Free Pro access for life. We&apos;re selecting reps who actually knock doors.
        </p>
      </div>

      {/* Spots progress bar */}
      <div className="mb-6">
        <div
          className="h-1.5 w-full rounded-full overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.max(8, ((BETA_TOTAL - spotsRemaining) / BETA_TOTAL) * 100)}%`,
              background: `linear-gradient(90deg, ${spotsColor}, ${spotsColor}cc)`,
            }}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-[11px]" style={{ color: 'rgba(245,245,247,0.3)' }}>
          <span>{BETA_TOTAL - spotsRemaining} claimed</span>
          <span>{spotsRemaining} left</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(245,245,247,0.4)' }}>
            Your Name
          </label>
          <input
            type="text"
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            placeholder="First Last"
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-[#F5F5F7] placeholder-[rgba(245,245,247,0.25)] focus:border-[#22c55e]/50 focus:outline-none focus:ring-1 focus:ring-[#22c55e]/30 transition-colors"
          />
        </div>

        {/* Email */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(245,245,247,0.4)' }}>
            Email
          </label>
          <input
            type="email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-[#F5F5F7] placeholder-[rgba(245,245,247,0.25)] focus:border-[#22c55e]/50 focus:outline-none focus:ring-1 focus:ring-[#22c55e]/30 transition-colors"
          />
        </div>

        {/* Industry */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(245,245,247,0.4)' }}>
            What do you sell?
          </label>
          <select
            name="industry"
            required
            value={form.industry}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/[0.08] bg-[#111118] px-4 py-3 text-sm text-[#F5F5F7] focus:border-[#22c55e]/50 focus:outline-none focus:ring-1 focus:ring-[#22c55e]/30 transition-colors appearance-none"
          >
            <option value="" disabled>Select your industry</option>
            {INDUSTRIES.map((ind) => (
              <option key={ind.value} value={ind.value}>{ind.label}</option>
            ))}
          </select>
        </div>

        {/* Doors per week */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(245,245,247,0.4)' }}>
            How many doors per week?
          </label>
          <input
            type="number"
            name="doors_per_week"
            min={1}
            max={9999}
            value={form.doors_per_week}
            onChange={handleChange}
            placeholder="e.g. 150"
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-[#F5F5F7] placeholder-[rgba(245,245,247,0.25)] focus:border-[#22c55e]/50 focus:outline-none focus:ring-1 focus:ring-[#22c55e]/30 transition-colors"
          />
        </div>

        {/* Reason */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(245,245,247,0.4)' }}>
            Why do you want in? <span style={{ color: 'rgba(245,245,247,0.25)', fontWeight: 400 }}>(optional)</span>
          </label>
          <textarea
            name="reason"
            rows={3}
            value={form.reason}
            onChange={handleChange}
            placeholder="What's your biggest pain with tracking doors right now?"
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-[#F5F5F7] placeholder-[rgba(245,245,247,0.25)] focus:border-[#22c55e]/50 focus:outline-none focus:ring-1 focus:ring-[#22c55e]/30 transition-colors resize-none leading-relaxed"
          />
        </div>

        {/* Error */}
        {state === 'error' && errorMsg && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {errorMsg}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={state === 'submitting' || spotsRemaining <= 0}
          className="w-full rounded-xl px-4 py-3.5 text-sm font-bold transition-all hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: '#22c55e',
            color: '#0A0A0F',
            boxShadow: state === 'submitting' ? 'none' : '0 0 24px rgba(34,197,94,0.25)',
          }}
        >
          {state === 'submitting'
            ? 'Submitting…'
            : spotsRemaining <= 0
            ? 'All spots claimed'
            : 'Apply for Free Beta Access'}
        </button>

        <p className="text-center text-xs" style={{ color: 'rgba(245,245,247,0.3)' }}>
          No credit card. We&apos;ll review and reply within 48 hours.
        </p>
      </form>
    </div>
  )
}
