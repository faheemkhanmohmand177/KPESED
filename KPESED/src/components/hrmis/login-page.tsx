'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { User, Lock, Eye, EyeOff } from 'lucide-react'
import type { SafeUser } from '@/lib/auth'

interface LoginPageProps {
  onSuccess: (user: SafeUser) => void
}

/**
 * KPESE HRMIS login page — faithfully reproduces the real login at
 * iemis.kpese.gov.pk (Oracle APEX 23.2.0 with Vita theme).
 *
 * Real HR-Banner.jpeg is the full-bleed background; real logo.jpg sits at the
 * top of the centered white card.
 */
export function LoginPage({ onSuccess }: LoginPageProps) {
  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [remember, setRemember] = React.useState(false)
  const [showPw, setShowPw] = React.useState(false)
  const [busy, setBusy] = React.useState(false)

  // Load remembered username
  React.useEffect(() => {
    const saved = localStorage.getItem('hrmis_remember_username')
    if (saved) {
      setUsername(saved)
      setRemember(true)
    }
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        toast.error(data?.error || 'Login failed')
        return
      }
      if (remember) {
        localStorage.setItem('hrmis_remember_username', username.trim())
      } else {
        localStorage.removeItem('hrmis_remember_username')
      }
      toast.success('Signed in')
      onSuccess(data.user)
    } catch (e) {
      console.error(e)
      toast.error('Network error — login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="hrmis-login-bg flex min-h-screen min-h-svh items-center justify-center overflow-y-auto p-4">
      <div className="w-full max-w-[400px] rounded-md bg-white p-5 shadow-xl sm:p-6">
        {/* Logo — real KPESE logo.jpg */}
        <div className="mb-4 flex flex-col items-center">
          <img
            src="/hrmis/logo.jpg"
            alt="KPESE logo"
            width={80}
            height={110}
            className="h-20 w-auto object-contain sm:h-[110px]"
          />
          <h1 className="mt-3 text-center text-lg font-bold text-[#1565c0] sm:text-xl">
            Integrated EMIS
          </h1>
          <p className="mt-1 text-xs text-gray-500 text-center">
            Human Resource Management Information System
          </p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          {/* Username */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <User className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              maxLength={100}
              className="w-full h-10 pl-9 pr-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-[#1565c0] focus:ring-2 focus:ring-[#1565c0]/15"
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock className="h-4 w-4" />
            </span>
            <input
              type={showPw ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full h-10 pl-9 pr-9 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-[#1565c0] focus:ring-2 focus:ring-[#1565c0]/15"
              required
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              tabIndex={-1}
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Remember username */}
          <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-3.5 w-3.5 accent-[#1565c0]"
            />
            Remember username
          </label>

          {/* Sign In */}
          <button
            type="submit"
            disabled={busy}
            className="w-full h-10 bg-[#1565c0] hover:bg-[#0d47a1] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-md transition-colors"
          >
            {busy ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
