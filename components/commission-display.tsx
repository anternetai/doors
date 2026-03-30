'use client'

import { useEffect, useState } from 'react'

interface CommissionStructure {
  type: 'flat' | 'percentage' | 'tiered'
  rate: number
}

interface CommissionPeriod {
  closes: number
  revenue: number
  earned: number
}

interface CommissionData {
  structure: CommissionStructure
  currency: string
  today: CommissionPeriod
  thisWeek: CommissionPeriod
  thisMonth: CommissionPeriod
  projected: number
}

function fmtMoney(n: number, currency = 'USD'): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`
  if (currency === 'USD') return `$${n.toFixed(0)}`
  return `${n.toFixed(0)} ${currency}`
}

function SkeletonCell() {
  return (
    <div className="text-center">
      <div className="mx-auto mb-1.5 h-6 w-14 animate-pulse rounded-lg bg-white/[0.06]" />
      <div className="mx-auto h-3 w-10 animate-pulse rounded bg-white/[0.04]" />
    </div>
  )
}

export function CommissionDisplay() {
  const [data, setData] = useState<CommissionData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/commission')
      .then((r) => (r.ok ? r.json() : null))
      .then((d: CommissionData | null) => setData(d))
      .catch(() => {/* silently skip */})
      .finally(() => setLoading(false))
  }, [])

  const isSetup = data && data.structure.rate > 0

  return (
    <div className="mb-4 rounded-2xl border border-white/[0.06] bg-[#111118]/80 px-5 py-4 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
          Commission
        </p>
        {data && isSetup && (
          <span className="text-[10px] text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/20 px-1.5 py-0.5 rounded-md font-medium capitalize">
            {data.structure.type}
          </span>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-2">
          <SkeletonCell />
          <SkeletonCell />
          <SkeletonCell />
        </div>
      ) : !isSetup ? (
        <p className="text-sm text-muted-foreground">
          Tap the chat to set up your commission
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          <CommCell label="Today" value={fmtMoney(data.today.earned, data.currency)} />
          <CommCell label="This Week" value={fmtMoney(data.thisWeek.earned, data.currency)} />
          <CommCell label="This Month" value={fmtMoney(data.thisMonth.earned, data.currency)} />
        </div>
      )}
    </div>
  )
}

function CommCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold text-[#22c55e] heading-tighter">{value}</p>
      <p className="text-[11px] text-muted-foreground mt-1">{label}</p>
    </div>
  )
}
