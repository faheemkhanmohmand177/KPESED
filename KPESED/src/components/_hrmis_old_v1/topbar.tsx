'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Menu, Bell, Search, User, LogOut, Settings as SettingsIcon, Check } from 'lucide-react'
import type { SafeUser } from '@/lib/auth'
import { MODULE_LABELS } from '@/lib/constants'

interface TopbarProps {
  user: SafeUser
  activeModule: string
  onMenuClick: () => void
  onNavigate: (m: string) => void
  onLogout: () => void
  notifications: Array<{
    id: string
    title: string
    message: string
    type: string
    isRead: boolean
    createdAt: string
  }>
  unreadCount: number
  onMarkNotificationRead: (id: string) => void
}

export function Topbar({
  user,
  activeModule,
  onMenuClick,
  onNavigate,
  onLogout,
  notifications,
  unreadCount,
  onMarkNotificationRead,
}: TopbarProps) {
  const router = useRouter()
  const title = MODULE_LABELS[activeModule] || 'HRMIS'

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-white px-3 sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        className="lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex flex-col">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">HRMIS / KPESE</p>
        <h1 className="text-lg font-bold leading-tight tracking-tight">{title}</h1>
      </div>

      {/* Search */}
      <div className="ml-auto hidden flex-1 max-w-md md:flex">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search employees, leaves, transfers…"
            className="pl-9 bg-muted/40"
            onFocus={() => onNavigate('employees')}
          />
        </div>
      </div>

      {/* Notifications */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#C9A96E] px-1 text-[10px] font-bold text-[#01411C]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[360px] p-0" align="end">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <p className="text-sm font-semibold">Notifications</p>
            <Badge variant="outline" className="text-[10px]">{unreadCount} unread</Badge>
          </div>
          <ScrollArea className="max-h-80">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">No notifications</div>
            ) : (
              <ul className="divide-y">
                {notifications.slice(0, 6).map((n) => (
                  <li
                    key={n.id}
                    className={cn(
                      'flex gap-3 px-4 py-3 transition-colors hover:bg-muted/50',
                      !n.isRead && 'bg-[#C9A96E]/5'
                    )}
                  >
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#01411C]/10 text-[#01411C]">
                      <Bell className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-tight">{n.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.message}</p>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!n.isRead && (
                      <button
                        onClick={() => onMarkNotificationRead(n.id)}
                        className="self-start text-muted-foreground hover:text-foreground"
                        aria-label="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
          <div className="border-t p-2">
            <Button variant="ghost" size="sm" className="w-full" onClick={() => onNavigate('notifications')}>
              View all notifications
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* User dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-muted/60" aria-label="User menu">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#016B3A] to-[#01411C] text-xs font-bold uppercase text-white">
              {user.fullName?.charAt(0) || 'U'}
            </div>
            <div className="hidden text-left leading-tight sm:block">
              <p className="text-sm font-semibold">{user.fullName}</p>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{user.role}</p>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <p className="text-sm font-semibold">{user.fullName}</p>
            <p className="text-xs text-muted-foreground">{user.email || user.username}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onNavigate('profile')}>
            <User className="mr-2 h-4 w-4" /> My Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onNavigate('notifications')}>
            <Bell className="mr-2 h-4 w-4" /> Notifications
            {unreadCount > 0 && <Badge className="ml-auto">{unreadCount}</Badge>}
          </DropdownMenuItem>
          {user.role === 'admin' && (
            <DropdownMenuItem onClick={() => onNavigate('settings')}>
              <SettingsIcon className="mr-2 h-4 w-4" /> Settings
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-600 focus:text-red-700" onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}

export default Topbar
