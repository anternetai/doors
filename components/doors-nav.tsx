'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Map, Trophy, Settings } from 'lucide-react'

const navItems = [
  { href: '/', icon: Map, label: 'Territories' },
  { href: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export function DoorsNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card">
      <div className="flex">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive =
            href === '/' ? pathname === '/' : pathname.startsWith(href)

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition-colors ${
                isActive
                  ? 'text-[#FF6B35]'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.8}
                className={isActive ? 'text-[#FF6B35]' : ''}
              />
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
