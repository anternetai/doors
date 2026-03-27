import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Doors — The tracker built for reps who knock.',
  description:
    'Log contacts, map territories, and close more deals — without leaving the porch. Free to start, no credit card, no annual contract.',
  openGraph: {
    title: 'Doors — The tracker built for reps who knock.',
    description:
      'Log contacts, map territories, and close more deals without leaving the porch. Free forever. No setup fee. No annual contract.',
    type: 'website',
  },
}

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // No app nav — this is a marketing page
  return <>{children}</>
}
