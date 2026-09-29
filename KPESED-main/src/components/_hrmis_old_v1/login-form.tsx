'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GraduationCap, Loader2, Lock, User } from 'lucide-react'

interface LoginFormProps {
  onSuccess: (user: { id: string; username: string; fullName: string; role: string }) => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const router = useRouter()
  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Login failed')
        return
      }
      toast.success(`Welcome back, ${data.user.fullName}!`)
      onSuccess(data.user)
      router.refresh()
    } catch (err) {
      console.error(err)
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="hrmis-login-bg min-h-screen w-full flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#016B3A] to-[#01411C] text-white shadow-lg ring-4 ring-white">
            <GraduationCap className="h-10 w-10" />
          </div>
          <div className="mt-4 space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              HRMIS
            </h1>
            <p className="text-sm font-medium text-foreground">
              Human Resource Management Information System
            </p>
            <p className="text-xs text-muted-foreground">
              Khyber Pakhtunkhwa Elementary &amp; Secondary Education Department
            </p>
          </div>
        </div>

        {/* Login card */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="pl-9"
                  autoComplete="username"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-9"
                  autoComplete="current-password"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </Button>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-center">
              <p className="text-xs text-amber-800">
                <strong>Demo credentials:</strong> admin / admin123456
              </p>
            </div>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          © 2024 KPESE — Elementary &amp; Secondary Education Department, Govt. of Khyber Pakhtunkhwa. All rights reserved.
        </p>
        <p className="mt-1 text-center text-[10px] text-muted-foreground/70">
          Integrated EMIS Portal
        </p>
      </div>
    </div>
  )
}

export default LoginForm
