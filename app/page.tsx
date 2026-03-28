'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Trash2, MapPin, TrendingUp } from 'lucide-react'
import { DoorsNav } from '@/components/doors-nav'
import { OnboardingFlow } from '@/components/onboarding-flow'
import { DailySummary } from '@/components/daily-summary'
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
    <div className="flex min-h-screen flex-col pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/95 px-4 py-4 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1f1510] border border-[#FF6B35]/30">
            <span className="text-sm font-bold text-[#FF6B35]">D</span>
          </div>
          <h1 className="text-lg font-bold">Territories</h1>
        </div>
        <button
          onClick={() => setShowNewForm((v) => !v)}
          className="flex items-center gap-1.5 rounded-lg bg-[#FF6B35] px-3 py-2 text-sm font-semibold text-[#0a0a0a] transition-opacity hover:opacity-90"
        >
          <Plus size={16} />
          New
        </button>
      </header>

      <main className="flex-1 px-4 py-4">
        {/* Daily summary — only when territories exist */}
        {!loading && !error && territories.length > 0 && (
          <DailySummary />
        )}

        {/* New Territory Form */}
        {showNewForm && (
          <form
            onSubmit={handleCreate}
            className="mb-4 rounded-xl border border-[#FF6B35]/30 bg-[#1f1510]/40 p-4 space-y-3"
          >
            <h2 className="text-sm font-semibold text-[#FF6B35]">New Territory</h2>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Name *</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Oakwood Heights"
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:border-[#FF6B35] focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Address (optional — sets map center)</label>
              <input
                type="text"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="e.g. 123 Main St, Charlotte, NC"
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:border-[#FF6B35] focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={creating}
                className="flex-1 rounded-lg bg-[#FF6B35] py-2.5 text-sm font-semibold text-[#0a0a0a] disabled:opacity-50"
              >
                {creating ? 'Creating…' : 'Create Territory'}
              </button>
              <button
                type="button"
                onClick={() => setShowNewForm(false)}
                className="rounded-lg border border-border px-4 py-2.5 text-sm text-muted-foreground"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-card" />
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-destructive/15 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {!loading && !error && territories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MapPin size={40} className="text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">No territories yet.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Tap &quot;New&quot; to create your first territory.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {territories.map((t) => (
            <div key={t.id} className="relative group">
              <Link
                href={`/territories/${encodeURIComponent(t.name)}`}
                className="block rounded-xl border border-border bg-card p-4 transition-colors hover:border-[#FF6B35]/40 active:bg-secondary"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="font-semibold text-foreground pr-8">{t.name}</h2>
                    {t.address && (
                      <p className="text-xs text-muted-foreground mt-0.5">{t.address}</p>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                    {t.kpis.total_doors} door{t.kpis.total_doors !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Contact</p>
                    <p className="text-base font-bold text-foreground">
                      {t.kpis.total_doors > 0 ? fmtPct(t.kpis.contact_rate) : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Pitch</p>
                    <p className="text-base font-bold text-foreground">
                      {t.kpis.doors_answered > 0 ? fmtPct(t.kpis.pitch_rate) : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Close</p>
                    <p className="text-base font-bold text-[#FF6B35]">
                      {t.kpis.doors_pitched > 0 ? fmtPct(t.kpis.close_rate) : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Revenue</p>
                    <p className="text-base font-bold text-foreground">
                      {t.kpis.total_revenue > 0 ? fmtRevenue(t.kpis.total_revenue) : '—'}
                    </p>
                  </div>
                </div>

                {t.kpis.total_doors > 0 && (
                  <div className="mt-3 flex items-center gap-1.5">
                    <TrendingUp size={12} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {t.kpis.doors_answered} answered · {t.kpis.doors_pitched} pitched ·{' '}
                      {t.kpis.doors_closed} closed
                    </span>
                  </div>
                )}
              </Link>

              <button
                onClick={() => handleDelete(t.name, t.id)}
                disabled={deleteId === t.id}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-destructive/15 hover:text-destructive transition-all disabled:opacity-50"
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
