'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ApexTableColumn {
  key: string
  label: string
  sortable?: boolean
  // Optional render function for the cell. If omitted, the value is shown as-is.
  render?: (row: Record<string, unknown>, rowIndex: number) => React.ReactNode
  // Header alignment (default left)
  headerAlign?: 'left' | 'center' | 'right'
  // Cell alignment
  cellAlign?: 'left' | 'center' | 'right'
  // Apply monospace font to cells in this column
  mono?: boolean
}

export interface ApexTableProps {
  columns: ApexTableColumn[]
  rows: Array<Record<string, unknown>>
  // Optional footer row — single row, keyed by column.key
  footer?: Record<string, React.ReactNode>
  emptyText?: string
  maxHeight?: string
  className?: string
  onRowClick?: (row: Record<string, unknown>, index: number) => void
  // Sort state
  sortKey?: string
  sortDir?: 'asc' | 'desc'
  onSort?: (key: string) => void
}

/**
 * Oracle APEX-style data table.
 * - Compact rows
 * - Sortable column headers (link-style)
 * - Horizontal scroll wrapper for wide tables (e.g. 32-col employee table)
 * - Optional footer
 */
export function ApexTable({
  columns,
  rows,
  footer,
  emptyText = 'No data found.',
  maxHeight,
  className,
  onRowClick,
  sortKey,
  sortDir,
  onSort,
}: ApexTableProps) {
  return (
    <div
      className={cn('apex-table-wrap hrmis-scroll w-full overflow-auto', className)}
      style={maxHeight ? { maxHeight } : undefined}
    >
      <table className="apex-table">
        <caption className="sr-only">
          Scroll sideways to see all {columns.length} columns
        </caption>
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                style={{ textAlign: c.headerAlign ?? 'left' }}
                onClick={() => {
                  if (c.sortable && onSort) onSort(c.key)
                }}
                className={c.sortable ? 'cursor-pointer select-none' : ''}
              >
                {c.sortable && onSort ? (
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      onSort(c.key)
                    }}
                    className="inline-flex items-center gap-1"
                  >
                    {c.label}
                    {sortKey === c.key && (
                      <span className="text-[10px] text-gray-500">
                        {sortDir === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </a>
                ) : (
                  c.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center text-gray-500 italic py-6">
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => (
              <tr
                key={idx}
                onClick={onRowClick ? () => onRowClick(row, idx) : undefined}
                className={onRowClick ? 'cursor-pointer' : ''}
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    style={{ textAlign: c.cellAlign ?? 'left' }}
                    className={c.mono ? 'font-mono' : ''}
                  >
                    {c.render ? c.render(row, idx) : toDisplay(row[c.key])}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
        {footer && (
          <tfoot>
            <tr>
              {columns.map((c) => (
                <td key={c.key}>{footer[c.key] ?? ''}</td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}

function toDisplay(v: unknown): string {
  if (v === null || v === undefined || v === '') return ''
  if (typeof v === 'number') return Number.isFinite(v) ? String(v) : ''
  if (v instanceof Date) return v.toISOString().slice(0, 10)
  return String(v)
}
