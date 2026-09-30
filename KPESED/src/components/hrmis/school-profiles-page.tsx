'use client'

import * as React from 'react'
import { Building2, Download, Edit3, Plus, Search, Trash2, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { ApexTable, type ApexTableColumn } from './ui/apex-table'
import type { SafeUser } from '@/lib/auth'

type School = { id: string; emisCode: string; name: string; schoolType?: string | null; gender?: string | null; ddoCode?: string | null; address?: string | null; district?: { name: string } | null; tehsil?: { name: string } | null }

export function SchoolProfilesPage({ user }: { user: SafeUser }) {
  const [schools, setSchools] = React.useState<School[]>([])
  const [search, setSearch] = React.useState('')
  const [showForm, setShowForm] = React.useState(false)
  const [editing, setEditing] = React.useState<School | null>(null)
  const [loading, setLoading] = React.useState(true)
  const canAdd = ['admin', 'deo', 'ddeo'].includes(user.role.trim().toLowerCase())

  async function removeSchool(school: School) {
    if (!window.confirm(`Delete ${school.name} (${school.emisCode})? This cannot be undone.`)) return
    const response = await fetch(`/api/schools/${school.id}`, { method: 'DELETE' })
    const body = await response.json().catch(() => ({}))
    if (!response.ok) return toast.error(body.error || 'Could not delete school.')
    toast.success('School deleted.')
    void load()
  }

  async function load() {
    setLoading(true)
    const response = await fetch('/api/schools', { cache: 'no-store' })
    const body = await response.json().catch(() => ({}))
    setSchools(response.ok ? body.schools || [] : [])
    setLoading(false)
  }
  React.useEffect(() => { void load() }, [])

  const visible = schools.filter((school) => `${school.emisCode} ${school.name} ${school.district?.name || ''}`.toLowerCase().includes(search.toLowerCase()))
  const columns: ApexTableColumn[] = [
    { key: 'emisCode', label: 'EMIS Code', sortable: true, mono: true },
    { key: 'name', label: 'Office/School', sortable: true },
    { key: 'schoolType', label: 'Level' },
    { key: 'gender', label: 'Gender' },
    { key: 'district', label: 'District' },
    { key: 'tehsil', label: 'Tehsil' },
    { key: 'ddoCode', label: 'DDO Code' },
    { key: '_edit', label: '', render: (row) => <button type="button" aria-label="Edit school" className="text-[#1565c0] hover:underline" onClick={() => { const school = schools.find((item) => item.id === row._id); if (school) { setEditing(school); setShowForm(true) } }}><Edit3 className="h-3.5 w-3.5" /></button> },
    ...(canAdd ? [{ key: '_delete', label: '', render: (row: Record<string, unknown>) => <button type="button" aria-label="Delete school" className="text-red-600 hover:underline" onClick={() => { const school = schools.find((item) => item.id === row._id); if (school) void removeSchool(school) }}><Trash2 className="h-3.5 w-3.5" /></button> }] : []),
  ]
  const rows = visible.map((school) => ({ _id: school.id, emisCode: school.emisCode, name: school.name, schoolType: school.schoolType || '', gender: school.gender || '', district: school.district?.name || '', tehsil: school.tehsil?.name || '', ddoCode: school.ddoCode || '', _edit: '', _delete: '' }))

  function download() {
    const csv = ['EMIS Code,Office/School,Level,Gender,District,Tehsil,DDO Code', ...rows.map((row) => [row.emisCode, row.name, row.schoolType, row.gender, row.district, row.tehsil, row.ddoCode].map((value) => JSON.stringify(value)).join(','))].join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'office-schools.csv'; anchor.click(); URL.revokeObjectURL(url)
  }

  return <div className="t-Body-contentInner"><nav className="mb-2 flex items-center gap-1 text-xs text-gray-500"><button type="button" className="hover:text-[#1565c0] hover:underline">Home</button><span>›</span><span>Office/School MIS</span><span>›</span><span className="font-medium text-[#1565c0]">Office/School Profile(s)</span></nav><h1 className="mb-2 text-base font-semibold text-[#333] sm:text-lg">Office/School Profile(s)</h1><section className="apex-region"><div className="apex-region-header"><span className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5" />Office/School Profile(s)</span><span className="flex gap-1.5"><button type="button" className="apex-btn" onClick={download}><Download className="h-3.5 w-3.5" />Download</button>{canAdd && <button type="button" className="apex-btn apex-btn--primary" onClick={() => { setEditing(null); setShowForm(true) }}><Plus className="h-3.5 w-3.5" />Add Office/School</button>}</span></div><div className="apex-region-body"><div className="mb-3 flex flex-wrap items-end gap-2"><div className="min-w-[180px] flex-1"><label className="apex-form-label">Search Report</label><input className="apex-input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search EMIS code, school, district…" /></div><button type="button" className="apex-btn apex-btn--primary" onClick={() => void load()}><Search className="h-3.5 w-3.5" />Search</button><span className="ml-auto text-xs text-gray-500">Total Office/School: {visible.length}</span></div>{loading ? <div className="py-10 text-center text-sm text-gray-500">Loading…</div> : <ApexTable columns={columns} rows={rows} emptyText="Office/School Profile(s) Data Not Found …!" />}</div></section>{showForm && <SchoolForm school={editing} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); void load() }} />}</div>
}

function SchoolForm({ school, onClose, onSaved }: { school: School | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = React.useState({ emisCode: school?.emisCode || '', name: school?.name || '', schoolType: school?.schoolType || '', gender: school?.gender || '', ddoCode: school?.ddoCode || '', address: school?.address || '', loginUsername: '', loginPassword: '' })
  const [busy, setBusy] = React.useState(false)
  const update = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }))
  async function submit(e: React.FormEvent) { e.preventDefault(); if ((form.loginUsername && !form.loginPassword) || (!form.loginUsername && form.loginPassword)) return toast.error('Enter both username and temporary password, or leave both login fields empty.'); setBusy(true); const url = school ? `/api/schools/${school.id}` : '/api/schools'; const response = await fetch(url, { method: school ? 'PATCH' : 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(form) }); const body = await response.json().catch(() => ({})); setBusy(false); if (!response.ok) return toast.error(body.error || 'Could not save school.'); if (body.login) toast.success(`School login created: ${body.login.username} / ${body.login.temporaryPassword}`); else toast.success('School profile saved.'); onSaved() }
  return <div className="fixed inset-0 z-[70] grid place-items-center bg-black/40 p-4"><form onSubmit={submit} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded border border-gray-300 bg-white p-4 shadow-xl"><div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">{school ? 'Update Office/School' : 'Add Office/School'}</h2><button type="button" onClick={onClose} className="text-xl">×</button></div><div className="grid gap-3 sm:grid-cols-2">{[['emisCode','EMIS Code'],['name','Office/School Name'],['schoolType','Level / Type'],['gender','Gender'],['ddoCode','DDO Code'],['address','Address']].map(([key, label]) => <label key={key} className="text-sm">{label}<input required={key === 'emisCode' || key === 'name'} value={form[key as keyof typeof form]} onChange={(e) => update(key, e.target.value)} className="apex-input mt-1" /></label>)}</div>{!school && <div className="mt-4 rounded border border-blue-100 bg-blue-50 p-3"><div className="mb-2 flex items-center gap-2 text-sm font-semibold"><UserPlus className="h-4 w-4" />Create school login (optional)</div><p className="mb-2 text-xs text-gray-600">Leave both fields empty to add the school without a login. If you create a login, both fields are required and the password must be at least 8 characters.</p><div className="grid gap-3 sm:grid-cols-2"><label className="text-sm">Username<input value={form.loginUsername} onChange={(e) => update('loginUsername', e.target.value)} className="apex-input mt-1" /></label><label className="text-sm">Temporary password<input type="password" value={form.loginPassword} onChange={(e) => update('loginPassword', e.target.value)} minLength={8} className="apex-input mt-1" /></label></div></div>}<div className="mt-4 flex justify-end gap-2"><button type="button" className="apex-btn" onClick={onClose}>Cancel</button><button disabled={busy} type="submit" className="apex-btn apex-btn--primary">{busy ? 'Saving…' : school ? 'Update Office/School' : 'Save Office/School'}</button></div></form></div>
}
