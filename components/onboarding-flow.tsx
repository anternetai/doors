'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DoorOpen, ArrowRight } from 'lucide-react'

interface Props {
  onCreated: () => void
}

export function OnboardingFlow({ onCreated }: Props) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setCreating(true)
    setError(null)
    try {
      const res = await fetch('/api/territories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), address: address.trim() || null }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Failed to create territory')
      }
      const created = await res.json()
      onCreated()
      // Small delay so the hint message is visible, then navigate
      setTimeout(() => {
        router.push(`/territories/${encodeURIComponent(created.name)}?hint=1`)
      }, 400)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating territory')
      setCreating(false)
    }
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6 pb-20"
      style={{ background: 'radial-gradient(ellipse at 50% 35%, rgba(255,107,53,0.07) 0%, transparent 55%)' }}
    >
      {/* Brand mark */}
      <div
        className="mb-6 flex h-18 w-18 items-center justify-center rounded-2xl bg-[#1f1510] border border-[#FF6B35]/25"
        style={{ width: 72, height: 72, boxShadow: '0 0 40px rgba(255, 107, 53, 0.2)' }}
      >
        <DoorOpen size={34} className="text-[#FF6B35]" />
      </div>

      {/* Welcome copy */}
      <h1 className="text-2xl font-bold text-foreground mb-3 text-center" style={{ letterSpacing: '-0.02em' }}>Welcome to Doors</h1>
      <p className="text-sm text-muted-foreground text-center max-w-xs mb-10 leading-relaxed">
        Track every door you knock, see your contact and close rates, and know exactly which blocks are worth your time.
      </p>

      {/* Territory creation form */}
      <div className="w-full max-w-sm rounded-2xl border border-[#FF6B35]/20 bg-[#1f1510]/30 p-6 backdrop-blur-sm">
        <h2 className="text-xs font-semibold text-[#FF6B35] mb-5 uppercase tracking-widest">Create your first territory</h2>

        <form onSubmit={handleCreate} className="space-y-5">
          <div>
            <label className="block text-xs text-muted-foreground mb-2 uppercase tracking-wide">Territory name *</label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Oakwood Heights"
              className="w-full rounded-xl border border-border bg-secondary/80 px-4 py-3.5 text-sm text-foreground placeholder-muted-foreground focus:border-[#FF6B35]/60 focus:outline-none focus:ring-1 focus:ring-[#FF6B35]/40 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-muted-foreground mb-2 uppercase tracking-wide">
              Starting address <span className="normal-case opacity-50">(optional — centers the map)</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 123 Main St, Charlotte, NC"
              className="w-full rounded-xl border border-border bg-secondary/80 px-4 py-3.5 text-sm text-foreground placeholder-muted-foreground focus:border-[#FF6B35]/60 focus:outline-none focus:ring-1 focus:ring-[#FF6B35]/40 transition-colors"
            />
          </div>

          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}

          <button
            type="submit"
            disabled={creating || !name.trim()}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#FF6B35] py-3.5 text-sm font-semibold text-[#0a0a0a] disabled:opacity-50 transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ boxShadow: (creating || !name.trim()) ? 'none' : '0 0 28px rgba(255, 107, 53, 0.3)' }}
          >
            {creating ? (
              'Creating…'
            ) : (
              <>
                Let&apos;s Go <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
