'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Map, Trophy, Settings } from 'lucide-react'

const navItems = [
  { href: '/dashboard', icon: Map, label: 'Territories' },
  { href: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export function DoorsNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.06] bg-[#0d0d13]/90 backdrop-blur-xl"
      style={{ boxShadow: '0 -1px 0 rgba(255,255,255,0.04)' }}
    >
      <div className="flex">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive =
            href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center justify-center gap-1 py-3.5 text-xs font-medium transition-all ${
                isActive
                  ? 'text-[#FF6B35]'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="relative">
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={isActive ? 'text-[#FF6B35]' : ''}
                />
                {isActive && (
                  <span
                    className="absolute -inset-2 rounded-full"
                    style={{ background: 'rgba(255,107,53,0.1)', filter: 'blur(4px)' }}
                  />
                )}
              </div>
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
