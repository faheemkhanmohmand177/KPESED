'use client'

import * as React from 'react'
import {
  Download, Filter, ChevronRight, Search, SlidersHorizontal, Plus, RefreshCw,
  Trash2, Edit3, Save, RotateCcw, Table2, AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'
import { MODULES } from '@/lib/modules'
import { ROWS_PER_PAGE } from '@/lib/constants'
import { ApexTable, type ApexTableColumn } from './ui/apex-table'
import type { RealModuleConfig, RealFilterField } from '@/lib/real-modules'

type PortalRecord = { id: string; title?: string | null; data: Record<string, unknown>; updatedAt?: string }

interface RealModulePageProps {
  moduleKey: string
  config: RealModuleConfig
  onNavigate: (m: string) => void
}

/**
 * Faithful Oracle APEX workspace renderer driven by REAL_MODULES configs
 * captured from the live KPESED portal. Renders the exact titles, filter
 * fields, report columns, tabs, saved reports, empty-state texts and toolbar
 * buttons observed on each live page. Record data comes from the portal
 * records store (moduleKey = live page slug).
 */
export function RealModulePage({ moduleKey, config, onNavigate }: RealModulePageProps) {
  const meta = MODULES[moduleKey]
  const title = config.title || meta?.title || moduleKey
  const parent = config.parent || meta?.parent || 'Main'

  const [records, setRecords] = React.useState<PortalRecord[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState('')
  const [appliedSearch, setAppliedSearch] = React.useState('')
  const [pageSize, setPageSize] = React.useState('50')
  const [showActions, setShowActions] = React.useState(false)
  const [showAdd, setShowAdd] = React.useState(false)
  const [json, setJson] = React.useState('{\n  "Name": ""\n}')
  const [tab, setTab] = React.useState(0)
  const [editing, setEditing] = React.useState(false)
  const [draft, setDraft] = React.useState<Record<string, Record<string, string>>>({})

  const isIG = config.mode === 'ig'
  const columns = isIG ? (config.igColumns || []) : (config.columns || [])

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/portal-records?module=${encodeURIComponent(moduleKey)}&search=${encodeURIComponent(appliedSearch)}`, { cache: 'no-store' })
      const body = await response.json()
      if (response.ok) setRecords(body.records || [])
      else setRecords([])
    } catch { setRecords([]) }
    finally { setLoading(false) }
  }, [moduleKey, appliedSearch])

  React.useEffect(() => { void load() }, [load])

  const filtered = React.useMemo(() => {
    if (!appliedSearch) return records
    const q = appliedSearch.toLowerCase()
    return records.filter((r) => JSON.stringify(r.data).toLowerCase().includes(q) || (r.title || '').toLowerCase().includes(q))
  }, [records, appliedSearch])

  const visible = pageSize === 'All' ? filtered : filtered.slice(0, Number(pageSize) || 50)

  function recordCell(row: PortalRecord, col: string): string {
    const v = row.data?.[col]
    if (v === undefined || v === null) return ''
    return typeof v === 'object' ? JSON.stringify(v) : String(v)
  }

  function downloadCsv() {
    const header = columns
    const body = filtered.map((row) => columns.map((c) => JSON.stringify(recordCell(row, c) ?? '')).join(','))
    const blob = new Blob([[header.join(','), ...body].join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${moduleKey}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  async function addRecord(e: React.FormEvent) {
    e.preventDefault()
    let data: Record<string, unknown>
    try { data = JSON.parse(json) } catch { toast.error('Enter valid JSON object data.'); return }
    const response = await fetch('/api/portal-records', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ moduleKey, data }),
    })
    if (!response.ok) { toast.error('Unable to save this record.'); return }
    toast.success('Record added.')
    setShowAdd(false)
    setJson('{\n  "Name": ""\n}')
    await load()
  }

  async function removeRecord(id: string) {
    if (!window.confirm('Delete this record?')) return
    const response = await fetch(`/api/portal-records/${encodeURIComponent(id)}`, { method: 'DELETE' })
    if (response.ok) { toast.success('Record deleted.'); await load() } else toast.error('Unable to delete this record.')
  }

  // ----- IG editing -----
  function startEdit() {
    const d: Record<string, Record<string, string>> = {}
    for (const row of visible) {
      d[row.id] = {}
      for (const col of columns) d[row.id][col] = recordCell(row, col)
    }
    setDraft(d)
    setEditing(true)
  }

  async function saveGrid() {
    let saved = 0
    for (const row of visible) {
      const next = draft[row.id]
      if (!next) continue
      const original: Record<string, unknown> = row.data || {}
      const changed = columns.some((c) => String(original[c] ?? '') !== (next[c] ?? ''))
      if (!changed) continue
      const payload: Record<string, unknown> = { ...original }
      for (const c of columns) payload[c] = next[c] ?? ''
      const response = await fetch(`/api/portal-records/${encodeURIComponent(row.id)}`, {
        method: 'PATCH', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ data: payload }),
      })
      if (response.ok) saved++
    }
    setEditing(false)
    if (saved > 0) { toast.success(`${saved} row(s) saved.`); await load() }
    else toast.info('No changes to save.')
  }

  async function addGridRow() {
    const data: Record<string, unknown> = {}
    for (const col of columns) data[col] = ''
    const response = await fetch('/api/portal-records', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ moduleKey, data }),
    })
    if (!response.ok) { toast.error('Unable to add row.'); return }
    toast.success('Row added.')
    await load()
  }

  const renderFilterField = (field: RealFilterField, index: number) => {
    const id = `${moduleKey}-filter-${index}`
    if (field.kind === 'select') {
      return (
        <div key={index}>
          <label className="apex-form-label" htmlFor={id}>{field.label}</label>
          <select id={id} className="apex-select min-w-[150px]" defaultValue={field.value || ''} disabled={field.disabled}>
            {(field.options || []).map((o) => <option key={o} value={o === (field.options?.[0]) ? '' : o}>{o}</option>)}
          </select>
        </div>
      )
    }
    if (field.kind === 'radio') {
      return (
        <div key={index} className="flex items-center gap-3">
          <span className="apex-form-label mb-0">{field.label}</span>
          <div className="flex gap-3">
            {(field.options || []).map((o, i) => (
              <label key={o} className="flex items-center gap-1 text-xs text-gray-700">
                <input type="radio" name={id} value={o} defaultChecked={i === 0} /> {o}
              </label>
            ))}
          </div>
        </div>
      )
    }
    if (field.kind === 'readonly') {
      return (
        <div key={index}>
          <label className="apex-form-label" htmlFor={id}>{field.label}</label>
          <input id={id} className="apex-input bg-gray-100" readOnly value={field.value || ''} />
        </div>
      )
    }
    return (
      <div key={index}>
        <label className="apex-form-label" htmlFor={id}>{field.label}</label>
        <input id={id} type={field.kind === 'date' ? 'date' : 'text'} className="apex-input min-w-[140px]" defaultValue={field.value || ''} disabled={field.disabled} />
      </div>
    )
  }

  // ----- ORA error page (faithful to live Teachers Attendance Report) -----
  if (config.mode === 'ora') {
    return (
      <div className="t-Body-contentInner">
        <Breadcrumb parent={parent} title={title} onNavigate={onNavigate} />
        <h1 className="mb-2 text-base font-semibold text-[#333] sm:text-lg">{title}</h1>
        <section className="apex-region" aria-label={title}>
          <div className="apex-region-header min-h-[34px]"><span className="flex items-center gap-2"><Filter className="h-3.5 w-3.5 text-gray-500" />{title}</span><span className="flex gap-1.5"><button type="button" className="apex-btn"><RefreshCw className="h-3.5 w-3.5" /><span className="hidden sm:inline">Refresh Report</span></button><button type="button" className="apex-btn"><Search className="h-3.5 w-3.5" /><span className="hidden sm:inline">Search</span></button><button type="button" className="apex-btn"><SlidersHorizontal className="h-3.5 w-3.5" /><span className="hidden sm:inline">Actions</span></button></span></div>
          <div className="apex-region-body">
            <div role="search" className="mb-3 flex flex-wrap items-end gap-2">
              <div><label className="apex-form-label">Attendance Date</label><input type="text" className="apex-input min-w-[140px]" /></div>
            </div>
            <div className="flex items-start gap-2 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800" role="alert">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="font-mono text-xs">{config.oraText}</span>
            </div>
          </div>
        </section>
      </div>
    )
  }

  // ----- Monitoring Dashboard charts -----
  if (config.mode === 'charts') {
    return (
      <div className="t-Body-contentInner">
        <Breadcrumb parent={parent} title={title} onNavigate={onNavigate} />
        <div className="grid gap-3 lg:grid-cols-2">
          {(config.charts || []).map((chart) => (
            <section key={chart} className="apex-region" aria-label={chart}>
              <div className="apex-region-header min-h-[34px]">
                <span className="text-xs font-semibold text-[#333]">{chart}</span>
                <span className="flex gap-1.5"><button type="button" className="apex-btn">Stack</button><button type="button" className="apex-btn">Unstack</button></span>
              </div>
              <div className="apex-region-body flex h-[220px] items-end justify-around gap-2 px-4 pb-3">
                <div className="flex h-full w-full flex-col items-center justify-center text-center text-xs text-gray-400">
                  No chart data available for this district yet.
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    )
  }

  // ----- Student Migration lookup form -----
  if (config.mode === 'form') {
    return (
      <div className="t-Body-contentInner">
        <Breadcrumb parent={parent} title={title} onNavigate={onNavigate} />
        {config.tabs && <ApexTabs tabs={config.tabs} tab={tab} onTab={setTab} />}
        {(config.formFields || []).length > 0 && (
          <section className="apex-region" aria-label={title}>
            <div className="apex-region-header min-h-[34px]"><span className="flex items-center gap-2"><Filter className="h-3.5 w-3.5 text-gray-500" />{title}</span></div>
            <div className="apex-region-body">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {(config.formFields || []).map((f, i) => renderFilterField(f, i))}
              </div>
            </div>
          </section>
        )}
      </div>
    )
  }

  // ----- Attachments page (DPS - Rankings) -----
  if (config.mode === 'attachments') {
    const rows = config.rows || []
    return (
      <div className="t-Body-contentInner">
        <Breadcrumb parent={parent} title={title} onNavigate={onNavigate} />
        <h1 className="mb-2 text-base font-semibold text-[#333] sm:text-lg">{title}</h1>
        <section className="apex-region" aria-label={title}>
          <div className="apex-region-header min-h-[34px]"><span className="flex items-center gap-2"><Filter className="h-3.5 w-3.5 text-gray-500" />{title}</span><span className="flex gap-1.5"><button type="button" className="apex-btn"><SlidersHorizontal className="h-3.5 w-3.5" /><span className="hidden sm:inline">Actions</span></button></span></div>
          <div className="apex-region-body">
            <div role="search" className="mb-2 flex flex-wrap items-end gap-2">
              <button type="button" className="apex-btn">Select columns to search</button>
              <div className="min-w-[160px] flex-1"><label className="apex-form-label">Search</label><input type="search" className="apex-input" placeholder="Search…" /></div>
              <button type="button" className="apex-btn apex-btn--primary"><Search className="h-3.5 w-3.5" />Go</button>
            </div>
            {rows.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">No data found.</div>
            ) : (
              <ApexTable
                columns={[
                  { key: '_title', label: 'Title', sortable: true },
                  { key: '_att', label: 'Attachment', headerAlign: 'center', render: () => (
                    <button type="button" className="inline-flex items-center gap-1 text-[#1565c0] hover:underline" onClick={() => toast.info('Attachment preview is not included in this clone.')}>
                      <Download className="h-3 w-3" /> Download
                    </button>
                  ) },
                ]}
                rows={rows.map((r) => ({ _id: r.Title, _title: r.Title, _att: 'Download' }))}
                emptyText="No data found."
              />
            )}
          </div>
        </section>
      </div>
    )
  }

  // ----- IRR / IG workspace -----
  const tableColumns: ApexTableColumn[] = [
    ...columns.map((col) => ({
      key: col,
      label: col,
      sortable: !editing,
      headerAlign: 'left' as const,
      render: editing
        ? (row: Record<string, unknown>) => {
            const value = draft[row._id as string]?.[col] ?? ''
            if (config.bankRemarksOptions && col === 'Bank Remakrs') {
              return (
                <select
                  className="apex-select w-full min-w-[90px]"
                  value={value}
                  onChange={(e) => setDraft((prev) => ({ ...prev, [row._id as string]: { ...prev[row._id as string], [col]: e.target.value } }))}
                >
                  <option value=""></option>
                  {config.bankRemarksOptions.map((o) => <option key={o}>{o}</option>)}
                </select>
              )
            }
            return (
              <input
                className="apex-input w-full min-w-[80px]"
                value={value}
                onChange={(e) => setDraft((prev) => ({ ...prev, [row._id as string]: { ...prev[row._id as string], [col]: e.target.value } }))}
              />
            )
          }
        : undefined,
    })),
    { key: '_updated', label: 'Updated' },
    ...(config.mode === 'irr' ? [{ key: '_del', label: '', headerAlign: 'center' as const, render: (row: Record<string, unknown>) => (
      <button type="button" title="Delete record" className="text-red-600 hover:text-red-800" onClick={(e) => { e.stopPropagation(); void removeRecord(String(row._id)) }}><Trash2 className="h-3.5 w-3.5" /></button>
    ) }] : []),
  ]

  const tableRows = visible.map((row) => ({
    _id: row.id,
    _updated: row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : '',
    ...Object.fromEntries(columns.map((c) => [c, recordCell(row, c)])),
  }))

  const hasTabbedIG = isIG && config.tabs && config.tabs.length === 2

  return (
    <div className="t-Body-contentInner">
      <Breadcrumb parent={parent} title={title} onNavigate={onNavigate} />
      <h1 className="mb-2 text-base font-semibold text-[#333] sm:text-lg">{title}</h1>

      {config.notice && (
        <div className="mb-3 flex items-start gap-2 rounded border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-900" role="note">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{config.notice}</span>
        </div>
      )}

      {config.tabs && config.tabs.length > 0 && (
        <div className="mb-0 flex flex-wrap gap-px overflow-hidden rounded-t border border-b-0 border-[#d6d6d6] bg-[#f5f5f5]" role="tablist">
          {config.tabs.map((t, i) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === i}
              onClick={() => setTab(i)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${tab === i ? 'border-b-2 border-[#0b6fc4] bg-white text-[#0b6fc4]' : 'text-gray-600 hover:bg-white/60'}`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      <section className="apex-region" aria-label={title}>
        <div className="apex-region-header min-h-[34px]">
          <span className="flex items-center gap-2"><Filter className="h-3.5 w-3.5 text-gray-500" />{isIG && hasTabbedIG ? config.tabs?.[tab] || title : title}</span>
          <span className="flex gap-1.5">
            <button type="button" className="apex-btn" onClick={downloadCsv} title="Download CSV"><Download className="h-3.5 w-3.5" /><span className="hidden sm:inline">Download</span></button>
            {isIG && !editing && <button type="button" className="apex-btn" onClick={startEdit}><Edit3 className="h-3.5 w-3.5" /><span className="hidden sm:inline">Edit</span></button>}
            {isIG && editing && <button type="button" className="apex-btn apex-btn--primary" onClick={() => void saveGrid()}><Save className="h-3.5 w-3.5" /><span className="hidden sm:inline">Save</span></button>}
            {isIG && editing && <button type="button" className="apex-btn" onClick={() => void addGridRow()}><Plus className="h-3.5 w-3.5" /><span className="hidden sm:inline">Add Row</span></button>}
            {isIG && editing && <button type="button" className="apex-btn" onClick={() => { setEditing(false); void load() }}><RotateCcw className="h-3.5 w-3.5" /><span className="hidden sm:inline">Reset</span></button>}
            <button type="button" className="apex-btn" onClick={() => setShowActions((v) => !v)}><SlidersHorizontal className="h-3.5 w-3.5" /><span className="hidden sm:inline">Actions</span></button>
          </span>
        </div>

        {showActions && (
          <div className="flex flex-wrap gap-2 border-b border-[#e5e5e5] bg-[#fafafa] px-3 py-2">
            <button type="button" className="apex-btn" onClick={() => setShowAdd(true)}><Plus className="h-3.5 w-3.5" />Add Record</button>
            <button type="button" className="apex-btn" onClick={() => void load()}><RefreshCw className="h-3.5 w-3.5" />Refresh</button>
          </div>
        )}

        <div className="apex-region-body">
          {(config.filters || []).length > 0 && (
            <div className="mb-3 flex flex-wrap items-end gap-3 rounded border border-[#e5e5e5] bg-[#fafafa] p-3">
              {(config.filters || []).map((f, i) => renderFilterField(f, i))}
            </div>
          )}

          {(config.savedReports || []).length > 0 && (
            <div className="mb-2 flex flex-wrap items-end gap-2">
              <div>
                <label className="apex-form-label">Saved Reports</label>
                <select className="apex-select min-w-[220px]">{(config.savedReports || []).map((r) => <option key={r}>{r}</option>)}</select>
              </div>
            </div>
          )}

          <div role="search" aria-label={`Search bar of ${title}`} className="mb-2 flex flex-wrap items-end gap-2">
            <button type="button" className="apex-btn">Select columns to search</button>
            <div className="min-w-[160px] flex-1">
              <label className="apex-form-label">Search Report</label>
              <input type="search" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} className="apex-input" />
            </div>
            <button type="button" className="apex-btn apex-btn--primary" onClick={() => { setAppliedSearch(search); }}><Search className="h-3.5 w-3.5" />Search</button>
            <div>
              <label className="apex-form-label">Rows</label>
              <select value={pageSize} onChange={(e) => setPageSize(e.target.value)} className="apex-select w-[80px] sm:w-[90px]">
                {ROWS_PER_PAGE.map((v) => <option key={String(v)}>{v}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-10 text-center text-sm text-gray-500">Loading…</div>
          ) : config.regions ? (
            <div className="space-y-4">
              {config.regions.map((region) => (
                <section key={region.title} className="apex-region" aria-label={region.title}>
                  <div className="apex-region-header min-h-[30px]"><span className="text-xs font-semibold text-[#333]">{region.title}</span></div>
                  <div className="apex-region-body">
                    <ApexTable columns={(region.columns.length ? region.columns : ['Name']).map((c) => ({ key: c, label: c, sortable: true }))} rows={[]} emptyText={region.empty} />
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <ApexTable
              columns={tableColumns}
              rows={tableRows}
              emptyText={config.empty || `${title} Data Not Found …!`}
              maxHeight="62vh"
            />
          )}
        </div>
      </section>

      {showAdd && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/35 p-4">
          <form onSubmit={addRecord} className="w-full max-w-xl rounded border border-gray-300 bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Add {title} record</h2><button type="button" onClick={() => setShowAdd(false)} className="text-xl">×</button></div>
            <label className="apex-form-label">Record data (JSON)
              <textarea value={json} onChange={(e) => setJson(e.target.value)} className="mt-1 min-h-[180px] w-full rounded border border-[#ccc] p-2 font-mono text-xs" />
            </label>
            <p className="mt-2 text-xs text-gray-500">Tip: keys must match the report column labels exactly (e.g. {JSON.stringify(columns[0] || 'Name')}).</p>
            <div className="mt-3 flex justify-end gap-2">
              <button type="button" className="apex-btn" onClick={() => setShowAdd(false)}>Cancel</button>
              <button type="submit" className="apex-btn apex-btn--primary">Save Record</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

function Breadcrumb({ parent, title, onNavigate }: { parent: string; title: string; onNavigate: (m: string) => void }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-2 flex flex-wrap items-center gap-1 text-xs text-gray-500">
      <button type="button" onClick={() => onNavigate('home')} className="hover:text-[#1565c0] hover:underline">Home</button>
      <ChevronRight className="h-3 w-3" />
      <span>{parent}</span>
      <ChevronRight className="h-3 w-3" />
      <span className="font-medium text-[#1565c0]">{title}</span>
    </nav>
  )
}

function ApexTabs({ tabs, tab, onTab }: { tabs: string[]; tab: number; onTab: (i: number) => void }) {
  return (
    <div className="mb-0 flex flex-wrap gap-px overflow-hidden rounded-t border border-b-0 border-[#d6d6d6] bg-[#f5f5f5]" role="tablist">
      {tabs.map((t, i) => (
        <button key={t} type="button" role="tab" aria-selected={tab === i} onClick={() => onTab(i)}
          className={`px-3 py-1.5 text-xs font-medium transition-colors ${tab === i ? 'border-b-2 border-[#0b6fc4] bg-white text-[#0b6fc4]' : 'text-gray-600 hover:bg-white/60'}`}>
          {t}
        </button>
      ))}
    </div>
  )
}

// Table2 icon kept for future pivot view (live page offers Pivot on PTC report tab).
export const __UNUSED = Table2
