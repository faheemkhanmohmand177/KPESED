'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { Plus, Eye, Wallet, CheckCircle2, Printer } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataTable, type Column } from '@/components/hrmis/ui/data-table'
import { StatusBadge } from '@/components/hrmis/ui/status-badge'
import { StatCard } from '@/components/hrmis/ui/stat-card'
import { Payslip } from './payslip'
import { MONTH_NAMES, PAYROLL_STATUS } from '@/lib/constants'
import type { SafeUser } from '@/lib/auth'

interface PayrollItem {
  id: string
  month: number
  year: number
  basicPay: number
  houseRentAllowance: number
  conveyanceAllowance: number
  medicalAllowance: number
  adhocReliefAllowance: number
  specialAllowance: number
  otherAllowances: number
  incomeTax: number
  gpFund: number
  insurance: number
  loanRecovery: number
  eobi: number
  otherDeductions: number
  status: string
  paidDate: string | null
  bankReference: string | null
  employee: { id: string; fullName: string; personalNo: string; bps: string | null; designation?: { title: string; bps: string } | null }
}

export function PayrollModule({ user }: { user: SafeUser }) {
  const canGenerate = ['admin', 'hr'].includes(user.role)
  const now = new Date()
  const [month, setMonth] = React.useState(now.getMonth() + 1)
  const [year, setYear] = React.useState(now.getFullYear())
  const [items, setItems] = React.useState<PayrollItem[]>([])
  const [summary, setSummary] = React.useState({ totalEmployees: 0, totalEarnings: 0, totalDeductions: 0, netPayout: 0 })
  const [total, setTotal] = React.useState(0)
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [totalPages, setTotalPages] = React.useState(1)
  const [loading, setLoading] = React.useState(true)
  const [viewItem, setViewItem] = React.useState<string | null>(null)
  const [generating, setGenerating] = React.useState(false)

  const fetchData = React.useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('month', String(month))
      params.set('year', String(year))
      params.set('page', String(page))
      params.set('pageSize', String(pageSize))
      const res = await fetch(`/api/payroll?${params.toString()}`, { cache: 'no-store' })
      const data = await res.json()
      setItems(data.items || [])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 1)
      setSummary(data.summary || { totalEmployees: 0, totalEarnings: 0, totalDeductions: 0, netPayout: 0 })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [month, year, page, pageSize])

  React.useEffect(() => { fetchData() }, [fetchData])

  async function handleGenerate() {
    if (!confirm(`Generate payroll for ${MONTH_NAMES[month - 1]} ${year}? This will create records for all active employees.`)) return
    setGenerating(true)
    try {
      const res = await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month, year, action: 'generate' }),
      })
      const data = await res.json()
      if (!res.ok) return toast.error(data.error || 'Failed')
      toast.success(data.message || 'Payroll generated')
      fetchData()
    } catch (err) { console.error(err) }
    finally { setGenerating(false) }
  }

  async function handleProcessAll() {
    if (!confirm(`Mark all draft payroll as processed for ${MONTH_NAMES[month - 1]} ${year}?`)) return
    try {
      await fetch('/api/payroll', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month, year }),
      })
      toast.success('Drafts marked as processed')
      fetchData()
    } catch (err) { console.error(err) }
  }

  async function handleMarkPaid(id: string) {
    try {
      await fetch(`/api/payroll/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid' }),
      })
      toast.success('Marked as paid')
      fetchData()
    } catch (err) { console.error(err) }
  }

  const columns: Column<PayrollItem>[] = [
    {
      key: 'employee',
      header: 'Employee',
      cell: (row) => (
        <div>
          <p className="font-medium">{row.employee.fullName}</p>
          <p className="text-xs text-muted-foreground">
            <span className="font-mono">{row.employee.personalNo}</span>
            {row.employee.designation?.title && ` · ${row.employee.designation.title}`}
          </p>
        </div>
      ),
    },
    {
      key: 'bps',
      header: 'BPS',
      cell: (row) => <span className="text-xs">{row.employee.bps?.replace('bps_', 'BPS-') || '—'}</span>,
    },
    {
      key: 'basicPay',
      header: 'Basic Pay',
      cell: (row) => <span className="font-mono text-xs">Rs {row.basicPay.toLocaleString()}</span>,
    },
    {
      key: 'allowances',
      header: 'Allowances',
      cell: (row) => (
        <span className="font-mono text-xs">
          Rs {(row.houseRentAllowance + row.conveyanceAllowance + row.medicalAllowance + row.adhocReliefAllowance + row.specialAllowance + row.otherAllowances).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'deductions',
      header: 'Deductions',
      cell: (row) => (
        <span className="font-mono text-xs text-red-600">
          Rs {(row.incomeTax + row.gpFund + row.insurance + row.loanRecovery + row.eobi + row.otherDeductions).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'net',
      header: 'Net Pay',
      cell: (row) => {
        const net = row.basicPay + row.houseRentAllowance + row.conveyanceAllowance + row.medicalAllowance + row.adhocReliefAllowance + row.specialAllowance + row.otherAllowances - (row.incomeTax + row.gpFund + row.insurance + row.loanRecovery + row.eobi + row.otherDeductions)
        return <span className="font-mono text-sm font-semibold text-[#01411C]">Rs {net.toLocaleString()}</span>
      },
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} statusMap={PAYROLL_STATUS} />,
    },
    {
      key: 'actions',
      header: () => <span className="text-right">Actions</span>,
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewItem(row.id)} title="View Payslip">
            <Eye className="h-4 w-4" />
          </Button>
          {canGenerate && row.status === 'processed' && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600" onClick={() => handleMarkPaid(row.id)} title="Mark Paid">
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payroll</h2>
          <p className="text-sm text-muted-foreground">
            Generate and manage monthly salary disbursements.
          </p>
        </div>
        {canGenerate && (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleProcessAll} disabled={loading}>
              <Printer className="mr-2 h-4 w-4" /> Process Drafts
            </Button>
            <Button size="sm" onClick={handleGenerate} disabled={generating}>
              <Plus className="mr-2 h-4 w-4" /> {generating ? 'Generating…' : 'Generate Payroll'}
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Wallet className="h-4 w-4" /> Period Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <label className="text-xs font-medium">Month</label>
              <Select value={String(month)} onValueChange={(v) => { setMonth(Number(v)); setPage(1) }}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MONTH_NAMES.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium">Year</label>
              <Select value={String(year)} onValueChange={(v) => { setYear(Number(v)); setPage(1) }}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 7 }).map((_, i) => {
                    const y = now.getFullYear() - i
                    return <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard title="Total Employees" value={summary.totalEmployees} icon={<Wallet className="h-5 w-5" />} accent="slate" />
        <StatCard title="Total Earnings" value={`Rs ${summary.totalEarnings.toLocaleString()}`} accent="green" />
        <StatCard title="Total Deductions" value={`Rs ${summary.totalDeductions.toLocaleString()}`} accent="red" />
        <StatCard title="Net Payout" value={`Rs ${summary.netPayout.toLocaleString()}`} accent="gold" />
      </div>

      <Card>
        <CardContent className="p-4">
          <DataTable
            columns={columns}
            data={items}
            loading={loading}
            rowKey={(r) => r.id}
            page={page}
            total={total}
            totalPages={totalPages}
            onPageChange={setPage}
            onPageSizeChange={(s) => { setPageSize(s); setPage(1) }}
            pageSizeOptions={[10, 25, 50]}
            emptyTitle={`No payroll for ${MONTH_NAMES[month - 1]} ${year}`}
            emptyDescription="Click 'Generate Payroll' to create records for active employees."
          />
        </CardContent>
      </Card>

      {viewItem && (
        <Payslip payrollId={viewItem} onClose={() => setViewItem(null)} />
      )}
    </div>
  )
}

export default PayrollModule
