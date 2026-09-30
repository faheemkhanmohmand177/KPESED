'use client'

import * as React from 'react'
import { Search, Download, Filter, ChevronRight, SlidersHorizontal, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { MODULES, type ModuleMeta } from '@/lib/modules'
import { ROWS_PER_PAGE } from '@/lib/constants'
import { ApexTable, type ApexTableColumn } from './ui/apex-table'

interface ModulePageProps { module: string; onNavigate: (m: string) => void }
type PortalRecord = { id: string; title?: string | null; data: Record<string, unknown>; updatedAt?: string }

export function ModulePage({ module, onNavigate }: ModulePageProps) {
  const meta: ModuleMeta | undefined = MODULES[module]
  const [search, setSearch] = React.useState('')
  const [pageSize, setPageSize] = React.useState('50')
  const [records, setRecords] = React.useState<PortalRecord[]>([])
  const [loading, setLoading] = React.useState(true)
  const [showActions, setShowActions] = React.useState(false)
  const [showAdd, setShowAdd] = React.useState(false)
  const [json, setJson] = React.useState('{\n  "name": ""\n}')

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/portal-records?module=${encodeURIComponent(module)}&search=${encodeURIComponent(search)}`, { cache: 'no-store' })
      const body = await response.json()
      if (response.ok) setRecords(body.records || [])
      else setRecords([])
    } catch { setRecords([]) }
    finally { setLoading(false) }
  }, [module, search])

  // The effect intentionally synchronizes the report with route/search state.
  React.useEffect(() => { void load() }, [load])

  if (!meta) return <div className="apex-region"><div className="apex-region-body text-center text-sm text-gray-500">Page not found.</div></div>

  const filtered = records
  const visible = pageSize === 'All' ? filtered : filtered.slice(0, Number(pageSize) || 50)
  const keys = Array.from(new Set(filtered.flatMap((row) => Object.keys(row.data))))
  const columns: ApexTableColumn[] = [
    { key: '_action', label: '', headerAlign: 'center', render: (row) => <button type="button" title="Delete record" className="text-red-600 hover:text-red-800" onClick={(e) => { e.stopPropagation(); void removeRecord(String(row._id)) }}><Trash2 className="h-3.5 w-3.5" /></button> },
    { key: '_title', label: 'Title', sortable: true },
    ...keys.map((key) => ({ key, label: key.replace(/_/g, ' '), sortable: true })),
    { key: '_updated', label: 'Updated' },
  ]
  const rows = visible.map((row) => ({ _id: row.id, _title: row.title || '', _updated: row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : '', ...row.data }))

  async function addRecord(e: React.FormEvent) {
    e.preventDefault()
    let data: Record<string, unknown>
    try { data = JSON.parse(json) } catch { toast.error('Enter valid JSON object data.'); return }
    const response = await fetch('/api/portal-records', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ moduleKey: module, data }) })
    if (!response.ok) { toast.error('Unable to save this record.'); return }
    toast.success('Record added.')
    setShowAdd(false)
    setJson('{\n  "name": ""\n}')
    await load()
  }

  async function removeRecord(id: string) {
    if (!window.confirm('Delete this record?')) return
    const response = await fetch(`/api/portal-records/${encodeURIComponent(id)}`, { method: 'DELETE' })
    if (response.ok) { toast.success('Record deleted.'); await load() } else toast.error('Unable to delete this record.')
  }

  function downloadCsv() {
    const header = columns.map((column) => column.label)
    const body = rows.map((row) => columns.map((column) => JSON.stringify(row[column.key] ?? '')).join(','))
    const blob = new Blob([[header.join(','), ...body].join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${module}.csv`; anchor.click(); URL.revokeObjectURL(url)
  }

  return <div className="t-Body-contentInner">
    <nav aria-label="Breadcrumb" className="mb-2 flex flex-wrap items-center gap-1 text-xs text-gray-500"><button type="button" onClick={() => onNavigate('home')} className="hover:text-[#1565c0] hover:underline">Home</button><ChevronRight className="h-3 w-3" /><span>{meta.parent}</span><ChevronRight className="h-3 w-3" /><span className="font-medium text-[#1565c0]">{meta.title}</span></nav>
    <h1 className="mb-2 text-base font-semibold text-[#333] sm:text-lg">{meta.title}</h1>
    <section className="apex-region" aria-label={meta.title}>
      <div className="apex-region-header min-h-[34px]"><span className="flex items-center gap-2"><Filter className="h-3.5 w-3.5 text-gray-500" />{meta.title}</span><span className="flex gap-1.5"><button type="button" className="apex-btn" onClick={downloadCsv} title="Download CSV"><Download className="h-3.5 w-3.5" /><span className="hidden sm:inline">Download</span></button><button type="button" className="apex-btn" onClick={() => setShowActions((v) => !v)} title="Actions"><SlidersHorizontal className="h-3.5 w-3.5" /><span className="hidden sm:inline">Actions</span></button></span></div>
      {showActions && <div className="flex flex-wrap gap-2 border-b border-[#e5e5e5] bg-[#fafafa] px-3 py-2"><button type="button" className="apex-btn" onClick={() => setShowAdd(true)}><Plus className="h-3.5 w-3.5" />Add Record</button><button type="button" className="apex-btn" onClick={() => void load()}><RefreshCw className="h-3.5 w-3.5" />Refresh</button></div>}
      <div className="apex-region-body"><div role="search" aria-label={`Search bar of ${meta.title}`} className="mb-2 flex flex-wrap items-end gap-2"><button type="button" className="apex-btn" onClick={() => setSearch('')}>Select columns to search</button><div className="min-w-[160px] flex-1"><label className="apex-form-label">Search Report</label><input type="search" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} className="apex-input" /></div><button type="button" className="apex-btn apex-btn--primary" onClick={() => void load()}><Search className="h-3.5 w-3.5" />Search</button><div><label className="apex-form-label">Rows</label><select value={pageSize} onChange={(e) => setPageSize(e.target.value)} className="apex-select w-[80px] sm:w-[90px]">{ROWS_PER_PAGE.map((v) => <option key={String(v)}>{v}</option>)}</select></div><button type="button" className="apex-btn" onClick={() => setShowActions((v) => !v)}>Actions</button></div>{loading ? <div className="py-10 text-center text-sm text-gray-500">Loading…</div> : <ApexTable columns={columns} rows={rows} emptyText={`${meta.title} Data Not Found …!`} />}</div>
    </section>
    {showAdd && <div className="fixed inset-0 z-[60] grid place-items-center bg-black/35 p-4"><form onSubmit={addRecord} className="w-full max-w-xl rounded border border-gray-300 bg-white p-4 shadow-xl"><div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Add {meta.title} record</h2><button type="button" onClick={() => setShowAdd(false)} className="text-xl">×</button></div><label className="apex-form-label">Record data (JSON)<textarea value={json} onChange={(e) => setJson(e.target.value)} className="mt-1 min-h-[180px] w-full rounded border border-[#ccc] p-2 font-mono text-xs" /></label><div className="mt-3 flex justify-end gap-2"><button type="button" className="apex-btn" onClick={() => setShowAdd(false)}>Cancel</button><button type="submit" className="apex-btn apex-btn--primary">Save Record</button></div></form></div>}
  </div>
}
