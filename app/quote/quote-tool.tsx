'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ArrowLeft, Minus, Plus, X, Check, Copy, MessageSquare, ExternalLink, Loader2, Sun, Moon, PlusCircle,
} from 'lucide-react'
import {
  WINDOW_TYPES, computeQuote, lineKey, unitPrice,
  type WindowType, type Story, type Coverage, type TallyLine,
} from '@/lib/window-pricing'

const STORIES: Story[] = [1, 2, 3]
const STORY_LABEL: Record<Story, string> = { 1: '1st', 2: '2nd', 3: '3rd' }
const COVERAGES: { key: Coverage; label: string }[] = [
  { key: 'exterior', label: 'Exterior' },
  { key: 'both', label: 'In & Out' },
]
const TYPE_LABEL: Record<WindowType, string> = { standard: 'Standard', picture: 'Picture', french: 'French' }

const LS_COUNTS = 'dq_quote_counts'
const LS_MODE = 'dq_quote_mode'

interface ExtraLine {
  id: string
  name: string
  price: string
}

let _lineId = 0
function newLineId() { return `line-${++_lineId}` }

function parseKey(k: string): { type: WindowType; story: Story; coverage: Coverage } {
  const [type, story, coverage] = k.split('-')
  return { type: type as WindowType, story: Number(story) as Story, coverage: coverage as Coverage }
}
function toLines(counts: Record<string, number>): TallyLine[] {
  return Object.entries(counts)
    .filter(([, c]) => c > 0)
    .map(([k, c]) => ({ ...parseKey(k), count: c }))
}
function fmt(n: number) { return `$${n.toLocaleString()}` }
function vibrate(ms = 10) { if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(ms) }

/* ── Address autocomplete (Google via /api/address-suggest, Photon fallback) ── */
function AddressInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [sugs, setSugs] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const deb = useRef<ReturnType<typeof setTimeout> | null>(null)
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDoc(e: MouseEvent) { if (box.current && !box.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  function handle(v: string) {
    onChange(v)
    if (deb.current) clearTimeout(deb.current)
    if (v.trim().length < 3) { setSugs([]); return }
    setLoading(true)
    deb.current = setTimeout(() => {
      fetch(`/api/address-suggest?q=${encodeURIComponent(v)}`)
        .then((r) => r.json())
        .then((d: { suggestions?: string[] }) => { setSugs(d.suggestions ?? []); setOpen(true) })
        .catch(() => {})
        .finally(() => setLoading(false))
    }, 250)
  }

  return (
    <div ref={box} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => handle(e.target.value)}
        onFocus={() => sugs.length && setOpen(true)}
        placeholder="Property address"
        autoComplete="off"
        className="w-full rounded-xl border border-border bg-secondary/80 px-3 py-3 text-base text-foreground placeholder-muted-foreground focus:border-primary/60 focus:outline-none transition-colors"
      />
      {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />}
      {open && sugs.length > 0 && (
        <ul className="absolute z-30 mt-1 w-full overflow-hidden rounded-xl border border-border bg-popover shadow-2xl">
          {sugs.map((s) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => { onChange(s); setOpen(false) }}
                className="w-full px-4 py-3 text-left text-sm text-foreground hover:bg-secondary transition-colors"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function QuoteTool() {
  const router = useRouter()
  const search = useSearchParams()

  const [screen, setScreen] = useState<'tally' | 'customer' | 'success' | 'edit'>('tally')
  const [story, setStory] = useState<Story>(1)
  const [coverage, setCoverage] = useState<Coverage>('exterior')
  const [counts, setCounts] = useState<Record<string, number>>({})

  const [first, setFirst] = useState('')
  const [last, setLast] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')

  const [extraLines, setExtraLines] = useState<ExtraLine[]>([])

  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ token: string; url: string; total: number } | null>(null)
  const [copied, setCopied] = useState(false)
  const [sun, setSun] = useState(false)

  // Edit-after-creation state
  const [editLines, setEditLines] = useState<{ id: string; name: string; price: string }[]>([])
  const [editFetching, setEditFetching] = useState(false)
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  // Sun mode (high-contrast for direct sunlight) — toggles the app's .sun theme.
  useEffect(() => {
    try {
      if (localStorage.getItem('doors_sun') === '1') {
        document.documentElement.classList.add('sun')
        setSun(true)
      }
    } catch {}
  }, [])
  function toggleSun() {
    const next = !sun
    setSun(next)
    document.documentElement.classList.toggle('sun', next)
    try { localStorage.setItem('doors_sun', next ? '1' : '0') } catch {}
  }

  // Load persisted tally
  useEffect(() => {
    try {
      const c = localStorage.getItem(LS_COUNTS)
      if (c) setCounts(JSON.parse(c))
      const m = localStorage.getItem(LS_MODE)
      if (m) { const p = JSON.parse(m); if (p.story) setStory(p.story); if (p.coverage) setCoverage(p.coverage) }
    } catch {}
    const addr = search.get('address')
    if (addr) setAddress(addr)
  }, [search])

  // Persist tally
  useEffect(() => { try { localStorage.setItem(LS_COUNTS, JSON.stringify(counts)) } catch {} }, [counts])
  useEffect(() => { try { localStorage.setItem(LS_MODE, JSON.stringify({ story, coverage })) } catch {} }, [story, coverage])

  const quote = computeQuote(toLines(counts))

  function add(type: WindowType) {
    vibrate()
    const k = lineKey(type, story, coverage)
    setCounts((c) => ({ ...c, [k]: (c[k] ?? 0) + 1 }))
  }
  function bump(k: string, delta: number) {
    setCounts((c) => {
      const next = (c[k] ?? 0) + delta
      const out = { ...c }
      if (next <= 0) delete out[k]
      else out[k] = next
      return out
    })
  }
  function clearAll() { setCounts({}) }

  function resetAll() {
    setCounts({}); setFirst(''); setLast(''); setPhone(''); setEmail(''); setAddress('')
    setResult(null); setError(null); setExtraLines([]); setScreen('tally')
    try { localStorage.removeItem(LS_COUNTS) } catch {}
  }

  function addExtraLine() {
    setExtraLines((prev) => [...prev, { id: newLineId(), name: '', price: '' }])
  }
  function updateExtraLine(id: string, field: 'name' | 'price', value: string) {
    setExtraLines((prev) => prev.map((l) => l.id === id ? { ...l, [field]: value } : l))
  }
  function removeExtraLine(id: string) {
    setExtraLines((prev) => prev.filter((l) => l.id !== id))
  }

  const validExtraLines = extraLines.filter((l) => l.name.trim() && parseFloat(l.price) > 0)
  const extraTotal = validExtraLines.reduce((sum, l) => sum + (parseFloat(l.price) || 0), 0)

  async function createQuote() {
    setCreating(true); setError(null)
    try {
      const grandTotal = quote.total + extraTotal
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: `${first.trim()} ${last.trim()}`.trim(),
          client_phone: phone.trim() || undefined,
          client_email: email.trim() || undefined,
          address: address.trim(),
          total: quote.total,
          description: quote.breakdownText,
          extra_lines: validExtraLines.map((l) => ({
            name: l.name.trim(),
            price: parseFloat(l.price),
          })),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create quote')
      setResult({ token: data.token, url: data.url, total: grandTotal })
      setScreen('success')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setCreating(false)
    }
  }

  async function openEditScreen() {
    if (!result) return
    setEditFetching(true); setEditError(null)
    try {
      const res = await fetch(`/api/quote/${result.token}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load quote')
      const lines = (data.services ?? []).map((s: { name: string; price: number }) => ({
        id: newLineId(),
        name: s.name,
        price: String(s.price),
      }))
      setEditLines(lines)
      setScreen('edit' as typeof screen)
    } catch (e) {
      setEditError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setEditFetching(false)
    }
  }

  async function saveEditLines() {
    if (!result) return
    setEditSaving(true); setEditError(null)
    const services = editLines
      .filter((l) => l.name.trim() && parseFloat(l.price) > 0)
      .map((l) => ({ name: l.name.trim(), price: parseFloat(l.price) }))
    if (services.length === 0) { setEditError('Add at least one service.'); setEditSaving(false); return }
    try {
      const res = await fetch(`/api/quote/${result.token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ services }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      const newTotal = services.reduce((s, l) => s + l.price, 0)
      setResult((prev) => prev ? { ...prev, total: newTotal } : prev)
      setScreen('success')
    } catch (e) {
      setEditError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setEditSaving(false)
    }
  }

  const contactValid = first.trim() && last.trim() && phone.trim() && address.trim()
  const entries = Object.entries(counts).filter(([, c]) => c > 0)

  // ─────────────────────────── SUCCESS ───────────────────────────
  if (screen === 'success' && result) {
    const digits = phone.replace(/\D/g, '')
    const msg = `Hey ${first || 'there'}, thanks for letting me take a look! Here's your window cleaning quote from Dr. Squeegee: ${result.url}`
    const smsHref = `sms:${digits}?&body=${encodeURIComponent(msg)}`
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-10 text-center">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Check size={40} />
        </div>
        <h1 className="text-2xl font-bold text-foreground heading-tight">Quote created</h1>
        <p className="mt-1 text-muted-foreground">{fmt(result.total)} · in your CRM</p>

        <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
          <a
            href={smsHref}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary py-4 text-base font-semibold text-primary-foreground active:scale-[0.98] transition-transform"
            style={{ boxShadow: '0 0 20px rgba(34,197,94,0.25)' }}
          >
            <MessageSquare size={18} /> Text it now
          </a>
          <button
            onClick={() => { navigator.clipboard?.writeText(result.url); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
            className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-4 text-base font-semibold text-foreground active:scale-[0.98] transition-transform"
          >
            <Copy size={18} /> {copied ? 'Copied!' : 'Copy quote link'}
          </button>
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-4 text-base font-semibold text-foreground active:scale-[0.98] transition-transform"
          >
            <ExternalLink size={18} /> Preview quote
          </a>
        </div>

        <button
          onClick={openEditScreen}
          disabled={editFetching}
          className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground disabled:opacity-40"
        >
          {editFetching ? <Loader2 size={14} className="animate-spin" /> : null}
          Edit quote lines
        </button>
        {editError && <p className="mt-2 text-xs text-destructive">{editError}</p>}
        <button onClick={resetAll} className="mt-4 text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground">
          New quote
        </button>
      </div>
    )
  }

  // ─────────────────────────── EDIT ───────────────────────────
  if (screen === 'edit') {
    return (
      <div className="flex min-h-dvh flex-col">
        <header className="flex items-center gap-3 px-4 py-4">
          <button onClick={() => setScreen('success')} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06] text-muted-foreground">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-lg font-semibold text-foreground heading-tight">Edit Quote</h1>
        </header>

        <div className="flex-1 space-y-3 px-4 pb-40">
          <p className="text-xs text-muted-foreground">Change names, prices, or add/remove lines. Changes are saved to the existing quote link.</p>

          {editLines.map((line, i) => (
            <div key={line.id} className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5">
              <input
                type="text"
                value={line.name}
                onChange={(e) => setEditLines((prev) => prev.map((l) => l.id === line.id ? { ...l, name: e.target.value } : l))}
                placeholder="Service name"
                className="flex-1 min-w-0 bg-transparent text-sm text-foreground placeholder-muted-foreground focus:outline-none"
              />
              <span className="text-muted-foreground text-sm">$</span>
              <input
                type="number"
                inputMode="decimal"
                value={line.price}
                onChange={(e) => setEditLines((prev) => prev.map((l) => l.id === line.id ? { ...l, price: e.target.value } : l))}
                placeholder="0"
                className="w-20 bg-transparent text-sm text-right text-foreground placeholder-muted-foreground focus:outline-none tabular-nums"
              />
              {editLines.length > 1 && (
                <button
                  onClick={() => setEditLines((prev) => prev.filter((l) => l.id !== line.id))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}

          <button
            onClick={() => setEditLines((prev) => [...prev, { id: newLineId(), name: '', price: '' }])}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <PlusCircle size={15} /> Add line
          </button>

          {editError && <p className="text-sm text-destructive">{editError}</p>}
        </div>

        <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background/95 px-4 py-4 backdrop-blur-xl">
          <div className="mb-2 text-right text-sm text-muted-foreground tabular-nums">
            Total: {fmt(editLines.reduce((s, l) => s + (parseFloat(l.price) || 0), 0))}
          </div>
          <button
            onClick={saveEditLines}
            disabled={editSaving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-base font-semibold text-primary-foreground disabled:opacity-40 active:scale-[0.98] transition-transform"
            style={{ boxShadow: '0 0 20px rgba(34,197,94,0.25)' }}
          >
            {editSaving ? <><Loader2 size={18} className="animate-spin" /> Saving…</> : 'Save Changes'}
          </button>
        </div>
      </div>
    )
  }

  // ─────────────────────────── CUSTOMER ───────────────────────────
  if (screen === 'customer') {
    return (
      <div className="flex min-h-dvh flex-col">
        <header className="flex items-center gap-3 px-4 py-4">
          <button onClick={() => setScreen('tally')} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06] text-muted-foreground">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-lg font-semibold text-foreground heading-tight">Customer details</h1>
        </header>

        <div className="flex-1 space-y-4 px-4 pb-40">
          <div className="rounded-xl border border-primary/25 bg-accent/40 px-4 py-3">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">
                {quote.windowCount > 0 ? `${quote.windowCount} windows` : ''}
                {quote.windowCount > 0 && validExtraLines.length > 0 ? ' + ' : ''}
                {validExtraLines.length > 0 ? `${validExtraLines.length} extra` : ''}
              </span>
              <span className="text-2xl font-bold text-primary heading-tighter">{fmt(quote.total + extraTotal)}</span>
            </div>
            {quote.windowCount > 0 && extraTotal === 0 && (
              <p className="mt-0.5 text-xs text-muted-foreground line-through">Normally {fmt(quote.normalPrice)}</p>
            )}
          </div>

          <AddressInput value={address} onChange={setAddress} />
          <div className="grid grid-cols-2 gap-3">
            <input value={first} onChange={(e) => setFirst(e.target.value)} placeholder="First name"
              className="w-full rounded-xl border border-border bg-secondary/80 px-3 py-3 text-base text-foreground placeholder-muted-foreground focus:border-primary/60 focus:outline-none" />
            <input value={last} onChange={(e) => setLast(e.target.value)} placeholder="Last name"
              className="w-full rounded-xl border border-border bg-secondary/80 px-3 py-3 text-base text-foreground placeholder-muted-foreground focus:border-primary/60 focus:outline-none" />
          </div>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" inputMode="tel" placeholder="Phone number"
            className="w-full rounded-xl border border-border bg-secondary/80 px-3 py-3 text-base text-foreground placeholder-muted-foreground focus:border-primary/60 focus:outline-none" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email (optional)"
            className="w-full rounded-xl border border-border bg-secondary/80 px-3 py-3 text-base text-foreground placeholder-muted-foreground focus:border-primary/60 focus:outline-none" />

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background/95 px-4 py-4 backdrop-blur-xl">
          <button
            onClick={createQuote}
            disabled={!contactValid || creating}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-base font-semibold text-primary-foreground disabled:opacity-40 active:scale-[0.98] transition-transform"
            style={{ boxShadow: contactValid && !creating ? '0 0 20px rgba(34,197,94,0.25)' : 'none' }}
          >
            {creating ? <><Loader2 size={18} className="animate-spin" /> Creating…</> : 'Create Quote'}
          </button>
        </div>
      </div>
    )
  }

  // ─────────────────────────── TALLY ───────────────────────────
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center gap-3 px-4 py-4">
        <button onClick={() => router.back()} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06] text-muted-foreground">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-semibold text-foreground heading-tight">New Quote</h1>
        <div className="ml-auto flex items-center gap-3">
          {quote.windowCount > 0 && (
            <span className="text-sm text-muted-foreground">{quote.windowCount} windows</span>
          )}
          <button
            onClick={toggleSun}
            aria-label="Toggle sun mode"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06] text-muted-foreground"
          >
            {sun ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </header>

      {/* Mode bar */}
      <div className="space-y-2 px-4">
        <div className="grid grid-cols-3 gap-2">
          {STORIES.map((s) => (
            <button key={s} onClick={() => setStory(s)}
              className={`rounded-xl py-3 text-sm font-semibold transition-colors min-h-[48px] ${story === s ? 'bg-primary text-primary-foreground' : 'border border-border bg-card text-muted-foreground'}`}>
              {STORY_LABEL[s]} story
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {COVERAGES.map((c) => (
            <button key={c.key} onClick={() => setCoverage(c.key)}
              className={`rounded-xl py-3 text-sm font-semibold transition-colors min-h-[48px] ${coverage === c.key ? 'bg-primary text-primary-foreground' : 'border border-border bg-card text-muted-foreground'}`}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Big tap-to-add type buttons */}
      <div className="mt-4 grid grid-cols-3 gap-2 px-4">
        {WINDOW_TYPES.map((t) => {
          const k = lineKey(t.key, story, coverage)
          const cnt = counts[k] ?? 0
          return (
            <div key={t.key} className="relative">
              <button
                onClick={() => add(t.key)}
                className="flex w-full flex-col items-center justify-center gap-0.5 rounded-2xl border-2 border-primary/40 bg-primary/10 py-5 text-center active:scale-[0.96] transition-transform"
              >
                <span className="text-base font-bold text-foreground heading-tight">{t.label}</span>
                <span className="text-[10px] text-muted-foreground">{t.sub}</span>
                <span className="mt-1 text-xs font-medium text-primary">{fmt(Math.round(unitPrice(t.key, story, coverage)))}/ea</span>
                {cnt > 0 && (
                  <span className="mt-1 text-2xl font-bold text-primary heading-tighter tabular-nums">{cnt}</span>
                )}
              </button>
              {cnt > 0 && (
                <button
                  onClick={() => bump(k, -1)}
                  className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card text-muted-foreground"
                  aria-label="remove one"
                >
                  <Minus size={14} />
                </button>
              )}
            </div>
          )
        })}
      </div>
      <p className="px-4 pt-2 text-center text-xs text-muted-foreground">
        Set story &amp; coverage, then tap to add windows.
      </p>

      {/* Added list */}
      <div className="mt-4 flex-1 space-y-2 overflow-y-auto px-4 pb-44">
        {entries.length > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Windows</span>
            <button onClick={clearAll} className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground">Clear all</button>
          </div>
        )}
        {entries.map(([k, c]) => {
          const { type, story: st, coverage: cv } = parseKey(k)
          return (
            <div key={k} className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5">
              <span className="flex-1 text-sm text-foreground">
                {TYPE_LABEL[type]} <span className="text-muted-foreground">· {STORY_LABEL[st]} · {cv === 'both' ? 'In & Out' : 'Exterior'}</span>
              </span>
              <button onClick={() => bump(k, -1)} className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06] text-muted-foreground"><Minus size={15} /></button>
              <span className="w-6 text-center text-base font-semibold tabular-nums text-foreground">{c}</span>
              <button onClick={() => bump(k, 1)} className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary"><Plus size={15} /></button>
              <button onClick={() => bump(k, -c)} className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground"><X size={15} /></button>
            </div>
          )
        })}

        {/* Extra services */}
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Other Services</span>
          </div>
          {extraLines.map((line) => (
            <div key={line.id} className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
              <input
                type="text"
                value={line.name}
                onChange={(e) => updateExtraLine(line.id, 'name', e.target.value)}
                placeholder="Service name (e.g. Gutters)"
                className="flex-1 min-w-0 bg-transparent text-sm text-foreground placeholder-muted-foreground focus:outline-none"
              />
              <span className="text-muted-foreground text-sm">$</span>
              <input
                type="number"
                inputMode="decimal"
                value={line.price}
                onChange={(e) => updateExtraLine(line.id, 'price', e.target.value)}
                placeholder="0"
                className="w-20 bg-transparent text-sm text-right text-foreground placeholder-muted-foreground focus:outline-none tabular-nums"
              />
              <button
                onClick={() => removeExtraLine(line.id)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <button
            onClick={addExtraLine}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <PlusCircle size={15} /> Add service
          </button>
        </div>
      </div>

      {/* Sticky price bar */}
      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-xl">
        <div className="mb-2 flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary heading-tighter">
                {(quote.windowCount > 0 || extraTotal > 0) ? fmt(quote.total + extraTotal) : '$0'}
              </span>
              {quote.windowCount > 0 && extraTotal === 0 && (
                <span className="text-sm text-muted-foreground line-through">{fmt(quote.normalPrice)}</span>
              )}
            </div>
            {quote.windowCount > 0 && (
              <span className="text-[11px] text-muted-foreground">
                Windows {fmt(quote.total)}{extraTotal > 0 ? ` + extras ${fmt(extraTotal)}` : ''}{quote.belowMinimum ? ' · min applied' : ''}
              </span>
            )}
            {quote.windowCount === 0 && extraTotal > 0 && (
              <span className="text-[11px] text-muted-foreground">Extra services only</span>
            )}
          </div>
        </div>
        <button
          onClick={() => setScreen('customer')}
          disabled={quote.windowCount === 0 && extraTotal === 0}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-base font-semibold text-primary-foreground disabled:opacity-40 active:scale-[0.98] transition-transform"
          style={{ boxShadow: (quote.windowCount > 0 || extraTotal > 0) ? '0 0 20px rgba(34,197,94,0.25)' : 'none' }}
        >
          Continue
        </button>
      </div>
    </div>
  )
}
