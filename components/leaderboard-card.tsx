'use client'

import { Crown } from 'lucide-react'

interface LeaderboardCardProps {
  rank: number
  name: string
  email?: string
  stats: {
    doors: number
    contactRate: number
    closeRate: number
    revenue: number
  }
  isCurrentUser?: boolean
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function fmtPct(n: number): string {
  return `${Math.round(n * 100)}%`
}

function fmtRevenue(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`
  return `$${n.toFixed(0)}`
}

const RANK_COLORS: Record<number, string> = {
  1: 'text-yellow-400',
  2: 'text-slate-400',
  3: 'text-amber-600',
}

export function LeaderboardCard({ rank, name, email, stats, isCurrentUser }: LeaderboardCardProps) {
  const rankColor = RANK_COLORS[rank] ?? 'text-muted-foreground'

  return (
    <div
      className={`rounded-xl border bg-card p-4 transition-colors ${
        isCurrentUser
          ? 'border-[#22c55e]/40 bg-[#1a2e1a]/30'
          : 'border-border'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Rank */}
        <div className={`w-8 text-center font-bold text-lg shrink-0 ${rankColor}`}>
          {rank === 1 ? <Crown size={22} className="mx-auto text-yellow-400" /> : `#${rank}`}
        </div>

        {/* Avatar */}
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${
            isCurrentUser
              ? 'border-[#22c55e]/50 bg-[#1a2e1a] text-[#22c55e]'
              : 'border-border bg-secondary text-foreground'
          }`}
        >
          {getInitials(name)}
        </div>

        {/* Name + email */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-foreground">{name}</p>
            {isCurrentUser && (
              <span className="shrink-0 rounded-full bg-[#22c55e]/20 px-1.5 py-0.5 text-[10px] font-semibold text-[#22c55e]">
                You
              </span>
            )}
          </div>
          {email && (
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-3 grid grid-cols-4 gap-2 border-t border-border pt-3">
        <div className="text-center">
          <p className="text-base font-bold text-foreground">{stats.doors}</p>
          <p className="text-[10px] text-muted-foreground">Doors</p>
        </div>
        <div className="text-center">
          <p className="text-base font-bold text-foreground">{fmtPct(stats.contactRate)}</p>
          <p className="text-[10px] text-muted-foreground">Contact</p>
        </div>
        <div className="text-center">
          <p className="text-base font-bold text-[#22c55e]">{fmtPct(stats.closeRate)}</p>
          <p className="text-[10px] text-muted-foreground">Close</p>
        </div>
        <div className="text-center">
          <p className="text-base font-bold text-foreground">{fmtRevenue(stats.revenue)}</p>
          <p className="text-[10px] text-muted-foreground">Revenue</p>
        </div>
      </div>
    </div>
  )
}
