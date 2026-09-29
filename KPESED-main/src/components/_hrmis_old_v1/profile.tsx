'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Loader2, Save, Lock, Mail, Phone, User } from 'lucide-react'
import type { SafeUser } from '@/lib/auth'

export function ProfileModule({ user }: { user: SafeUser }) {
  const [form, setForm] = React.useState({
    fullName: user.fullName || '',
    email: user.email || '',
    phone: user.phone || '',
    avatarUrl: user.avatarUrl || '',
  })
  const [passwordForm, setPasswordForm] = React.useState({ current: '', next: '', confirm: '' })
  const [saving, setSaving] = React.useState(false)
  const [savingPwd, setSavingPwd] = React.useState(false)

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/auth/me', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) {
        toast.error('Profile update not available in demo (no PATCH route)')
        return
      }
      toast.success('Profile updated')
    } catch (err) {
      console.error(err)
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (passwordForm.next !== passwordForm.confirm) {
      toast.error('Passwords do not match')
      return
    }
    if (passwordForm.next.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }
    setSavingPwd(true)
    try {
      const res = await fetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordForm),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed')
        return
      }
      toast.success('Password changed successfully')
      setPasswordForm({ current: '', next: '', confirm: '' })
    } catch (err) {
      console.error(err)
      toast.error('Failed to change password')
    } finally {
      setSavingPwd(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">My Profile</h2>
        <p className="text-sm text-muted-foreground">Manage your account information.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Profile card */}
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#016B3A] to-[#01411C] text-4xl font-bold uppercase text-white shadow-lg">
              {user.fullName.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-bold">{user.fullName}</h3>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
            </div>
            <Badge variant="outline" className="uppercase text-[#016B3A]">{user.role}</Badge>
            <div className="w-full space-y-1 text-left text-sm">
              {user.email && (
                <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> {user.email}</p>
              )}
              {user.phone && (
                <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> {user.phone}</p>
              )}
              <p className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /> ID: {user.id.substring(0, 8)}…</p>
            </div>
          </CardContent>
        </Card>

        {/* Edit profile */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Edit Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input value={user.username} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Avatar URL</Label>
                  <Input value={form.avatarUrl} onChange={(e) => setForm((f) => ({ ...f, avatarUrl: e.target.value }))} placeholder="https://…" />
                </div>
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
              </Button>
              <p className="text-xs text-muted-foreground">Note: profile update is disabled in demo mode. Use Settings → Users (admin only) to edit.</p>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Change password */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Lock className="h-4 w-4" /> Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input type="password" value={passwordForm.current} onChange={(e) => setPasswordForm((f) => ({ ...f, current: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" value={passwordForm.next} onChange={(e) => setPasswordForm((f) => ({ ...f, next: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <Input type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm((f) => ({ ...f, confirm: e.target.value }))} required />
              </div>
            </div>
            <Button type="submit" disabled={savingPwd}>
              {savingPwd ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default ProfileModule
