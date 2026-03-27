'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

type Theme = 'dark' | 'light' | 'sun'

const THEME_KEY = 'doors-theme'

const THEME_CONFIG: Record<Theme, { icon: typeof Sun; label: string; shortLabel: string }> = {
  dark: { icon: Moon, label: 'Dark', shortLabel: 'D' },
  light: { icon: Sun, label: 'Light', shortLabel: 'L' },
  sun: { icon: Zap, label: 'Sun', shortLabel: 'S' },
}

const CYCLE: Theme[] = ['dark', 'light', 'sun']

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY) as Theme | null
    if (stored && CYCLE.includes(stored)) {
      setTheme(stored)
      applyTheme(stored)
    }
  }, [])

  function applyTheme(t: Theme) {
    const html = document.documentElement
    // Remove all theme classes
    html.classList.remove('dark', 'light', 'sun')
    // Add the new one
    html.classList.add(t)
    localStorage.setItem(THEME_KEY, t)
  }

  function cycleTheme() {
    const idx = CYCLE.indexOf(theme)
    const next = CYCLE[(idx + 1) % CYCLE.length]
    setTheme(next)
    applyTheme(next)
  }

  const config = THEME_CONFIG[theme]
  const Icon = config.icon

  return (
    <button
      onClick={cycleTheme}
      className={cn(
        'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium',
        'border border-border bg-secondary text-foreground',
        'hover:bg-muted transition-colors',
        className,
      )}
      title={`Theme: ${config.label}. Tap to cycle.`}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{config.label}</span>
    </button>
  )
}
