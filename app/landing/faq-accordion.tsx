'use client'

import { useState } from 'react'

const faqs = [
  {
    q: 'Is there really a free plan?',
    a: 'Yes. Free forever. No credit card required. No time limit. Track unlimited territories and unlimited doors — completely free.',
  },
  {
    q: 'Does it work offline?',
    a: 'Your map and data are cached locally. Log doors even with no signal — everything syncs automatically when you are back online.',
  },
  {
    q: 'Is this for solo reps or teams?',
    a: 'Both. Solo reps use it free with no limits. Teams get leaderboards, manager dashboards, and rep performance tracking (coming soon).',
  },
  {
    q: 'Can I export my data?',
    a: 'Yes. CSV export anytime on the Pro plan. Your data is always yours. We never hold it hostage or charge ransom fees to get it out.',
  },
  {
    q: 'What about Android?',
    a: 'Doors is a web app — it works on any phone with a browser, iOS or Android, right now. Native apps are on the roadmap.',
  },
  {
    q: 'How is this different from SalesRabbit?',
    a: 'No $400 setup fee. No annual contract required. No demo call to get access. Start knocking in 60 seconds — not 60 days.',
  },
]

export function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="divide-y divide-white/[0.06]">
      {faqs.map((item, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors hover:text-[#F5F5F7]"
            aria-expanded={open === i}
          >
            <span className="text-base font-semibold text-[#F5F5F7]">{item.q}</span>
            <span
              className="flex-shrink-0 transition-transform duration-200"
              style={{ transform: open === i ? 'rotate(45deg)' : 'rotate(0deg)' }}
              aria-hidden="true"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke={open === i ? '#FF6B35' : 'rgba(245,245,247,0.4)'}
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </span>
          </button>
          {open === i && (
            <div className="pb-5">
              <p className="text-[15px] leading-relaxed text-[rgba(245,245,247,0.6)]">{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
