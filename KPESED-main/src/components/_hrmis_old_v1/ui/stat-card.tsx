'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

interface StatCardProps {
  title: string
  value: React.ReactNode
  icon?: React.ReactNode
  description?: string
  trend?: { value: string; positive?: boolean }
  accent?: 'green' | 'gold' | 'red' | 'slate'
  className?: string
}

const accentBg: Record<NonNullable<StatCardProps['accent']>, string> = {
  green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  gold: 'bg-amber-50 text-amber-700 border-amber-100',
  red: 'bg-red-50 text-red-700 border-red-100',
  slate: 'bg-slate-50 text-slate-700 border-slate-100',
}

export function StatCard({ title, value, icon, description, trend, accent = 'green', className }: StatCardProps) {
  return (
    <Card className={cn('overflow-hidden border', className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
            {trend && (
              <p className={cn('text-xs font-medium', trend.positive ? 'text-emerald-600' : 'text-red-600')}>
                {trend.positive ? '▲' : '▼'} {trend.value}
              </p>
            )}
          </div>
          {icon && (
            <div className={cn('flex h-11 w-11 items-center justify-center rounded-lg border', accentBg[accent])}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default StatCard
