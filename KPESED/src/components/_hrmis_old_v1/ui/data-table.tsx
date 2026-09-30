'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react'

export interface Column<T> {
  key: string
  header: React.ReactNode
  cell: (row: T, index: number) => React.ReactNode
  className?: string
  headerClassName?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  emptyTitle?: string
  emptyDescription?: string
  pageSize?: number
  page?: number
  total?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: number[]
  maxHeight?: string
  rowKey?: (row: T) => string
  onRowClick?: (row: T) => void
  className?: string
}

export function DataTable<T>({
  columns,
  data,
  loading,
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting your filters or search criteria.',
  page,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
  maxHeight = 'max-h-[60vh]',
  rowKey,
  onRowClick,
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className={cn('overflow-auto rounded-md border bg-card hrmis-scroll', maxHeight)}>
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted/50 backdrop-blur">
            <TableRow className="hover:bg-muted/50">
              {columns.map((col) => (
                <TableHead key={col.key} className={col.headerClassName}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((col) => (
                    <TableCell key={col.key}>
                      <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-40 text-center">
                  <div className="mx-auto flex max-w-sm flex-col items-center gap-2 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <Inbox className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-semibold">{emptyTitle}</p>
                    <p className="text-xs text-muted-foreground">{emptyDescription}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, idx) => (
                <TableRow
                  key={rowKey ? rowKey(row) : idx}
                  className={onRowClick ? 'cursor-pointer' : undefined}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((col) => (
                    <TableCell key={col.key} className={col.className}>
                      {col.cell(row, idx)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {(onPageChange || onPageSizeChange) && (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {total !== undefined && (
              <>
                <span>
                  Showing <strong>{data.length}</strong> of <strong>{total}</strong> records
                </span>
                {onPageSizeChange && (
                  <div className="flex items-center gap-2">
                    <span>·</span>
                    <Select value={String(pageSizeOptions[0])} onValueChange={(v) => onPageSizeChange?.(Number(v))}>
                      <SelectTrigger className="h-8 w-[90px]">
                        <SelectValue placeholder="Rows" />
                      </SelectTrigger>
                      <SelectContent>
                        {pageSizeOptions.map((opt) => (
                          <SelectItem key={opt} value={String(opt)}>
                            {opt} / page
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}
          </div>
          {onPageChange && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!page || page <= 1}
                onClick={() => onPageChange((page || 1) - 1)}
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </Button>
              <span className="text-xs text-muted-foreground">
                Page <strong>{page}</strong> of {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={!totalPages || page >= totalPages}
                onClick={() => onPageChange((page || 1) + 1)}
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default DataTable
