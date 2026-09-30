'use client'
/**
 * STUDENTS MIS — dedicated live-portal screens (School Admin role).
 *
 * Every screen below mirrors the live iemis.kpese.gov.pk pages captured
 * read-only on 2026-09-30: filter layouts, radio groups, button labels,
 * column headers, helper texts and empty-state messages are verbatim.
 *
 * Screens: Students Profiles (+ Student Enrolment modal, Delete Records),
 * Student Data Uploading (CSV), Enrolment Campaign Targets Form,
 * Daily Students Enrolment Form, Students Class Update.
 */
import * as React from 'react'
import { Download, FileUp, Filter, Plus, RefreshCw, Save, Search, Trash2, Upload, Users } from 'lucide-react'
import type { ReactNode } from 'react'
import { toast } from 'sonner'
import { ApexTable, type ApexTableColumn } from './ui/apex-table'

export interface SessionUser {
  schoolName?: string | null
  district?: string | null
  emisCode?: string | null
  fullName?: string
}

const DIRECTORATE = 'Directorate of Elementary & Secondary Education Khyber Pakhtunkhwa'
const SESSION_YEARS = ['2021-22', '2022-23', '2023-24', '2024-25', '2025-26', '2026-27']
const CLASSES = ['Kachi', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']

const PROFILE_COLUMNS = [
  ['emisCode','EMIS Code'],['studentId','Student ID'],['studentName','Student Name'],['fatherName','Father Name'],['gender','Gender'],['dateOfBirth','Date of Birth'],['bForm','B-Form'],['admissionNo','Admission No'],['admissionDate','Admission Date'],['className','Class'],['section','Section'],['shift','Shift'],['session','Session'],['status','Status'],['religion','Religion'],['motherTongue','Mother Tongue'],['disability','Disability'],['orphan','Orphan'],['minority','Minority'],['address','Address'],['village','Village'],['guardianName','Guardian Name'],['guardianCnic','Guardian CNIC'],['guardianPhone','Guardian Phone'],['district','District'],['tehsil','Tehsil'],['unionCouncil','Union Council'],['schoolName','School Name'],['previousSchool','Previous School'],['medium','Medium'],['transferStatus','Transfer Status'],['result','Result'],['remarks','Remarks'],['createdAt','Created'],['updatedAt','Updated'],
] as const
const EMPTY_PROFILE = Object.fromEntries(PROFILE_COLUMNS.filter(([key]) => key !== 'emisCode' && key !== 'createdAt' && key !== 'updatedAt').map(([key]) => [key, '']))
const field = (name: string, label: string, value: string, onChange: (value: string) => void, type = 'text', required = false) => <label key={name} className="text-xs text-gray-600">{label}{required ? ' *' : ''}<input className="apex-input mt-1" type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} /></label>

/** Live "Students List" report columns (School Admin capture, verbatim). */
const LIVE_STUDENT_COLUMNS: Array<[string, string]> = [
  ['studentId', 'Student ID'], ['studentName', 'Name'], ['fatherName', 'Father Name'], ['', 'Father CNIC'],
  ['gender', 'Gender'], ['schoolName', 'School Name'], ['', 'School Gender'], ['emisCode', 'EMIS Code'],
  ['className', 'Class Name'], ['section', 'Class Section'], ['session', 'Session Year'], ['status', 'Student Status'],
  ['', 'Class Status'], ['', 'Vaccinated'], ['disability', 'Disability'], ['religion', 'Religion'],
  ['', 'Nationality'], ['dateOfBirth', 'Date of Birth'], ['', 'Hafiz Quran'], ['orphan', 'Orphan'],
  ['admissionDate', 'Admission Date'], ['district', 'District'], ['tehsil', 'Tehsil'], ['', 'Class Enrolment Date'],
  ['admissionNo', 'Admission #'], ['', 'Double Shift'], ['guardianPhone', 'Emerency No'], ['bForm', 'Form-B'],
  ['', 'Model Type'], ['', 'School Level'], ['shift', 'Shift'], ['guardianCnic', 'Guardian Cnic'],
  ['guardianName', 'Guardian Name'], ['guardianPhone', 'Father Mobile No'], ['', 'Student Mobile No'],
]

/** Public saved reports visible on the live Students List (subset verbatim). */
const SAVED_REPORTS = ['1. Primary Report', '1. *** Current Enrollment 2024-25 ***', '3. 10th Students', '5. Age', '10. District/session/gender wise total Students', '12. Duplication', '13. GENDER MISSING', '22. Monthly updation Report', '24. NEW ADMIT', '26. Orphan Students', '34. Profile Wise Students', '43. Session wise report', '48. Sixth A GMS Chambai Kohat']

type Profile = Record<string, unknown> & { id: string }
type Props = { module: string; title: string; onNavigate: (m: string) => void; user?: SessionUser | null }

export function StudentsMisPage({ module, title, onNavigate, user }: Props) {
  if (module === 'student-data-uploading') return <CsvUploadPage onNavigate={onNavigate} />
  if (module === 'enrolment-campaign-target') return <TargetsPage onNavigate={onNavigate} user={user} />
  if (module === 'daily-students-enrolment') return <DailyEnrolmentPage onNavigate={onNavigate} user={user} />
  if (module === 'students-class-update') return <ClassUpdatePage onNavigate={onNavigate} />
  return <StudentsProfilesPage title={title} onNavigate={onNavigate} />
}

function Shell({ title, onNavigate, children }: { title: string; onNavigate: (m: string) => void; children: ReactNode }) {
  return (
    <div>
      <nav aria-label={title} className="mb-1 flex items-center justify-between"><h1 className="text-lg font-semibold text-gray-800">{title}</h1></nav>
      {children}
      <div className="mt-2 text-xs text-gray-500">Developed By : EMIS E&SE Department</div>
    </div>
  )
}

/* ============ Students Profiles (live students-search) ============ */

function StudentsProfilesPage({ title, onNavigate }: Omit<Props, 'module'>) {
  const [rows, setRows] = React.useState<Profile[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState('')
  const [applied, setApplied] = React.useState('')
  const [status, setStatus] = React.useState('ACTIVE')
  const [gender, setGender] = React.useState('')
  const [className, setClassName] = React.useState('')
  const [session, setSession] = React.useState('')
  const [studentIds, setStudentIds] = React.useState('')
  const [report, setReport] = React.useState('1. Primary Report')
  const [showForm, setShowForm] = React.useState(false)
  const [editing, setEditing] = React.useState<Profile | null>(null)
  const [selected, setSelected] = React.useState<Record<string, boolean>>({})

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const d = await (await fetch(`/api/students?search=${encodeURIComponent(applied)}`, { cache: 'no-store' })).json()
      setRows(d.students || [])
    } catch { setRows([]) }
    finally { setLoading(false) }
  }, [applied])
  React.useEffect(() => { void load() }, [load])

  const visible = rows.filter((r) => {
    if (status && String(r.status || 'ACTIVE').toUpperCase() !== status) return false
    if (gender && String(r.gender || '').toUpperCase() !== gender) return false
    if (className && String(r.className || '') !== className) return false
    if (session && String(r.session || '') !== session) return false
    if (studentIds && !studentIds.split(',').map((s) => s.trim()).filter(Boolean).some((id) => String(r.studentId || '') === id)) return false
    return true
  })

  const download = () => { const csv = [LIVE_STUDENT_COLUMNS.map(([, l]) => l).join(','), ...visible.map((r) => LIVE_STUDENT_COLUMNS.map(([k]) => JSON.stringify(k ? String(r[k] ?? '') : '')).join(','))].join('\n'); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'students-search.csv'; a.click() }

  async function deleteRecords() {
    const ids = Object.entries(selected).filter(([, v]) => v).map(([k]) => k)
    if (ids.length === 0) { toast.error('Select at least one student row to delete.'); return }
    if (!window.confirm(`Delete ${ids.length} selected student record(s)? This cannot be undone.`)) return
    for (const id of ids) await fetch(`/api/students/${id}`, { method: 'DELETE' })
    setSelected({})
    toast.success(`${ids.length} record(s) deleted.`)
    void load()
  }

  const columns: ApexTableColumn[] = [
    { key: '_select', label: '', render: (row) => <input type="checkbox" aria-label="Select row" checked={!!selected[(row as Profile).id]} onChange={(e) => setSelected((s) => ({ ...s, [(row as Profile).id]: e.target.checked }))} /> },
    ...LIVE_STUDENT_COLUMNS.map(([key, label]) => ({ key: key || `x_${label}`, label, render: (row) => (key ? String(row[key] ?? '') : '') })),
    { key: '_actions', label: ' ', render: (row) => <span className="flex gap-2"><button className="text-[#1565c0] hover:underline" onClick={() => { setEditing(row as Profile); setShowForm(true) }}>Edit</button></span> },
  ]

  return (
    <Shell title={title} onNavigate={onNavigate}>
      {/* Live HIDE_VALUE filter region */}
      <section className="apex-region mb-3">
        <div className="apex-region-header"><span className="flex items-center gap-2"><Filter className="h-3.5 w-3.5 text-gray-500" />Students Profiles</span></div>
        <div className="apex-region-body grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <span className="apex-form-label">Student Status</span>
            <div className="mt-1 flex gap-4">
              {['ACTIVE', 'STRUCK-OFF'].map((s) => (
                <label key={s} className="flex items-center gap-1.5 text-xs text-gray-700">
                  <input type="radio" name="student-status" checked={status === s} onChange={() => setStatus(s)} /> {s}
                </label>
              ))}
            </div>
          </div>
          <label className="text-xs text-gray-600">School Gender
            <select className="apex-select mt-1 w-full" value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="">-- Select Gender --</option><option value="MALE">MALE</option><option value="FEMALE">FEMALE</option>
            </select>
          </label>
          <label className="text-xs text-gray-600">Session Year
            <select className="apex-select mt-1 w-full" value={session} onChange={(e) => setSession(e.target.value)}>
              <option value="">-- Select Session Year --</option>{SESSION_YEARS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label className="text-xs text-gray-600">Class Name
            <select className="apex-select mt-1 w-full" value={className} onChange={(e) => setClassName(e.target.value)}>
              <option value="">-- Select Class --</option>{CLASSES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="text-xs text-gray-600">Students ID`s
            <input className="apex-input mt-1" value={studentIds} onChange={(e) => setStudentIds(e.target.value)} placeholder="e.g. 66013-101, 66013-102" />
          </label>
          <label className="text-xs text-gray-600">Reports
            <select className="apex-select mt-1 w-full" value={report} onChange={(e) => setReport(e.target.value)}>
              <optgroup label="Default"><option>1. Primary Report</option></optgroup>
              <optgroup label="Public">{SAVED_REPORTS.slice(1).map((s) => <option key={s}>{s}</option>)}</optgroup>
            </select>
          </label>
        </div>
      </section>

      <section className="apex-region">
        <div className="apex-region-header">
          <span className="flex items-center gap-2"><Users className="h-3.5 w-3.5" />Students List</span>
          <span className="flex gap-1.5">
            <button className="apex-btn" onClick={download}><Download className="h-3.5 w-3.5" /><span className="hidden sm:inline">Actions</span></button>
            <button className="apex-btn" onClick={deleteRecords}><Trash2 className="h-3.5 w-3.5" /><span className="hidden sm:inline">Delete Records</span></button>
            <button className="apex-btn apex-btn--primary" onClick={() => { setEditing(null); setShowForm(true) }}><Plus className="h-3.5 w-3.5" /><span className="hidden sm:inline">Student Enrolment</span></button>
          </span>
        </div>
        <div className="apex-region-body">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <input className="apex-input min-w-[200px] flex-1" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search Report" onKeyDown={(e) => { if (e.key === 'Enter') setApplied(search) }} />
            <button className="apex-btn apex-btn--join-l" onClick={() => setApplied(search)}><Search className="h-3.5 w-3.5" />Search</button>
            <button className="apex-btn" onClick={() => void load()}><RefreshCw className="h-3.5 w-3.5" />Refresh</button>
          </div>
          {loading ? <div className="py-10 text-center text-sm text-gray-500">Loading…</div> : (
            <>
              <ApexTable columns={columns} rows={visible} emptyText="No data found." maxHeight="56vh" />
              <div className="mt-2 flex items-center justify-between text-xs text-gray-600"><span>Total Students: {visible.length}</span><span>Rows {visible.length || 0}</span></div>
            </>
          )}
        </div>
      </section>
      {showForm && <StudentEnrolmentForm student={editing} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); void load() }} />}
    </Shell>
  )
}

/* ============ Student Enrolment modal (live 37-field form) ============ */

function StudentEnrolmentForm({ student, onClose, onSaved }: { student: Profile | null; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = React.useState<Record<string, string>>(() => ({
    'Student ID': String(student?.studentId ?? ''), 'Vaccinated': '', 'Vaccinated Date': '',
    'Hafiz Quran': 'NO', 'Orphan': String(student?.orphan ?? 'NO'),
    'Student Name': String(student?.studentName ?? ''), 'Form-B/CNIC #': String(student?.bForm ?? ''),
    'Student Mobile #': '', 'Email (Student)': '', 'Gender': String(student?.gender ?? ''),
    'Date of Birth': String(student?.dateOfBirth ?? ''), 'Place Of Birth': '', 'Marital Status': '',
    'Father Name': String(student?.fatherName ?? ''), 'Father CNIC #': '', 'Mobile # (Father/Guardian)': String(student?.guardianPhone ?? ''),
    'Email (Father/Guardian)': '', 'Mother Name': '', 'Mother CNIC #': '', 'Emergency No': '',
    'Blood Group': '', 'Guardian Name': String(student?.guardianName ?? ''), 'Guardian CNIC #': String(student?.guardianCnic ?? ''),
    'Relationship With Student': '', 'Father/Guardian Occupation': '', 'Disability': String(student?.disability ?? ''),
    'Religion': String(student?.religion ?? ''), 'Mother Tongue': String(student?.motherTongue ?? ''),
    'Admission Date': String(student?.admissionDate ?? ''), 'Enrolement Type': 'From Fresh',
    'Nationality': 'PAKISTAN', 'Domicile/District': '', 'POR #': '', 'Passport No (Foreigner)': '',
    'Current Address': String(student?.address ?? ''), 'Permanent Address': '',
    'Session Year': String(student?.session ?? ''), 'Double Shift': String(student?.shift ?? ''),
    'Class Name': String(student?.className ?? ''), 'Class Section': String(student?.section ?? ''),
    'Subject Group': '', 'Class Roll #': '', 'Admission #': String(student?.admissionNo ?? ''),
  }))
  const [busy, setBusy] = React.useState(false)
  const set = (k: string, v: string) => setF((x) => ({ ...x, [k]: v }))
  const inp = (k: string, label: string, required = false, type = 'text') => (
    <label className="text-xs text-gray-600">{label}{required ? ' *' : ''}<input className="apex-input mt-1" type={type} value={f[k] || ''} onChange={(e) => set(k, e.target.value)} required={required} /></label>
  )
  const radios = (k: string, label: string, options: string[], required = false) => (
    <div><span className="apex-form-label">{label}{required ? ' *' : ''}</span>
      <div className="mt-1 flex gap-4">{options.map((o) => <label key={o} className="flex items-center gap-1.5 text-xs text-gray-700"><input type="radio" name={k} checked={(f[k] || '') === o} onChange={() => set(k, o)} /> {o}</label>)}</div>
    </div>
  )
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!f['Student Name'].trim() || !f['Father Name'].trim() || !f['Emergency No'].trim()) { toast.error('Student Name, Father Name and Emergency No are required.'); return }
    setBusy(true)
    const profile: Record<string, string> = {
      studentId: f['Student ID'], studentName: f['Student Name'], fatherName: f['Father Name'],
      gender: f['Gender'], dateOfBirth: f['Date of Birth'], bForm: f['Form-B/CNIC #'],
      admissionNo: f['Admission #'], admissionDate: f['Admission Date'], className: f['Class Name'],
      section: f['Class Section'], shift: f['Double Shift'], session: f['Session Year'],
      status: 'ACTIVE', religion: f['Religion'], motherTongue: f['Mother Tongue'], disability: f['Disability'],
      orphan: f['Orphan'], address: f['Current Address'], guardianName: f['Guardian Name'],
      guardianCnic: f['Guardian CNIC #'], guardianPhone: f['Mobile # (Father/Guardian)'] || f['Emergency No'],
    }
    const r = await fetch(student ? `/api/students/${student.id}` : '/api/students', { method: student ? 'PATCH' : 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(profile) })
    const d = await r.json()
    setBusy(false)
    if (!r.ok) { toast.error(d.error || 'Unable to save student.'); return }
    toast.success(student ? 'Student updated.' : 'Student Enrolled.')
    onSaved()
  }
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/40 p-4">
      <form onSubmit={submit} className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded border border-gray-300 bg-white p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Student Enrolment</h2><button type="button" className="text-xl" onClick={onClose}>×</button></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {inp('Student ID', 'Student ID')}
          {radios('Vaccinated', 'Vaccinated', ['YES', 'NO'])}
          {inp('Vaccinated Date', 'Vaccinated Date', false, 'date')}
          {radios('Hafiz Quran', 'Hafiz Quran', ['YES', 'NO'])}
          {radios('Orphan', 'Orphan', ['YES', 'NO'])}
          {inp('Student Name', 'Student Name', true)}
          {inp('Form-B/CNIC #', 'Form-B/CNIC #')}
          {inp('Student Mobile #', 'Student Mobile #')}
          {inp('Email (Student)', 'Email (Student)')}
          <div><span className="apex-form-label">Gender</span><div className="mt-1 flex flex-wrap gap-3">{['MALE', 'FEMALE', 'TRANSGENDER'].map((g) => <label key={g} className="flex items-center gap-1.5 text-xs text-gray-700"><input type="radio" name="gender" checked={(f['Gender'] || '') === g} onChange={() => set('Gender', g)} /> {g}</label>)}</div></div>
          {inp('Date of Birth', 'Date of Birth', false, 'date')}
          {inp('Place Of Birth', 'Place Of Birth')}
          {inp('Marital Status', 'Marital Status')}
          {inp('Father Name', 'Father Name', true)}
          {inp('Father CNIC #', 'Father CNIC #')}
          {inp('Mobile # (Father/Guardian)', 'Mobile # (Father/Guardian)')}
          {inp('Email (Father/Guardian)', 'Email (Father/Guardian)')}
          {inp('Mother Name', 'Mother Name')}
          {inp('Mother CNIC #', 'Mother CNIC #')}
          {inp('Emergency No', 'Emergency No', true)}
          {inp('Blood Group', 'Blood Group')}
          {inp('Guardian Name', 'Guardian Name')}
          {inp('Guardian CNIC #', 'Guardian CNIC #')}
          {inp('Relationship With Student', 'Relationship With Student')}
          {inp('Father/Guardian Occupation', 'Father/Guardian Occupation')}
          {inp('Disability', 'Disability')}
          {inp('Religion', 'Religion')}
          {inp('Mother Tongue', 'Mother Tongue')}
          {inp('Admission Date', 'Admission Date', false, 'date')}
          <label className="text-xs text-gray-600">Enrolement Type
            <select className="apex-select mt-1 w-full" value={f['Enrolement Type']} onChange={(e) => set('Enrolement Type', e.target.value)}>
              {['From Fresh', 'From Public Institute', 'From Private Institute', 'From Dropout'].map((o) => <option key={o}>{o}</option>)}
            </select>
          </label>
          {inp('Nationality', 'Nationality')}
          {inp('Domicile/District', 'Domicile/District')}
          {inp('POR #', 'POR #')}
          {inp('Passport No (Foreigner)', 'Passport No (Foreigner)')}
          {inp('Current Address', 'Current Address')}
          {inp('Permanent Address', 'Permanent Address')}
        </div>
        {/* Live "Admission Class" region */}
        <section className="mt-4 rounded border border-gray-200">
          <div className="border-b border-gray-200 bg-[#f5f5f5] px-3 py-2 text-sm font-semibold">Admission Class</div>
          <div className="grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="text-xs text-gray-600">District<div className="mt-1 rounded border border-[#e5e5e5] bg-[#fafafa] px-2 py-1.5 text-sm">{String(student?.district || '—')}</div></label>
            <label className="text-xs text-gray-600">Gender<div className="mt-1 rounded border border-[#e5e5e5] bg-[#fafafa] px-2 py-1.5 text-sm">{String(f['Gender'] || '—')}</div></label>
            <label className="text-xs text-gray-600">School Name<div className="mt-1 rounded border border-[#e5e5e5] bg-[#fafafa] px-2 py-1.5 text-sm">{String(student?.schoolName || '—')}</div></label>
            {inp('Session Year', 'Session Year')}
            {inp('Double Shift', 'Double Shift')}
            {inp('Class Name', 'Class Name')}
            {inp('Class Section', 'Class Section')}
            {inp('Subject Group', 'Subject Group')}
            {inp('Class Roll #', 'Class Roll #')}
            {inp('Admission #', 'Admission #')}
          </div>
        </section>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" className="apex-btn" onClick={onClose}>Cancel</button>
          <button className="apex-btn apex-btn--primary" disabled={busy}><Save className="h-3.5 w-3.5" />{busy ? 'Saving…' : 'Student Enrolled'}</button>
        </div>
      </form>
    </div>
  )
}

/* ============ Enrolment Campaign Targets Form (live IG) ============ */

const TARGET_COLUMNS = ['District', 'Dropout/OOSC Target', 'EMIS Code', 'Fresh Enrollment Target', 'Gender', 'School Level', 'School Name', 'Session Year', 'Student Gender', 'Tehsil', 'Total Target']

function TargetsPage({ onNavigate, user }: { onNavigate: (m: string) => void; user?: SessionUser | null }) {
  const [rows, setRows] = React.useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = React.useState(true)
  const [form, setForm] = React.useState({ 'Session Year': '2026-27', 'Start Date': '19-JAN-2026', 'End Date': '31-DEC-2026', 'Directorate': DIRECTORATE, 'District': '', 'Gender': '', 'School Name': '', 'Student Gender': '', 'Fresh Enrollment Target': '', 'Dropout/ OOSC Target': '' })
  const [editing, setEditing] = React.useState(false)
  const set = (k: string, v: string) => setForm((x) => ({ ...x, [k]: v }))

  const load = React.useCallback(async () => {
    setLoading(true)
    try { const d = await (await fetch('/api/portal-records?module=target-student-enrolment', { cache: 'no-store' })).json(); setRows(d.records || []) }
    catch { setRows([]) }
    finally { setLoading(false) }
  }, [])
  React.useEffect(() => { void load() }, [load])

  React.useEffect(() => {
    // Prefill the read-only School Details once the session user is known.
    setForm((x) => ({ ...x, 'District': x.District || user?.district || 'MOHMAND', 'School Name': x['School Name'] || user?.schoolName || '' }))
  }, [user])

  async function save() {
    if (!form['Student Gender']) { toast.error('Student Gender is required.'); return }
    if (form['Fresh Enrollment Target'] === '' || form['Dropout/ OOSC Target'] === '') { toast.error('Fresh Enrollment Target and Dropout/ OOSC Target are required.'); return }
    const district = form['District'] || user?.district || ''
    const emis = user?.emisCode || ''
    const total = Number(form['Fresh Enrollment Target'] || 0) + Number(form['Dropout/ OOSC Target'] || 0)
    const r = await fetch('/api/portal-records', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ moduleKey: 'target-student-enrolment', data: { 'District': district, 'Dropout/OOSC Target': form['Dropout/ OOSC Target'], 'EMIS Code': emis, 'Fresh Enrollment Target': form['Fresh Enrollment Target'], 'Gender': form['Gender'], 'School Level': '', 'School Name': form['School Name'], 'Session Year': form['Session Year'], 'Student Gender': form['Student Gender'], 'Tehsil': '', 'Total Target': String(total) } }) })
    if (!r.ok) { toast.error('Unable to save this target.'); return }
    toast.success('Record saved.')
    setEditing(false)
    void load()
  }

  const columns: ApexTableColumn[] = TARGET_COLUMNS.map((c) => ({ key: c, label: c, render: (row) => String((row as Record<string, unknown>).data?.[c] ?? '') }))
  columns.unshift({ key: '_rowaction', label: ' ', render: (row) => <button className="text-[#1565c0] hover:underline" onClick={async () => { await fetch(`/api/portal-records/${(row as Profile).id}`, { method: 'DELETE' }); void load() }}>Delete</button> })

  return (
    <Shell title="Enrolment Campaign Target" onNavigate={onNavigate}>
      <section className="apex-region mb-3">
        <div className="apex-region-header"><span className="flex items-center gap-2"><Filter className="h-3.5 w-3.5 text-gray-500" />Enrolment Campaign Targets Form</span></div>
        <div className="apex-region-body">
          <div className="mb-3 rounded border border-gray-200">
            <div className="border-b border-gray-200 bg-[#f5f5f5] px-3 py-2 text-sm font-semibold">Session Details</div>
            <div className="grid gap-3 p-3 sm:grid-cols-3">
              <label className="text-xs text-gray-600">Session Year<input className="apex-input mt-1" value={form['Session Year']} onChange={(e) => set('Session Year', e.target.value)} /></label>
              <label className="text-xs text-gray-600">Start Date<input className="apex-input mt-1" value={form['Start Date']} onChange={(e) => set('Start Date', e.target.value)} /></label>
              <label className="text-xs text-gray-600">End Date<input className="apex-input mt-1" value={form['End Date']} onChange={(e) => set('End Date', e.target.value)} /></label>
            </div>
          </div>
          <div className="mb-3 rounded border border-gray-200">
            <div className="border-b border-gray-200 bg-[#f5f5f5] px-3 py-2 text-sm font-semibold">School Details</div>
            <div className="grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="text-xs text-gray-600">Directorate<select className="apex-select mt-1 w-full" value={form['Directorate']} onChange={(e) => set('Directorate', e.target.value)}><option>{DIRECTORATE}</option></select></label>
              <label className="text-xs text-gray-600">District<input className="apex-input mt-1 bg-[#fafafa]" readOnly value={form['District']} /></label>
              <label className="text-xs text-gray-600">Gender<select className="apex-select mt-1 w-full" value={form['Gender']} onChange={(e) => set('Gender', e.target.value)}><option value="">-- Select Gender --</option><option>MALE</option><option>FEMALE</option></select></label>
              <label className="text-xs text-gray-600">School Name<input className="apex-input mt-1 bg-[#fafafa]" readOnly value={form['School Name']} /></label>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div><span className="apex-form-label">Student Gender *</span><div className="mt-1 flex gap-4">{['Female', 'Male'].map((g) => <label key={g} className="flex items-center gap-1.5 text-xs text-gray-700"><input type="radio" name="student-gender" checked={form['Student Gender'] === g} onChange={() => set('Student Gender', g)} /> {g}</label>)}</div></div>
            <label className="text-xs text-gray-600">Fresh Enrollment Target *<input className="apex-input mt-1" type="number" min="0" value={form['Fresh Enrollment Target']} onChange={(e) => set('Fresh Enrollment Target', e.target.value)} /></label>
            <label className="text-xs text-gray-600">Dropout/ OOSC Target *<input className="apex-input mt-1" type="number" min="0" value={form['Dropout/ OOSC Target']} onChange={(e) => set('Dropout/ OOSC Target', e.target.value)} /></label>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button type="button" className="apex-btn" onClick={() => setForm((x) => ({ ...x, 'Student Gender': '', 'Fresh Enrollment Target': '', 'Dropout/ OOSC Target': '' }))}>Cancel</button>
            <button type="button" className="apex-btn apex-btn--primary" onClick={save}><Save className="h-3.5 w-3.5" />Save Record</button>
          </div>
        </div>
      </section>
      <section className="apex-region">
        <div className="apex-region-header"><span className="flex items-center gap-2"><Users className="h-3.5 w-3.5" />Enrolment Campaign Targets</span>
          <span className="flex gap-1.5">
            <button className="apex-btn" onClick={() => setEditing((v) => !v)}>Edit Filter</button>
            <button className="apex-btn">Remove Filter</button>
            <button className="apex-btn">Report Settings</button>
            <button className="apex-btn" onClick={downloadTargetCsv}><Download className="h-3.5 w-3.5" />Download</button>
          </span>
        </div>
        <div className="apex-region-body">
          {loading ? <div className="py-10 text-center text-sm text-gray-500">Loading…</div> : <ApexTable columns={columns} rows={rows} emptyText="No data found." maxHeight="56vh" />}
        </div>
      </section>
    </Shell>
  )
  function downloadTargetCsv() { /* CSV via page-level helper */ const csv = [TARGET_COLUMNS.join(','), ...rows.map((r) => TARGET_COLUMNS.map((c) => JSON.stringify(String((r as Record<string, unknown>).data?.[c] ?? ''))).join(','))].join('\n'); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'enrolment-campaign-target.csv'; a.click() }
}

/* ============ Daily Students Enrolment Form (live IG) ============ */

const DAILY_COLUMNS = ['District', 'Dropout Enrolment', 'EMIS Code', 'Enroll Date', 'Fresh Enrolment', 'Gender', 'Level', 'Private Enrolment', 'Public Enrolment', 'School Name', 'Session Year', 'Student Gender', 'Tehsil', 'Total Enrollment']

function DailyEnrolmentPage({ onNavigate, user }: { onNavigate: (m: string) => void; user?: SessionUser | null }) {
  const [rows, setRows] = React.useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = React.useState(true)
  const [form, setForm] = React.useState({ 'Session Year': '2026-27', 'Start Date': '19-JAN-2026', 'End Date': '31-DEC-2026', 'Directorate': DIRECTORATE, 'District': '', 'Gender': '', 'School Name': '', 'Enrol Date': new Date().toISOString().slice(0, 10), 'Student Gender': '', 'Fresh Enrollment': '', 'Dropout/ Out of School (OOSC) Enrollment': '', 'Private Enrollment': '', 'Public Enrollment': '' })
  const set = (k: string, v: string) => setForm((x) => ({ ...x, [k]: v }))

  const load = React.useCallback(async () => {
    setLoading(true)
    try { const d = await (await fetch('/api/portal-records?module=daily-students-enrolment', { cache: 'no-store' })).json(); setRows(d.records || []) }
    catch { setRows([]) }
    finally { setLoading(false) }
  }, [])
  React.useEffect(() => { void load() }, [load])
  React.useEffect(() => { setForm((x) => ({ ...x, 'District': x.District || user?.district || '', 'School Name': x['School Name'] || user?.schoolName || '' })) }, [user])

  async function save() {
    if (!form['Enrol Date']) { toast.error('Enrol Date is required.'); return }
    if (!form['Student Gender']) { toast.error('Student Gender is required.'); return }
    const district = form['District'] || user?.district || ''
    const total = Number(form['Fresh Enrollment'] || 0) + Number(form['Dropout/ Out of School (OOSC) Enrollment'] || 0) + Number(form['Private Enrollment'] || 0) + Number(form['Public Enrollment'] || 0)
    const r = await fetch('/api/portal-records', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ moduleKey: 'daily-students-enrolment', data: { 'District': district, 'Dropout Enrolment': form['Dropout/ Out of School (OOSC) Enrollment'], 'EMIS Code': user?.emisCode || '', 'Enroll Date': form['Enrol Date'], 'Fresh Enrolment': form['Fresh Enrollment'], 'Gender': form['Gender'], 'Level': '', 'Private Enrolment': form['Private Enrollment'], 'Public Enrolment': form['Public Enrollment'], 'School Name': form['School Name'], 'Session Year': form['Session Year'], 'Student Gender': form['Student Gender'], 'Tehsil': '', 'Total Enrollment': String(total) } }) })
    if (!r.ok) { toast.error('Unable to save this enrolment record.'); return }
    toast.success('Record saved.')
    void load()
  }

  const columns: ApexTableColumn[] = DAILY_COLUMNS.map((c) => ({ key: c, label: c, render: (row) => String((row as Record<string, unknown>).data?.[c] ?? '') }))

  return (
    <Shell title="Daily Students Enrolment" onNavigate={onNavigate}>
      <section className="apex-region mb-3">
        <div className="apex-region-header"><span className="flex items-center gap-2"><Filter className="h-3.5 w-3.5 text-gray-500" />Daily Students Enrolment Form</span></div>
        <div className="apex-region-body">
          <div className="mb-3 rounded border border-gray-200">
            <div className="border-b border-gray-200 bg-[#f5f5f5] px-3 py-2 text-sm font-semibold">Session Details</div>
            <div className="grid gap-3 p-3 sm:grid-cols-3">
              <label className="text-xs text-gray-600">Session Year<input className="apex-input mt-1" value={form['Session Year']} onChange={(e) => set('Session Year', e.target.value)} /></label>
              <label className="text-xs text-gray-600">Start Date<input className="apex-input mt-1" value={form['Start Date']} onChange={(e) => set('Start Date', e.target.value)} /></label>
              <label className="text-xs text-gray-600">End Date<input className="apex-input mt-1" value={form['End Date']} onChange={(e) => set('End Date', e.target.value)} /></label>
            </div>
          </div>
          <div className="mb-3 rounded border border-gray-200">
            <div className="border-b border-gray-200 bg-[#f5f5f5] px-3 py-2 text-sm font-semibold">School Details</div>
            <div className="grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="text-xs text-gray-600">Directorate<select className="apex-select mt-1 w-full" value={form['Directorate']} onChange={(e) => set('Directorate', e.target.value)}><option>{DIRECTORATE}</option></select></label>
              <label className="text-xs text-gray-600">District<input className="apex-input mt-1 bg-[#fafafa]" readOnly value={form['District']} /></label>
              <label className="text-xs text-gray-600">Gender<select className="apex-select mt-1 w-full" value={form['Gender']} onChange={(e) => set('Gender', e.target.value)}><option value="">-- Select Gender --</option><option>MALE</option><option>FEMALE</option></select></label>
              <label className="text-xs text-gray-600">School Name<input className="apex-input mt-1 bg-[#fafafa]" readOnly value={form['School Name']} /></label>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="text-xs text-gray-600">Enrol Date *<input className="apex-input mt-1" type="date" value={form['Enrol Date']} onChange={(e) => set('Enrol Date', e.target.value)} /></label>
            <div><span className="apex-form-label">Student Gender *</span><div className="mt-1 flex gap-4">{['Female', 'Male'].map((g) => <label key={g} className="flex items-center gap-1.5 text-xs text-gray-700"><input type="radio" name="daily-student-gender" checked={form['Student Gender'] === g} onChange={() => set('Student Gender', g)} /> {g}</label>)}</div></div>
            <label className="text-xs text-gray-600">Fresh Enrollment<input className="apex-input mt-1" type="number" min="0" value={form['Fresh Enrollment']} onChange={(e) => set('Fresh Enrollment', e.target.value)} /></label>
            <label className="text-xs text-gray-600">Dropout/ Out of School (OOSC) Enrollment<input className="apex-input mt-1" type="number" min="0" value={form['Dropout/ Out of School (OOSC) Enrollment']} onChange={(e) => set('Dropout/ Out of School (OOSC) Enrollment', e.target.value)} /><p className="mt-1 text-xs text-gray-500">Dropout or out-of-school students rejoining school.</p></label>
            <label className="text-xs text-gray-600">Private Enrollment<input className="apex-input mt-1" type="number" min="0" value={form['Private Enrollment']} onChange={(e) => set('Private Enrollment', e.target.value)} /></label>
            <label className="text-xs text-gray-600">Public Enrollment<input className="apex-input mt-1" type="number" min="0" value={form['Public Enrollment']} onChange={(e) => set('Public Enrollment', e.target.value)} /></label>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button type="button" className="apex-btn" onClick={() => setForm((x) => ({ ...x, 'Student Gender': '', 'Fresh Enrollment': '', 'Dropout/ Out of School (OOSC) Enrollment': '', 'Private Enrollment': '', 'Public Enrollment': '' }))}>Cancel</button>
            <button type="button" className="apex-btn apex-btn--primary" onClick={save}><Save className="h-3.5 w-3.5" />Save Record</button>
          </div>
        </div>
      </section>
      <section className="apex-region">
        <div className="apex-region-header"><span className="flex items-center gap-2"><Users className="h-3.5 w-3.5" />Daily Students Enrolment</span>
          <span className="flex gap-1.5"><button className="apex-btn">Edit Filter</button><button className="apex-btn">Remove Filter</button><button className="apex-btn">Report Settings</button></span>
        </div>
        <div className="apex-region-body">
          {loading ? <div className="py-10 text-center text-sm text-gray-500">Loading…</div> : <ApexTable columns={columns} rows={rows} emptyText="No data found." maxHeight="56vh" />}
        </div>
      </section>
    </Shell>
  )
}

/* ============ Students Class Update (live) ============ */

const CLASS_UPDATE_COLUMNS: Array<[string, string]> = [
  ['studentId', 'Student Code'], ['studentName', 'Name'], ['fatherName', 'Father Name'], ['gender', 'Gender'],
  ['session', 'Session Year'], ['', 'Class Roll #'], ['section', 'Class Section'], ['', 'Subject Group'],
  ['admissionNo', 'Admission #'], ['shift', 'Shift'], ['admissionDate', 'Admission Date'], ['', 'Class Enrolment Date'], ['dateOfBirth', 'Date of Birth'],
]

function ClassUpdatePage({ onNavigate }: { onNavigate: (m: string) => void }) {
  const [rows, setRows] = React.useState<Profile[]>([])
  const [session, setSession] = React.useState('')
  const [className, setClassName] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [loaded, setLoaded] = React.useState(false)

  async function loadRows() {
    setLoading(true)
    try { const d = await (await fetch('/api/students', { cache: 'no-store' })).json(); setRows(d.students || []) } catch { setRows([]) }
    finally { setLoading(false); setLoaded(true) }
  }
  async function saveAll() {
    toast.success('Class update saved.')
  }
  async function updateRow(id: string, section: string) {
    await fetch(`/api/students/${id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ section }) })
    toast.success('Student class updated.')
    void loadRows()
  }

  const columns: ApexTableColumn[] = CLASS_UPDATE_COLUMNS.map(([key, label]) => ({
    key: key || `x_${label}`, label,
    render: (row) => {
      if (label === 'Class Section') {
        return <select className="apex-select" value={String(row.section ?? '')} onChange={(e) => void updateRow((row as Profile).id, e.target.value)}><option value="">--</option>{['A', 'B', 'C', 'D'].map((s) => <option key={s}>{s}</option>)}</select>
      }
      return key === 'admissionDate' || key === 'dateOfBirth' ? (row[key] ? new Date(String(row[key])).toLocaleDateString() : '') : String(key ? (row[key] ?? '') : '')
    },
  }))

  return (
    <Shell title="Students Class Update" onNavigate={onNavigate}>
      <section className="apex-region mb-3">
        <div className="apex-region-header"><span className="flex items-center gap-2"><Filter className="h-3.5 w-3.5 text-gray-500" />Students Class Update</span></div>
        <div className="apex-region-body grid gap-3 sm:grid-cols-3">
          <label className="text-xs text-gray-600">Class
            <select className="apex-select mt-1 w-full" value={className} onChange={(e) => setClassName(e.target.value)}>
              <option value="">-- Select Class --</option>{CLASSES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="text-xs text-gray-600">Session Year
            <select className="apex-select mt-1 w-full" value={session} onChange={(e) => setSession(e.target.value)}>
              <option value="">-- Select Session Year --</option>{SESSION_YEARS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <div className="flex items-end gap-2">
            <button className="apex-btn" onClick={() => { setSession(''); setClassName('') }}>Clear</button>
            <button className="apex-btn apex-btn--primary" onClick={saveAll}><Save className="h-3.5 w-3.5" />Save</button>
            <button className="apex-btn apex-btn--primary" onClick={() => void loadRows()}><Search className="h-3.5 w-3.5" />Go</button>
          </div>
        </div>
      </section>
      <section className="apex-region">
        <div className="apex-region-header"><span className="flex items-center gap-2"><Users className="h-3.5 w-3.5" />Student Class List</span></div>
        <div className="apex-region-body">
          {loading ? <div className="py-10 text-center text-sm text-gray-500">Loading…</div> : (
            <ApexTable columns={columns} rows={rows.filter((r) => !className || String(r.className || '') === className).filter((r) => !session || String(r.session || '') === session)} emptyText="No data found" maxHeight="56vh" />
          )}
          {!loading && loaded && rows.length === 0 && <div className="pb-2 text-center text-xs text-gray-500">Pagination</div>}
        </div>
      </section>
    </Shell>
  )
}

/* ============ Student Data Uploading (live CSV workflow) ============ */

function CsvUploadPage({ onNavigate }: { onNavigate: (m: string) => void }) {
  const [file, setFile] = React.useState<File | null>(null)
  const [busy, setBusy] = React.useState(false)
  const [result, setResult] = React.useState('')
  async function upload() {
    if (!file) return toast.error('Choose a CSV file first.')
    setBusy(true)
    const text = await file.text()
    const rows = parseCsv(text)
    const r = await fetch('/api/students', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ rows }) })
    const d = await r.json()
    setBusy(false)
    if (!r.ok) toast.error(d.error || 'Upload failed.')
    else { setResult(`${d.count} student record(s) processed successfully.`); toast.success('CSV upload complete.') }
  }
  return (
    <Shell title="Student Data Uploading" onNavigate={onNavigate}>
      <section className="apex-region">
        <div className="apex-region-header"><span className="flex items-center gap-2"><FileUp className="h-3.5 w-3.5" />Data Source</span><a className="apex-btn" href={`data:text/csv;charset=utf-8,${encodeURIComponent(PROFILE_COLUMNS.map(([, label]) => label).join(',') + '\n')}`} download="Students.csv">Students.csv</a></div>
        <div className="apex-region-body space-y-4">
          <div className="rounded border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900"><strong>F / P / D / G codes:</strong> upload files may include F (female), P (present/active), D (disabled/disability), and G (guardian) values in the Gender, Status, Disability, and Guardian fields. The importer preserves those codes and upserts by Student ID within your school.</div>
          <div className="rounded border-2 border-dashed border-gray-300 p-8 text-center">
            <Upload className="mx-auto mb-2 h-8 w-8 text-gray-400" />
            <span className="block text-sm font-medium">Upload CSV File</span>
            <span className="block text-xs text-gray-500">Select a file or drop one here.</span>
            <input type="file" accept=".csv,text/csv" className="mt-3" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <span className="ml-2 rounded bg-[#1565c0] px-2 py-0.5 text-xs font-semibold text-white">CSV</span>
          </div>
          {file && <p className="text-sm text-gray-600">Selected: {file.name}</p>}
          <div className="flex gap-2">
            <button className="apex-btn apex-btn--primary" disabled={!file || busy} onClick={() => void upload()}><Upload className="h-3.5 w-3.5" />{busy ? 'Uploading…' : 'Upload File'}</button>
            <button className="apex-btn" onClick={() => { setFile(null); setResult('') }}>Clear</button>
          </div>
          {result && <div className="rounded bg-green-50 p-3 text-sm text-green-800">{result}</div>}
          <div className="text-xs text-gray-500">All uploads are server-scoped to the authenticated school-admin account. EMIS Code from the CSV is ignored for school admins.</div>
        </div>
      </section>
    </Shell>
  )
}

function parseCsv(text: string): string[][] {
  return text.split(/\r?\n/).filter((l) => l.trim()).map((line) => {
    const out: string[] = []
    let cur = ''
    let q = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') { q = !q; continue }
      if (ch === ',' && !q) { out.push(cur); cur = '' } else cur += ch
    }
    out.push(cur)
    return out
  })
}
