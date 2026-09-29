'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { Calendar, Search } from 'lucide-react'
import { ApexTable, type ApexTableColumn } from './ui/apex-table'
import { ATTENDANCE_COLUMNS, ATTENDANCE_STATUSES } from '@/lib/constants'
import { toStr } from '@/lib/date'

interface Designation {
  id: string
  title: string
  bps: number
  category: string | null
  level: string | null
}

interface EmployeeAttendanceRow {
  id: string
  empId: string
  name: string
  fatherOrHusbandName: string | null
  gender: string | null
  workingDesignation: string | null
  mobileSms: string | null
}

interface EmployeesResponse {
  employees: EmployeeAttendanceRow[]
}

interface AttendanceRecord {
  id: string
  status: string
  remarks: string | null
  employeeId: string
}

/**
 * Teacher Attendance page — matches 05-teacher-attendance.html
 *
 * - Date picker + Mark Attendance + Save buttons at top
 * - "Employee Attendance List" region with table:
 *   Name | Father Name | Gender | Designation | Contact # | Attendance (dropdown)
 * - Below the table: designation list grouped by BPS
 */
export function TeacherAttendancePage() {
  const [date, setDate] = React.useState('')
  const [employees, setEmployees] = React.useState<EmployeeAttendanceRow[]>([])
  const [attendanceMap, setAttendanceMap] = React.useState<Record<string, { status: string; remarks: string | null }>>({})
  const [designations, setDesignations] = React.useState<Designation[]>([])
  const [loading, setLoading] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  // Load employees (scoped to the current user's school) + designations
  React.useEffect(() => {
    fetch('/api/employees?pageSize=1000', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d: EmployeesResponse) => setEmployees(d?.employees ?? []))
      .catch(() => toast.error('Failed to load employees'))
    fetch('/api/designations', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setDesignations(d?.designations ?? []))
      .catch(() => toast.error('Failed to load designations'))
  }, [])

  // When date changes, load existing attendance records for that date
  React.useEffect(() => {
    if (!date) {
      setAttendanceMap({})
      return
    }
    setLoading(true)
    fetch(`/api/attendance?date=${date}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        const map: Record<string, { status: string; remarks: string | null }> = {}
        for (const rec of (d?.records ?? []) as AttendanceRecord[]) {
          map[rec.employeeId] = { status: rec.status, remarks: rec.remarks }
        }
        setAttendanceMap(map)
      })
      .catch(() => toast.error('Failed to load attendance'))
      .finally(() => setLoading(false))
  }, [date])

  function setStatus(employeeId: string, status: string) {
    setAttendanceMap((prev) => ({
      ...prev,
      [employeeId]: { status, remarks: prev[employeeId]?.remarks ?? null },
    }))
  }

  function markAllPresent() {
    if (!date) {
      toast.error('Please select a date first')
      return
    }
    const next: Record<string, { status: string; remarks: string | null }> = { ...attendanceMap }
    for (const emp of employees) {
      if (!next[emp.id]) {
        next[emp.id] = { status: 'present', remarks: null }
      }
    }
    setAttendanceMap(next)
    toast.success('Marked all present')
  }

  async function save() {
    if (!date) {
      toast.error('Please select a date')
      return
    }
    const records = Object.entries(attendanceMap).map(([employeeId, v]) => ({
      employeeId,
      status: v.status,
      remarks: v.remarks,
    }))
    if (records.length === 0) {
      toast.error('No attendance to save')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, records }),
      })
      const d = await res.json().catch(() => null)
      if (!res.ok) {
        toast.error(d?.error || 'Save failed')
      } else {
        toast.success(`Saved ${records.length} attendance records`)
      }
    } finally {
      setSaving(false)
    }
  }

  // Group designations by BPS for the reference list at the bottom
  const designationsByBps = React.useMemo(() => {
    const map: Record<number, Designation[]> = {}
    for (const d of designations) {
      if (!map[d.bps]) map[d.bps] = []
      map[d.bps].push(d)
    }
    return Object.keys(map)
      .map((b) => parseInt(b, 10))
      .sort((a, b) => a - b)
      .map((bps) => ({ bps, items: map[bps] }))
  }, [designations])

  // Table columns
  const columns: ApexTableColumn[] = ATTENDANCE_COLUMNS.map((label, i) => {
    if (label === 'Attendance') {
      return {
        key: 'attendance',
        label,
        headerAlign: 'center' as const,
        cellAlign: 'center' as const,
        render: (row: Record<string, unknown>) => {
          const empId = String(row.id)
          const cur = attendanceMap[empId]?.status || ''
          return (
            <select
              value={cur}
              onChange={(e) => setStatus(empId, e.target.value.toLowerCase())}
              className="apex-select"
              style={{ width: 'auto', minWidth: '120px' }}
              aria-label={`Attendance for ${toStr(row.name)}`}
            >
              <option value="">— Select —</option>
              {ATTENDANCE_STATUSES.map((s) => (
                <option key={s} value={s.toLowerCase()}>{s}</option>
              ))}
            </select>
          )
        },
      }
    }
    return {
      key: String(i),
      label,
      render: (row: Record<string, unknown>) => toStr(row[label]),
    }
  })

  const rows = employees.map((e) => ({
    Name: e.name,
    'Father Name': e.fatherOrHusbandName,
    Gender: e.gender,
    Designation: e.workingDesignation,
    'Contact #': e.mobileSms,
    Attendance: '',
    id: e.id,
  } as Record<string, unknown>))

  return (
    <div>
      <h1 className="mb-3 text-lg font-bold text-[#1565c0] sm:text-xl">Employee Attendance</h1>

      {/* Toolbar */}
      <div className="apex-region">
        <div className="apex-region-body flex flex-wrap items-end gap-3">
          <div>
            <label className="apex-form-label">Attendance Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="apex-input"
            />
          </div>
          <button type="button" className="apex-btn" title="Select Date">
            <Calendar className="h-3.5 w-3.5" /> Select Date
          </button>
          <button
            type="button"
            className="apex-btn"
            onClick={() => {
              setDate('')
              setAttendanceMap({})
            }}
          >
            Clear
          </button>
          <button
            type="button"
            className="apex-btn apex-btn--primary"
            disabled={!date}
            onClick={markAllPresent}
            title={date ? 'Mark all present' : 'Select a date first'}
          >
            Mark Attendance
          </button>
          <button
            type="button"
            className="apex-btn apex-btn--primary"
            disabled={!date || saving}
            onClick={save}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {/* Employee Attendance List */}
      <div className="apex-region">
        <div className="apex-region-header">
          <span>Employee Attendance List</span>
        </div>
        <div className="apex-region-body p-2">
          <div className="flex flex-wrap items-end gap-2 mb-2">
            <button type="button" className="apex-btn">
              Select columns to search
            </button>
            <div className="flex-1 min-w-[180px]">
              <label className="apex-form-label">Search:</label>
              <input type="text" placeholder="All Text Columns" className="apex-input" />
            </div>
            <button type="button" className="apex-btn apex-btn--primary">
              <Search className="h-3.5 w-3.5" /> Go
            </button>
            <button type="button" className="apex-btn">Actions</button>
          </div>

          {loading ? (
            <div className="text-center text-gray-500 italic py-8">Loading…</div>
          ) : (
            <ApexTable
              columns={columns}
              rows={rows}
              emptyText="Employee Attendance Data Not Found...!"
            />
          )}
        </div>
      </div>

      {/* Reference list of designations by BPS */}
      <div className="apex-region">
        <div className="apex-region-header">
          <span>Designations (BPS-1 to BPS-22)</span>
        </div>
        <div className="apex-region-body">
          {designationsByBps.length === 0 ? (
            <div className="text-center text-gray-500 italic py-4">No designations available.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              {designationsByBps.map(({ bps, items }) => (
                <div key={bps} className="border border-gray-200 rounded p-2">
                  <div className="font-semibold text-[#1565c0] mb-1">BPS-{bps}</div>
                  <ul className="space-y-0.5">
                    {items.map((d) => (
                      <li key={d.id} className="text-gray-700">
                        {d.title}
                        {d.level ? <span className="text-gray-400"> · {d.level}</span> : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
