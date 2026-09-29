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
 * Matches the look of the Oracle APEX a-TreeView node.
 *
 * Like the live portal, every row carries the » navigation glyph (doubled
 * on the top level), so leaf rows align perfectly with group rows. The
 * expand/collapse chevron stays on the far right of the row.
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
  // Depth-aware indent; the real tree nests further than two levels.
  const indent = 8 + level * 16

  return (
    <div
      className={cn('tree-item', active && 'tree-item--active')}
      style={{ paddingLeft: `${indent}px` }}
    >
      {icon === 'book' ? (
        <BookOpen className="tree-caret h-4 w-4 shrink-0" aria-hidden />
      ) : (
        <span className="tree-caret text-[11px] text-white/45" aria-hidden>
          {level === 0 ? '»»' : '»'}
        </span>
      )}

      <button
        type="button"
        onClick={onClick}
        // A node with no module of its own acts as a pure expander, matching
        // the real site where clicking the parent row just opens the sub-menu.
        className={cn(
          'min-w-0 flex-1 whitespace-normal break-words py-0.5 text-left leading-tight',
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
          className="mr-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-white/70 transition-colors hover:bg-white/20 hover:text-white"
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      ) : (
        <span className="mr-1 inline-block h-4 w-6 shrink-0" aria-hidden />
      )}
    </div>
  )
}
