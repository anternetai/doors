'use client'

import { useEffect, useState } from 'react'

interface WaitlistCounterProps {
  /** Seed value used until the real count loads (prevents 0-flash) */
  seed?: number
  className?: string
}

export function WaitlistCounter({ seed = 247, className }: WaitlistCounterProps) {
  const [count, setCount] = useState<number>(seed)
  const [isLive, setIsLive] = useState(false)

  async function fetchCount() {
    try {
      const res = await fetch('/api/waitlist', { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      // Only update if the real count is meaningful (> 0)
      if (typeof data.count === 'number' && data.count > 0) {
        setCount(data.count)
      }
      setIsLive(true)
    } catch {
      // Fail silently — show seed value
    }
  }

  useEffect(() => {
    fetchCount()
    // Poll every 30 seconds
    const id = setInterval(fetchCount, 30_000)
    return () => clearInterval(id)
  }, [])

  return (
    <span className={className}>
      <span
        className="inline-flex items-center gap-1.5 text-[#22c55e] font-semibold"
      >
        <span
          className="inline-block h-1.5 w-1.5 rounded-full bg-[#22c55e] animate-pulse"
          aria-hidden="true"
        />
        {count.toLocaleString()} reps on the waitlist
        {isLive && (
          <span className="text-[rgba(245,245,247,0.3)] font-normal text-xs">· live</span>
        )}
      </span>
    </span>
  )
}
