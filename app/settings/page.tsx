'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, User } from 'lucide-react'
import { DoorsNav } from '@/components/doors-nav'
import { createClient } from '@/lib/supabase/client'

export default function SettingsPage() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null)
      setLoading(false)
    })
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen flex-col pb-20">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 px-4 py-4 backdrop-blur">
        <h1 className="text-lg font-bold">Settings</h1>
      </header>

      <main className="flex-1 px-4 py-6 space-y-4">
        {/* Account */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1a2e1a] border border-[#22c55e]/30">
              <User size={18} className="text-[#22c55e]" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Account</p>
              {loading ? (
                <div className="h-3 w-40 animate-pulse rounded bg-muted mt-1" />
              ) : (
                <p className="text-xs text-muted-foreground">{email}</p>
              )}
            </div>
          </div>
        </div>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-destructive/10 hover:border-destructive/30"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/15">
            <LogOut size={18} className="text-destructive" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Sign Out</p>
            <p className="text-xs text-muted-foreground">Log out of your account</p>
          </div>
        </button>

        {/* App version */}
        <p className="text-center text-xs text-muted-foreground pt-4">
          Doors v1.0
        </p>
      </main>

      <DoorsNav />
    </div>
  )
}
