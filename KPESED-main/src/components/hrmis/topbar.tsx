'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { Menu, X, LogOut, ChevronDown, User as UserIcon, CloudDownload, ClipboardList, FileVideo, FileText } from 'lucide-react'
import type { SafeUser } from '@/lib/auth'

interface TopbarProps {
  user: SafeUser
  sidebarOpen: boolean
  onToggleSidebar: () => void
  onLogout: () => void
  onNavigate: (module: string) => void
}

type DialogKind = 'tutorial' | 'manual' | 'password' | null

export function Topbar({ user, sidebarOpen, onToggleSidebar, onLogout, onNavigate }: TopbarProps) {
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [dialog, setDialog] = React.useState<DialogKind>(null)
  const [installPrompt, setInstallPrompt] = React.useState<BeforeInstallPromptEvent | null>(null)
  const menuRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => undefined)
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall)
  }, [])

  React.useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (menuRef.current && !menuRef.current.contains(target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  async function installApp() {
    if (installPrompt) {
      await installPrompt.prompt()
      await installPrompt.userChoice
      setInstallPrompt(null)
      return
    }
    toast.info('Use your browser menu and choose “Install Integrated EMIS” or “Add to Home screen”.')
  }

  const openDialog = (kind: DialogKind) => { setMenuOpen(false); setDialog(kind) }
  const go = (module: string) => { setMenuOpen(false); onNavigate(module) }

  return (
    <>
      {/* Blue masthead. Height comes from --apex-header-h (globals.css):
          56px on phones like the live APEX top bar, 34px from lg up. */}
      <header className="t-Header sticky top-0 z-30 flex shrink-0 items-center gap-1 border-b border-[#07579e] bg-[#0b6fc4] px-2 text-white">
        <div className="t-Header-branding flex min-w-0 items-center gap-1">
          {/* On phones the toggle is the solid white square with the blue
              X — exactly like the live portal's mobile masthead. */}
          <button type="button" onClick={onToggleSidebar} title="Main Navigation" aria-label="Main Navigation" aria-expanded={sidebarOpen} className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[3px] bg-white text-[#0b6fc4] shadow-sm transition-colors hover:bg-white/90 lg:h-7 lg:w-7 lg:rounded lg:bg-transparent lg:text-white lg:shadow-none lg:hover:bg-white/15">
            {sidebarOpen ? <X className="h-5 w-5 lg:h-4 lg:w-4" /> : <Menu className="h-5 w-5 lg:h-4 lg:w-4" />}
          </button>
          <a href="/?module=home" onClick={(e) => { e.preventDefault(); go('home') }} className="flex min-w-0 items-center gap-2 text-white">
            <img src="/hrmis/logo.jpg" alt="KPESE" width={22} height={27} className="h-[30px] w-[25px] shrink-0 object-contain lg:h-[27px] lg:w-[22px]" />
            <span className="truncate text-lg font-semibold lg:text-sm">Integrated EMIS</span>
          </a>
        </div>

        {/* Header actions — icon-only on phones (like the live site), with
            labels appearing from the lg breakpoint up. */}
        <nav className="ml-auto flex items-center gap-0.5 text-xs text-white/90">
          <button type="button" onClick={installApp} aria-label="Install App" className="flex items-center gap-1.5 whitespace-nowrap rounded px-1.5 py-1 text-white/90 hover:bg-white/15 lg:px-2"><CloudDownload className="h-[18px] w-[18px] lg:h-3.5 lg:w-3.5" /><span className="hidden lg:inline">Install App</span></button>
          <button type="button" onClick={() => go('dps-rankings')} aria-label="District Performance ScoreCard" className="flex items-center gap-1.5 whitespace-nowrap rounded px-1.5 py-1 text-white/90 hover:bg-white/15 lg:px-2"><ClipboardList className="h-[18px] w-[18px] lg:h-3.5 lg:w-3.5" /><span className="hidden lg:inline">District Performance ScoreCard</span></button>
          <button type="button" onClick={() => openDialog('tutorial')} aria-label="HRIS Tutorial" className="flex items-center gap-1.5 whitespace-nowrap rounded px-1.5 py-1 text-white/90 hover:bg-white/15 lg:px-2"><FileVideo className="h-[18px] w-[18px] lg:h-3.5 lg:w-3.5" /><span className="hidden lg:inline">HRIS Tutorial</span></button>
          <button type="button" onClick={() => openDialog('manual')} aria-label="iEMIS User Manual" className="flex items-center gap-1.5 whitespace-nowrap rounded px-1.5 py-1 text-white/90 hover:bg-white/15 lg:px-2"><FileText className="h-[18px] w-[18px] lg:h-3.5 lg:w-3.5" /><span className="hidden lg:inline">iEMIS User Manual</span></button>
        </nav>

        <div className="relative ml-1 shrink-0" ref={menuRef}>
          <button type="button" onClick={() => setMenuOpen((v) => !v)} title={`${user.username} / ${formatRole(user.role)}`} aria-haspopup="menu" aria-expanded={menuOpen} className="flex items-center gap-1 rounded px-1.5 py-1 text-white hover:bg-white/15 lg:px-2">
            <UserIcon className="h-[19px] w-[19px] lg:h-3.5 lg:w-3.5" /><span className="hidden min-w-0 truncate lg:inline"><span className="font-medium">{user.username}</span><span className="mx-1 text-white/60">/</span><span>{formatRole(user.role)}</span></span><ChevronDown className="h-4 w-4 text-white/70 lg:h-3 lg:w-3" />
          </button>
          {menuOpen && <div role="menu" className="absolute right-0 z-50 mt-1 w-[260px] max-w-[calc(100vw-1.5rem)] rounded-md border border-gray-200 bg-white py-1 shadow-lg">
            <div className="border-b border-gray-100 px-3 py-2"><div className="truncate text-sm font-semibold text-gray-800">{user.fullName}</div><div className="mt-0.5 text-[11px] text-gray-500">Role: <span className="font-medium">{formatRole(user.role)}</span></div></div>
            <button type="button" role="menuitem" onClick={() => openDialog('password')} className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"><UserIcon className="h-4 w-4" />Change Password</button>
            <button type="button" role="menuitem" onClick={onLogout} className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"><LogOut className="h-4 w-4" />Sign Out</button>
          </div>}
        </div>
      </header>
      {dialog && <PortalDialog kind={dialog} user={user} onClose={() => setDialog(null)} />}
    </>
  )
}

function PortalDialog({ kind, user, onClose }: { kind: DialogKind; user: SafeUser; onClose: () => void }) {
  const [current, setCurrent] = React.useState('')
  const [next, setNext] = React.useState('')
  const [confirm, setConfirm] = React.useState('')
  const [busy, setBusy] = React.useState(false)
  async function updatePassword(e: React.FormEvent) {
    e.preventDefault()
    if (next.length < 8) return toast.error('New password must be at least 8 characters.')
    if (next !== confirm) return toast.error('New passwords do not match.')
    setBusy(true)
    const response = await fetch('/api/auth/change-password', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ currentPassword: current, newPassword: next }) })
    const body = await response.json().catch(() => ({}))
    setBusy(false)
    if (!response.ok) return toast.error(body.error || 'Unable to update password.')
    toast.success('Password updated successfully.')
    onClose()
  }
  const title = kind === 'tutorial' ? 'HRIS Tutorial' : kind === 'manual' ? 'iEMIS User Manual' : 'Change Password - Dialog'
  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-label={title}>
    <div className="w-full max-w-2xl rounded border border-gray-300 bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3"><h2 className="text-base font-semibold text-gray-800">{title}</h2><button type="button" onClick={onClose} className="text-2xl leading-none text-gray-500 hover:text-gray-800" aria-label="Close">×</button></div>
      {kind === 'tutorial' && <div className="space-y-3 p-5 text-sm text-gray-700"><p>Use the Main Navigation menu to open Office/School MIS, HR MIS, Students MIS, SSR, Assets, PTC, Textbook Board, Monitoring, Dengue, and DPS workflows.</p><div className="aspect-video rounded bg-slate-100 grid place-items-center text-slate-500">Application Help Video</div></div>}
      {kind === 'manual' && <div className="space-y-3 p-5 text-sm text-gray-700"><p className="font-semibold">Integrated EMIS User Manual</p><ol className="list-decimal space-y-2 pl-5"><li>Choose a module from the navigation tree.</li><li>Use filters, Search, saved Reports, Rows, and Actions on report pages.</li><li>Open a row to view or edit its detail form.</li><li>Use Add, Update, Download, and pagination controls where available.</li></ol></div>}
      {kind === 'password' && <form onSubmit={updatePassword} className="space-y-3 p-5"><label className="block text-sm">Current Password<input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} className="apex-input mt-1" required /></label><label className="block text-sm">New Password<input type="password" value={next} onChange={(e) => setNext(e.target.value)} className="apex-input mt-1" minLength={8} required /></label><label className="block text-sm">Confirm Password<input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="apex-input mt-1" minLength={8} required /></label><div className="flex justify-end gap-2"><button type="button" onClick={onClose} className="apex-btn">Cancel</button><button type="submit" disabled={busy} className="apex-btn apex-btn--primary">{busy ? 'Updating…' : 'Update Password'}</button></div></form>}
    </div>
  </div>
}

function formatRole(role: string): string {
  if (!role) return ''
  if (role === role.toUpperCase() && /[A-Z]/.test(role)) return role
  return role.split(/\s+/).map((word) => word ? word[0].toUpperCase() + word.slice(1) : word).join(' ')
}

interface BeforeInstallPromptEvent extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }
