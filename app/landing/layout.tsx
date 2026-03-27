import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Doors — Track Every Door.',
  description:
    'The door-to-door sales tracker built by a rep who knocks every day. Map your territories. Log every door. Close more deals.',
  openGraph: {
    title: 'Doors — Track Every Door.',
    description:
      'Map your territories. Log every door. Know your numbers. Built for D2D reps who knock all day.',
    type: 'website',
  },
}

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // No bottom nav — this is a marketing page, not the app
  return <>{children}</>
}
