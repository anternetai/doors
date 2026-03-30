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
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 px-4 py-4 backdrop-blur-xl">
        <h1 className="text-lg font-bold heading-tight">Settings</h1>
      </header>

      <main className="flex-1 px-4 py-6 space-y-3">
        {/* Account */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#111118]/80 p-5 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1a2e1a] border border-[#22c55e]/25">
              <User size={18} className="text-[#22c55e]" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Account</p>
              {loading ? (
                <div className="h-3 w-40 animate-pulse rounded bg-muted mt-1.5" />
              ) : (
                <p className="text-xs text-muted-foreground mt-0.5">{email}</p>
              )}
            </div>
          </div>
        </div>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-4 rounded-2xl border border-white/[0.06] bg-[#111118]/80 p-5 text-left transition-all hover:bg-destructive/5 hover:border-destructive/20 backdrop-blur-sm"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10 border border-destructive/15">
            <LogOut size={18} className="text-destructive" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Sign Out</p>
            <p className="text-xs text-muted-foreground mt-0.5">Log out of your account</p>
          </div>
        </button>

        {/* App version */}
        <p className="text-center text-xs text-muted-foreground pt-6">
          Doors v1.0
        </p>
      </main>

      <DoorsNav />
    </div>
  )
}
