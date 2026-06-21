// Window-cleaning quote pricing — in-field tally tool.
// Hybrid model: flat base $ per window type × story multiplier × coverage multiplier,
// with a job minimum and a "normally" anchor markup. All numbers are TUNABLE here —
// adjust after a few real jobs. Target hourly is a sanity readout, not part of the
// customer-facing formula.

export type WindowType = "standard" | "picture" | "french"
export type Story = 1 | 2 | 3
export type Coverage = "exterior" | "both"

export interface TallyLine {
  type: WindowType
  story: Story
  coverage: Coverage
  count: number
}

// ─────────────────────────── TUNABLE CONFIG ───────────────────────────
export const PRICING = {
  // Base price per window: exterior-only, 1st story.
  base: { standard: 7, picture: 12, french: 15 } as Record<WindowType, number>,
  // Interior + exterior costs more (detailing, no drips, moving things).
  coverageMult: { exterior: 1, both: 1.8 } as Record<Coverage, number>,
  // Higher stories are slower / need more gear.
  storyMult: { 1: 1, 2: 1.3, 3: 1.7 } as Record<Story, number>,
  minJob: 200, // never quote below this
  anchorMult: 1.3, // "normally $X" = on-site price × this
  roundTo: 5, // round quotes to the nearest $5 for cleaner numbers
  // Internal sanity check only (never shown to the customer):
  targetHourly: 150,
  baseMinutes: { standard: 3, picture: 4, french: 6 } as Record<WindowType, number>,
  minutesCoverageMult: { exterior: 1, both: 1.7 } as Record<Coverage, number>,
  minutesStoryMult: { 1: 1, 2: 1.3, 3: 1.7 } as Record<Story, number>,
}

export const WINDOW_TYPES: { key: WindowType; label: string; sub: string }[] = [
  { key: "standard", label: "Standard", sub: "Double-hung" },
  { key: "picture", label: "Picture", sub: "Large / slider" },
  { key: "french", label: "French", sub: "Grids / panes" },
]

const STORY_LABEL: Record<Story, string> = { 1: "1st", 2: "2nd", 3: "3rd" }
const COVERAGE_LABEL: Record<Coverage, string> = { exterior: "ext", both: "in&out" }
const TYPE_LABEL: Record<WindowType, string> = { standard: "Standard", picture: "Picture", french: "French" }

function round(n: number): number {
  return Math.round(n / PRICING.roundTo) * PRICING.roundTo
}

export function unitPrice(type: WindowType, story: Story, coverage: Coverage): number {
  return PRICING.base[type] * PRICING.storyMult[story] * PRICING.coverageMult[coverage]
}

function unitMinutes(type: WindowType, story: Story, coverage: Coverage): number {
  return (
    PRICING.baseMinutes[type] *
    PRICING.minutesStoryMult[story] *
    PRICING.minutesCoverageMult[coverage]
  )
}

export interface QuoteLineItem {
  label: string
  count: number
  lineTotal: number
}

export interface QuoteResult {
  windowCount: number
  rawSubtotal: number
  total: number // on-site price (customer pays this), >= minJob
  normalPrice: number // anchor "normally $X"
  estMinutes: number
  impliedHourly: number
  belowMinimum: boolean // true if the floor bumped the price up
  lineItems: QuoteLineItem[]
  breakdownText: string
}

export function computeQuote(lines: TallyLine[]): QuoteResult {
  const active = lines.filter((l) => l.count > 0)
  const windowCount = active.reduce((s, l) => s + l.count, 0)

  if (windowCount === 0) {
    return {
      windowCount: 0, rawSubtotal: 0, total: 0, normalPrice: 0,
      estMinutes: 0, impliedHourly: 0, belowMinimum: false,
      lineItems: [], breakdownText: "",
    }
  }

  const rawSubtotal = active.reduce(
    (s, l) => s + unitPrice(l.type, l.story, l.coverage) * l.count,
    0
  )
  const estMinutes = active.reduce(
    (s, l) => s + unitMinutes(l.type, l.story, l.coverage) * l.count,
    0
  )

  const rounded = round(rawSubtotal)
  const total = Math.max(PRICING.minJob, rounded)
  const belowMinimum = rounded < PRICING.minJob
  const normalPrice = round(total * PRICING.anchorMult)
  const impliedHourly = estMinutes > 0 ? Math.round(total / (estMinutes / 60)) : 0

  const lineItems: QuoteLineItem[] = active.map((l) => ({
    label: `${l.count}× ${TYPE_LABEL[l.type]} · ${STORY_LABEL[l.story]} · ${COVERAGE_LABEL[l.coverage]}`,
    count: l.count,
    lineTotal: Math.round(unitPrice(l.type, l.story, l.coverage) * l.count),
  }))

  const breakdownText =
    `${windowCount} windows — ` +
    active
      .map((l) => `${l.count}× ${TYPE_LABEL[l.type]} (${STORY_LABEL[l.story]} · ${COVERAGE_LABEL[l.coverage]})`)
      .join(", ") +
    `  •  Normally $${normalPrice}, on-site $${total}`

  return {
    windowCount, rawSubtotal, total, normalPrice,
    estMinutes, impliedHourly, belowMinimum, lineItems, breakdownText,
  }
}

// Stable key for a tally line (type+story+coverage) — used by the UI to merge taps.
export function lineKey(type: WindowType, story: Story, coverage: Coverage): string {
  return `${type}-${story}-${coverage}`
}
