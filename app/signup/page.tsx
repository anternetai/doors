'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Create user via server-side admin API (auto-confirms, no email sent)
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Signup failed')
      setLoading(false)
      return
    }

    // Now sign in with the confirmed account
    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  if (done) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center px-4"
        style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(34,197,94,0.06) 0%, transparent 60%)' }}
      >
        <div className="w-full max-w-sm text-center">
          <div
            className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1a2e1a] border border-[#22c55e]/25"
            style={{ boxShadow: '0 0 32px rgba(34, 197, 94, 0.2)' }}
          >
            <span className="text-2xl font-bold text-[#22c55e]" style={{ letterSpacing: '-0.02em' }}>D</span>
          </div>
          <h2 className="text-xl font-bold text-foreground" style={{ letterSpacing: '-0.02em' }}>Check your email</h2>
          <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed">
            We sent a confirmation link to <strong className="text-foreground">{email}</strong>. Click it to activate your account.
          </p>
          <Link
            href="/login"
            className="mt-7 inline-block text-sm text-[#22c55e] hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4"
      style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(34,197,94,0.06) 0%, transparent 60%)' }}
    >
      <div className="w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="mb-10 text-center">
          <div
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1a2e1a] border border-[#22c55e]/25"
            style={{ boxShadow: '0 0 32px rgba(34, 197, 94, 0.2)' }}
          >
            <span className="text-2xl font-bold text-[#22c55e]" style={{ letterSpacing: '-0.02em' }}>D</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground" style={{ letterSpacing: '-0.02em' }}>Doors</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-border bg-secondary/80 px-4 py-3.5 text-sm text-foreground placeholder-muted-foreground focus:border-[#22c55e]/60 focus:outline-none focus:ring-1 focus:ring-[#22c55e]/40 transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-border bg-secondary/80 px-4 py-3.5 text-sm text-foreground placeholder-muted-foreground focus:border-[#22c55e]/60 focus:outline-none focus:ring-1 focus:ring-[#22c55e]/40 transition-colors"
              placeholder="Min. 6 characters"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-destructive/15 px-4 py-3 text-sm text-destructive border border-destructive/20">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#22c55e] px-4 py-3.5 text-sm font-semibold text-[#0a0a0a] transition-all hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            style={{ boxShadow: loading ? 'none' : '0 0 24px rgba(34, 197, 94, 0.3)' }}
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-[#22c55e] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
