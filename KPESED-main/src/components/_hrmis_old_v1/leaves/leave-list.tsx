'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { Plus, Check, X, Eye, FileText, CalendarOff } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { DataTable, type Column } from '@/components/hrmis/ui/data-table'
import { StatusBadge } from '@/components/hrmis/ui/status-badge'
import { StatCard } from '@/components/hrmis/ui/stat-card'
import { LeaveForm } from './leave-form'
import { LEAVE_TYPES, LEAVE_STATUS } from '@/lib/constants'
import type { SafeUser } from '@/lib/auth'

interface LeaveItem {
  id: string
  employeeId: string
  leaveType: string
  fromDate: string
  toDate: string
  noOfDays: number
  reason: string
  status: string
  appliedDate: string
  approvedDate: string | null
  rejectionReason: string | null
  employee: { fullName: string; personalNo: string; designation?: { title: string; bps: string } | null; district?: { name: string } | null }
  approvedBy?: { id: string; fullName: string } | null
}

interface LeavesModuleProps {
  user: SafeUser
}

export function LeavesModule({ user }: LeavesModuleProps) {
  const canApprove = ['admin', 'hr'].includes(user.role)
  const [tab, setTab] = React.useState('all')
  const [items, setItems] = React.useState<LeaveItem[]>([])
  const [total, setTotal] = React.useState(0)
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [totalPages, setTotalPages] = React.useState(1)
  const [loading, setLoading] = React.useState(true)
  const [formOpen, setFormOpen] = React.useState(false)
  const [rejectTarget, setRejectTarget] = React.useState<string | null>(null)
  const [rejectReason, setRejectReason] = React.useState('')
  const [viewItem, setViewItem] = React.useState<LeaveItem | null>(null)

  const fetchData = React.useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (tab === 'mine') params.set('mine', '1')
      else if (tab !== 'all') params.set('status', tab)
      params.set('page', String(page))
      params.set('pageSize', String(pageSize))
      const res = await fetch(`/api/leaves?${params.toString()}`, { cache: 'no-store' })
      const data = await res.json()
      setItems(data.items || [])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 1)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load leaves')
    } finally {
      setLoading(false)
    }
  }, [tab, page, pageSize])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  async function handleApprove(id: string) {
    try {
      const res = await fetch(`/api/leaves/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to approve')
        return
      }
      toast.success('Leave approved')
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  async function submitReject() {
    if (!rejectTarget) return
    if (!rejectReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }
    try {
      const res = await fetch(`/api/leaves/${rejectTarget}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectionReason }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to reject')
        return
      }
      toast.success('Leave rejected')
      setRejectTarget(null)
      setRejectReason('')
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  const columns: Column<LeaveItem>[] = [
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
      key: 'type',
      header: 'Type',
      cell: (row) => <span className="text-sm font-medium">{row.leaveType}</span>,
    },
    {
      key: 'dates',
      header: 'From → To',
      cell: (row) => (
        <div className="text-xs">
          <p>{new Date(row.fromDate).toLocaleDateString()} → {new Date(row.toDate).toLocaleDateString()}</p>
          <p className="text-muted-foreground">{row.noOfDays} day{row.noOfDays > 1 ? 's' : ''}</p>
        </div>
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      cell: (row) => <p className="line-clamp-1 text-xs text-muted-foreground">{row.reason}</p>,
    },
    {
      key: 'applied',
      header: 'Applied',
      cell: (row) => <span className="text-xs">{new Date(row.appliedDate).toLocaleDateString()}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} statusMap={LEAVE_STATUS} />,
    },
    {
      key: 'actions',
      header: () => <span className="text-right">Actions</span>,
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewItem(row)} title="View">
            <Eye className="h-4 w-4" />
          </Button>
          {canApprove && row.status === 'pending' && (
            <>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:text-emerald-700" onClick={() => handleApprove(row.id)} title="Approve">
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
          <h2 className="text-2xl font-bold tracking-tight">Leave Applications</h2>
          <p className="text-sm text-muted-foreground">
            Apply, approve, and track leave requests across the department.
          </p>
        </div>
        <Button size="sm" onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Apply Leave
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard title="Pending" value={items.filter((i) => i.status === 'pending').length} icon={<CalendarOff className="h-5 w-5" />} accent="gold" />
        <StatCard title="Approved" value={items.filter((i) => i.status === 'approved').length} accent="green" />
        <StatCard title="Rejected" value={items.filter((i) => i.status === 'rejected').length} accent="red" />
        <StatCard title="Total Leaves" value={total} accent="slate" />
      </div>

      <Tabs value={tab} onValueChange={(v) => { setTab(v); setPage(1) }}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="mine">My Leaves</TabsTrigger>
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
        <LeaveForm onClose={() => setFormOpen(false)} onSaved={() => { setFormOpen(false); fetchData() }} />
      )}

      <Dialog open={!!rejectTarget} onOpenChange={(o) => !o && setRejectTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Leave Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this leave application.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reason">Rejection Reason</Label>
            <Textarea
              id="reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Insufficient leave balance / conflicting schedule…"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={submitReject}>Reject Leave</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewItem} onOpenChange={(o) => !o && setViewItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Leave Application Details</DialogTitle>
            <DialogDescription>
              Filed by {viewItem?.employee.fullName}
            </DialogDescription>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs uppercase text-muted-foreground">Leave Type</p><p className="font-medium">{viewItem.leaveType}</p></div>
                <div><p className="text-xs uppercase text-muted-foreground">Duration</p><p className="font-medium">{viewItem.noOfDays} day{viewItem.noOfDays > 1 ? 's' : ''}</p></div>
                <div><p className="text-xs uppercase text-muted-foreground">From</p><p className="font-medium">{new Date(viewItem.fromDate).toLocaleDateString()}</p></div>
                <div><p className="text-xs uppercase text-muted-foreground">To</p><p className="font-medium">{new Date(viewItem.toDate).toLocaleDateString()}</p></div>
                <div><p className="text-xs uppercase text-muted-foreground">Applied</p><p className="font-medium">{new Date(viewItem.appliedDate).toLocaleDateString()}</p></div>
                <div><p className="text-xs uppercase text-muted-foreground">Status</p><StatusBadge status={viewItem.status} statusMap={LEAVE_STATUS} /></div>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Reason</p>
                <p className="mt-1 rounded-md border bg-muted/30 p-3 text-sm">{viewItem.reason}</p>
              </div>
              {viewItem.rejectionReason && (
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Rejection Reason</p>
                  <p className="mt-1 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{viewItem.rejectionReason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default LeavesModule
