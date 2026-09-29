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
import { TRANSFER_TYPES } from '@/lib/constants'

interface TransferFormProps {
  onClose: () => void
  onSaved: () => void
}

export function TransferForm({ onClose, onSaved }: TransferFormProps) {
  const [form, setForm] = React.useState({
    employeeId: '',
    fromSchoolId: '',
    toSchoolId: '',
    fromDistrictId: '',
    toDistrictId: '',
    fromDesignationId: '',
    toDesignationId: '',
    transferType: 'Routine Transfer',
    reason: '',
    effectiveDate: '',
    remarks: '',
  })
  const [employees, setEmployees] = React.useState<any[]>([])
  const [districts, setDistricts] = React.useState<{ id: string; name: string }[]>([])
  const [schools, setSchools] = React.useState<{ id: string; name: string; districtId: string | null }[]>([])
  const [designations, setDesignations] = React.useState<{ id: string; title: string; bps: string }[]>([])
  const [loading, setLoading] = React.useState(false)
  const [search, setSearch] = React.useState('')

  React.useEffect(() => {
    fetch('/api/employees?pageSize=200').then((r) => r.json()).then((d) => setEmployees(d.items || [])).catch(console.error)
    fetch('/api/districts').then((r) => r.json()).then((d) => setDistricts(d.items || [])).catch(console.error)
    fetch('/api/schools').then((r) => r.json()).then((d) => setSchools(d.items || [])).catch(console.error)
    fetch('/api/designations').then((r) => r.json()).then((d) => setDesignations(d.items || [])).catch(console.error)
  }, [])

  const filteredEmps = React.useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return employees
    return employees.filter((e: any) =>
      e.fullName.toLowerCase().includes(q) || e.personalNo.includes(q)
    )
  }, [search, employees])

  async function handleSubmit() {
    if (!form.employeeId) return toast.error('Please select an employee')
    if (!form.reason.trim()) return toast.error('Please provide a reason')
    setLoading(true)
    try {
      const res = await fetch('/api/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) return toast.error(data.error || 'Failed')
      toast.success('Transfer request submitted')
      onSaved()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function fillFromEmployee(eid: string) {
    const emp = employees.find((e: any) => e.id === eid)
    if (emp) {
      setForm((f) => ({
        ...f,
        employeeId: eid,
        fromSchoolId: emp.schoolId || '',
        fromDistrictId: emp.districtId || '',
        fromDesignationId: emp.designationId || '',
      }))
    } else {
      setForm((f) => ({ ...f, employeeId: eid }))
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>New Transfer / Posting</DialogTitle>
          <DialogDescription>Initiate a transfer request for an employee.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] px-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Employee</Label>
              <Input
                placeholder="Search employee…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mb-2"
              />
              <Select value={form.employeeId} onValueChange={fillFromEmployee}>
                <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>
                  {filteredEmps.slice(0, 100).map((e: any) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.fullName} ({e.personalNo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>From District</Label>
                <Select value={form.fromDistrictId || '_none'} onValueChange={(v) => setForm((f) => ({ ...f, fromDistrictId: v === '_none' ? '' : v }))}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">—</SelectItem>
                    {districts.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>To District</Label>
                <Select value={form.toDistrictId || '_none'} onValueChange={(v) => setForm((f) => ({ ...f, toDistrictId: v === '_none' ? '' : v }))}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">—</SelectItem>
                    {districts.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>From School</Label>
                <Select value={form.fromSchoolId || '_none'} onValueChange={(v) => setForm((f) => ({ ...f, fromSchoolId: v === '_none' ? '' : v }))}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">—</SelectItem>
                    {schools.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>To School</Label>
                <Select value={form.toSchoolId || '_none'} onValueChange={(v) => setForm((f) => ({ ...f, toSchoolId: v === '_none' ? '' : v }))}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">—</SelectItem>
                    {schools.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>From Designation</Label>
                <Select value={form.fromDesignationId || '_none'} onValueChange={(v) => setForm((f) => ({ ...f, fromDesignationId: v === '_none' ? '' : v }))}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">—</SelectItem>
                    {designations.map((d) => <SelectItem key={d.id} value={d.id}>{d.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>To Designation</Label>
                <Select value={form.toDesignationId || '_none'} onValueChange={(v) => setForm((f) => ({ ...f, toDesignationId: v === '_none' ? '' : v }))}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">—</SelectItem>
                    {designations.map((d) => <SelectItem key={d.id} value={d.id}>{d.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Transfer Type</Label>
                <Select value={form.transferType} onValueChange={(v) => setForm((f) => ({ ...f, transferType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TRANSFER_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Effective Date</Label>
                <Input type="date" value={form.effectiveDate} onChange={(e) => setForm((f) => ({ ...f, effectiveDate: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Reason</Label>
              <Textarea value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} rows={3} />
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="border-t px-6 py-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Submit Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default TransferForm
