'use client'

import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type Variant = 'green' | 'amber' | 'red' | 'grey' | 'blue'

interface StatusBadgeProps {
  variant?: Variant
  children: React.ReactNode
  className?: string
}

const variantClass: Record<Variant, string> = {
  green: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900',
  amber: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900',
  red: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900',
  grey: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700',
  blue: 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-900',
}

/** Maps a status string (e.g. "pending", "approved") to a variant using a label map. */
export function StatusBadge({
  status,
  label,
  statusMap,
  className,
}: {
  status: string
  label?: string
  statusMap?: Record<string, { label: string; variant: Variant }>
  className?: string
}) {
  const info = statusMap?.[status] || { label: label || status, variant: 'grey' as Variant }
  return (
    <Badge variant="outline" className={cn(variantClass[info.variant], className)}>
      {info.label}
    </Badge>
  )
}

/** Generic Badge wrapper for one-off colored status usage. */
export function ColoredBadge({ variant = 'grey', children, className }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn(variantClass[variant], className)}>
      {children}
    </Badge>
  )
}

export default StatusBadge
