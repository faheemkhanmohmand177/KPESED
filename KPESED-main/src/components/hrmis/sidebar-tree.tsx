'use client'

import * as React from 'react'
import { NAV_TREE, type NavItem } from '@/lib/constants'
import { SidebarTreeItem } from './ui/sidebar-tree-item'
import { cn } from '@/lib/utils'

interface SidebarTreeProps {
  activeModule: string
  onNavigate: (module: string) => void
  expanded: boolean
  onClose?: () => void
}

/**
 * Oracle APEX-style sidebar tree navigation.
 *
 * Both variants are always rendered and switched with CSS, so there is no
 * layout flash on first paint:
 *   - <lg  : off-canvas drawer, fixed under the topbar, slides in from the left
 *   - >=lg : static 168px column (collapses to 0 width, like the real site)
 *
 * Renders all 12 top-level items from NAV_TREE; HR MIS expands to 4 sub-items.
 */
export function SidebarTree({ activeModule, onNavigate, expanded }: SidebarTreeProps) {
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(() => {
    // Every group starts collapsed; users open only the branch they need.
    return new Set()
  })

  const toggle = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const renderItem = (item: NavItem, level: number) => {
    const hasChildren = !!item.children?.length
    const isExpanded = expandedItems.has(item.id)
    const active = item.module === activeModule
    return (
      <div key={item.id}>
        <SidebarTreeItem
          label={item.label}
          level={level}
          hasChildren={hasChildren}
          expanded={isExpanded}
          active={active}
          icon={item.icon === 'book' ? 'book' : undefined}
          onClick={() => {
            if (item.module) onNavigate(item.module)
            else if (hasChildren) toggle(item.id)
          }}
          onToggleExpand={() => toggle(item.id)}
        />
        {hasChildren && isExpanded && (
          <div className="tree-children">
            {item.children?.length
              ? item.children.map((child) => renderItem(child, level + 1))
              : null}
          </div>
        )}
      </div>
    )
  }

  const tree = (
    <nav className="py-1" aria-label="Main modules">
      {NAV_TREE.map((item) => renderItem(item, 0))}
    </nav>
  )

  return (
    <>
      {/* ---------- Mobile: off-canvas drawer ---------- *
       * Like the live APEX portal on a phone: the drawer takes roughly two
       * thirds of the screen so the page (and the footer) stay visible on
       * the right, rows start right under the blue top bar — the close (X)
       * control lives in the top bar itself, not inside the drawer.       */}
      <aside
        id="t_TreeNavMobile"
        aria-label="Sidebar navigation"
        aria-hidden={!expanded}
        className={cn(
          'hrmis-scroll fixed inset-y-0 left-0 z-50 w-[66vw] min-w-[260px] max-w-[400px] overflow-y-auto overscroll-contain lg:hidden',
          'border-r border-[#22262a] bg-[#4a4a4a] text-[#f0f0f0] shadow-[2px_0_8px_rgba(0,0,0,0.45)] will-change-transform',
          // `visibility` keeps the slide animation but removes the closed
          // drawer from the tab order and from hit-testing.
          'transition-[transform,visibility] duration-200 ease-out',
          expanded ? 'visible translate-x-0' : 'invisible -translate-x-full',
        )}
        style={{ top: 'var(--apex-header-h, calc(56px + env(safe-area-inset-top)))' }}
      >
        <div className="pb-[calc(1rem+env(safe-area-inset-bottom))]">{tree}</div>
      </aside>

      {/* ---------- Desktop: static column ---------- */}
      <aside
        id="t_TreeNav"
        aria-label="Sidebar navigation"
        className={cn(
          'hrmis-scroll hidden shrink-0 overflow-y-auto border-r border-[#252c2f] bg-[#2f383c] text-[#f0f0f0] transition-[width] duration-200 lg:block',
          expanded ? 'w-[330px]' : 'w-0 border-r-0',
        )}
      >
        {expanded ? (
          <>
            <div className="border-b border-[#3c3c3c] px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-white/70">
              Navigation
            </div>
            {tree}
          </>
        ) : null}
      </aside>
    </>
  )
}
