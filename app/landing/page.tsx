import Link from 'next/link'
import { cn } from '@/lib/utils'

// ─── Shared primitives ────────────────────────────────────────────────────────

function GreenDot() {
  return (
    <span
      className="inline-block h-1.5 w-1.5 rounded-full bg-[#22c55e]"
      aria-hidden="true"
    />
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#22c55e]/25 bg-[#1a2e1a]/60 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#22c55e]">
      <GreenDot />
      {children}
    </span>
  )
}

function GlassCard({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 backdrop-blur-sm transition-colors hover:border-[#22c55e]/20 hover:bg-[#1a2e1a]/20',
        className
      )}
    >
      {children}
    </div>
  )
}

// ─── Feature icon wrappers (pure CSS, no images) ─────────────────────────────

function FeatureIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-[#22c55e]/20 bg-[#1a2e1a]/80 text-[#22c55e]">
      {children}
    </div>
  )
}

// ─── SVG icons (inline, no dependencies) ─────────────────────────────────────

const IconTap = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11V6a3 3 0 0 1 6 0v5" />
    <path d="M9 11H5a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2h-4" />
  </svg>
)

const IconMap = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
    <line x1="9" y1="3" x2="9" y2="18" />
    <line x1="15" y1="6" x2="15" y2="21" />
  </svg>
)

const IconStats = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
)

const IconGPS = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="10" r="3" />
    <path d="M12 2a8 8 0 0 1 8 8c0 5.25-8 14-8 14S4 15.25 4 10a8 8 0 0 1 8-8z" />
  </svg>
)

const IconHistory = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M12 7v5l4 2" />
  </svg>
)

const IconBenchmark = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
)

const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
)

// ─── Data ─────────────────────────────────────────────────────────────────────

const features = [
  {
    icon: <IconTap />,
    title: 'Tap to Log',
    description:
      'Tap the map at each door. 4 quick questions and you\'re done. No forms, no friction — built for reps who have 30 seconds between doors.',
  },
  {
    icon: <IconMap />,
    title: 'Territory Maps',
    description:
      'Color-coded pins show exactly where you\'ve been and what happened. Never knock the same door twice. See your coverage at a glance.',
  },
  {
    icon: <IconStats />,
    title: 'Real Stats',
    description:
      'Contact rate, pitch rate, close rate, revenue per door. Know your numbers every single day. Improve your game with data, not guesses.',
  },
  {
    icon: <IconGPS />,
    title: 'GPS Precision',
    description:
      'Every door is a GPS pin on the real map. See your exact coverage. Find gaps in your territory. Know where you\'ve never knocked.',
  },
  {
    icon: <IconHistory />,
    title: 'Revisit Tracking',
    description:
      'Doors remember every visit. Know when to come back, what happened last time, and who was home. Your memory shouldn\'t be the bottleneck.',
  },
  {
    icon: <IconBenchmark />,
    title: 'Industry Benchmarks',
    description:
      'Compare your numbers to D2D industry standards by industry. Know if you\'re crushing it or where you need to tighten up.',
  },
]

const steps = [
  {
    number: '01',
    title: 'Create a territory',
    description: 'Type an address. We center the map. Name it anything.',
  },
  {
    number: '02',
    title: 'Walk and tap',
    description:
      'Walk your territory. Tap each door on the map as you knock it.',
  },
  {
    number: '03',
    title: 'Answer 4 questions',
    description:
      'Answered? Pitched? Closed? Notes? Done. Stats update automatically.',
  },
]

const soloFeatures = [
  'Unlimited territories',
  'Unlimited doors',
  'GPS tracking',
  'Stats dashboard',
  'Revisit history',
  'Color-coded pins',
  'Export your data',
]

const teamFeatures = [
  'Everything in Solo',
  'Team leaderboards',
  'Manager dashboard',
  'Rep performance view',
  'Territory assignments',
  'Team benchmarks',
]

const differentiators = [
  {
    title: 'Your data is yours.',
    description:
      'Export anytime. We never hold your data hostage. No vendor lock-in, no surprise data fees. Your territory history is yours to keep.',
    note: 'Unlike Canvass.',
  },
  {
    title: 'Built for the field.',
    description:
      'Not a CRM with a map bolted on. Not an enterprise tool your manager bought. Built mobile-first for reps who knock from 9am to 8pm.',
    note: null,
  },
  {
    title: 'No bloat.',
    description:
      'You don\'t need 50 features you\'ll never use. Doors does one thing and does it right. Log doors. Track results. Get better.',
    note: null,
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[oklch(0.08_0_0)] text-foreground antialiased">

      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[oklch(0.08_0_0)]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#22c55e]/30 bg-[#1a2e1a]">
              <span className="text-sm font-bold text-[#22c55e]">D</span>
            </div>
            <span className="text-base font-bold tracking-tight">Doors</span>
          </div>
          {/* Nav links — hidden on small */}
          <nav className="hidden items-center gap-6 sm:flex" aria-label="Primary navigation">
            <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              How It Works
            </a>
            <a href="#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Pricing
            </a>
          </nav>
          {/* CTA */}
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-[#22c55e] px-4 text-sm font-semibold text-[#0a0a0a] transition-opacity hover:opacity-90"
            >
              Start Free
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 pb-20 pt-24 sm:px-6 sm:pb-28 sm:pt-32">
        {/* Background glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/4"
          style={{
            width: 700,
            height: 400,
            background:
              'radial-gradient(ellipse at center, rgba(34,197,94,0.10) 0%, transparent 70%)',
          }}
        />

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 flex justify-center">
            <SectionLabel>Now in beta — free during launch</SectionLabel>
          </div>

          <h1 className="text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
            Track Every Door.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            The door-to-door sales tracker built by a rep who knocks every day.{' '}
            <span className="text-foreground/80">Map your territories.</span>{' '}
            <span className="text-foreground/80">Log every door.</span>{' '}
            <span className="text-foreground/80">Close more deals.</span>
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#22c55e] px-8 text-base font-bold text-[#0a0a0a] shadow-lg shadow-[#22c55e]/20 transition-all hover:opacity-90 hover:shadow-[#22c55e]/30 sm:w-auto"
            >
              Start Free
              <IconArrow />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-8 text-base font-semibold text-foreground transition-colors hover:border-white/20 hover:bg-white/[0.07] sm:w-auto"
            >
              See How It Works
            </a>
          </div>

          {/* Hero stat strip */}
          <div className="mx-auto mt-14 grid max-w-lg grid-cols-3 gap-4 sm:gap-8">
            {[
              { value: '500+', label: 'Doors tracked' },
              { value: '3', label: 'Territories mapped' },
              { value: '100%', label: 'Free right now' },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <span className="text-2xl font-black text-[#22c55e] sm:text-3xl">{value}</span>
                <span className="text-xs text-muted-foreground sm:text-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social Proof Bar ────────────────────────────────────────── */}
      <section className="border-y border-white/[0.06] bg-white/[0.02] px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <blockquote className="text-center">
            <p className="text-base font-medium leading-relaxed text-foreground/90 sm:text-lg">
              &ldquo;I built this because every other D2D app is overpriced garbage.
              Your data locked behind $100/mo, enterprise features you never asked for,
              and a UI designed by people who have never knocked a door in their life.&rdquo;
            </p>
            <footer className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#22c55e]/30 bg-[#1a2e1a] text-xs font-bold text-[#22c55e]">
                A
              </div>
              <span>Anthony F., Founder &amp; door knocker</span>
            </footer>
          </blockquote>
        </div>
      </section>

      {/* ── Industries ──────────────────────────────────────────────── */}
      <section className="px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <p className="mb-4 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Built for every door-to-door industry
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {['Solar', 'Roofing', 'Pest Control', 'HVAC', 'Security', 'Lawn Care'].map(
              (industry) => (
                <span
                  key={industry}
                  className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-sm text-muted-foreground"
                >
                  {industry}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────── */}
      <section id="features" className="scroll-mt-20 px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <div className="mb-4 flex justify-center">
              <SectionLabel>Features</SectionLabel>
            </div>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
              Everything a door knocker needs.
              <br />
              <span className="text-muted-foreground">Nothing they don&apos;t.</span>
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <GlassCard key={feature.title}>
                <FeatureIcon>{feature.icon}</FeatureIcon>
                <h3 className="mb-2 text-base font-bold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="scroll-mt-20 border-t border-white/[0.06] px-4 py-20 sm:px-6 sm:py-28"
      >
        <div className="mx-auto max-w-4xl">
          <div className="mb-14 text-center">
            <div className="mb-4 flex justify-center">
              <SectionLabel>How It Works</SectionLabel>
            </div>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
              Simple enough to use between doors.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
              No onboarding call. No tutorial video. Just open it, create a territory, and start knocking.
            </p>
          </div>

          <div className="relative grid gap-6 sm:grid-cols-3">
            {/* Connector line — desktop only */}
            <div
              aria-hidden="true"
              className="absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent sm:block"
            />

            {steps.map((step, i) => (
              <div key={step.number} className="relative flex flex-col items-center text-center">
                {/* Step number */}
                <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#22c55e]/25 bg-[#1a2e1a]/80">
                  <span className="text-xl font-black text-[#22c55e]">{step.number}</span>
                </div>
                <h3 className="mb-2 text-base font-bold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
                {/* Arrow between steps — mobile */}
                {i < steps.length - 1 && (
                  <div aria-hidden="true" className="my-2 flex justify-center sm:hidden">
                    <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
                      <path d="M8 2v20M8 22l-4-4M8 22l4-4" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Final note */}
          <div className="mt-10 rounded-2xl border border-[#22c55e]/15 bg-[#1a2e1a]/30 p-5 text-center">
            <p className="text-sm font-medium text-foreground/80">
              Your stats update automatically. Contact rate, pitch rate, close rate, revenue per door —
              all tracked in real time.
            </p>
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────────── */}
      <section
        id="pricing"
        className="scroll-mt-20 px-4 py-20 sm:px-6 sm:py-28"
      >
        <div className="mx-auto max-w-4xl">
          <div className="mb-14 text-center">
            <div className="mb-4 flex justify-center">
              <SectionLabel>Pricing</SectionLabel>
            </div>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
              Straightforward pricing.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground">
              Free during launch. Lock in your access before we flip the switch.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
            {/* Solo */}
            <div className="relative rounded-2xl border border-[#22c55e]/30 bg-[#1a2e1a]/30 p-7">
              {/* Live badge */}
              <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-[#22c55e]/30 bg-[#1a2e1a] px-2.5 py-1 text-xs font-semibold text-[#22c55e]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#22c55e]" />
                Available now
              </div>

              <h3 className="text-xl font-black">Solo</h3>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-4xl font-black text-[#22c55e]">Free</span>
                <span className="text-sm text-muted-foreground line-through">$39/mo</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Free during beta launch</p>

              <ul className="mt-6 space-y-3">
                {soloFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm">
                    <IconCheck />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className="mt-8 flex h-11 w-full items-center justify-center rounded-xl bg-[#22c55e] text-sm font-bold text-[#0a0a0a] shadow-lg shadow-[#22c55e]/20 transition-opacity hover:opacity-90"
              >
                Start Free — No Credit Card
              </Link>
            </div>

            {/* Team */}
            <div className="relative rounded-2xl border border-white/[0.07] bg-white/[0.02] p-7 opacity-75">
              <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                Coming soon
              </div>

              <h3 className="text-xl font-black">Team</h3>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-4xl font-black">$29</span>
                <span className="text-sm text-muted-foreground">/ rep / mo</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Billed monthly per active rep</p>

              <ul className="mt-6 space-y-3">
                {teamFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <IconCheck />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                disabled
                className="mt-8 flex h-11 w-full cursor-not-allowed items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-sm font-bold text-muted-foreground"
              >
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Doors ───────────────────────────────────────────────── */}
      <section className="border-t border-white/[0.06] px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-4xl">
          <div className="mb-14 text-center">
            <div className="mb-4 flex justify-center">
              <SectionLabel>Why Doors?</SectionLabel>
            </div>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
              A tool that respects your time.
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {differentiators.map((d) => (
              <GlassCard key={d.title} className="flex flex-col">
                <h3 className="mb-2 text-base font-bold text-[#22c55e]">{d.title}</h3>
                <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                  {d.description}
                </p>
                {d.note && (
                  <p className="mt-3 text-xs font-medium text-muted-foreground/60 italic">
                    {d.note}
                  </p>
                )}
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-white/[0.06] px-4 py-24 text-center sm:px-6 sm:py-32">
        {/* Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: 600,
            height: 300,
            background:
              'radial-gradient(ellipse at center, rgba(34,197,94,0.08) 0%, transparent 70%)',
          }}
        />

        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl md:text-6xl">
            Stop guessing.
            <br />
            <span className="text-[#22c55e]">Start tracking.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-md text-base text-muted-foreground">
            Every door you don&apos;t log is data you&apos;ll never get back. Start tracking today — it&apos;s free.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#22c55e] px-10 text-base font-bold text-[#0a0a0a] shadow-xl shadow-[#22c55e]/25 transition-all hover:opacity-90 hover:shadow-[#22c55e]/35 sm:w-auto"
              style={{ height: '3.25rem' }}
            >
              Start Free — No Credit Card
              <IconArrow />
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Takes 60 seconds to set up. No BS.
          </p>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#22c55e]/30 bg-[#1a2e1a]">
              <span className="text-xs font-bold text-[#22c55e]">D</span>
            </div>
            <span className="text-sm font-semibold">Doors</span>
            <span className="text-xs text-muted-foreground">&copy; 2026</span>
          </div>
          {/* Links */}
          <nav className="flex items-center gap-5" aria-label="Footer navigation">
            <a
              href="/privacy"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Privacy
            </a>
            <a
              href="/terms"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Terms
            </a>
            <Link
              href="/login"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
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
