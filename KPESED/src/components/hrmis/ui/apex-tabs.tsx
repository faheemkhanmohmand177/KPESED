'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ApexTab {
  id: string
  label: string
}

export interface ApexTabsProps {
  tabs: ApexTab[]
  active: string
  onChange: (id: string) => void
  className?: string
}

/**
 * Oracle APEX-style horizontal tab strip.
 * Active tab has a teal underline indicator.
 */
export function ApexTabs({ tabs, active, onChange, className }: ApexTabsProps) {
  return (
    <div className={cn('apex-tabs', className)} role="tablist">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={t.id === active}
          onClick={() => onChange(t.id)}
          className={cn('apex-tab', t.id === active && 'apex-tab--active')}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
