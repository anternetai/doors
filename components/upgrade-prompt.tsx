'use client'

import { useState } from 'react'
import { X, Sparkles, Check, Zap } from 'lucide-react'
import { PLANS } from '@/lib/stripe'

interface UpgradePromptProps {
  feature?: string
  onClose: () => void
}

const FEATURE_LABELS: Record<string, string> = {
  ai_insights: 'AI Insights',
  pitch_recording: 'Pitch Recording',
  photo_capture: 'Photo Capture',
  share_cards: 'Share Cards',
  csv_export: 'CSV Export',
  sun_mode: 'Sun Mode',
}

const PRO_FEATURE_LIST = [
  { key: 'ai_insights', label: 'AI Insights', desc: 'Get territory grades, action items, and coaching' },
  { key: 'pitch_recording', label: 'Pitch Recording', desc: 'Record and replay your best pitches' },
  { key: 'photo_capture', label: 'Photo Capture', desc: 'Snap photos of signs, gates, and notes' },
  { key: 'share_cards', label: 'Share Cards', desc: 'Share your stats with your team or manager' },
  { key: 'csv_export', label: 'CSV Export', desc: 'Export all your data for reporting' },
  { key: 'sun_mode', label: 'Sun Mode', desc: 'High-contrast mode for bright outdoor conditions' },
]

export function UpgradePrompt({ feature, onClose }: UpgradePromptProps) {
  const [loading, setLoading] = useState(false)

  async function handleUpgrade() {
    setLoading(true)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: PLANS.pro.priceId }),
      })
      const data = await res.json() as { url?: string; error?: string }
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error ?? 'Failed to start checkout')
        setLoading(false)
      }
    } catch {
      alert('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const featureLabel = feature ? (FEATURE_LABELS[feature] ?? feature) : null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Beta banner */}
        <div className="flex items-center justify-center gap-2 bg-[#22c55e]/15 border-b border-[#22c55e]/20 px-4 py-2">
          <Zap size={14} className="text-[#22c55e]" />
          <span className="text-xs font-semibold text-[#22c55e]">
            During beta, all features are free
          </span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1a2e1a] border border-[#22c55e]/30">
              <Sparkles size={20} className="text-[#22c55e]" />
            </div>
            <div>
              <h2 className="font-bold text-foreground text-base">Upgrade to Pro</h2>
              <p className="text-xs text-muted-foreground mt-0.5">$39/month · Cancel anytime</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tried to access message */}
        {featureLabel && (
          <div className="mx-5 mb-4 rounded-lg bg-secondary/60 border border-border px-3 py-2.5">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{featureLabel}</span> is a Pro feature.
              Upgrade to unlock it.
            </p>
          </div>
        )}

        {/* Feature list */}
        <div className="px-5 pb-4 space-y-2">
          {PRO_FEATURE_LIST.map(({ key, label, desc }) => (
            <div key={key} className="flex items-start gap-2.5">
              <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#22c55e]/20">
                <Check size={10} className="text-[#22c55e]" strokeWidth={3} />
              </div>
              <div>
                <span className="text-sm font-medium text-foreground">{label}</span>
                <span className="text-xs text-muted-foreground"> — {desc}</span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="px-5 pb-5 pt-2 space-y-2">
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full rounded-xl bg-[#22c55e] py-3 text-sm font-bold text-[#0a0a0a] transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loading ? 'Redirecting…' : 'Upgrade to Pro — $39/mo'}
          </button>
          <button
            onClick={onClose}
            className="w-full rounded-xl py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  )
}
