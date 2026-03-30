'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Trash2, MapPin, TrendingUp } from 'lucide-react'
import { DoorsNav } from '@/components/doors-nav'
import { OnboardingFlow } from '@/components/onboarding-flow'
import { DailySummary } from '@/components/daily-summary'
import { CommissionDisplay } from '@/components/commission-display'
import { DoorsIcon } from '@/components/doors-icon'
import type { TerritoryWithKpis } from '@/lib/types'

export default function TerritoriesPage() {
  const [territories, setTerritories] = useState<TerritoryWithKpis[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newAddress, setNewAddress] = useState('')
  const [creating, setCreating] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchTerritories = useCallback(async () => {
    try {
      const res = await fetch('/api/territories')
      if (!res.ok) throw new Error('Failed to load territories')
      const data = await res.json()
      setTerritories(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTerritories()
  }, [fetchTerritories])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/territories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), address: newAddress.trim() || null }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Failed to create territory')
      }
      setNewName('')
      setNewAddress('')
      setShowNewForm(false)
      await fetchTerritories()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error')
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(name: string, id: string) {
    if (!confirm(`Delete territory "${name}"? This cannot be undone.`)) return
    setDeleteId(id)
    try {
      const res = await fetch(`/api/territories/${encodeURIComponent(name)}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete')
      await fetchTerritories()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error')
    } finally {
      setDeleteId(null)
    }
  }

  function fmtPct(n: number) {
    return `${Math.round(n * 100)}%`
  }

  function fmtRevenue(n: number) {
    if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`
    return `$${n.toFixed(0)}`
  }

  // Show onboarding when we know for sure there are 0 territories (not loading, no error)
  if (!loading && !error && territories.length === 0) {
    return (
      <>
        <OnboardingFlow onCreated={fetchTerritories} />
        <DoorsNav />
      </>
    )
  }

  return (
    <div className="flex min-h-screen flex-col pb-20 dot-grid">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/90 px-4 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <DoorsIcon size={24} />
          <h1 className="text-lg font-bold heading-tight">Territories</h1>
        </div>
        <button
          onClick={() => setShowNewForm((v) => !v)}
          className="flex items-center gap-1.5 rounded-lg bg-[#22c55e] px-3.5 py-2 text-sm font-semibold text-[#0a0a0a] transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
          style={{ boxShadow: '0 0 20px rgba(34, 197, 94, 0.3)' }}
        >
          <Plus size={16} />
          New
        </button>
      </header>

      <main className="flex-1 px-4 py-5">
        {/* Daily summary — only when territories exist */}
        {!loading && !error && territories.length > 0 && (
          <DailySummary />
        )}

        {/* Commission display — only when territories exist */}
        {!loading && !error && territories.length > 0 && (
          <CommissionDisplay />
        )}

        {/* New Territory Form */}
        {showNewForm && (
          <form
            onSubmit={handleCreate}
            className="mb-5 rounded-2xl border border-[#22c55e]/20 bg-[#1a2e1a]/30 p-5 space-y-4 backdrop-blur-sm"
          >
            <h2 className="text-xs font-semibold text-[#22c55e] tracking-widest uppercase">New Territory</h2>
            <div>
              <label className="block text-xs text-muted-foreground mb-2">Name *</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Oakwood Heights"
                className="w-full rounded-xl border border-border bg-secondary/80 px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:border-[#22c55e]/60 focus:outline-none focus:ring-1 focus:ring-[#22c55e]/40 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-2">
                Address <span className="opacity-50">(optional — sets map center)</span>
              </label>
              <input
                type="text"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="e.g. 123 Main St, Charlotte, NC"
                className="w-full rounded-xl border border-border bg-secondary/80 px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:border-[#22c55e]/60 focus:outline-none focus:ring-1 focus:ring-[#22c55e]/40 transition-colors"
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={creating}
                className="flex-1 rounded-xl bg-[#22c55e] py-3 text-sm font-semibold text-[#0a0a0a] disabled:opacity-50 transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ boxShadow: creating ? 'none' : '0 0 24px rgba(34, 197, 94, 0.25)' }}
              >
                {creating ? 'Creating…' : 'Create Territory'}
              </button>
              <button
                type="button"
                onClick={() => setShowNewForm(false)}
                className="rounded-xl border border-border px-5 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 animate-pulse rounded-2xl bg-card/60" />
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-destructive/15 px-4 py-3 text-sm text-destructive border border-destructive/20">
            {error}
          </div>
        )}

        {!loading && !error && territories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1a2e1a] border border-[#22c55e]/20">
              <MapPin size={28} className="text-[#22c55e]/60" />
            </div>
            <p className="text-base font-semibold text-foreground mb-1.5 heading-tight">No territories yet</p>
            <p className="text-sm text-muted-foreground max-w-[220px] leading-relaxed">
              Tap &ldquo;New&rdquo; above to create your first territory and start tracking doors.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {territories.map((t) => (
            <div key={t.id} className="relative group">
              <Link
                href={`/territories/${encodeURIComponent(t.name)}`}
                className="block rounded-2xl border border-white/[0.06] bg-[#111118]/80 p-5 transition-all hover:border-[#22c55e]/25 hover:bg-[#111118] active:scale-[0.99] backdrop-blur-sm"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="font-semibold text-foreground pr-10 heading-tight text-[15px]">{t.name}</h2>
                    {t.address && (
                      <p className="text-xs text-muted-foreground mt-0.5">{t.address}</p>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground bg-white/[0.05] border border-white/[0.06] px-2.5 py-1 rounded-lg">
                    {t.kpis.total_doors} door{t.kpis.total_doors !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <p className="text-[11px] text-muted-foreground mb-1">Contact</p>
                    <p className="text-lg font-bold text-foreground heading-tight">
                      {t.kpis.total_doors > 0 ? fmtPct(t.kpis.contact_rate) : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground mb-1">Pitch</p>
                    <p className="text-lg font-bold text-foreground heading-tight">
                      {t.kpis.doors_answered > 0 ? fmtPct(t.kpis.pitch_rate) : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground mb-1">Close</p>
                    <p className="text-lg font-bold text-[#22c55e] heading-tight">
                      {t.kpis.doors_pitched > 0 ? fmtPct(t.kpis.close_rate) : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground mb-1">Revenue</p>
                    <p className="text-lg font-bold text-foreground heading-tight">
                      {t.kpis.total_revenue > 0 ? fmtRevenue(t.kpis.total_revenue) : '—'}
                    </p>
                  </div>
                </div>

                {t.kpis.total_doors > 0 && (
                  <div className="mt-3.5 flex items-center gap-1.5 pt-3.5 border-t border-white/[0.04]">
                    <TrendingUp size={11} className="text-muted-foreground" />
                    <span className="text-[11px] text-muted-foreground">
                      {t.kpis.doors_answered} answered · {t.kpis.doors_pitched} pitched ·{' '}
                      {t.kpis.doors_closed} closed
                    </span>
                  </div>
                )}
              </Link>

              <button
                onClick={() => handleDelete(t.name, t.id)}
                disabled={deleteId === t.id}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-destructive/15 hover:text-destructive transition-all disabled:opacity-50"
                aria-label={`Delete ${t.name}`}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </main>

      <DoorsNav />
    </div>
  )
}
