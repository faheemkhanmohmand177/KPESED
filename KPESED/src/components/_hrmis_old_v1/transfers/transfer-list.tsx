'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { Plus, Check, X, Eye } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
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
import { TransferForm } from './transfer-form'
import { TRANSFER_TYPES, TRANSFER_STATUS } from '@/lib/constants'
import type { SafeUser } from '@/lib/auth'

interface TransferItem {
  id: string
  transferType: string | null
  reason: string
  status: string
  appliedDate: string
  effectiveDate: string | null
  orderNo: string | null
  remarks: string | null
  employee: { fullName: string; personalNo: string; designation?: { title: string } | null }
  fromSchool?: { name: string; emisCode: string } | null
  toSchool?: { name: string; emisCode: string } | null
  fromDistrict?: { name: string } | null
  toDistrict?: { name: string } | null
  fromDesignation?: { title: string; bps: string } | null
  toDesignation?: { title: string; bps: string } | null
}

export function TransfersModule({ user }: { user: SafeUser }) {
  const canApprove = ['admin', 'hr'].includes(user.role)
  const [tab, setTab] = React.useState('all')
  const [items, setItems] = React.useState<TransferItem[]>([])
  const [total, setTotal] = React.useState(0)
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [totalPages, setTotalPages] = React.useState(1)
  const [loading, setLoading] = React.useState(true)
  const [formOpen, setFormOpen] = React.useState(false)
  const [rejectTarget, setRejectTarget] = React.useState<string | null>(null)
  const [rejectReason, setRejectReason] = React.useState('')
  const [approveTarget, setApproveTarget] = React.useState<{ id: string } | null>(null)
  const [approveForm, setApproveForm] = React.useState({ orderNo: '', orderDate: '', effectiveDate: '', remarks: '' })

  const fetchData = React.useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (tab !== 'all') params.set('status', tab)
      params.set('page', String(page))
      params.set('pageSize', String(pageSize))
      const res = await fetch(`/api/transfers?${params.toString()}`, { cache: 'no-store' })
      const data = await res.json()
      setItems(data.items || [])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 1)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [tab, page, pageSize])

  React.useEffect(() => { fetchData() }, [fetchData])

  async function submitReject() {
    if (!rejectTarget || !rejectReason.trim()) return toast.error('Provide a rejection reason')
    try {
      const res = await fetch(`/api/transfers/${rejectTarget}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectionReason: rejectReason }),
      })
      const data = await res.json()
      if (!res.ok) return toast.error(data.error || 'Failed')
      toast.success('Transfer rejected')
      setRejectTarget(null)
      setRejectReason('')
      fetchData()
    } catch (err) { console.error(err) }
  }

  async function submitApprove() {
    if (!approveTarget) return
    try {
      const res = await fetch(`/api/transfers/${approveTarget.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(approveForm),
      })
      const data = await res.json()
      if (!res.ok) return toast.error(data.error || 'Failed')
      toast.success('Transfer approved & applied')
      setApproveTarget(null)
      setApproveForm({ orderNo: '', orderDate: '', effectiveDate: '', remarks: '' })
      fetchData()
    } catch (err) { console.error(err) }
  }

  const columns: Column<TransferItem>[] = [
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
      key: 'from_to',
      header: 'From → To',
      cell: (row) => (
        <div className="text-xs">
          <p><strong>From:</strong> {row.fromSchool?.name || row.fromDistrict?.name || '—'}</p>
          <p><strong>To:</strong> {row.toSchool?.name || row.toDistrict?.name || '—'}</p>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      cell: (row) => <span className="text-xs font-medium">{row.transferType || 'Routine'}</span>,
    },
    {
      key: 'reason',
      header: 'Reason',
      cell: (row) => <p className="line-clamp-1 text-xs text-muted-foreground">{row.reason}</p>,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} statusMap={TRANSFER_STATUS} />,
    },
    {
      key: 'applied',
      header: 'Applied',
      cell: (row) => <span className="text-xs">{new Date(row.appliedDate).toLocaleDateString()}</span>,
    },
    {
      key: 'actions',
      header: () => <span className="text-right">Actions</span>,
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          {canApprove && row.status === 'pending' && (
            <>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:text-emerald-700" onClick={() => setApproveTarget({ id: row.id })} title="Approve">
                <Check className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700" onClick={() => { setRejectTarget(row.id); setRejectReason('') }} title="Reject">
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Transfers / Postings</h2>
          <p className="text-sm text-muted-foreground">
            Manage employee transfers and postings across schools and districts.
          </p>
        </div>
        <Button size="sm" onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Transfer
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard title="Pending" value={items.filter((i) => i.status === 'pending').length} accent="gold" />
        <StatCard title="Approved" value={items.filter((i) => i.status === 'approved').length} accent="green" />
        <StatCard title="Rejected" value={items.filter((i) => i.status === 'rejected').length} accent="red" />
        <StatCard title="Total" value={total} accent="slate" />
      </div>

      <Tabs value={tab} onValueChange={(v) => { setTab(v); setPage(1) }}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
      </Tabs>

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
          />
        </CardContent>
      </Card>

      {formOpen && (
        <TransferForm onClose={() => setFormOpen(false)} onSaved={() => { setFormOpen(false); fetchData() }} />
      )}

      <Dialog open={!!rejectTarget} onOpenChange={(o) => !o && setRejectTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Transfer Request</DialogTitle>
            <DialogDescription>Provide a reason for rejection.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reason">Rejection Reason</Label>
            <Textarea id="reason" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={4} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={submitReject}>Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!approveTarget} onOpenChange={(o) => !o && setApproveTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Transfer</DialogTitle>
            <DialogDescription>Enter official order details to approve and apply this transfer.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Order No</Label>
              <Input value={approveForm.orderNo} onChange={(e) => setApproveForm((f) => ({ ...f, orderNo: e.target.value }))} placeholder="e.g. SO(E&SE)ESTB-2024-001" />
            </div>
            <div>
              <Label>Order Date</Label>
              <Input type="date" value={approveForm.orderDate} onChange={(e) => setApproveForm((f) => ({ ...f, orderDate: e.target.value }))} />
            </div>
            <div>
              <Label>Effective Date</Label>
              <Input type="date" value={approveForm.effectiveDate} onChange={(e) => setApproveForm((f) => ({ ...f, effectiveDate: e.target.value }))} />
            </div>
            <div>
              <Label>Remarks</Label>
              <Textarea value={approveForm.remarks} onChange={(e) => setApproveForm((f) => ({ ...f, remarks: e.target.value }))} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveTarget(null)}>Cancel</Button>
            <Button onClick={submitApprove}>Approve &amp; Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TransfersModule
