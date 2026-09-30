'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { Calendar, CheckCheck, Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StatCard } from '@/components/hrmis/ui/stat-card'
import { DataTable, type Column } from '@/components/hrmis/ui/data-table'
import { ATTENDANCE_STATUS, ATTENDANCE_STATUS_LABELS } from '@/lib/constants'

interface AttendanceRow {
  id: string | null
  employeeId: string
  attendanceDate: string
  status: string | null
  checkIn: string | null
  checkOut: string | null
  remarks: string | null
  employee: {
    id: string
    fullName: string
    personalNo: string
    designation?: { title: string } | null
  }
}

interface AttendanceModuleProps {
  user: { role: string }
}

export function AttendanceModule({ user }: AttendanceModuleProps) {
  const canEdit = ['admin', 'hr', 'deo'].includes(user.role)

  const [date, setDate] = React.useState(new Date().toISOString().substring(0, 10))
  const [districtId, setDistrictId] = React.useState('')
  const [schoolId, setSchoolId] = React.useState('')
  const [items, setItems] = React.useState<AttendanceRow[]>([])
  const [summary, setSummary] = React.useState<Record<string, number>>({})
  const [totalEmployees, setTotalEmployees] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState<string | null>(null)
  const [edits, setEdits] = React.useState<Record<string, { status: string; checkIn: string; checkOut: string; remarks: string }>>({})

  const [districts, setDistricts] = React.useState<{ id: string; name: string }[]>([])
  const [schools, setSchools] = React.useState<{ id: string; name: string }[]>([])

  React.useEffect(() => {
    fetch('/api/districts').then((r) => r.json()).then((d) => setDistricts(d.items || [])).catch(console.error)
    fetch('/api/schools').then((r) => r.json()).then((d) => setSchools(d.items || [])).catch(console.error)
  }, [])

  const fetchData = React.useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ date })
      if (districtId) params.set('districtId', districtId)
      if (schoolId) params.set('schoolId', schoolId)
      const res = await fetch(`/api/attendance?${params.toString()}`, { cache: 'no-store' })
      const data = await res.json()
      setItems(data.items || [])
      setSummary(data.summary || {})
      setTotalEmployees(data.totalEmployees || 0)
      setEdits({})
    } catch (err) {
      console.error(err)
      toast.error('Failed to load attendance')
    } finally {
      setLoading(false)
    }
  }, [date, districtId, schoolId])

  React.useEffect(() => {
    const t = setTimeout(fetchData, 200)
    return () => clearTimeout(t)
  }, [fetchData])

  function getRowEdit(r: AttendanceRow) {
    return edits[r.employeeId] || {
      status: r.status || 'present',
      checkIn: r.checkIn || '',
      checkOut: r.checkOut || '',
      remarks: r.remarks || '',
    }
  }

  async function saveRow(r: AttendanceRow) {
    const e = getRowEdit(r)
    setSaving(r.employeeId)
    try {
      const url = r.id ? `/api/attendance/${r.id}` : '/api/attendance'
      const method = r.id ? 'PUT' : 'POST'
      const body: any = {
        employeeId: r.employeeId,
        attendanceDate: date,
        status: e.status,
        checkIn: e.checkIn,
        checkOut: e.checkOut,
        remarks: e.remarks,
      }
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to save')
        return
      }
      toast.success('Attendance saved')
      setEdits((prev) => { const n = { ...prev }; delete n[r.employeeId]; return n })
      fetchData()
    } catch (err) {
      console.error(err)
      toast.error('Failed to save attendance')
    } finally {
      setSaving(null)
    }
  }

  async function markAllPresent() {
    if (!confirm('Mark all employees as Present for the selected date?')) return
    let ok = 0
    for (const r of items) {
      try {
        const res = await fetch('/api/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employeeId: r.employeeId,
            attendanceDate: date,
            status: 'present',
            checkIn: '09:00',
            checkOut: '17:00',
          }),
        })
        if (res.ok) ok++
      } catch (err) {
        console.error(err)
      }
    }
    toast.success(`${ok} employees marked as Present`)
    fetchData()
  }

  const columns: Column<AttendanceRow>[] = [
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
      key: 'status',
      header: 'Status',
      cell: (row) => {
        const e = getRowEdit(row)
        return (
          <Select
            value={e.status}
            onValueChange={(v) => setEdits((prev) => ({ ...prev, [row.employeeId]: { ...getRowEdit(row), status: v } }))}
            disabled={!canEdit || saving === row.employeeId}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ATTENDANCE_STATUS.map((s) => (
                <SelectItem key={s} value={s}>{ATTENDANCE_STATUS_LABELS[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      },
    },
    {
      key: 'checkIn',
      header: 'Check-in',
      cell: (row) => (
        <Input
          type="time"
          className="w-[100px]"
          value={getRowEdit(row).checkIn}
          onChange={(e) => setEdits((prev) => ({ ...prev, [row.employeeId]: { ...getRowEdit(row), checkIn: e.target.value } }))}
          disabled={!canEdit || saving === row.employeeId}
        />
      ),
    },
    {
      key: 'checkOut',
      header: 'Check-out',
      cell: (row) => (
        <Input
          type="time"
          className="w-[100px]"
          value={getRowEdit(row).checkOut}
          onChange={(e) => setEdits((prev) => ({ ...prev, [row.employeeId]: { ...getRowEdit(row), checkOut: e.target.value } }))}
          disabled={!canEdit || saving === row.employeeId}
        />
      ),
    },
    {
      key: 'remarks',
      header: 'Remarks',
      cell: (row) => (
        <Input
          className="min-w-[140px]"
          value={getRowEdit(row).remarks}
          placeholder="Optional notes"
          onChange={(e) => setEdits((prev) => ({ ...prev, [row.employeeId]: { ...getRowEdit(row), remarks: e.target.value } }))}
          disabled={!canEdit || saving === row.employeeId}
        />
      ),
    },
    {
      key: 'save',
      header: () => <span className="text-right">Save</span>,
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (row) => {
        const isEdited = !!edits[row.employeeId]
        return (
          <Button
            size="sm"
            variant={isEdited ? 'default' : 'outline'}
            disabled={!canEdit || saving === row.employeeId || !isEdited}
            onClick={() => saveRow(row)}
          >
            <Save className="h-4 w-4" />
          </Button>
        )
      },
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Attendance</h2>
          <p className="text-sm text-muted-foreground">
            Daily attendance tracking for teaching and non-teaching staff.
          </p>
        </div>
        {canEdit && (
          <Button size="sm" onClick={markAllPresent} disabled={loading || items.length === 0}>
            <CheckCheck className="mr-2 h-4 w-4" /> Mark All Present
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4" /> Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="text-xs font-medium">Date</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium">District</label>
              <Select value={districtId || '_all'} onValueChange={(v) => setDistrictId(v === '_all' ? '' : v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="All Districts" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">All Districts</SelectItem>
                  {districts.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium">School</label>
              <Select value={schoolId || '_all'} onValueChange={(v) => setSchoolId(v === '_all' ? '' : v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="All Schools" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">All Schools</SelectItem>
                  {schools.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard title="Total" value={totalEmployees} accent="slate" />
        <StatCard title="Present" value={summary.present || 0} accent="green" />
        <StatCard title="Absent" value={summary.absent || 0} accent="red" />
        <StatCard title="Late" value={summary.late || 0} accent="gold" />
        <StatCard title="On Leave" value={summary.leave || 0} accent="gold" />
        <StatCard title="Holiday" value={summary.holiday || 0} accent="slate" />
      </div>

      <Card>
        <CardContent className="p-4">
          <DataTable
            columns={columns}
            data={items}
            loading={loading}
            rowKey={(r) => r.employeeId}
            emptyTitle="No employees for selected filters"
            emptyDescription="Try a different date or remove filters."
            maxHeight="max-h-[60vh]"
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default AttendanceModule
