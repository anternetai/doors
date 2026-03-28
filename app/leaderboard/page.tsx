'use client'

import { useEffect, useState } from 'react'
import { Trophy, UserPlus } from 'lucide-react'
import { DoorsNav } from '@/components/doors-nav'
import { LeaderboardCard } from '@/components/leaderboard-card'
import { createClient } from '@/lib/supabase/client'

interface InsightsOverall {
  totalDoors: number
  totalAnswered: number
  totalPitched: number
  totalClosed: number
  totalRevenue: number
  contactRate: number
  pitchRate: number
  closeRate: number
  streak: number
}

interface InsightsResponse {
  overall: InsightsOverall
}

export default function LeaderboardPage() {
  const [email, setEmail] = useState<string | null>(null)
  const [stats, setStats] = useState<InsightsOverall | null>(null)
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const [{ data: userData }, insightsRes] = await Promise.all([
        supabase.auth.getUser(),
        fetch('/api/insights'),
      ])

      setEmail(userData.user?.email ?? null)

      if (insightsRes.ok) {
        const data = (await insightsRes.json()) as InsightsResponse
        setStats(data.overall)
      }

      setLoading(false)
    }

    load()
  }, [])

  const displayName = email ? email.split('@')[0] : 'You'

  return (
    <div className="flex min-h-screen flex-col pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 px-4 py-4 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy size={20} className="text-yellow-400" />
            <h1 className="text-lg font-bold">Leaderboard</h1>
          </div>
          {/* Pro badge */}
          <span className="rounded-full border border-[#22c55e]/30 bg-[#1a2e1a] px-2.5 py-1 text-xs font-semibold text-[#22c55e]">
            Pro
          </span>
        </div>
      </header>

      <main className="flex-1 px-4 py-5 space-y-4">
        {/* Solo notice */}
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-semibold text-foreground">Your Rankings</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Invite reps to your team to compete on a shared leaderboard.
          </p>
        </div>

        {/* Leaderboard card */}
        {loading ? (
          <div className="h-32 animate-pulse rounded-xl bg-card" />
        ) : (
          <LeaderboardCard
            rank={1}
            name={displayName}
            email={email ?? undefined}
            stats={{
              doors: stats?.totalDoors ?? 0,
              contactRate: stats?.contactRate ?? 0,
              closeRate: stats?.closeRate ?? 0,
              revenue: stats?.totalRevenue ?? 0,
            }}
            isCurrentUser
          />
        )}

        {/* Streak callout */}
        {!loading && stats && stats.streak > 0 && (
          <div className="rounded-xl border border-[#22c55e]/20 bg-[#1a2e1a]/30 px-4 py-3">
            <p className="text-sm font-semibold text-[#22c55e]">
              {stats.streak}-day streak
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Keep it going — consistency wins.
            </p>
          </div>
        )}

        {/* Invite CTA */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary border border-border">
              <UserPlus size={18} className="text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Invite your team</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Compete with your reps, track everyone&apos;s numbers, and see who&apos;s crushing it.
              </p>
              <button
                onClick={() => setShowInvite(true)}
                className="mt-3 rounded-lg border border-[#22c55e]/40 bg-[#1a2e1a]/50 px-3 py-2 text-xs font-semibold text-[#22c55e] transition-colors hover:bg-[#1a2e1a]"
              >
                Invite a rep
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Coming soon modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1a2e1a] border border-[#22c55e]/30 mx-auto">
              <Trophy size={24} className="text-[#22c55e]" />
            </div>
            <div className="text-center">
              <h2 className="font-bold text-foreground text-base">Teams — Coming Soon</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Team leaderboards are on the roadmap. You&apos;ll be able to invite reps, assign territories, and compete on a shared board.
              </p>
            </div>
            <button
              onClick={() => setShowInvite(false)}
              className="w-full rounded-xl bg-secondary py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary/70"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      <DoorsNav />
    </div>
  )
}
