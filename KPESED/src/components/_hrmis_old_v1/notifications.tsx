'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { Check, Bell, Inbox } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmptyState } from '@/components/hrmis/ui/empty-state'
import { cn } from '@/lib/utils'
import type { SafeUser } from '@/lib/auth'

interface NotificationItem {
  id: string
  title: string
  message: string
  type: string
  category: string | null
  isRead: boolean
  createdAt: string
  link: string | null
}

interface NotificationsModuleProps {
  user: SafeUser
}

const TYPE_COLORS: Record<string, string> = {
  info: 'bg-blue-100 text-blue-800 border-blue-200',
  success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  warning: 'bg-amber-100 text-amber-800 border-amber-200',
  leave: 'bg-purple-100 text-purple-800 border-purple-200',
  transfer: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  payroll: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  attendance: 'bg-orange-100 text-orange-800 border-orange-200',
  system: 'bg-slate-100 text-slate-800 border-slate-200',
}

export function NotificationsModule({ user }: NotificationsModuleProps) {
  const [tab, setTab] = React.useState('all')
  const [items, setItems] = React.useState<NotificationItem[]>([])
  const [loading, setLoading] = React.useState(true)

  const fetchData = React.useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (tab === 'unread') params.set('unread', '1')
      else if (tab !== 'all') params.set('category', tab)
      params.set('pageSize', '50')
      const res = await fetch(`/api/notifications?${params.toString()}`, { cache: 'no-store' })
      const data = await res.json()
      setItems(data.items || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [tab])

  React.useEffect(() => { fetchData() }, [fetchData])

  async function handleMarkRead(id: string) {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' })
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
      toast.success('Marked as read')
    } catch (err) {
      console.error(err)
    }
  }

  async function handleMarkAllRead() {
    const unread = items.filter((i) => !i.isRead)
    if (!unread.length) return
    for (const n of unread) {
      try {
        await fetch(`/api/notifications/${n.id}/read`, { method: 'POST' })
      } catch (err) { console.error(err) }
    }
    toast.success(`Marked ${unread.length} as read`)
    fetchData()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
          <p className="text-sm text-muted-foreground">Stay updated on system alerts and approvals.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleMarkAllRead} disabled={items.every((i) => i.isRead)}>
          <Check className="mr-2 h-4 w-4" /> Mark all as read
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="leaves">Leaves</TabsTrigger>
          <TabsTrigger value="transfers">Transfers</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-md bg-muted" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={<Inbox className="h-6 w-6 text-muted-foreground" />}
              title="No notifications"
              description="You're all caught up!"
            />
          ) : (
            <ul className="divide-y">
              {items.map((n) => (
                <li
                  key={n.id}
                  className={cn(
                    'flex items-start gap-3 p-4 transition-colors hover:bg-muted/30',
                    !n.isRead && 'bg-[#C9A96E]/5'
                  )}
                >
                  <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full border', TYPE_COLORS[n.type] || TYPE_COLORS.info)}>
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold">{n.title}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
                    {n.category && (
                      <Badge variant="outline" className="mt-2 text-[10px] uppercase">{n.category}</Badge>
                    )}
                  </div>
                  {!n.isRead && (
                    <Button variant="ghost" size="sm" onClick={() => handleMarkRead(n.id)}>
                      <Check className="h-4 w-4" /> Mark read
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default NotificationsModule
