'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CalendarOff,
  ArrowRightLeft,
  Wallet,
  FileText,
  BarChart3,
  Bell,
  User,
  Settings,
  LogOut,
  GraduationCap,
  X,
} from 'lucide-react'
import type { SafeUser } from '@/lib/auth'

interface SidebarProps {
  user: SafeUser
  activeModule: string
  onNavigate: (module: string) => void
  onLogout: () => void
  unreadCount: number
  mobileOpen: boolean
  onMobileOpenChange: (open: boolean) => void
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'hr', 'deo', 'employee'] },
  { id: 'employees', label: 'Employees', icon: Users, roles: ['admin', 'hr', 'deo'] },
  { id: 'attendance', label: 'Attendance', icon: CalendarCheck, roles: ['admin', 'hr', 'deo'] },
  { id: 'leaves', label: 'Leaves', icon: CalendarOff, roles: ['admin', 'hr', 'deo', 'employee'] },
  { id: 'transfers', label: 'Transfers', icon: ArrowRightLeft, roles: ['admin', 'hr', 'deo'] },
  { id: 'payroll', label: 'Payroll', icon: Wallet, roles: ['admin', 'hr'] },
  { id: 'service_records', label: 'Service Records', icon: FileText, roles: ['admin', 'hr', 'deo'] },
  { id: 'reports', label: 'Reports', icon: BarChart3, roles: ['admin', 'hr', 'deo'] },
  { id: 'notifications', label: 'Notifications', icon: Bell, roles: ['admin', 'hr', 'deo', 'employee'] },
  { id: 'profile', label: 'Profile', icon: User, roles: ['admin', 'hr', 'deo', 'employee'] },
]

export function Sidebar({
  user,
  activeModule,
  onNavigate,
  onLogout,
  unreadCount,
  mobileOpen,
  onMobileOpenChange,
}: SidebarProps) {
  const items = NAV_ITEMS.filter((it) => it.roles.includes(user.role))
  const settingsItem = { id: 'settings', label: 'Settings', icon: Settings }

  const NavContent = (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#C9A96E] to-[#B8860B] text-[#01411C] shadow">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <p className="text-base font-bold text-white">HRMIS</p>
          <p className="text-[11px] uppercase tracking-wider text-white/60">KPESE</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto h-8 w-8 text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
          onClick={() => onMobileOpenChange(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Nav */}
      <nav className="hrmis-scroll flex-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-white/40">Main Menu</p>
        <ul className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon
            const isActive = activeModule === item.id
            return (
              <li key={item.id}>
                <button
                  onClick={() => {
                    onNavigate(item.id)
                    onMobileOpenChange(false)
                  }}
                  className={cn(
                    'group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-white/10 text-white border-l-2 border-[#C9A96E] -ml-0.5'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-[#C9A96E]' : 'text-white/60 group-hover:text-white')} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.id === 'notifications' && unreadCount > 0 && (
                    <Badge className="ml-auto h-5 min-w-5 justify-center rounded-full bg-[#C9A96E] px-1.5 text-[10px] font-semibold text-[#01411C]">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                  )}
                </button>
              </li>
            )
          })}
        </ul>

        {user.role === 'admin' && (
          <>
            <p className="px-3 pb-2 pt-5 text-[10px] font-semibold uppercase tracking-wider text-white/40">Administration</p>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => {
                    onNavigate(settingsItem.id)
                    onMobileOpenChange(false)
                  }}
                  className={cn(
                    'group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                    activeModule === settingsItem.id
                      ? 'bg-white/10 text-white border-l-2 border-[#C9A96E] -ml-0.5'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <Settings className={cn('h-4 w-4 shrink-0', activeModule === settingsItem.id ? 'text-[#C9A96E]' : 'text-white/60 group-hover:text-white')} />
                  {settingsItem.label}
                </button>
              </li>
            </ul>
          </>
        )}
      </nav>

      {/* User */}
      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#016B3A] to-[#01411C] text-xs font-bold uppercase text-white ring-2 ring-white/10">
            {user.fullName?.charAt(0) || 'U'}
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-semibold text-white">{user.fullName}</p>
            <p className="truncate text-[11px] uppercase tracking-wide text-[#C9A96E]">{user.role}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="mt-2 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-[250px] shrink-0 bg-[#01411C] lg:block">
        <div className="sticky top-0 h-screen">{NavContent}</div>
      </aside>

      {/* Mobile */}
      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent side="left" className="w-[250px] border-0 bg-[#01411C] p-0">
          {NavContent}
        </SheetContent>
      </Sheet>
    </>
  )
}

export default Sidebar
