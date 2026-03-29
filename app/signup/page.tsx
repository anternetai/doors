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

    const supabase = createClient()
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // Auto-sign in after signup (skip email confirmation for now)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      // If auto-signin fails (email confirmation required), show the check-email screen
      setDone(true)
      setLoading(false)
      return
    }

    // Signed in — go to dashboard
    router.push('/dashboard')
    router.refresh()
  }

  if (done) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center px-4"
        style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(255,107,53,0.06) 0%, transparent 60%)' }}
      >
        <div className="w-full max-w-sm text-center">
          <div
            className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1f1510] border border-[#FF6B35]/25"
            style={{ boxShadow: '0 0 32px rgba(255, 107, 53, 0.2)' }}
          >
            <span className="text-2xl font-bold text-[#FF6B35]" style={{ letterSpacing: '-0.02em' }}>D</span>
          </div>
          <h2 className="text-xl font-bold text-foreground" style={{ letterSpacing: '-0.02em' }}>Check your email</h2>
          <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed">
            We sent a confirmation link to <strong className="text-foreground">{email}</strong>. Click it to activate your account.
          </p>
          <Link
            href="/login"
            className="mt-7 inline-block text-sm text-[#FF6B35] hover:underline"
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
      style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(255,107,53,0.06) 0%, transparent 60%)' }}
    >
      <div className="w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="mb-10 text-center">
          <div
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1f1510] border border-[#FF6B35]/25"
            style={{ boxShadow: '0 0 32px rgba(255, 107, 53, 0.2)' }}
          >
            <span className="text-2xl font-bold text-[#FF6B35]" style={{ letterSpacing: '-0.02em' }}>D</span>
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
              className="w-full rounded-xl border border-border bg-secondary/80 px-4 py-3.5 text-sm text-foreground placeholder-muted-foreground focus:border-[#FF6B35]/60 focus:outline-none focus:ring-1 focus:ring-[#FF6B35]/40 transition-colors"
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
              className="w-full rounded-xl border border-border bg-secondary/80 px-4 py-3.5 text-sm text-foreground placeholder-muted-foreground focus:border-[#FF6B35]/60 focus:outline-none focus:ring-1 focus:ring-[#FF6B35]/40 transition-colors"
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
            className="w-full rounded-xl bg-[#FF6B35] px-4 py-3.5 text-sm font-semibold text-[#0a0a0a] transition-all hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            style={{ boxShadow: loading ? 'none' : '0 0 24px rgba(255, 107, 53, 0.3)' }}
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-[#FF6B35] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
