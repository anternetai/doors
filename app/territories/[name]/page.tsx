'use client'

import { use, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronDown, ChevronUp, Info, CheckCircle, AlertTriangle, X, Trash2 } from 'lucide-react'
import { TerritoryMap } from '@/components/territory-map'
import { DoorLogOverlay } from '@/components/door-log-overlay'
import type { TerritoryDoor, TerritoryKpis, Recommendation, DoorVisit } from '@/lib/types'

interface TerritoryDetail {
  id: string
  name: string
  address: string | null
  center_lat: number | null
  center_lng: number | null
  zoom_level: number | null
  kpis: TerritoryKpis
  recommendations: Recommendation[]
}

interface PendingDoor {
  lat: number
  lng: number
  isRevisit: boolean
  door?: TerritoryDoor
}

const DEFAULT_CENTER: [number, number] = [35.2271, -80.8431]
const DEFAULT_ZOOM = 15

export default function TerritoryDetailPage({
  params,
}: {
  params: Promise<{ name: string }>
}) {
  const { name: encodedName } = use(params)
  const name = decodeURIComponent(encodedName)
  const router = useRouter()

  const [territory, setTerritory] = useState<TerritoryDetail | null>(null)
  const [doors, setDoors] = useState<TerritoryDoor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER)
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM)

  const [pendingDoor, setPendingDoor] = useState<PendingDoor | null>(null)
  const [selectedDoor, setSelectedDoor] = useState<TerritoryDoor | null>(null)
  const [showBenchmarks, setShowBenchmarks] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const [tRes, dRes] = await Promise.all([
        fetch(`/api/territories/${encodeURIComponent(name)}`),
        fetch(`/api/territories/${encodeURIComponent(name)}/doors`),
      ])
      if (!tRes.ok) throw new Error('Territory not found')
      const tData = await tRes.json()
      const dData = dRes.ok ? await dRes.json() : []
      setTerritory(tData)
      setDoors(dData)
      if (tData.center_lat && tData.center_lng) {
        setMapCenter([tData.center_lat, tData.center_lng])
        setMapZoom(tData.zoom_level ?? DEFAULT_ZOOM)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [name])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  function handleMapMove(lat: number, lng: number, zoom: number) {
    fetch(`/api/territories/${encodeURIComponent(name)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ center_lat: lat, center_lng: lng, zoom_level: zoom }),
    }).catch(() => {}) // silently ignore
  }

  function handleNewDoor(lat: number, lng: number) {
    setPendingDoor({ lat, lng, isRevisit: false })
    setSelectedDoor(null)
  }

  function handleRevisit(door: TerritoryDoor) {
    setPendingDoor({ lat: door.lat, lng: door.lng, isRevisit: true, door })
    setSelectedDoor(null)
  }

  async function handleSaveVisit(visit: DoorVisit) {
    if (!pendingDoor) return
    try {
      if (pendingDoor.isRevisit && pendingDoor.door) {
        // Add visit to existing door
        await fetch(
          `/api/territories/${encodeURIComponent(name)}/doors/${pendingDoor.door.id}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ visit }),
          }
        )
      } else {
        // Create new door
        await fetch(`/api/territories/${encodeURIComponent(name)}/doors`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lat: pendingDoor.lat,
            lng: pendingDoor.lng,
            visit,
          }),
        })
      }
      setPendingDoor(null)
      await fetchData()
    } catch {
      alert('Failed to save visit')
    }
  }

  async function handleDeleteDoor(door: TerritoryDoor) {
    if (!confirm('Delete this door?')) return
    await fetch(
      `/api/territories/${encodeURIComponent(name)}/doors/${door.id}`,
      { method: 'DELETE' }
    )
    setSelectedDoor(null)
    await fetchData()
  }

  function fmtPct(n: number) {
    return `${Math.round(n * 100)}%`
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    )
  }

  if (error || !territory) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 px-4">
        <p className="text-sm text-destructive">{error ?? 'Territory not found'}</p>
        <button
          onClick={() => router.push('/')}
          className="text-sm text-[#22c55e] underline"
        >
          Back to territories
        </button>
      </div>
    )
  }

  const kpis = territory.kpis

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur z-30 shrink-0">
        <button
          onClick={() => router.push('/')}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold truncate">{territory.name}</h1>
          <p className="text-xs text-muted-foreground">
            {kpis.total_doors} door{kpis.total_doors !== 1 ? 's' : ''} · tap map to log
          </p>
        </div>
      </header>

      {/* KPI row */}
      <div className="flex gap-3 overflow-x-auto px-4 py-3 shrink-0 border-b border-border scrollbar-hide">
        {[
          { label: 'Doors', value: kpis.total_doors.toString(), accent: false },
          { label: 'Contact', value: kpis.total_doors > 0 ? fmtPct(kpis.contact_rate) : '—', accent: false },
          { label: 'Pitch', value: kpis.doors_answered > 0 ? fmtPct(kpis.pitch_rate) : '—', accent: false },
          { label: 'Close', value: kpis.doors_pitched > 0 ? fmtPct(kpis.close_rate) : '—', accent: true },
          { label: 'Revenue', value: kpis.total_revenue > 0 ? `$${kpis.total_revenue.toFixed(0)}` : '—', accent: false },
        ].map(({ label, value, accent }) => (
          <div
            key={label}
            className="flex shrink-0 flex-col items-center rounded-xl bg-card px-4 py-2.5 min-w-[72px]"
          >
            <span className={`text-xl font-bold ${accent ? 'text-[#22c55e]' : 'text-foreground'}`}>
              {value}
            </span>
            <span className="text-xs text-muted-foreground mt-0.5">{label}</span>
          </div>
        ))}
      </div>

      {/* Map — takes remaining space */}
      <div className="relative flex-1 min-h-0">
        <TerritoryMap
          center={mapCenter}
          zoom={mapZoom}
          doors={doors}
          onNewDoor={handleNewDoor}
          onDoorClick={setSelectedDoor}
          onRevisit={handleRevisit}
          onMapMove={handleMapMove}
        />

        {/* Map legend */}
        <div className="absolute bottom-4 left-4 z-[400] flex flex-col gap-1.5 rounded-xl border border-border bg-card/95 px-3 py-2.5 backdrop-blur text-xs">
          <LegendItem color="#6b7280" label="Not home" />
          <LegendItem color="#22c55e" label="Positive" />
          <LegendItem color="#ef4444" label="Not interested" />
          <div className="flex items-center gap-1.5 text-muted-foreground mt-0.5 border-t border-border pt-1.5">
            <span className="inline-block h-3 w-3 rounded-full border border-white/60 bg-transparent" />
            Ring = revisited
          </div>
        </div>
      </div>

      {/* Recommendations + benchmarks */}
      {(territory.recommendations.length > 0 || true) && (
        <div className="shrink-0 border-t border-border bg-background max-h-48 overflow-y-auto">
          {territory.recommendations.length > 0 && (
            <div className="flex flex-col gap-2 px-4 py-3">
              {territory.recommendations.map((rec, i) => (
                <RecommendationCard key={i} rec={rec} />
              ))}
            </div>
          )}

          {/* Benchmarks collapsible */}
          <button
            onClick={() => setShowBenchmarks((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-2.5 text-xs text-muted-foreground border-t border-border"
          >
            <span className="font-medium">Industry Benchmarks</span>
            {showBenchmarks ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {showBenchmarks && (
            <div className="px-4 pb-4 grid grid-cols-3 gap-3 text-xs">
              {[
                { metric: 'Contact Rate', target: '25–40%' },
                { metric: 'Pitch Rate', target: '60–80%' },
                { metric: 'Close Rate', target: '10–20%' },
              ].map(({ metric, target }) => (
                <div key={metric} className="rounded-lg bg-card p-2.5">
                  <p className="text-muted-foreground">{metric}</p>
                  <p className="font-bold text-foreground mt-0.5">{target}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Door log overlay (new or revisit) */}
      {pendingDoor && (
        <DoorLogOverlay
          lat={pendingDoor.lat}
          lng={pendingDoor.lng}
          isRevisit={pendingDoor.isRevisit}
          onSave={handleSaveVisit}
          onCancel={() => setPendingDoor(null)}
        />
      )}

      {/* Door detail popup */}
      {selectedDoor && (
        <DoorDetailPopup
          door={selectedDoor}
          onKnockAgain={() => {
            handleRevisit(selectedDoor)
          }}
          onDelete={() => handleDeleteDoor(selectedDoor)}
          onClose={() => setSelectedDoor(null)}
        />
      )}
    </div>
  )
}

// ---- Sub-components ---------------------------------------------------------

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-muted-foreground">
      <span
        className="inline-block h-3 w-3 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </div>
  )
}

function RecommendationCard({ rec }: { rec: Recommendation }) {
  const icons = {
    warning: <AlertTriangle size={14} className="text-yellow-400 shrink-0" />,
    info: <Info size={14} className="text-blue-400 shrink-0" />,
    success: <CheckCircle size={14} className="text-[#22c55e] shrink-0" />,
  }
  const bg = {
    warning: 'border-yellow-400/20 bg-yellow-400/5',
    info: 'border-blue-400/20 bg-blue-400/5',
    success: 'border-[#22c55e]/20 bg-[#22c55e]/5',
  }
  return (
    <div className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 ${bg[rec.type]}`}>
      {icons[rec.type]}
      <div>
        <p className="text-xs font-semibold text-foreground">{rec.title}</p>
        <p className="text-xs text-muted-foreground">{rec.message}</p>
      </div>
    </div>
  )
}

function DoorDetailPopup({
  door,
  onKnockAgain,
  onDelete,
  onClose,
}: {
  door: TerritoryDoor
  onKnockAgain: () => void
  onDelete: () => void
  onClose: () => void
}) {
  const latestVisit = door.visits[door.visits.length - 1]

  function statusLabel(): string {
    if (!latestVisit) return 'No visits'
    if (latestVisit.not_interested) return 'Not interested'
    if (latestVisit.closed) return 'Closed'
    if (latestVisit.pitched) return 'Pitched'
    if (latestVisit.answered) return 'Answered'
    return 'Not home'
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[500] rounded-t-2xl border-t border-border bg-card shadow-2xl">
      <div className="flex justify-center pt-3 pb-1">
        <div className="h-1 w-10 rounded-full bg-border" />
      </div>

      <div className="flex items-start justify-between px-4 py-3 border-b border-border">
        <div>
          <p className="text-sm font-semibold text-foreground">
            {door.lat.toFixed(5)}, {door.lng.toFixed(5)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {door.visits.length} visit{door.visits.length !== 1 ? 's' : ''} · {statusLabel()}
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground"
        >
          <X size={16} />
        </button>
      </div>

      {/* Visit history */}
      {door.visits.length > 0 && (
        <div className="px-4 py-3 max-h-36 overflow-y-auto space-y-2">
          {[...door.visits].reverse().map((v, i) => (
            <div key={i} className="flex items-start gap-3 text-xs">
              <span className="text-muted-foreground shrink-0">{v.date}</span>
              <span className="text-foreground">
                {v.not_interested
                  ? 'Not interested'
                  : v.closed
                  ? `Closed${v.revenue ? ` — $${v.revenue}` : ''}`
                  : v.pitched
                  ? 'Pitched'
                  : v.answered
                  ? 'Answered'
                  : 'Not home'}
                {v.notes && ` · ${v.notes}`}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3 px-4 py-4">
        <button
          onClick={onKnockAgain}
          className="flex-1 rounded-xl bg-[#22c55e] py-3 text-sm font-semibold text-[#0a0a0a]"
        >
          Knock Again
        </button>
        <button
          onClick={onDelete}
          className="flex h-12 w-12 items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}
