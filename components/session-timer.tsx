'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Square, Clock } from 'lucide-react'

const STORAGE_KEY = 'doors_session_timer'

interface SessionState {
  startedAt: number   // Date.now() when session started
  territoryName: string
}

interface SessionSummary {
  durationMs: number
  doorsKnocked: number
  doorsAnswered: number
  contactRate: number
}

interface Props {
  territoryName: string
  /** Live door count for this territory (total doors logged today or all-time) */
  doorsKnocked: number
  doorsAnswered: number
}

function loadSession(): SessionState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as SessionState
  } catch {
    return null
  }
}

function saveSession(state: SessionState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEY)
}

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const mins = Math.floor(totalSec / 60)
  const secs = totalSec % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export function SessionTimer({ territoryName, doorsKnocked, doorsAnswered }: Props) {
  const [session, setSession] = useState<SessionState | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [summary, setSummary] = useState<SessionSummary | null>(null)
  const [doorsAtStart, setDoorsAtStart] = useState(0)
  const [answeredAtStart, setAnsweredAtStart] = useState(0)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const stored = loadSession()
    if (stored && stored.territoryName === territoryName) {
      setSession(stored)
      setElapsed(Date.now() - stored.startedAt)
    }
  }, [territoryName])

  const stopTick = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current)
      tickRef.current = null
    }
  }, [])

  // Start/stop interval when session changes
  useEffect(() => {
    if (session) {
      tickRef.current = setInterval(() => {
        setElapsed(Date.now() - session.startedAt)
      }, 1000)
    } else {
      stopTick()
    }
    return stopTick
  }, [session, stopTick])

  function handleStart() {
    setSummary(null)
    const state: SessionState = { startedAt: Date.now(), territoryName }
    saveSession(state)
    setSession(state)
    setElapsed(0)
    setDoorsAtStart(doorsKnocked)
    setAnsweredAtStart(doorsAnswered)
  }

  function handleStop() {
    if (!session) return
    const durationMs = Date.now() - session.startedAt
    const sessionDoors = Math.max(0, doorsKnocked - doorsAtStart)
    const sessionAnswered = Math.max(0, doorsAnswered - answeredAtStart)
    setSummary({
      durationMs,
      doorsKnocked: sessionDoors,
      doorsAnswered: sessionAnswered,
      contactRate: sessionDoors > 0 ? sessionAnswered / sessionDoors : 0,
    })
    clearSession()
    setSession(null)
    setElapsed(0)
  }

  function handleDismissSummary() {
    setSummary(null)
  }

  if (summary) {
    return (
      <div className="mx-4 mb-3 rounded-xl border border-[#FF6B35]/30 bg-[#1f1510]/60 p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-[#FF6B35] uppercase tracking-wide">Session Summary</p>
          <button
            onClick={handleDismissSummary}
            className="text-xs text-muted-foreground underline"
          >
            Dismiss
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <p className="text-lg font-bold text-foreground">{formatDuration(summary.durationMs)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Time</p>
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{summary.doorsKnocked}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Doors</p>
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{summary.doorsAnswered}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Contacts</p>
          </div>
          <div>
            <p className="text-lg font-bold text-[#FF6B35]">
              {Math.round(summary.contactRate * 100)}%
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Contact</p>
          </div>
        </div>
      </div>
    )
  }

  if (session) {
    const sessionDoors = Math.max(0, doorsKnocked - doorsAtStart)
    return (
      <div className="mx-4 mb-3 flex items-center gap-3 rounded-xl border border-[#FF6B35]/40 bg-[#1f1510]/60 px-4 py-2.5">
        <Clock size={14} className="text-[#FF6B35] shrink-0" />
        <span className="font-mono text-sm font-bold text-[#FF6B35] tabular-nums">
          {formatDuration(elapsed)}
        </span>
        <span className="text-xs text-muted-foreground">
          {sessionDoors} door{sessionDoors !== 1 ? 's' : ''}
        </span>
        <div className="ml-auto">
          <button
            onClick={handleStop}
            className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Square size={11} className="fill-current" />
            Stop
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-4 mb-3">
      <button
        onClick={handleStart}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-secondary py-2.5 text-sm font-medium text-muted-foreground hover:border-[#FF6B35]/40 hover:text-foreground transition-colors"
      >
        <Play size={14} className="fill-current" />
        Start Knocking
      </button>
    </div>
  )
}
