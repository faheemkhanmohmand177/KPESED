'use client'

import * as React from 'react'
import { ChevronRight, GraduationCap, RefreshCw, Save } from 'lucide-react'
import { toast } from 'sonner'

type Row = {
  studentId: string
  studentName: string
  fatherName: string
  gender: string
  fatherCnic?: string
  className: string
  section: string
  admissionNo: string
  status: string
}

const CLASSES = ['Kachi', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
const SECTIONS = ['A', 'B', 'C', 'D']

type Draft = { toClass: string; classSection: string; newAdmissionNo: string; certificateIssue: string }

/**
 * Students MIS > Student Class Promotion (Manual) — live workflow:
 * New Session is fixed to the active session, choose Promoted Date, review the
 * promotion student list, set To Class / Class Section / New Admission # /
 * Certificate Issue per student and press "Promoted to New Class".
 * The Double Shift variant runs the same grid on shift D.
 */
export function StudentPromotionPage({ doubleShift, onNavigate }: { doubleShift?: boolean; onNavigate: (m: string) => void }) {
  const session = '2026-27'
  const shift = doubleShift ? 'D' : 'S'
  const [rows, setRows] = React.useState<Row[]>([])
  const [promotedRows, setPromotedRows] = React.useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [promotedDate, setPromotedDate] = React.useState(new Date().toISOString().slice(0, 10))
  const [forMigration, setForMigration] = React.useState('Y')
  const [draft, setDraft] = React.useState<Record<string, Draft>>({})

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const [studentsRes, promoRes] = await Promise.all([
        fetch(`/api/students?className=&status=ACTIVE&shift=${shift}`, { cache: 'no-store' }),
        fetch(`/api/students/promote?session=${encodeURIComponent(session)}&shift=${shift}`, { cache: 'no-store' }),
      ])
      const students = await studentsRes.json()
      const promos = await promoRes.json()
      if (studentsRes.ok) setRows((students.students || []) as Row[])
      if (promoRes.ok) setPromotedRows(promos.promotions || [])
    } finally {
      setLoading(false)
    }
  }, [shift])

  React.useEffect(() => { void load() }, [load])

  function setAllToClass(value: string) {
    const next: Record<string, Draft> = {}
    for (const row of rows) {
      next[row.studentId] = { ...(draft[row.studentId] || { classSection: '', newAdmissionNo: '', certificateIssue: 'NO' }), toClass: value }
    }
    setDraft(next)
  }

  function clearForm() {
    setDraft({})
    toast.info('Promotion form cleared.')
  }

  async function promote() {
    const records = rows
      .filter((row) => draft[row.studentId]?.toClass)
      .map((row) => ({ studentId: row.studentId, ...draft[row.studentId] }))
    if (!records.length) { toast.error('Set "To Class" for at least one student.'); return }
    setSaving(true)
    try {
      const r = await fetch('/api/students/promote', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ session, shift, promotedDate, records }),
      })
      const d = await r.json()
      if (!r.ok) { toast.error(d.error || 'Unable to promote students.'); return }
      toast.success(`${d.promoted} student(s) promoted to new class.`)
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
        <ChevronRight className="h-3 w-3" /><span className="font-medium text-[#1565c0]">{doubleShift ? 'Double Shift Student Promotion (Manual)' : 'Student Promotion (Manual)'}</span>
      </nav>
      <h1 className="mb-2 text-base font-semibold text-[#333] sm:text-lg">SCHOOL DETAIL</h1>

      <section className="apex-region" aria-label="Promotion">
        <div className="apex-region-header min-h-[34px]">
          <span className="flex items-center gap-2"><GraduationCap className="h-3.5 w-3.5 text-gray-500" />Promotion Student List</span>
          <span className="flex flex-wrap gap-1.5">
            <button type="button" className="apex-btn" onClick={clearForm}>Clear Form</button>
            <button type="button" className="apex-btn apex-btn--primary" onClick={() => void promote()} disabled={saving}>
              <Save className="h-3.5 w-3.5" /><span>{saving ? 'Promoting…' : 'Promoted to New Class'}</span>
            </button>
          </span>
        </div>
        <div className="apex-region-body">
          <div className="mb-3 flex flex-wrap items-end gap-3 rounded border border-[#e5e5e5] bg-[#fafafa] p-3">
            <div>
              <label className="apex-form-label" htmlFor="sp-session">New Session</label>
              <input id="sp-session" className="apex-input bg-gray-100 min-w-[110px]" readOnly value={session} />
            </div>
            <div>
              <span className="apex-form-label">For Migration</span>
              <div className="mt-1 flex gap-4 text-xs text-gray-700">
                <label className="flex items-center gap-1"><input type="radio" name="sp-migration" checked={forMigration === 'Y'} onChange={() => setForMigration('Y')} /> Y</label>
              </div>
            </div>
            <div>
              <label className="apex-form-label" htmlFor="sp-date">Promoted Date</label>
              <input id="sp-date" type="date" className="apex-input min-w-[140px]" value={promotedDate} onChange={(e) => setPromotedDate(e.target.value)} />
            </div>
            <div>
              <label className="apex-form-label" htmlFor="sp-all">Promote whole class to</label>
              <select id="sp-all" className="apex-select min-w-[120px]" value="" onChange={(e) => e.target.value && setAllToClass(e.target.value)}>
                <option value="">-- Select To Class --</option>
                {CLASSES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <button type="button" className="apex-btn" onClick={() => void load()}><RefreshCw className="h-3.5 w-3.5" />Refresh</button>
          </div>

          {loading ? (
            <div className="py-10 text-center text-sm text-gray-500">Loading…</div>
          ) : rows.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-500">Promotion Student List Not Found …!</div>
          ) : (
            <div className="overflow-auto rounded border border-[#e5e5e5]" style={{ maxHeight: '50vh' }}>
              <table className="apex-table w-full">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Father Name</th>
                    <th>Gender</th>
                    <th>Class</th>
                    <th>Section</th>
                    <th>Admission #</th>
                    <th>Status</th>
                    <th className="min-w-[110px]">To Class</th>
                    <th className="min-w-[100px]">Class Section</th>
                    <th className="min-w-[130px]">New Admission #</th>
                    <th className="min-w-[120px]">Certificate Issue</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const d = draft[row.studentId]
                    const set = (patch: Partial<Draft>) => setDraft((prev) => ({
                      ...prev,
                      [row.studentId]: { toClass: '', classSection: '', newAdmissionNo: '', certificateIssue: 'NO', ...(prev[row.studentId] || {}), ...patch },
                    }))
                    return (
                      <tr key={row.studentId}>
                        <td className="font-mono text-xs">{row.studentId}</td>
                        <td>{row.studentName}</td>
                        <td>{row.fatherName}</td>
                        <td>{row.gender}</td>
                        <td>{row.className}</td>
                        <td>{row.section}</td>
                        <td>{row.admissionNo}</td>
                        <td>{row.status}</td>
                        <td>
                          <select className="apex-select w-full min-w-[100px]" aria-label={`To class for ${row.studentName}`} value={d?.toClass || ''} onChange={(e) => set({ toClass: e.target.value })}>
                            <option value="">-- Select --</option>
                            {CLASSES.map((c) => <option key={c}>{c}</option>)}
                          </select>
                        </td>
                        <td>
                          <select className="apex-select w-full min-w-[90px]" aria-label={`Class section for ${row.studentName}`} value={d?.classSection || ''} onChange={(e) => set({ classSection: e.target.value })}>
                            <option value="">-- Select Class Section --</option>
                            {SECTIONS.map((s) => <option key={s}>{s}</option>)}
                          </select>
                        </td>
                        <td>
                          <input className="apex-input w-full min-w-[110px]" aria-label={`New admission number for ${row.studentName}`} value={d?.newAdmissionNo || ''} onChange={(e) => set({ newAdmissionNo: e.target.value })} />
                        </td>
                        <td>
                          <select className="apex-select w-full min-w-[100px]" aria-label={`Certificate issue for ${row.studentName}`} value={d?.certificateIssue || 'NO'} onChange={(e) => set({ certificateIssue: e.target.value })}>
                            <option value="">-- Select --</option>
                            <option>YES</option>
                            <option>NO</option>
                          </select>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {promotedRows.length > 0 && (
            <div className="mt-4">
              <h2 className="mb-2 text-sm font-semibold text-[#333]">Promoted This Session ({promotedRows.length})</h2>
              <div className="overflow-auto rounded border border-[#e5e5e5]" style={{ maxHeight: '24vh' }}>
                <table className="apex-table w-full">
                  <thead>
                    <tr><th>Student ID</th><th>Name</th><th>From Class</th><th>To Class</th><th>Section</th><th>Status</th><th>Promoted Date</th></tr>
                  </thead>
                  <tbody>
                    {promotedRows.map((p, i) => (
                      <tr key={i}>
                        <td className="font-mono text-xs">{String(p.studentId)}</td>
                        <td>{String(p.studentName ?? '')}</td>
                        <td>{String(p.fromClass ?? '')}</td>
                        <td>{String(p.toClass ?? '')}</td>
                        <td>{String(p.classSection ?? '')}</td>
                        <td>{String(p.status ?? '')}</td>
                        <td>{p.promotedDate ? new Date(String(p.promotedDate)).toLocaleDateString() : ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
