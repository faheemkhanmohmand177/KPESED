'use client'

import * as React from 'react'
import { Download, Filter, Plus, RefreshCw, Search, SlidersHorizontal, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { ApexTable, type ApexTableColumn } from './ui/apex-table'
import { ROWS_PER_PAGE } from '@/lib/constants'

type AssetView = 'profile' | 'details' | 'report'
type AssetRecord = Record<string, unknown> & { id: string }

type Lookups = {
  districts: string[]
  schools: Array<{ emisCode: string; name: string; gender: string | null; schoolType: string | null }>
  types: string[]
  categories: string[]
  assetNames: string[]
}

const today = () => new Date().toISOString().slice(0, 10)

export function AssetMisPage({ view, onNavigate }: { view: AssetView; onNavigate: (module: string) => void }) {
  const [records, setRecords] = React.useState<AssetRecord[]>([])
  const [lookups, setLookups] = React.useState<Lookups>({ districts: [], schools: [], types: [], categories: [], assetNames: [] })
  const [search, setSearch] = React.useState('')
  const [pageSize, setPageSize] = React.useState('50')
  const [loading, setLoading] = React.useState(true)
  const [showActions, setShowActions] = React.useState(false)
  const [showForm, setShowForm] = React.useState(false)
  const [filters, setFilters] = React.useState({ emisCode: '', type: '', category: '', assetName: '' })
  const [form, setForm] = React.useState({ emisCode: '', assetType: 'CONSUMABLE', category: '', assetName: '', donatedBy: '', purchaseDate: today(), quantity: '1' })

  const title = view === 'profile' ? 'Asset Profile' : view === 'details' ? 'Asset Details' : 'Assets Report'
  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ view, search, ...filters })
      const response = await fetch(`/api/assets?${params.toString()}`, { cache: 'no-store' })
      const body = await response.json()
      if (response.ok) setRecords(body.records || [])
      else setRecords([])
    } catch { setRecords([]) }
    finally { setLoading(false) }
  }, [filters, search, view])

  const loadLookups = React.useCallback(async () => {
    const response = await fetch(`/api/assets?view=lookups${filters.type ? `&type=${encodeURIComponent(filters.type)}` : ''}${filters.category ? `&category=${encodeURIComponent(filters.category)}` : ''}`, { cache: 'no-store' })
    if (response.ok) setLookups(await response.json())
  }, [filters.category, filters.type])

  React.useEffect(() => { void loadLookups() }, [loadLookups])
  React.useEffect(() => { void load() }, [load])
  React.useEffect(() => {
    if (!form.emisCode && lookups.schools[0]) setForm((current) => ({ ...current, emisCode: lookups.schools[0].emisCode }))
  }, [form.emisCode, lookups.schools])

  const visible = pageSize === 'All' ? records : records.slice(0, Number(pageSize) || 50)
  const columns: ApexTableColumn[] = view === 'profile' ? [
    { key: '_delete', label: '', headerAlign: 'center', render: (row) => <button type="button" title="Delete" className="text-red-600 hover:text-red-800" onClick={() => void removeAsset(String(row.id))}><Trash2 className="h-3.5 w-3.5" /></button> },
    { key: 'assetCode', label: 'Serial#', sortable: true }, { key: 'assetName', label: 'Name', sortable: true }, { key: 'purchaseDate', label: 'Date', sortable: true },
    { key: 'status', label: 'Status', sortable: true }, { key: 'assetType', label: 'Type', sortable: true }, { key: 'category', label: 'Category', sortable: true }, { key: 'donatedBy', label: 'Donated By', sortable: true }, { key: 'availability', label: 'Availability', sortable: true },
  ] : view === 'details' ? [
    { key: 'serialNumber', label: 'Serial #', sortable: true }, { key: 'assetCode', label: 'Asset Code', sortable: true }, { key: 'assetName', label: 'Asset Name', sortable: true }, { key: 'assetType', label: 'Asset Type', sortable: true }, { key: 'category', label: 'Category', sortable: true }, { key: 'availability', label: 'Availability/Issue', sortable: true }, { key: 'status', label: 'Status', sortable: true },
  ] : [
    { key: 'district', label: 'District', sortable: true }, { key: 'schoolName', label: 'School/Office Name', sortable: true }, { key: 'schoolLevel', label: 'School Level', sortable: true }, { key: 'emisCode', label: 'EMIS Code', sortable: true }, { key: 'schoolGender', label: 'School/Office Gender', sortable: true }, { key: 'assetType', label: 'Asset TYpe', sortable: true }, { key: 'category', label: 'Category', sortable: true }, { key: 'assetName', label: 'Asset Name', sortable: true }, { key: 'status', label: 'Status', sortable: true }, { key: 'totalAsset', label: 'Total Asset', sortable: true },
  ]

  async function removeAsset(id: string) {
    if (!window.confirm('Delete this asset record?')) return
    const response = await fetch(`/api/assets/${encodeURIComponent(id)}`, { method: 'DELETE' })
    if (response.ok) { toast.success('Asset record deleted.'); await load() } else toast.error('Unable to delete asset record.')
  }

  async function addAsset(event: React.FormEvent) {
    event.preventDefault()
    const response = await fetch('/api/assets', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...form, quantity: Number(form.quantity) }) })
    const body = await response.json().catch(() => null)
    if (!response.ok) { toast.error(body?.error || 'Unable to save asset record.'); return }
    toast.success('Asset record saved.')
    setShowForm(false)
    setForm((current) => ({ ...current, assetName: '', category: '', donatedBy: '', quantity: '1', purchaseDate: today() }))
    await load()
  }

  function downloadCsv() {
    const header = columns.map((column) => column.label)
    const body = visible.map((row) => columns.map((column) => JSON.stringify(row[column.key] ?? '')).join(','))
    const blob = new Blob([[header.join(','), ...body].join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${view === 'profile' ? 'asset-profile' : view === 'details' ? 'asset-details' : 'assets-report'}.csv`; anchor.click(); URL.revokeObjectURL(url)
  }

  const selectedSchool = lookups.schools.find((school) => school.emisCode === form.emisCode)
  return <div className="t-Body-contentInner">
    <nav aria-label="Breadcrumb" className="mb-2 flex flex-wrap items-center gap-1 text-xs text-gray-500"><button type="button" onClick={() => onNavigate('home')} className="hover:text-[#1565c0] hover:underline">Home</button><span>›</span><span>Assets MIS</span><span>›</span><span className="font-medium text-[#1565c0]">{title}</span></nav>
    <h1 className="mb-2 text-base font-semibold text-[#333] sm:text-lg">{title}</h1>
    {view === 'profile' && <section className="mb-3 rounded border border-[#ddd] bg-white p-3 shadow-sm"><div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4"><label className="apex-form-label">District<select className="apex-select mt-1 w-full" value={filters.emisCode ? (lookups.schools.find((s) => s.emisCode === filters.emisCode)?.gender ? (lookups.districts[0] || '') : '') : ''} onChange={() => undefined}><option>Select District</option>{lookups.districts.map((district) => <option key={district}>{district}</option>)}</select></label><label className="apex-form-label">School Gender<select className="apex-select mt-1 w-full"><option>MALE</option></select></label><label className="apex-form-label sm:col-span-2">School Name<select className="apex-select mt-1 w-full" value={form.emisCode} onChange={(e) => setForm((current) => ({ ...current, emisCode: e.target.value }))}><option value="">Select School</option>{lookups.schools.map((school) => <option key={school.emisCode} value={school.emisCode}>{school.name}</option>)}</select></label></div><div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4"><label className="apex-form-label">Type<select className="apex-select mt-1 w-full" value={form.assetType} onChange={(e) => setForm((current) => ({ ...current, assetType: e.target.value }))}>{(lookups.types.length ? lookups.types : ['CONSUMABLE', 'FIXED/MOVABLE']).map((type) => <option key={type}>{type}</option>)}</select></label><label className="apex-form-label">Category<select className="apex-select mt-1 w-full" value={form.category} onChange={(e) => setForm((current) => ({ ...current, category: e.target.value }))}><option value="">Select Category</option>{lookups.categories.map((category) => <option key={category}>{category}</option>)}</select></label><label className="apex-form-label">Donated By<input className="apex-input mt-1 w-full" placeholder="-- Donated By --" value={form.donatedBy} onChange={(e) => setForm((current) => ({ ...current, donatedBy: e.target.value }))} /></label><label className="apex-form-label">Asset Name<select className="apex-select mt-1 w-full" value={form.assetName} onChange={(e) => setForm((current) => ({ ...current, assetName: e.target.value }))}><option value="">Select Asset Name</option>{lookups.assetNames.map((name) => <option key={name}>{name}</option>)}</select></label><label className="apex-form-label">Purchase Date<input type="date" className="apex-input mt-1 w-full" value={form.purchaseDate} onChange={(e) => setForm((current) => ({ ...current, purchaseDate: e.target.value }))} /></label><label className="apex-form-label">Quantity<input type="number" min="1" className="apex-input mt-1 w-full" value={form.quantity} onChange={(e) => setForm((current) => ({ ...current, quantity: e.target.value }))} /></label></div><div className="mt-3 flex justify-end"><button type="button" className="apex-btn apex-btn--primary" onClick={() => setShowForm(true)}><Plus className="h-3.5 w-3.5" />Save Asset Record</button></div></section>}
    <section className="apex-region" aria-label={title}><div className="apex-region-header min-h-[34px]"><span className="flex items-center gap-2"><Filter className="h-3.5 w-3.5 text-gray-500" />{view === 'profile' ? 'Asset record of GMS Taj mohammad' : title}</span><span className="flex gap-1.5"><button type="button" className="apex-btn" onClick={downloadCsv} title="Download"><Download className="h-3.5 w-3.5" /><span className="hidden sm:inline">Download</span></button><button type="button" className="apex-btn" onClick={() => setShowActions((v) => !v)}><SlidersHorizontal className="h-3.5 w-3.5" /><span className="hidden sm:inline">Actions</span></button></span></div>{showActions && <div className="flex flex-wrap gap-2 border-b border-[#e5e5e5] bg-[#fafafa] px-3 py-2"><button type="button" className="apex-btn" onClick={() => void load()}><RefreshCw className="h-3.5 w-3.5" />Refresh</button><button type="button" className="apex-btn" onClick={() => setFilters({ emisCode: '', type: '', category: '', assetName: '' })}>Reset Filters</button></div>}<div className="apex-region-body"><div role="search" className="mb-2 flex flex-wrap items-end gap-2"><button type="button" className="apex-btn" onClick={() => setSearch('')}>Select columns to search</button><div className="min-w-[160px] flex-1"><label className="apex-form-label">Search Report</label><input type="search" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} className="apex-input" /></div><button type="button" className="apex-btn apex-btn--primary" onClick={() => void load()}><Search className="h-3.5 w-3.5" />Search</button><div><label className="apex-form-label">Rows</label><select value={pageSize} onChange={(e) => setPageSize(e.target.value)} className="apex-select w-[80px]">{ROWS_PER_PAGE.map((value) => <option key={String(value)}>{value}</option>)}</select></div><button type="button" className="apex-btn" onClick={() => setShowActions((v) => !v)}>Actions</button></div>{loading ? <div className="py-10 text-center text-sm text-gray-500">Loading…</div> : <ApexTable columns={columns} rows={visible} emptyText={`${title} Data Not Found …!`} />}</div></section>
    {showForm && <div className="fixed inset-0 z-[60] grid place-items-center bg-black/35 p-4"><form onSubmit={addAsset} className="w-full max-w-xl rounded border border-gray-300 bg-white p-4 shadow-xl"><div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Asset Profile</h2><button type="button" onClick={() => setShowForm(false)} className="text-xl">×</button></div><p className="mb-3 text-xs text-gray-500">{selectedSchool?.name || 'Select a school'} · {form.assetType}</p><div className="grid grid-cols-1 gap-2 sm:grid-cols-2"><label className="apex-form-label">Asset Name<select required className="apex-select mt-1 w-full" value={form.assetName} onChange={(e) => setForm((current) => ({ ...current, assetName: e.target.value }))}><option value="">Select Asset Name</option>{lookups.assetNames.map((name) => <option key={name}>{name}</option>)}</select></label><label className="apex-form-label">Category<select className="apex-select mt-1 w-full" value={form.category} onChange={(e) => setForm((current) => ({ ...current, category: e.target.value }))}><option value="">Select Category</option>{lookups.categories.map((category) => <option key={category}>{category}</option>)}</select></label><label className="apex-form-label">Donated By<input className="apex-input mt-1 w-full" value={form.donatedBy} onChange={(e) => setForm((current) => ({ ...current, donatedBy: e.target.value }))} /></label><label className="apex-form-label">Purchase Date<input required type="date" className="apex-input mt-1 w-full" value={form.purchaseDate} onChange={(e) => setForm((current) => ({ ...current, purchaseDate: e.target.value }))} /></label><label className="apex-form-label">Quantity<input required min="1" type="number" className="apex-input mt-1 w-full" value={form.quantity} onChange={(e) => setForm((current) => ({ ...current, quantity: e.target.value }))} /></label></div><div className="mt-4 flex justify-end gap-2"><button type="button" className="apex-btn" onClick={() => setShowForm(false)}>Clear</button><button type="submit" className="apex-btn apex-btn--primary">Save</button></div></form></div>}
  </div>
}
