'use client'

import { useEffect, useState } from 'react'
import { Share2 } from 'lucide-react'
import { ShareCard } from '@/components/share-card'
import type { TodayStats } from '@/app/api/stats/today/route'

export function DailySummary() {
  const [stats, setStats] = useState<TodayStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showShare, setShowShare] = useState(false)

  useEffect(() => {
    fetch('/api/stats/today')
      .then((r) => r.json())
      .then((d: TodayStats) => setStats(d))
      .catch(() => {/* silently skip */})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="mb-4 h-20 animate-pulse rounded-xl bg-card" />
  }

  if (!stats) return null

  const hasActivity = stats.knocked > 0

  return (
    <>
      <div className="mb-4 rounded-xl border border-border bg-card px-4 py-3">
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Today</p>
          {hasActivity && (
            <button
              onClick={() => setShowShare(true)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-[#22c55e] transition-colors"
            >
              <Share2 size={12} />
              Share
            </button>
          )}
        </div>

        {!hasActivity ? (
          <p className="text-sm text-muted-foreground">
            No doors knocked yet today. Get after it.
          </p>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            <StatCell label="Doors" value={stats.knocked.toString()} />
            <StatCell
              label="Contacts"
              value={stats.answered.toString()}
            />
            <StatCell
              label="Closes"
              value={stats.closed.toString()}
              accent
            />
            <StatCell
              label="Revenue"
              value={stats.revenue > 0 ? fmtRevenue(stats.revenue) : '—'}
            />
          </div>
        )}
      </div>

      {showShare && stats && (
        <ShareCard stats={stats} onClose={() => setShowShare(false)} />
      )}
    </>
  )
}

function StatCell({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="text-center">
      <p className={`text-xl font-bold ${accent ? 'text-[#22c55e]' : 'text-foreground'}`}>
        {value}
      </p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  )
}

function fmtRevenue(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`
  return `$${n.toFixed(0)}`
}
