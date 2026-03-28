'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Mic, Square, Play, Pause, Trash2 } from 'lucide-react'
import { PremiumBadge } from '@/components/premium-badge'

interface Props {
  /** Called when a recording is captured or cleared. Pass null to clear. */
  onRecorded: (audioUrl: string | null) => void
  /** If already have a recording from a previous session */
  initialAudioUrl?: string
}

type RecorderState = 'idle' | 'recording' | 'recorded'

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const mins = Math.floor(totalSec / 60)
  const secs = totalSec % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export function PitchRecorder({ onRecorded, initialAudioUrl }: Props) {
  const [state, setState] = useState<RecorderState>(
    initialAudioUrl ? 'recorded' : 'idle'
  )
  const [elapsed, setElapsed] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(initialAudioUrl ?? null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [micError, setMicError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number>(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Clean up object URLs and streams on unmount
  useEffect(() => {
    return () => {
      stopTick()
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
      if (audioUrl && !initialAudioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stopTick = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current)
      tickRef.current = null
    }
  }, [])

  async function handleStartRecording() {
    setMicError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Prefer opus/webm, fall back to whatever the browser supports
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : ''

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mimeType || 'audio/webm',
        })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        onRecorded(url)
        setState('recorded')
        // Stop mic tracks
        stream.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }

      recorder.start(100) // collect data every 100ms
      startTimeRef.current = Date.now()
      setState('recording')
      setElapsed(0)

      tickRef.current = setInterval(() => {
        setElapsed(Date.now() - startTimeRef.current)
      }, 500)
    } catch (err) {
      const msg =
        err instanceof DOMException && err.name === 'NotAllowedError'
          ? 'Microphone permission denied. Please allow access in your browser settings.'
          : err instanceof Error
          ? err.message
          : 'Could not access microphone'
      setMicError(msg)
    }
  }

  function handleStopRecording() {
    stopTick()
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
  }

  function handleDiscard() {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setIsPlaying(false)
    if (audioUrl && !initialAudioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setAudioUrl(null)
    onRecorded(null)
    setState('idle')
    setElapsed(0)
  }

  function handleTogglePlayback() {
    if (!audioUrl) return

    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl)
      audioRef.current.onended = () => {
        setIsPlaying(false)
        audioRef.current = null
      }
    }

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play().catch(() => setIsPlaying(false))
      setIsPlaying(true)
    }
  }

  // ---- Render ----------------------------------------------------------------

  if (state === 'idle') {
    return (
      <div className="space-y-1.5">
        <button
          type="button"
          onClick={handleStartRecording}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-secondary py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-[#FF6B35]/40 hover:text-foreground active:scale-95"
        >
          <Mic size={15} />
          Record Pitch
          <PremiumBadge />
        </button>
        {micError && (
          <p className="text-xs text-destructive px-1">{micError}</p>
        )}
      </div>
    )
  }

  if (state === 'recording') {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-[#FF6B35]/40 bg-[#1f1510]/60 px-4 py-3">
        {/* Pulsing red dot */}
        <span className="relative flex h-3 w-3 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
        </span>

        <span className="font-mono text-sm font-bold text-[#FF6B35] tabular-nums flex-1">
          {formatTime(elapsed)}
        </span>

        <button
          type="button"
          onClick={handleStopRecording}
          className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <Square size={11} className="fill-current" />
          Stop
        </button>
      </div>
    )
  }

  // state === 'recorded'
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#FF6B35]/30 bg-[#1f1510]/40 px-4 py-3">
      <Mic size={14} className="text-[#FF6B35] shrink-0" />
      <span className="flex-1 text-xs text-muted-foreground">Pitch recorded</span>

      <button
        type="button"
        onClick={handleTogglePlayback}
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors hover:text-foreground"
        aria-label={isPlaying ? 'Pause playback' : 'Play recording'}
      >
        {isPlaying ? <Pause size={14} /> : <Play size={14} />}
      </button>

      <button
        type="button"
        onClick={handleDiscard}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
        aria-label="Discard recording"
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}
