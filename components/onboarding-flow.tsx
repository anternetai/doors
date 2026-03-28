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
    <div className="flex min-h-screen flex-col items-center justify-center px-6 pb-20">
      {/* Brand mark */}
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1f1510] border border-[#FF6B35]/30">
        <DoorOpen size={32} className="text-[#FF6B35]" />
      </div>

      {/* Welcome copy */}
      <h1 className="text-2xl font-bold text-foreground mb-2 text-center">Welcome to Doors</h1>
      <p className="text-sm text-muted-foreground text-center max-w-xs mb-8">
        Track every door you knock, see your contact and close rates, and know exactly which blocks are worth your time.
      </p>

      {/* Territory creation form */}
      <div className="w-full max-w-sm rounded-2xl border border-[#FF6B35]/30 bg-[#1f1510]/40 p-6">
        <h2 className="text-base font-semibold text-[#FF6B35] mb-4">Create your first territory</h2>

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Territory name *</label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Oakwood Heights"
              className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:border-[#FF6B35] focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
            />
          </div>

          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">
              Starting address <span className="text-muted-foreground/60">(optional — centers the map)</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 123 Main St, Charlotte, NC"
              className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:border-[#FF6B35] focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
            />
          </div>

          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}

          <button
            type="submit"
            disabled={creating || !name.trim()}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#FF6B35] py-3.5 text-sm font-semibold text-[#0a0a0a] disabled:opacity-50 transition-opacity active:opacity-80"
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
