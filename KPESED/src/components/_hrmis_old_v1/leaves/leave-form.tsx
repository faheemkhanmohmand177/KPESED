'use client'

import * as React from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, Save } from 'lucide-react'
import { LEAVE_TYPES } from '@/lib/constants'

interface LeaveFormProps {
  onClose: () => void
  onSaved: () => void
}

export function LeaveForm({ onClose, onSaved }: LeaveFormProps) {
  const [form, setForm] = React.useState({
    employeeId: '',
    leaveType: 'Casual Leave',
    fromDate: '',
    toDate: '',
    reason: '',
    attachmentUrl: '',
    remarks: '',
  })
  const [employees, setEmployees] = React.useState<{ id: string; fullName: string; personalNo: string; designation?: { title: string } | null }[]>([])
  const [loading, setLoading] = React.useState(false)
  const [search, setSearch] = React.useState('')

  React.useEffect(() => {
    fetch(`/api/employees?pageSize=200`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setEmployees(d.items || []))
      .catch(console.error)
  }, [])

  const filtered = React.useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return employees
    return employees.filter((e) =>
      e.fullName.toLowerCase().includes(q) || e.personalNo.includes(q)
    )
  }, [search, employees])

  const diffDays = React.useMemo(() => {
    if (!form.fromDate || !form.toDate) return 0
    const from = new Date(form.fromDate)
    const to = new Date(form.toDate)
    return Math.max(1, Math.round((to.getTime() - from.getTime()) / 86400000) + 1)
  }, [form.fromDate, form.toDate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.employeeId) return toast.error('Please select an employee')
    if (!form.fromDate || !form.toDate) return toast.error('Please select leave dates')
    if (!form.reason.trim()) return toast.error('Please provide a reason')
    setLoading(true)
    try {
      const res = await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to apply')
        return
      }
      toast.success('Leave application submitted')
      onSaved()
    } catch (err) {
      console.error(err)
      toast.error('Failed to apply leave')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Apply for Leave</DialogTitle>
          <DialogDescription>Submit a new leave application for approval.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] px-6 py-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Employee</Label>
              <Input
                placeholder="Search employee by name or personal no…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mb-2"
              />
              <Select value={form.employeeId} onValueChange={(v) => setForm((f) => ({ ...f, employeeId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>
                  {filtered.slice(0, 100).map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.fullName} ({e.personalNo}){e.designation?.title ? ` · ${e.designation.title}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Leave Type</Label>
                <Select value={form.leaveType} onValueChange={(v) => setForm((f) => ({ ...f, leaveType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LEAVE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Duration</Label>
                <div className="flex h-9 items-center justify-between rounded-md border px-3 text-sm">
                  <span>{diffDays} day{diffDays > 1 ? 's' : ''}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>From Date</Label>
                <Input type="date" value={form.fromDate} onChange={(e) => setForm((f) => ({ ...f, fromDate: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>To Date</Label>
                <Input type="date" value={form.toDate} min={form.fromDate} onChange={(e) => setForm((f) => ({ ...f, toDate: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Reason</Label>
              <Textarea
                value={form.reason}
                onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                placeholder="Brief reason for leave application…"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Attachment URL (optional)</Label>
              <Input
                value={form.attachmentUrl}
                onChange={(e) => setForm((f) => ({ ...f, attachmentUrl: e.target.value }))}
                placeholder="e.g. medical certificate URL"
              />
            </div>
          </form>
        </ScrollArea>
        <DialogFooter className="border-t px-6 py-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Submit Application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default LeaveForm
