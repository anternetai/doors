'use client'

import { useState } from 'react'
import { X, ChevronRight } from 'lucide-react'
import { PhotoCapture } from '@/components/photo-capture'
import { PitchRecorder } from '@/components/pitch-recorder'
import type { DoorVisit } from '@/lib/types'

interface Props {
  lat: number
  lng: number
  isRevisit?: boolean
  onSave: (visit: DoorVisit) => Promise<void>
  onCancel: () => void
}

type Step = 1 | 2 | 3 | 4

export function DoorLogOverlay({ lat, lng, isRevisit, onSave, onCancel }: Props) {
  const [step, setStep] = useState<Step>(1)
  const [saving, setSaving] = useState(false)

  // Step 1
  const today = new Date().toISOString().split('T')[0]
  const nowTime = new Date().toTimeString().slice(0, 5)
  const [date, setDate] = useState(today)
  const [time, setTime] = useState(nowTime)
  const [answered, setAnswered] = useState<boolean | null>(null)

  // Step 2
  const [pitched, setPitched] = useState<boolean | null>(null)

  // Step 3
  const [closed, setClosed] = useState<boolean | null>(null)
  const [notInterested, setNotInterested] = useState(false)

  // Step 4
  const [notes, setNotes] = useState('')
  const [revenue, setRevenue] = useState('')
  const [photo, setPhoto] = useState<string | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  async function handleSave() {
    setSaving(true)
    const visit: DoorVisit = {
      date,
      time,
      answered: answered ?? false,
      pitched: pitched ?? false,
      closed: closed ?? false,
      not_interested: notInterested,
      notes: notes.trim() || undefined,
      revenue: closed && revenue ? parseFloat(revenue) : undefined,
      photo: photo ?? undefined,
      audioUrl: audioUrl ?? undefined,
    }
    await onSave(visit)
    setSaving(false)
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[500] bg-card border-t border-border rounded-t-2xl shadow-2xl"
      style={{ maxHeight: '80vh', overflow: 'auto' }}
    >
      {/* Handle bar */}
      <div className="flex justify-center pt-3 pb-1">
        <div className="h-1 w-10 rounded-full bg-border" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 pb-4">
        <div>
          <h2 className="font-semibold text-foreground">
            {isRevisit ? 'Log Revisit' : 'Log New Door'}
          </h2>
          <p className="text-xs text-muted-foreground">
            {lat.toFixed(5)}, {lng.toFixed(5)}
          </p>
        </div>
        <button
          onClick={onCancel}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground"
        >
          <X size={16} />
        </button>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-1 px-4 mb-4">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors ${
              s <= step ? 'bg-[#FF6B35]' : 'bg-border'
            }`}
          />
        ))}
      </div>

      <div className="px-4 pb-6 space-y-4">
        {/* Step 1: Date/time + answered */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground focus:border-[#FF6B35] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground focus:border-[#FF6B35] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-foreground mb-3">Did they answer?</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setAnswered(true); setStep(2) }}
                  className="rounded-xl border-2 border-[#FF6B35] bg-[#FF6B35]/10 py-4 text-sm font-semibold text-[#FF6B35] transition-all active:scale-95"
                >
                  Yes, answered
                </button>
                <button
                  onClick={() => { setAnswered(false); setStep(4) }}
                  className="rounded-xl border-2 border-border bg-secondary py-4 text-sm font-semibold text-muted-foreground transition-all active:scale-95"
                >
                  Not home
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Pitched? */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm font-medium text-foreground">Did you pitch them?</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { setPitched(true); setStep(3) }}
                className="rounded-xl border-2 border-[#FF6B35] bg-[#FF6B35]/10 py-4 text-sm font-semibold text-[#FF6B35] transition-all active:scale-95"
              >
                Yes, pitched
              </button>
              <button
                onClick={() => { setPitched(false); setStep(4) }}
                className="rounded-xl border-2 border-border bg-secondary py-4 text-sm font-semibold text-muted-foreground transition-all active:scale-95"
              >
                Just talked
              </button>
            </div>
            <button
              onClick={() => setStep(1)}
              className="text-xs text-muted-foreground underline"
            >
              Back
            </button>
          </div>
        )}

        {/* Step 3: Closed? */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm font-medium text-foreground">How did it go?</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => { setClosed(true); setNotInterested(false); setStep(4) }}
                className="rounded-xl border-2 border-[#FF6B35] bg-[#FF6B35]/10 py-4 text-sm font-semibold text-[#FF6B35] transition-all active:scale-95"
              >
                Closed the deal!
              </button>
              <button
                onClick={() => { setClosed(false); setNotInterested(false); setStep(4) }}
                className="rounded-xl border-2 border-border bg-secondary py-4 text-sm font-semibold text-muted-foreground transition-all active:scale-95"
              >
                Not yet — follow up
              </button>
              <button
                onClick={() => { setClosed(false); setNotInterested(true); setStep(4) }}
                className="rounded-xl border-2 border-destructive/40 bg-destructive/10 py-4 text-sm font-semibold text-destructive transition-all active:scale-95"
              >
                Not interested
              </button>
            </div>
            <button
              onClick={() => setStep(2)}
              className="text-xs text-muted-foreground underline"
            >
              Back
            </button>
          </div>
        )}

        {/* Step 4: Photo + Pitch recording + Notes + revenue */}
        {step === 4 && (
          <div className="space-y-4">
            <PhotoCapture photo={photo} onChange={setPhoto} />

            <PitchRecorder onRecorded={(url) => setAudioUrl(url)} />

            <div>
              <label className="block text-xs text-muted-foreground mb-1">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Anything to remember about this door…"
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:border-[#FF6B35] focus:outline-none resize-none"
              />
            </div>

            {closed && (
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Revenue ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={revenue}
                  onChange={(e) => setRevenue(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:border-[#FF6B35] focus:outline-none"
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(answered ? (pitched ? 3 : 2) : 1)}
                className="rounded-xl border border-border px-4 py-3 text-sm text-muted-foreground"
              >
                Back
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#FF6B35] py-3 text-sm font-semibold text-[#0a0a0a] disabled:opacity-50"
              >
                {saving ? 'Saving…' : (
                  <>Save Visit <ChevronRight size={16} /></>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
