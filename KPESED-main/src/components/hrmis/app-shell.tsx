'use client'

import * as React from 'react'
import { Topbar } from './topbar'
import { SidebarTree } from './sidebar-tree'
import type { SafeUser } from '@/lib/auth'
import { toast } from 'sonner'

interface AppShellProps {
  user: SafeUser
  activeModule: string
  onModuleChange: (m: string) => void
  onLogout: () => void
  children: React.ReactNode
}

const MOBILE_QUERY = '(max-width: 1023px)'

/**
 * Oracle APEX-style app shell.
 *
 * Desktop (>=1024px): static 168px sidebar + main content, exactly as captured.
 * Mobile  (<1024px): the sidebar becomes an off-canvas drawer — fixed to the
 * left edge, slid in over the content with a dimmed backdrop, auto-closed on
 * navigation or Escape. This is what fixes the squashed layout on phones.
 */
export function AppShell({
  user,
  activeModule,
  onModuleChange,
  onLogout,
  children,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(true)
  const [isMobile, setIsMobile] = React.useState(false)
  const [customizeOpen, setCustomizeOpen] = React.useState(false)

  // Track whether we are in the mobile drawer mode.
  React.useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY)
    const apply = () => setIsMobile(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  // On mobile the drawer starts closed so the content is immediately visible.
  React.useEffect(() => {
    setSidebarOpen(!mqMatches())
  }, [])

  // Lock background scroll while the drawer covers the page.
  React.useEffect(() => {
    if (!isMobile || !sidebarOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [isMobile, sidebarOpen])

  // Escape closes the drawer.
  React.useEffect(() => {
    if (!isMobile || !sidebarOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isMobile, sidebarOpen])

  // Navigating from the drawer closes it and returns the user to the content.
  const handleNavigate = React.useCallback(
    (m: string) => {
      onModuleChange(m)
      if (isMobile) setSidebarOpen(false)
    },
    [onModuleChange, isMobile],
  )

  return (
    <div className="flex h-screen h-dvh flex-col overflow-hidden bg-white">
      <Topbar
        user={user}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        onLogout={onLogout}
        onNavigate={onModuleChange}
      />

      <div className="t-Body flex min-h-0 flex-1">
        <SidebarTree
          activeModule={activeModule}
          onNavigate={handleNavigate}
          expanded={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Click-catcher behind the open mobile drawer. Like the live APEX
            portal, the page stays fully visible (no dimming) — the drawer
            simply overlays ~2/3 of the screen. Starts *below* the topbar so
            the header's close (X) button stays tappable. */}
        {isMobile && sidebarOpen && (
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-x-0 bottom-0 z-40 lg:hidden"
            style={{ top: 'var(--apex-header-h, calc(56px + env(safe-area-inset-top)))' }}
          />
        )}

        <div className="t-Body-main flex min-w-0 flex-1 flex-col">
          <div className="t-Body-title hidden" />
          <div className="t-Body-content flex min-h-0 flex-1 flex-col">
            <main
              id="main"
              className="t-Body-mainContent hrmis-scroll min-h-0 flex-1 overflow-auto bg-white p-3 sm:p-4"
            >
              {children}
            </main>

            <footer
              className="t-Footer mt-auto flex flex-col items-start gap-1 border-t border-[#d6d6d6] bg-[#f5f5f5] px-3 py-2 text-gray-700 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-4"
              style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
              role="contentinfo"
            >
              <div className="t-Footer-body flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px]">
                <div className="t-Footer-version">Developed By : EMIS E&amp;SE Department</div>
                <div className="t-Footer-customize">
                  <button type="button" onClick={() => setCustomizeOpen(true)} className="text-[#1565c0] hover:underline">
                    Customize
                  </button>
                </div>
              </div>
              <div className="text-[10px] text-gray-400 sm:text-[10px]">Integrated EMIS Portal</div>
            </footer>
          </div>
        </div>
      </div>
      {customizeOpen ? <CustomizeDialog onClose={() => setCustomizeOpen(false)} /> : null}
      <ToastBridge />
    </div>
  )
}

function CustomizeDialog({ onClose }: { onClose: () => void }) {
  const [compact, setCompact] = React.useState(() => document.documentElement.dataset.density === 'compact')
  const [largeText, setLargeText] = React.useState(() => document.documentElement.dataset.text === 'large')
  const apply = () => {
    document.documentElement.dataset.density = compact ? 'compact' : 'comfortable'
    document.documentElement.dataset.text = largeText ? 'large' : 'normal'
    toast.success('Display preferences saved on this device.')
    onClose()
  }
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-label="Customize">
      <div className="w-full max-w-md rounded border border-gray-300 bg-white p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold text-gray-800">Customize</h2><button type="button" onClick={onClose} className="text-xl text-gray-500">×</button></div>
        <div className="space-y-3 text-sm"><label className="flex items-center gap-2"><input type="checkbox" checked={compact} onChange={(e) => setCompact(e.target.checked)} />Compact report rows</label><label className="flex items-center gap-2"><input type="checkbox" checked={largeText} onChange={(e) => setLargeText(e.target.checked)} />Larger text</label></div>
        <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={onClose} className="apex-btn">Cancel</button><button type="button" onClick={apply} className="apex-btn apex-btn--primary">Save Preferences</button></div>
      </div>
    </div>
  )
}

function mqMatches() {
  if (typeof window === 'undefined') return false
  return window.matchMedia(MOBILE_QUERY).matches
}

function ToastBridge() {
  // Small no-op so the shell always loads sonner side-effects inside React tree.
  React.useEffect(() => {
    return () => {
      toast.dismiss?.()
    }
  }, [])
  return null
}
