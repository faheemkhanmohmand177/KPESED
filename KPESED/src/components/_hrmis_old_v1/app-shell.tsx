'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'
import type { SafeUser } from '@/lib/auth'

interface AppShellProps {
  user: SafeUser
  activeModule: string
  onModuleChange: (m: string) => void
  children: React.ReactNode
}

interface Notification {
  id: string
  title: string
  message: string
  type: string
  category: string | null
  isRead: boolean
  createdAt: string
}

export function AppShell({ user, activeModule, onModuleChange, children }: AppShellProps) {
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [notifications, setNotifications] = React.useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = React.useState(0)

  const refreshNotifications = React.useCallback(async () => {
    try {
      const res = await fetch('/api/notifications?pageSize=20', { cache: 'no-store' })
      const data = await res.json()
      setNotifications(data.items || [])
      setUnreadCount(data.unread || 0)
    } catch (err) {
      console.error(err)
    }
  }, [])

  React.useEffect(() => {
    refreshNotifications()
    const interval = setInterval(refreshNotifications, 60000)
    return () => clearInterval(interval)
  }, [refreshNotifications])

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      toast.success('Signed out successfully')
      router.refresh()
      router.push('/')
    } catch (err) {
      console.error(err)
      toast.error('Failed to sign out')
    }
  }

  function handleNavigate(m: string) {
    onModuleChange(m)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('module', m)
      window.history.replaceState({}, '', url.toString())
    }
  }

  async function handleMarkRead(id: string) {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' })
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
      setUnreadCount((c) => Math.max(0, c - 1))
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-[#F8FAFC]">
      <Sidebar
        user={user}
        activeModule={activeModule}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        unreadCount={unreadCount}
        mobileOpen={mobileOpen}
        onMobileOpenChange={setMobileOpen}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          user={user}
          activeModule={activeModule}
          onMenuClick={() => setMobileOpen(true)}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkNotificationRead={handleMarkRead}
        />
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}

export default AppShell
