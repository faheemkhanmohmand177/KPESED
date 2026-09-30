'use client'

import * as React from 'react'
import { ChevronRight, ChevronDown, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SidebarTreeItemProps {
  label: string
  active?: boolean
  expanded?: boolean
  hasChildren?: boolean
  /** Marks a branch with additional options. */
  pending?: boolean
  /** Optional glyph override — e.g. `book` renders the Textbook Board icon. */
  icon?: string
  level: number
  onClick?: () => void
  onToggleExpand?: () => void
}

/**
 * Reusable tree node for the sidebar tree navigation.
 * Matches the look of the Oracle APEX a-TreeView node on the live portal:
 *
 * - Every row (group or leaf) carries the same » glyph at the same x, so
 *   sub-items sit flush with their parent rows — exactly like the real site.
 * - Tall ~46px rows with ~17px labels, single-line ellipsis.
 * - An expanded group row is highlighted with the live site's blue underline.
 * - The expand/collapse chevron stays on the far right of the row.
 */
export function SidebarTreeItem({
  label,
  active,
  expanded,
  hasChildren,
  pending,
  icon,
  level,
  onClick,
  onToggleExpand,
}: SidebarTreeItemProps) {
  // The live tree keeps every level flush-left; only a small constant pad.
  void level

  return (
    <div
      className={cn(
        'tree-item',
        active && 'tree-item--active',
        hasChildren && expanded && !active && 'tree-item--expanded',
      )}
      style={{ paddingLeft: '12px' }}
    >
      {icon === 'book' ? (
        <BookOpen className="tree-caret h-[18px] w-[18px] shrink-0" aria-hidden />
      ) : (
        <span className="tree-caret text-[15px] text-white/75" aria-hidden>
          »
        </span>
      )}

      <button
        type="button"
        onClick={onClick}
        // A node with no module of its own acts as a pure expander, matching
        // the real site where clicking the parent row just opens the sub-menu.
        className={cn(
          'min-w-0 flex-1 text-left leading-tight',
        )}
        title={label}
      >
        <span className={cn(level === 0 && 'font-medium')}>{label}</span>
        {pending ? <span className="sr-only"> (additional options)</span> : null}
      </button>

      {/* The live portal renders the expand chevron on the far right of the
          row, not on the left — matched here for a faithful look. */}
      {hasChildren ? (
        <button
          type="button"
          aria-label={expanded ? 'Collapse' : 'Expand'}
          aria-expanded={expanded}
          onClick={(e) => {
            e.stopPropagation()
            onToggleExpand?.()
          }}
          className="mr-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded text-white/70 transition-colors hover:bg-white/20 hover:text-white"
        >
          {expanded ? (
            <ChevronDown className="h-4.5 w-4.5" />
          ) : (
            <ChevronRight className="h-4.5 w-4.5" />
          )}
        </button>
      ) : (
        <span className="mr-1 inline-block h-4 w-5 shrink-0" aria-hidden />
      )}
    </div>
  )
}
