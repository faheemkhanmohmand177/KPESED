'use client'

import * as React from 'react'
import { CalendarDays, ChevronRight, RefreshCw, Save, Users } from 'lucide-react'
import { toast } from 'sonner'

type Row = {
  studentId: string
  studentName: string
  fatherName: string
  className: string
  section: string
  session: string
  gender: string
  status: string
  remarks: string
}

type Summary = { total: number; present: number; absent: number; leave: number; sickLeave: number; unmarked: number }

const STATUS_OPTIONS = ['Absent', 'Leave', 'Present', 'Sick Leave']
const CLASSES = ['Kachi', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']

/**
 * Students MIS > Student Attendence — live workflow:
 * pick a date (attendance stays disabled until a date is chosen), optionally
 * filter by class, mark each student Absent/Leave/Present/Sick Leave, then
 * Save. Mark Attendance marks every listed student Present in one click.
 */
export function StudentAttendancePage({ onNavigate }: { onNavigate: (m: string) => void }) {
  const [date, setDate] = React.useState('')
  const [shift, setShift] = React.useState('S')
  const [className, setClassName] = React.useState('')
  const [rows, setRows] = React.useState<Row[]>([])
  const [summary, setSummary] = React.useState<Summary | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [draft, setDraft] = React.useState<Record<string, string>>({})

  const load = React.useCallback(async () => {
    if (!date) return
    setLoading(true)
    try {
      const url = `/api/students/attendance?date=${encodeURIComponent(date)}&shift=${encodeURIComponent(shift)}${className ? `&className=${encodeURIComponent(className)}` : ''}`
      const r = await fetch(url, { cache: 'no-store' })
      const d = await r.json()
      if (!r.ok) { toast.error(d.error || 'Unable to load students.'); setRows([]); return }
      setRows(d.rows || [])
      setSummary(d.summary || null)
      const next: Record<string, string> = {}
      for (const row of d.rows || []) next[row.studentId] = row.status || ''
      setDraft(next)
    } finally {
      setLoading(false)
    }
  }, [date, shift, className])

  function markAllPresent() {
    const next: Record<string, string> = {}
    for (const row of rows) next[row.studentId] = 'Present'
    setDraft(next)
    toast.info('All listed students marked Present — press Save to store.')
  }

  function clearAll() {
    setDraft({})
    toast.info('Attendance selections cleared.')
  }

  async function save() {
    if (!date) return
    const records = rows
      .filter((row) => draft[row.studentId])
      .map((row) => ({ studentId: row.studentId, status: draft[row.studentId] }))
    if (!records.length) { toast.error('Select a date and mark at least one student.'); return }
    setSaving(true)
    try {
      const r = await fetch('/api/students/attendance', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ date, shift, records }),
      })
      const d = await r.json()
      if (!r.ok) { toast.error(d.error || 'Unable to save attendance.'); return }
      toast.success(`Attendance saved for ${d.saved} student(s).`)
      await load()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="t-Body-contentInner">
      <nav aria-label="Breadcrumb" className="mb-2 flex flex-wrap items-center gap-1 text-xs text-gray-500">
        <button type="button" onClick={() => onNavigate('home')} className="hover:text-[#1565c0] hover:underline">Home</button>
        <ChevronRight className="h-3 w-3" /><span>Students MIS</span>
        <ChevronRight className="h-3 w-3" /><span className="font-medium text-[#1565c0]">Student Attendence</span>
      </nav>
      <h1 className="mb-2 text-base font-semibold text-[#333] sm:text-lg">Employee Attendance</h1>

      <section className="apex-region" aria-label="Student Attendance">
        <div className="apex-region-header min-h-[34px]">
          <span className="flex items-center gap-2"><CalendarDays className="h-3.5 w-3.5 text-gray-500" />Student Attendance</span>
          <span className="flex flex-wrap gap-1.5">
            <button type="button" className="apex-btn" onClick={clearAll}>Clear</button>
            <button type="button" className="apex-btn" onClick={markAllPresent} disabled={!date || loading}>Mark Attendance</button>
            <button type="button" className="apex-btn apex-btn--primary" onClick={() => void save()} disabled={!date || saving}>
              <Save className="h-3.5 w-3.5" /><span>{saving ? 'Saving…' : 'Save'}</span>
            </button>
          </span>
        </div>
        <div className="apex-region-body">
          <div className="mb-3 flex flex-wrap items-end gap-3 rounded border border-[#e5e5e5] bg-[#fafafa] p-3">
            <div>
              <label className="apex-form-label" htmlFor="sa-date">Attendance Date</label>
              <input id="sa-date" type="date" className="apex-input min-w-[140px]" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <label className="apex-form-label" htmlFor="sa-shift">Shift</label>
              <select id="sa-shift" className="apex-select" value={shift} onChange={(e) => setShift(e.target.value)}>
                <option value="S">Single (S)</option>
                <option value="D">Double Shift (D)</option>
              </select>
            </div>
            <div>
              <label className="apex-form-label" htmlFor="sa-class">Class</label>
              <select id="sa-class" className="apex-select min-w-[120px]" value={className} onChange={(e) => setClassName(e.target.value)}>
                <option value="">All Classes</option>
                {CLASSES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <button type="button" className="apex-btn" onClick={() => void load()} disabled={!date || loading}>
              <RefreshCw className="h-3.5 w-3.5" />Load Students
            </button>
            {summary && (
              <div className="ml-auto flex flex-wrap gap-2 text-xs text-gray-600">
                <span className="rounded bg-green-50 px-2 py-1">Present: {summary.present}</span>
                <span className="rounded bg-red-50 px-2 py-1">Absent: {summary.absent}</span>
                <span className="rounded bg-yellow-50 px-2 py-1">Leave: {summary.leave}</span>
                <span className="rounded bg-blue-50 px-2 py-1">Sick: {summary.sickLeave}</span>
                <span className="rounded bg-gray-100 px-2 py-1">Unmarked: {summary.unmarked}</span>
              </div>
            )}
          </div>

          {!date ? (
            <div className="py-10 text-center text-sm text-gray-500">Select an attendance date to load the student list.</div>
          ) : loading ? (
            <div className="py-10 text-center text-sm text-gray-500">Loading…</div>
          ) : rows.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-500">Student Attendance Data Not Found...!</div>
          ) : (
            <div className="overflow-auto rounded border border-[#e5e5e5]" style={{ maxHeight: '58vh' }}>
              <table className="apex-table w-full">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Father Name</th>
                    <th>Gender</th>
                    <th>Section</th>
                    <th>Class Roll #</th>
                    <th>Session</th>
                    <th className="min-w-[130px]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.studentId}>
                      <td className="font-mono text-xs">{row.studentId}</td>
                      <td>{row.studentName}</td>
                      <td>{row.fatherName}</td>
                      <td>{row.gender}</td>
                      <td>{row.section}</td>
                      <td>{row.className}</td>
                      <td>{row.session}</td>
                      <td>
                        <select
                          aria-label={`Attendance status for ${row.studentName}`}
                          className="apex-select w-full min-w-[110px]"
                          value={draft[row.studentId] || ''}
                          onChange={(e) => setDraft((prev) => ({ ...prev, [row.studentId]: e.target.value }))}
                        >
                          <option value="">-- Select Status --</option>
                          {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
            <Users className="h-3 w-3" />Live list from your school&apos;s student profiles. Statuses save per date and shift.
          </p>
        </div>
      </section>
    </div>
  )
}
