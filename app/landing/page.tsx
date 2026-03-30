import Link from 'next/link'
import { FaqAccordion } from './faq-accordion'

// ─── SVG Icons (inline, zero dependencies) ────────────────────────────────────

const IconArrow = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
)

const IconX = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const IconClock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <polyline points="12 7 12 12 15 15" />
  </svg>
)

const IconMapPin = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="10" r="3" />
    <path d="M12 2a8 8 0 0 1 8 8c0 5.25-8 14-8 14S4 15.25 4 10a8 8 0 0 1 8-8z" />
  </svg>
)

const IconCheck = ({ color = '#22C55E' }: { color?: string }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const IconSun = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <line x1="12" y1="2" x2="12" y2="5" />
    <line x1="12" y1="19" x2="12" y2="22" />
    <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
    <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
    <line x1="2" y1="12" x2="5" y2="12" />
    <line x1="19" y1="12" x2="22" y2="12" />
    <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
    <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
  </svg>
)

const IconStats = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
)

const IconCamera = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
)

const IconHistory = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M12 7v5l4 2" />
  </svg>
)

// ─── Shared primitives ─────────────────────────────────────────────────────────

function OrangeDot() {
  return (
    <span
      className="inline-block h-1.5 w-1.5 rounded-full bg-[#22c55e]"
      aria-hidden="true"
    />
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#22c55e]/25 bg-[#22c55e]/[0.08] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#22c55e]">
      <OrangeDot />
      {children}
    </span>
  )
}

// ─── Neighborhood Map Visual (CSS-only, no images) ────────────────────────────

function MapVisual() {
  // A grid of colored dots representing a neighborhood canvas
  const dots: { color: string; label: string }[] = [
    { color: '#22C55E', label: 'Closed' },
    { color: '#22c55e', label: 'No answer' },
    { color: '#22C55E', label: 'Closed' },
    { color: 'rgba(245,245,247,0.2)', label: 'Not knocked' },
    { color: '#22c55e', label: 'No answer' },
    { color: 'rgba(245,245,247,0.2)', label: 'Not knocked' },
    { color: '#22c55e', label: 'No answer' },
    { color: '#22C55E', label: 'Closed' },
    { color: 'rgba(245,245,247,0.2)', label: 'Not knocked' },
    { color: '#22c55e', label: 'No answer' },
    { color: '#22C55E', label: 'Closed' },
    { color: '#22C55E', label: 'Closed' },
    { color: 'rgba(245,245,247,0.2)', label: 'Not knocked' },
    { color: 'rgba(245,245,247,0.2)', label: 'Not knocked' },
    { color: '#22c55e', label: 'No answer' },
    { color: '#22C55E', label: 'Closed' },
    { color: 'rgba(245,245,247,0.2)', label: 'Not knocked' },
    { color: '#22c55e', label: 'No answer' },
    { color: '#22C55E', label: 'Closed' },
    { color: 'rgba(245,245,247,0.2)', label: 'Not knocked' },
    { color: '#22c55e', label: 'No answer' },
    { color: '#22C55E', label: 'Closed' },
    { color: '#22C55E', label: 'Closed' },
    { color: '#22c55e', label: 'No answer' },
    { color: 'rgba(245,245,247,0.2)', label: 'Not knocked' },
  ]

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Orange radial glow behind */}
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-3xl"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(34,197,94,0.18) 0%, transparent 70%)',
        }}
      />

      {/* Card */}
      <div
        className="relative rounded-2xl border border-white/[0.06] p-6"
        style={{ background: '#111118' }}
      >
        {/* Mini street grid lines */}
        <div className="mb-5 text-[10px] font-semibold uppercase tracking-widest text-[rgba(245,245,247,0.3)]">
          Oak Ridge Blvd — Territory 1
        </div>

        {/* Dot grid */}
        <div className="grid grid-cols-5 gap-3 mb-5" role="img" aria-label="Territory map showing knocked doors">
          {dots.map((dot, i) => (
            <div key={i} className="flex items-center justify-center">
              <div
                className="h-4 w-4 rounded-full ring-1 ring-white/10"
                style={{ backgroundColor: dot.color }}
                title={dot.label}
              />
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[11px] text-[rgba(245,245,247,0.5)]">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#22C55E]" />
            Closed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e]" />
            No answer
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
            Not knocked
          </span>
        </div>

        {/* Live stat pill */}
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-xs">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#22C55E]" aria-hidden="true" />
          <span className="text-[#F5F5F7] font-semibold">5 closes today</span>
          <span className="text-[rgba(245,245,247,0.4)]">·</span>
          <span className="text-[rgba(245,245,247,0.4)]">20% close rate</span>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div
      className="min-h-screen text-[#F5F5F7] antialiased"
      style={{ backgroundColor: '#0A0A0F' }}
    >

      {/* ════════════════════════════════════════════════════════════════
          1. STICKY NAV
      ════════════════════════════════════════════════════════════════ */}
      <header
        className="sticky top-0 z-50 border-b border-white/[0.06]"
        style={{ backgroundColor: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(12px)' }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 sm:px-8">

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}
            >
              <span className="text-sm font-black text-[#22c55e]">D</span>
            </div>
            <span className="text-base font-bold tracking-tight text-[#F5F5F7]">Doors</span>
          </div>

          {/* Nav links — desktop */}
          <nav className="hidden items-center gap-7 sm:flex" aria-label="Primary navigation">
            <a
              href="#features"
              className="text-sm text-[rgba(245,245,247,0.6)] transition-colors hover:text-[#F5F5F7]"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm text-[rgba(245,245,247,0.6)] transition-colors hover:text-[#F5F5F7]"
            >
              Pricing
            </a>
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden text-sm text-[rgba(245,245,247,0.6)] transition-colors hover:text-[#F5F5F7] sm:block"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-bold transition-all hover:opacity-90"
              style={{ backgroundColor: '#22c55e', color: '#0A0A0F' }}
            >
              Start free — no card needed
            </Link>
          </div>
        </div>
      </header>


      {/* ════════════════════════════════════════════════════════════════
          2. HERO
      ════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden px-5 pb-24 pt-24 sm:px-8 sm:pb-32 sm:pt-32">

        {/* Orange radial glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2"
          style={{
            width: 800,
            height: 500,
            background: 'radial-gradient(ellipse at center, rgba(34,197,94,0.12) 0%, transparent 65%)',
          }}
        />

        <div className="relative mx-auto max-w-5xl">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">

            {/* Left: Copy */}
            <div>
              {/* Badge */}
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#22c55e]/25 bg-[#22c55e]/[0.08] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#22c55e]">
                <OrangeDot />
                Free during launch — no card needed
              </div>

              <h1
                className="font-extrabold leading-[1.04] tracking-tight text-[#F5F5F7]"
                style={{ fontSize: 'clamp(42px, 6vw, 68px)', letterSpacing: '-0.03em' }}
              >
                The tracker built for reps who knock.
              </h1>

              <p
                className="mt-6 leading-relaxed"
                style={{ fontSize: '19px', color: 'rgba(245,245,247,0.6)' }}
              >
                Log contacts, map territories, and close more deals —
                without leaving the porch. Free to start, no credit card.
              </p>

              {/* CTAs */}
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl px-8 text-base font-bold transition-all hover:opacity-90"
                  style={{
                    backgroundColor: '#22c55e',
                    color: '#0A0A0F',
                    boxShadow: '0 0 30px rgba(34,197,94,0.25)',
                  }}
                >
                  Start tracking free
                  <IconArrow />
                </Link>
                <a
                  href="#features"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border px-8 text-base font-semibold transition-colors hover:border-white/20 hover:bg-white/[0.05]"
                  style={{
                    borderColor: 'rgba(255,255,255,0.1)',
                    color: '#F5F5F7',
                  }}
                >
                  See how it works
                </a>
              </div>

              {/* Micro trust line */}
              <p
                className="mt-4 text-[13px]"
                style={{ color: 'rgba(245,245,247,0.35)' }}
              >
                No demo required. No setup fee. No annual contract.
              </p>

              {/* Founder quote anchor */}
              <div
                className="mt-8 rounded-xl border p-4"
                style={{
                  borderColor: 'rgba(255,255,255,0.06)',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                }}
              >
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'rgba(245,245,247,0.7)' }}
                >
                  &ldquo;Built by a door knocker who was tired of losing deals
                  between the door and the CRM.&rdquo;
                </p>
                <div className="mt-2.5 flex items-center gap-2">
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black text-[#22c55e]"
                    style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}
                  >
                    A
                  </div>
                  <span
                    className="text-xs font-medium"
                    style={{ color: 'rgba(245,245,247,0.4)' }}
                  >
                    Anthony F., Founder &amp; door knocker
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Map visual */}
            <div className="flex justify-center lg:justify-end">
              <MapVisual />
            </div>

          </div>
        </div>
      </section>


      {/* ════════════════════════════════════════════════════════════════
          3. PROBLEM STRIP
      ════════════════════════════════════════════════════════════════ */}
      <section
        className="border-y px-5 py-16 sm:px-8"
        style={{ borderColor: 'rgba(255,255,255,0.06)', backgroundColor: 'rgba(255,255,255,0.01)' }}
      >
        <div className="mx-auto max-w-5xl">
          <p
            className="mb-8 text-center text-xs font-semibold uppercase tracking-widest"
            style={{ color: 'rgba(245,245,247,0.35)' }}
          >
            Sound familiar?
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: <IconX />,
                title: 'Contacts lost on paper and napkins',
                body: 'You knocked 60 doors today. You remember about 12 of them.',
              },
              {
                icon: <IconClock />,
                title: 'Your CRM is too slow to use at the door',
                body: 'By the time you open it, fill it in, and hit save — you are three doors behind.',
              },
              {
                icon: <IconMapPin />,
                title: 'No idea which streets are actually working',
                body: 'You know you knocked this block. You just do not know what happened there.',
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-2xl p-6"
                style={{
                  backgroundColor: '#111118',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div
                  className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}
                >
                  {card.icon}
                </div>
                <h3 className="mb-2 text-sm font-bold text-[#F5F5F7]">{card.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(245,245,247,0.5)' }}>
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ════════════════════════════════════════════════════════════════
          4. FEATURES — BENTO GRID
      ════════════════════════════════════════════════════════════════ */}
      <section id="features" className="scroll-mt-20 px-5 py-24 sm:px-8 sm:py-32">
        <div className="mx-auto max-w-5xl">

          {/* Header */}
          <div className="mb-14 text-center">
            <div className="mb-4 flex justify-center">
              <SectionLabel>Features</SectionLabel>
            </div>
            <h2
              className="font-bold tracking-tight text-[#F5F5F7]"
              style={{ fontSize: 'clamp(30px, 4vw, 44px)', letterSpacing: '-0.025em' }}
            >
              Everything a door knocker needs.{' '}
              <span style={{ color: 'rgba(245,245,247,0.4)' }}>Nothing they don&apos;t.</span>
            </h2>
          </div>

          {/* Bento grid */}
          <div className="grid gap-4 lg:grid-cols-3">

            {/* Large card — Log a Door in 4 Taps (spans 2 cols) */}
            <div
              className="relative overflow-hidden rounded-2xl p-7 lg:col-span-2"
              style={{
                backgroundColor: '#111118',
                border: '1px solid rgba(34,197,94,0.2)',
                boxShadow: '0 0 40px rgba(34,197,94,0.06)',
              }}
            >
              {/* Subtle orange glow */}
              <div
                aria-hidden="true"
                className="absolute -right-12 -top-12 h-48 w-48 rounded-full"
                style={{ background: 'rgba(34,197,94,0.07)', filter: 'blur(40px)' }}
              />

              <div
                className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg"
                style={{ backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 11V6a3 3 0 0 1 6 0v5" />
                  <path d="M9 11H5a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2h-4" />
                </svg>
              </div>

              <h3 className="mb-2 text-xl font-bold text-[#F5F5F7]">Log a door in 4 taps</h3>
              <p className="mb-6 text-[15px] leading-relaxed" style={{ color: 'rgba(245,245,247,0.55)' }}>
                Tap the map. Answer 4 questions. Done. No forms, no typing, no friction.
                Built for reps who have 30 seconds between doors.
              </p>

              {/* 4-step pills */}
              <div className="flex flex-wrap gap-2">
                {[
                  { n: '1', label: 'Answered?' },
                  { n: '2', label: 'Pitched?' },
                  { n: '3', label: 'Closed?' },
                  { n: '4', label: 'Notes?' },
                ].map((step) => (
                  <div
                    key={step.n}
                    className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium"
                    style={{
                      backgroundColor: 'rgba(34,197,94,0.1)',
                      border: '1px solid rgba(34,197,94,0.2)',
                      color: '#F5F5F7',
                    }}
                  >
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black"
                      style={{ backgroundColor: '#22c55e', color: '#0A0A0F' }}
                    >
                      {step.n}
                    </span>
                    {step.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Small card — Territory Maps */}
            <div
              className="rounded-2xl p-6"
              style={{
                backgroundColor: '#111118',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div
                className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg"
                style={{ backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}
              >
                <IconMapPin />
              </div>
              <h3 className="mb-2 text-base font-bold text-[#F5F5F7]">Territory Maps</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(245,245,247,0.55)' }}>
                Color-coded pins. See exactly where you&apos;ve been and what happened at every door.
              </p>
            </div>

            {/* Small card — Sun Mode (hero differentiator) */}
            <div
              className="relative overflow-hidden rounded-2xl p-6"
              style={{
                backgroundColor: '#111118',
                border: '1px solid rgba(34,197,94,0.25)',
              }}
            >
              {/* Star badge */}
              <div
                className="absolute right-4 top-4 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: '#22c55e' }}
              >
                Only in Doors
              </div>
              <div
                className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg"
                style={{ backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}
              >
                <IconSun />
              </div>
              <h3 className="mb-2 text-base font-bold text-[#F5F5F7]">Sun Mode</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(245,245,247,0.55)' }}>
                Maximum contrast for direct sunlight. Readable at 2pm in July. No other app has this.
              </p>
            </div>

            {/* Small card — Real Stats */}
            <div
              className="rounded-2xl p-6"
              style={{
                backgroundColor: '#111118',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div
                className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg"
                style={{ backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}
              >
                <IconStats />
              </div>
              <h3 className="mb-2 text-base font-bold text-[#F5F5F7]">Real Stats</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(245,245,247,0.55)' }}>
                Contact rate. Pitch rate. Close rate. Revenue per door. Know your numbers every day.
              </p>
            </div>

            {/* Small card — Photo Capture */}
            <div
              className="rounded-2xl p-6"
              style={{
                backgroundColor: '#111118',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div
                className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg"
                style={{ backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}
              >
                <IconCamera />
              </div>
              <h3 className="mb-2 text-base font-bold text-[#F5F5F7]">Photo Capture</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(245,245,247,0.55)' }}>
                Snap a photo at each door. Never forget which house is which again.
              </p>
            </div>

            {/* Small card — Revisit Tracking */}
            <div
              className="rounded-2xl p-6"
              style={{
                backgroundColor: '#111118',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div
                className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg"
                style={{ backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}
              >
                <IconHistory />
              </div>
              <h3 className="mb-2 text-base font-bold text-[#F5F5F7]">Revisit Tracking</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(245,245,247,0.55)' }}>
                Every door remembers every visit. Know when to come back and what happened last time.
              </p>
            </div>

          </div>
        </div>
      </section>


      {/* ════════════════════════════════════════════════════════════════
          5. HOW IT WORKS
      ════════════════════════════════════════════════════════════════ */}
      <section
        id="how-it-works"
        className="scroll-mt-20 border-t px-5 py-24 sm:px-8 sm:py-32"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className="mx-auto max-w-4xl">
          <div className="mb-14 text-center">
            <div className="mb-4 flex justify-center">
              <SectionLabel>How It Works</SectionLabel>
            </div>
            <h2
              className="font-bold tracking-tight text-[#F5F5F7]"
              style={{ fontSize: 'clamp(28px, 4vw, 40px)', letterSpacing: '-0.025em' }}
            >
              Simple enough to use between doors.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base" style={{ color: 'rgba(245,245,247,0.55)' }}>
              No onboarding call. No tutorial video. Open it, create a territory, start knocking.
            </p>
          </div>

          {/* Steps */}
          <div className="relative grid gap-8 sm:grid-cols-3">

            {/* Connector line — desktop */}
            <div
              aria-hidden="true"
              className="absolute left-0 right-0 top-8 hidden h-px sm:block"
              style={{
                background: 'linear-gradient(to right, transparent, rgba(34,197,94,0.2), rgba(34,197,94,0.2), transparent)',
              }}
            />

            {[
              {
                n: '1',
                title: 'Create a territory',
                body: 'Type an address. We map it. Name it anything.',
              },
              {
                n: '2',
                title: 'Walk and tap',
                body: 'Tap each door on the map as you knock. Takes 3 seconds per door.',
              },
              {
                n: '3',
                title: 'See your numbers',
                body: 'Stats update automatically. Share your day in one tap.',
              },
            ].map((step, i) => (
              <div key={step.n} className="relative flex flex-col items-center text-center">
                {/* Number circle */}
                <div
                  className="relative z-10 mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
                  style={{
                    backgroundColor: 'rgba(34,197,94,0.1)',
                    border: '1px solid rgba(34,197,94,0.3)',
                  }}
                >
                  <span className="text-xl font-black text-[#22c55e]">0{step.n}</span>
                </div>
                <h3 className="mb-2 text-base font-bold text-[#F5F5F7]">{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(245,245,247,0.55)' }}>
                  {step.body}
                </p>
                {/* Mobile arrow */}
                {i < 2 && (
                  <div aria-hidden="true" className="my-3 sm:hidden">
                    <svg width="16" height="20" viewBox="0 0 16 24" fill="none">
                      <path d="M8 2v18M8 20l-4-4M8 20l4-4" stroke="rgba(34,197,94,0.3)" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ════════════════════════════════════════════════════════════════
          6. SOCIAL PROOF
      ════════════════════════════════════════════════════════════════ */}
      <section
        className="border-t px-5 py-20 sm:px-8"
        style={{ borderColor: 'rgba(255,255,255,0.06)', backgroundColor: 'rgba(255,255,255,0.01)' }}
      >
        <div className="mx-auto max-w-3xl">

          {/* Main quote */}
          <blockquote className="text-center">
            <p
              className="text-lg font-medium leading-relaxed sm:text-xl"
              style={{ color: 'rgba(245,245,247,0.85)' }}
            >
              &ldquo;I knocked 10,000 doors before I built this.
              Nothing else was fast enough to use between knocks.&rdquo;
            </p>
            <footer className="mt-5 flex items-center justify-center gap-2.5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-black text-[#22c55e]"
                style={{
                  background: 'rgba(34,197,94,0.15)',
                  border: '1px solid rgba(34,197,94,0.3)',
                }}
              >
                A
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-[#F5F5F7]">Anthony F.</div>
                <div className="text-xs" style={{ color: 'rgba(245,245,247,0.4)' }}>Founder, door knocker</div>
              </div>
            </footer>
          </blockquote>

          {/* Stat strip */}
          <div
            className="mt-10 flex items-center justify-center gap-1 rounded-2xl px-6 py-4 text-sm"
            style={{
              backgroundColor: 'rgba(34,197,94,0.06)',
              border: '1px solid rgba(34,197,94,0.15)',
            }}
          >
            <span className="font-bold text-[#22c55e]">Built from 10,000+ real door knocks</span>
            <span style={{ color: 'rgba(245,245,247,0.3)' }}>in Charlotte, NC</span>
          </div>

        </div>
      </section>


      {/* ════════════════════════════════════════════════════════════════
          7. PRICING
      ════════════════════════════════════════════════════════════════ */}
      <section id="pricing" className="scroll-mt-20 px-5 py-24 sm:px-8 sm:py-32">
        <div className="mx-auto max-w-5xl">

          <div className="mb-14 text-center">
            <div className="mb-4 flex justify-center">
              <SectionLabel>Pricing</SectionLabel>
            </div>
            <h2
              className="font-bold tracking-tight text-[#F5F5F7]"
              style={{ fontSize: 'clamp(28px, 4vw, 40px)', letterSpacing: '-0.025em' }}
            >
              Transparent pricing.
              <span style={{ color: 'rgba(245,245,247,0.4)' }}> No surprises.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base" style={{ color: 'rgba(245,245,247,0.55)' }}>
              Every D2D competitor charges $400 upfront and requires a year contract just to try.
              Not us.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">

            {/* Free tier */}
            <div
              className="rounded-2xl p-7"
              style={{
                backgroundColor: '#111118',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div className="mb-1 text-sm font-semibold" style={{ color: 'rgba(245,245,247,0.5)' }}>Free</div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-black text-[#F5F5F7]">$0</span>
                <span className="text-sm" style={{ color: 'rgba(245,245,247,0.4)' }}>/forever</span>
              </div>
              <ul className="mt-6 space-y-3">
                {[
                  'Unlimited territories',
                  'Unlimited doors',
                  'GPS tracking',
                  'Basic stats',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: 'rgba(245,245,247,0.7)' }}>
                    <IconCheck />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="mt-8 flex h-11 w-full items-center justify-center rounded-xl border text-sm font-bold transition-colors hover:border-white/20 hover:bg-white/[0.05]"
                style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#F5F5F7' }}
              >
                Start free
              </Link>
            </div>

            {/* Pro tier — highlighted */}
            <div
              className="relative rounded-2xl p-7"
              style={{
                backgroundColor: '#111118',
                border: '2px solid #22c55e',
                boxShadow: '0 0 40px rgba(34,197,94,0.12)',
              }}
            >
              {/* Most Popular badge */}
              <div
                className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-bold"
                style={{ backgroundColor: '#22c55e', color: '#0A0A0F' }}
              >
                Most Popular
              </div>

              <div className="mb-1 text-sm font-semibold" style={{ color: 'rgba(245,245,247,0.5)' }}>Pro</div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-black text-[#22c55e]">$39</span>
                <span className="text-sm" style={{ color: 'rgba(245,245,247,0.4)' }}>/mo</span>
              </div>
              <ul className="mt-6 space-y-3">
                {[
                  'Everything in Free',
                  'AI territory insights (A–F grading)',
                  'Pitch recording + AI coaching',
                  'Photo capture',
                  'Share cards for social',
                  'CSV export',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: 'rgba(245,245,247,0.7)' }}>
                    <IconCheck color="#22c55e" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="mt-8 flex h-11 w-full items-center justify-center rounded-xl text-sm font-bold transition-all hover:opacity-90"
                style={{
                  backgroundColor: '#22c55e',
                  color: '#0A0A0F',
                  boxShadow: '0 4px 20px rgba(34,197,94,0.25)',
                }}
              >
                Try free — 14 days
              </Link>
            </div>

            {/* Team tier — coming soon */}
            <div
              className="rounded-2xl p-7 opacity-70"
              style={{
                backgroundColor: '#111118',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div className="mb-1 flex items-center gap-2">
                <span className="text-sm font-semibold" style={{ color: 'rgba(245,245,247,0.5)' }}>Team</span>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(245,245,247,0.4)' }}
                >
                  Coming Soon
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-black text-[#F5F5F7]">$29</span>
                <span className="text-sm" style={{ color: 'rgba(245,245,247,0.4)' }}>/rep/mo</span>
              </div>
              <ul className="mt-6 space-y-3">
                {[
                  'Everything in Pro',
                  'Team leaderboard',
                  'Manager dashboard',
                  'Rep performance tracking',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: 'rgba(245,245,247,0.4)' }}>
                    <IconCheck color="rgba(245,245,247,0.25)" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                disabled
                className="mt-8 flex h-11 w-full cursor-not-allowed items-center justify-center rounded-xl border text-sm font-bold"
                style={{ borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(245,245,247,0.3)' }}
              >
                Join waitlist
              </button>
            </div>

          </div>

          <p
            className="mt-7 text-center text-sm"
            style={{ color: 'rgba(245,245,247,0.4)' }}
          >
            No setup fees. No annual contracts. Cancel anytime.
          </p>
        </div>
      </section>


      {/* ════════════════════════════════════════════════════════════════
          8. FOUNDER STORY
      ════════════════════════════════════════════════════════════════ */}
      <section
        className="border-t px-5 py-20 sm:px-8"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className="mx-auto max-w-3xl">
          <div
            className="rounded-2xl p-8 sm:p-10"
            style={{
              backgroundColor: '#0D0D14',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div className="mb-6 flex justify-center">
              <SectionLabel>Founder Story</SectionLabel>
            </div>
            <blockquote>
              <p
                className="text-[17px] leading-[1.75] sm:text-lg"
                style={{ color: 'rgba(245,245,247,0.75)' }}
              >
                I knocked doors for 3 years selling pressure washing in Charlotte, NC.
                I lost deals because I couldn&apos;t remember who I talked to last week,
                which streets I&apos;d already hit, or what happened at each door.
                I built Doors because nothing else was fast enough to use between knocks —
                and the apps that existed charged $400 setup fees and required annual
                contracts just to try them.
              </p>
              <footer className="mt-6 flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-black text-[#22c55e]"
                  style={{
                    background: 'rgba(34,197,94,0.15)',
                    border: '1px solid rgba(34,197,94,0.3)',
                  }}
                >
                  AF
                </div>
                <div>
                  <div className="text-sm font-bold text-[#F5F5F7]">Anthony Ferguson</div>
                  <div className="text-xs" style={{ color: 'rgba(245,245,247,0.4)' }}>
                    Founder · Charlotte, NC
                  </div>
                </div>
              </footer>
            </blockquote>
          </div>
        </div>
      </section>


      {/* ════════════════════════════════════════════════════════════════
          9. FAQ
      ════════════════════════════════════════════════════════════════ */}
      <section
        className="border-t px-5 py-24 sm:px-8 sm:py-32"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className="mx-auto max-w-2xl">
          <div className="mb-12 text-center">
            <div className="mb-4 flex justify-center">
              <SectionLabel>FAQ</SectionLabel>
            </div>
            <h2
              className="font-bold tracking-tight text-[#F5F5F7]"
              style={{ fontSize: 'clamp(26px, 3.5vw, 38px)', letterSpacing: '-0.02em' }}
            >
              Questions we get a lot.
            </h2>
          </div>
          <FaqAccordion />
        </div>
      </section>


      {/* ════════════════════════════════════════════════════════════════
          10. FINAL CTA
      ════════════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden border-t px-5 py-28 text-center sm:px-8 sm:py-36"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        {/* Orange radial glow behind the button */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: 700,
            height: 400,
            background: 'radial-gradient(ellipse at center, rgba(34,197,94,0.13) 0%, transparent 65%)',
          }}
        />

        <div className="relative mx-auto max-w-xl">
          <h2
            className="font-black leading-tight tracking-tight text-[#F5F5F7]"
            style={{ fontSize: 'clamp(32px, 5vw, 56px)', letterSpacing: '-0.03em' }}
          >
            Every door you don&apos;t track is a deal you might lose.
          </h2>
          <p
            className="mx-auto mt-5 max-w-sm text-[17px]"
            style={{ color: 'rgba(245,245,247,0.55)' }}
          >
            Start tracking free. Takes 60 seconds.
          </p>
          <div className="mt-10">
            <Link
              href="/signup"
              className="inline-flex h-14 items-center justify-center gap-2.5 rounded-xl px-10 text-base font-bold transition-all hover:opacity-90 hover:scale-105"
              style={{
                backgroundColor: '#22c55e',
                color: '#0A0A0F',
                boxShadow: '0 0 50px rgba(34,197,94,0.35)',
              }}
            >
              Start tracking free
              <IconArrow />
            </Link>
          </div>
          <p className="mt-4 text-xs" style={{ color: 'rgba(245,245,247,0.3)' }}>
            No credit card. No demo. No annual contract.
          </p>
        </div>
      </section>


      {/* ════════════════════════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════════════════════════ */}
      <footer
        className="border-t px-5 py-8 sm:px-8"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">

          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{
                background: 'rgba(34,197,94,0.1)',
                border: '1px solid rgba(34,197,94,0.25)',
              }}
            >
              <span className="text-xs font-black text-[#22c55e]">D</span>
            </div>
            <span className="text-sm font-semibold text-[#F5F5F7]">Doors</span>
            <span className="text-xs" style={{ color: 'rgba(245,245,247,0.3)' }}>&copy; 2026</span>
            <span className="text-xs" style={{ color: 'rgba(245,245,247,0.25)' }}>
              &middot; Built in Charlotte, NC
            </span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-5" aria-label="Footer navigation">
            <a
              href="/privacy"
              className="text-xs transition-colors hover:text-[#F5F5F7]"
              style={{ color: 'rgba(245,245,247,0.4)' }}
            >
              Privacy
            </a>
            <a
              href="/terms"
              className="text-xs transition-colors hover:text-[#F5F5F7]"
              style={{ color: 'rgba(245,245,247,0.4)' }}
            >
              Terms
            </a>
            <Link
              href="/login"
              className="text-xs transition-colors hover:text-[#F5F5F7]"
              style={{ color: 'rgba(245,245,247,0.4)' }}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-xs font-semibold text-[#22c55e] transition-opacity hover:opacity-80"
            >
              Sign up free
            </Link>
          </nav>

        </div>
      </footer>

    </div>
  )
}
