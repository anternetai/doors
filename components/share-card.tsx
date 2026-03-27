'use client'

import { useRef, useEffect } from 'react'
import { X, Download } from 'lucide-react'
import type { TodayStats } from '@/app/api/stats/today/route'

interface Props {
  stats: TodayStats
  onClose: () => void
}

function fmtPct(n: number): string {
  return `${Math.round(n * 100)}%`
}

function fmtRevenue(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`
  return `$${Math.round(n)}`
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function ShareCard({ stats, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const contactRate = stats.knocked > 0 ? stats.answered / stats.knocked : 0
  const pitchRate = stats.answered > 0 ? stats.pitched / stats.answered : 0
  const closeRate = stats.pitched > 0 ? stats.closed / stats.pitched : 0

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = 800
    const H = 480
    canvas.width = W
    canvas.height = H

    // Background
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, W, H)

    // Subtle grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.03)'
    ctx.lineWidth = 1
    for (let x = 0; x < W; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
    }
    for (let y = 0; y < H; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
    }

    // Green accent bar at top
    ctx.fillStyle = '#22c55e'
    ctx.fillRect(0, 0, W, 4)

    // Brand — "D" icon box
    const iconX = 48
    const iconY = 36
    const iconSize = 44
    roundRect(ctx, iconX, iconY, iconSize, iconSize, 10)
    ctx.fillStyle = '#1a2e1a'
    ctx.fill()
    ctx.strokeStyle = 'rgba(34,197,94,0.3)'
    ctx.lineWidth = 1.5
    ctx.stroke()
    ctx.fillStyle = '#22c55e'
    ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('D', iconX + iconSize / 2, iconY + iconSize / 2 + 9)

    // Brand name
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('Doors', iconX + iconSize + 12, iconY + iconSize / 2 + 8)

    // Date
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif'
    ctx.fillText(formatDate(), iconX + iconSize + 12, iconY + iconSize / 2 + 28)

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(48, 100)
    ctx.lineTo(W - 48, 100)
    ctx.stroke()

    // Stats grid — 5 stats in a row
    const statItems = [
      { label: 'Doors Knocked', value: stats.knocked.toString() },
      { label: 'Contact Rate', value: fmtPct(contactRate) },
      { label: 'Pitch Rate', value: fmtPct(pitchRate) },
      { label: 'Close Rate', value: fmtPct(closeRate) },
      { label: 'Revenue', value: stats.revenue > 0 ? fmtRevenue(stats.revenue) : '—' },
    ]

    const colW = (W - 96) / 5
    const statsY = 130

    statItems.forEach((item, i) => {
      const cx = 48 + colW * i + colW / 2

      // Card bg
      roundRect(ctx, 48 + colW * i + 4, statsY, colW - 8, 200, 12)
      ctx.fillStyle = 'rgba(255,255,255,0.04)'
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'
      ctx.lineWidth = 1
      ctx.stroke()

      // Value — close rate gets green accent
      const isAccent = item.label === 'Close Rate'
      ctx.fillStyle = isAccent ? '#22c55e' : '#ffffff'
      ctx.font = `bold 36px -apple-system, BlinkMacSystemFont, sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText(item.value, cx, statsY + 90)

      // Label
      ctx.fillStyle = 'rgba(255,255,255,0.45)'
      ctx.font = '13px -apple-system, BlinkMacSystemFont, sans-serif'
      ctx.fillText(item.label, cx, statsY + 118)
    })

    // Bottom domain
    ctx.fillStyle = 'rgba(255,255,255,0.25)'
    ctx.font = '13px -apple-system, BlinkMacSystemFont, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('thedoorsapp.com', W / 2, H - 24)

    // Green dot next to domain
    ctx.beginPath()
    ctx.arc(W / 2 - 82, H - 29, 4, 0, Math.PI * 2)
    ctx.fillStyle = '#22c55e'
    ctx.fill()
  }, [stats, contactRate, pitchRate, closeRate])

  async function handleShare() {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.toBlob(async (blob) => {
      if (!blob) return

      // Try native share (mobile)
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], 'doors-stats.png', { type: 'image/png' })
        if (navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: 'My Doors Stats',
              text: `${stats.knocked} doors knocked today — ${fmtPct(closeRate)} close rate`,
            })
            return
          } catch {
            // Fall through to download
          }
        }
      }

      // Fallback: download
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `doors-stats-${new Date().toISOString().split('T')[0]}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 'image/png')
  }

  return (
    <div className="fixed inset-0 z-[600] flex items-end justify-center bg-black/70 backdrop-blur-sm p-4 pb-8">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <p className="text-sm font-semibold text-foreground">Share Today&apos;s Stats</p>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground"
          >
            <X size={16} />
          </button>
        </div>

        {/* Canvas preview */}
        <div className="p-3">
          <canvas
            ref={canvasRef}
            className="w-full rounded-xl"
            style={{ imageRendering: 'crisp-edges' }}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-4 pb-4">
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#22c55e] py-3 text-sm font-semibold text-[#0a0a0a]"
          >
            Share
          </button>
          <button
            onClick={handleShare}
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Download"
          >
            <Download size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

// Helper to draw rounded rects (canvas doesn't have it natively in older envs)
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}
