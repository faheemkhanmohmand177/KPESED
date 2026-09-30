'use client'

import * as React from 'react'
import {
  Download, Filter, ChevronDown, Search, SlidersHorizontal, Plus, RefreshCw,
  Trash2, Edit3, Save, RotateCcw, AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'
import { MODULES } from '@/lib/modules'
import { ROWS_PER_PAGE } from '@/lib/constants'
import { ApexTable, type ApexTableColumn } from './ui/apex-table'
import type { RealModuleConfig, RealFilterField } from '@/lib/real-modules'
import { MODULE_FORMS, type FormFieldDef } from '@/lib/module-forms'

type PortalRecord = { id: string; title?: string | null; data: Record<string, unknown>; updatedAt?: string }

interface RealModulePageProps {
  moduleKey: string
  config: RealModuleConfig
  onNavigate: (m: string) => void
}

/**
 * Functional Oracle APEX workspace renderer driven by REAL_MODULES (visual
 * capture) + MODULE_FORMS (data-entry capture, live 2026-09-30). Every module
 * now supports: real Add/Create forms (exact live field labels), inline row
 * edit, delete, CSV download, saved-report select, rows-per-page, functional
 * filters and auto-seeded editable grids (Tree Survey, PTC headwise balance).
 */
export function RealModulePage({ moduleKey, config }: RealModulePageProps) {
  const meta = MODULES[moduleKey]
  const title = config.title || meta?.title || moduleKey
  const formDef = MODULE_FORMS[moduleKey]

  const [records, setRecords] = React.useState<PortalRecord[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState('')
  const [appliedSearch, setAppliedSearch] = React.useState('')
  const [pageSize, setPageSize] = React.useState('50')
  const [showActions, setShowActions] = React.useState(false)
  const [showAdd, setShowAdd] = React.useState(false)
  const [tab, setTab] = React.useState(0)
  const [editing, setEditing] = React.useState(false)
  const [draft, setDraft] = React.useState<Record<string, Record<string, string>>>({})
  const [filterValue, setFilterValue] = React.useState('')
  const [formValues, setFormValues] = React.useState<Record<string, string>>({})
  const [seeding, setSeeding] = React.useState(false)
  const [savingForm, setSavingForm] = React.useState(false)
  const [editTarget, setEditTarget] = React.useState<PortalRecord | null>(null)

  const isIG = config.mode === 'ig'
  // Column priority: explicit config columns/igColumns -> form-field keys
  // (so every entry-backed module shows its own data columns in the report).
  const formColumns = (formDef?.fields || []).map((f) => f.key)
  const columns = isIG
    ? (config.igColumns?.length ? config.igColumns : formColumns)
    : (config.columns?.length ? config.columns : formColumns)

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

  // Auto-seed default grid rows the first time a seedable module is opened
  // (matches the live portal where Survey Trees / PTC heads arrive pre-filled).
  React.useEffect(() => {
    if (!formDef?.seedRows?.length || loading || seeding) return
    if (records.length > 0) return
    setSeeding(true)
    ;(async () => {
      try {
        await fetch('/api/portal-records/seed-defaults', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ moduleKey, rows: formDef.seedRows }),
        })
        await load()
      } catch { /* non-fatal */ }
      finally { setSeeding(false) }
    })()
  }, [formDef, records.length, loading, seeding, moduleKey, load])

  const filtered = React.useMemo(() => {
    let out = records
    if (appliedSearch) {
      const q = appliedSearch.toLowerCase()
      out = out.filter((r) => JSON.stringify(r.data).toLowerCase().includes(q) || (r.title || '').toLowerCase().includes(q))
    }
    if (formDef?.functionalFilter && filterValue) {
      out = out.filter((r) => String(r.data?.[formDef.functionalFilter!.key] ?? '').includes(filterValue))
    }
    return out
  }, [records, appliedSearch, formDef, filterValue])

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

  function openAddForm() {
    const init: Record<string, string> = {}
    for (const f of formDef?.fields || []) init[f.key] = f.defaultValue ?? ''
    setFormValues(init)
    setEditTarget(null)
    setShowAdd(true)
  }

  function openEditForm(row: PortalRecord) {
    const init: Record<string, string> = {}
    for (const f of formDef?.fields || []) init[f.key] = String(row.data?.[f.key] ?? '')
    setFormValues(init)
    setEditTarget(row)
    setShowAdd(true)
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault()
    setSavingForm(true)
    try {
      if (editTarget) {
        const payload: Record<string, unknown> = { ...editTarget.data }
        for (const f of formDef?.fields || []) payload[f.key] = formValues[f.key] ?? ''
        const response = await fetch(`/api/portal-records/${encodeURIComponent(editTarget.id)}`, {
          method: 'PATCH', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ data: payload }),
        })
        if (!response.ok) { toast.error('Unable to update this record.'); return }
        toast.success('Record updated.')
      } else {
        const response = await fetch('/api/portal-records', {
          method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ moduleKey, data: formValues }),
        })
        if (!response.ok) { toast.error('Unable to save this record.'); return }
        toast.success('Record saved.')
      }
      setShowAdd(false)
      setEditTarget(null)
      await load()
    } finally {
      setSavingForm(false)
    }
  }

  async function removeRecord(id: string) {
    if (!window.confirm('Delete this record?')) return
    const response = await fetch(`/api/portal-records/${encodeURIComponent(id)}`, { method: 'DELETE' })
    if (response.ok) { toast.success('Record deleted.'); await load() } else toast.error('Unable to delete this record.')
  }

  // ----- IG / inline grid editing -----
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
        <div key={index} className="apex-filter">
          <label className="apex-form-label" htmlFor={id}>{field.label}</label>
          <select id={id} defaultValue={field.value || ''} disabled={field.disabled}>
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
        <div key={index} className="apex-filter">
          <label className="apex-form-label" htmlFor={id}>{field.label}</label>
          <input id={id} readOnly value={field.value || ''} />
        </div>
      )
    }
    return (
      <div key={index} className="apex-filter">
        <label className="apex-form-label" htmlFor={id}>{field.label}</label>
        <input id={id} type={field.kind === 'date' ? 'date' : 'text'} defaultValue={field.value || ''} disabled={field.disabled} />
      </div>
    )
  }

  // ----- ORA error page (faithful to live Teachers Attendance Report) -----
  if (config.mode === 'ora') {
    return (
      <div className="t-Body-contentInner">
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

  // ----- Student Migration lookup form -----
  if (config.mode === 'form') {
    return (
      <div className="t-Body-contentInner">
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

  const tableColumns: ApexTableColumn[] = [
    ...columns.map((col) => ({
      key: col,
      label: col,
      sortable: !editing,
      headerAlign: 'left' as const,
      render: editing
        ? (row: Record<string, unknown>) => {
            const value = draft[row._id as string]?.[col] ?? ''
            const selectOptions = formDef?.gridSelectCols?.[col]
            if (selectOptions) {
              return (
                <select
                  className="apex-select w-full min-w-[90px]"
                  value={value}
                  onChange={(e) => setDraft((prev) => ({ ...prev, [row._id as string]: { ...prev[row._id as string], [col]: e.target.value } }))}
                >
                  <option value=""></option>
                  {selectOptions.map((o) => <option key={o}>{o}</option>)}
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
    ...(editing ? [] : [
      ...(formDef ? [{ key: '_edit', label: '', headerAlign: 'center' as const, render: (row: Record<string, unknown>) => (
        <button type="button" title="Edit record" className="text-[#1565c0] hover:text-[#0b4f96]" onClick={(e) => { e.stopPropagation(); openEditForm(records.find((r) => r.id === row._id)!) }}><Edit3 className="h-3.5 w-3.5" /></button>
      ) }] : []),
      { key: '_del', label: '', headerAlign: 'center' as const, render: (row: Record<string, unknown>) => (
        <button type="button" title="Delete record" className="text-red-600 hover:text-red-800" onClick={(e) => { e.stopPropagation(); void removeRecord(String(row._id)) }}><Trash2 className="h-3.5 w-3.5" /></button>
      ) },
    ]),
  ]

  const tableRows = visible.map((row) => ({
    _id: row.id,
    _updated: row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : '',
    ...Object.fromEntries(columns.map((c) => [c, recordCell(row, c)])),
  }))

  const hasTabbedIG = isIG && config.tabs && config.tabs.length === 2
  void hasTabbedIG

  return (
    <div className="t-Body-contentInner">
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
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${tab === i ? 'border-b-2 border-[#1565c0] bg-white text-[#1565c0]' : 'text-gray-600 hover:bg-white/60'}`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Page-level actions — the live portal places Create / Edit controls
          at the top-right, above the report region. */}
      {(formDef || isIG) && (
        <div className="mb-2 flex flex-wrap items-center justify-end gap-1.5">
          {isIG && !editing && <button type="button" className="apex-btn" onClick={startEdit}><Edit3 className="h-3.5 w-3.5" /><span className="hidden sm:inline">Edit</span></button>}
          {isIG && editing && <button type="button" className="apex-btn apex-btn--primary" onClick={() => void saveGrid()}><Save className="h-3.5 w-3.5" />Save</button>}
          {isIG && editing && <button type="button" className="apex-btn" onClick={() => void addGridRow()}><Plus className="h-3.5 w-3.5" /><span className="hidden sm:inline">Add Row</span></button>}
          {isIG && editing && <button type="button" className="apex-btn" onClick={() => { setEditing(false); void load() }}><RotateCcw className="h-3.5 w-3.5" /><span className="hidden sm:inline">Reset</span></button>}
          {formDef && !editing && (
            <button type="button" className="apex-btn apex-btn--primary" onClick={openAddForm}>
              <Plus className="h-3.5 w-3.5" /><span>{formDef.createLabel}</span>
            </button>
          )}
          <button type="button" className="apex-btn" onClick={downloadCsv} title="Download CSV"><Download className="h-3.5 w-3.5" /><span className="hidden sm:inline">Download</span></button>
        </div>
      )}

      <section className="apex-region" aria-label={title}>
        <div className="apex-region-body">
          {/* APEX inline filter boxes — each filter is one bordered box with
              the label above the value, laid out horizontally like the live
              Interactive Report. */}
          {(config.filters || []).length > 0 && (
            <div className="mb-3 flex flex-wrap items-stretch gap-2">
              {(config.filters || []).map((f, i) => renderFilterField(f, i))}
            </div>
          )}

          {formDef?.functionalFilter && (
            <div className="mb-3 flex flex-wrap items-stretch gap-2">
              {formDef.functionalFilter.kind === 'date' ? (
                <div className="apex-filter">
                  <label className="apex-form-label" htmlFor={`${moduleKey}-fnfilter`}>{formDef.functionalFilter.label}</label>
                  <input
                    id={`${moduleKey}-fnfilter`} type="date" value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                  />
                </div>
              ) : (
                <div className="apex-filter">
                  <label className="apex-form-label" htmlFor={`${moduleKey}-fnfilter`}>{formDef.functionalFilter.label}</label>
                  <select
                    id={`${moduleKey}-fnfilter`} value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                  >
                    <option value="">-- {formDef.functionalFilter.label} --</option>
                    {(formDef.functionalFilter.options || []).map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
              )}
              {filterValue && (
                <button type="button" className="apex-btn self-center" onClick={() => setFilterValue('')}>Clear Filter</button>
              )}
            </div>
          )}

          {/* APEX Interactive Report toolbar — search box with attached
              Search button, saved-report select, Rows selector and the
              Actions menu, all on one row (like the live portal). */}
          <div role="search" aria-label={`Search bar of ${title}`} className="mb-2 flex flex-wrap items-center gap-2">
            <button type="button" className="apex-btn px-2" title="Select columns to search" aria-label="Select columns to search"><Search className="h-3.5 w-3.5" /><ChevronDown className="h-3 w-3 text-gray-500" /></button>
            <div className="flex min-w-[200px] flex-1 items-stretch">
              <input
                type="search"
                aria-label="Search report"
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') setAppliedSearch(search) }}
                className="apex-input flex-1"
              />
              <button type="button" className="apex-btn apex-btn--join-l" onClick={() => { setAppliedSearch(search); }}><Search className="h-3.5 w-3.5" />Search</button>
            </div>
            {(config.savedReports || []).length > 0 && (
              <select aria-label="Saved reports" className="apex-select apex-select--inline min-w-[150px]">{(config.savedReports || []).map((r) => <option key={r}>{r}</option>)}</select>
            )}
            <div className="flex items-center gap-1.5">
              <span className="whitespace-nowrap text-xs text-gray-600">Rows</span>
              <select aria-label="Rows per page" value={pageSize} onChange={(e) => setPageSize(e.target.value)} className="apex-select apex-select--inline w-[74px]">
                {ROWS_PER_PAGE.map((v) => <option key={String(v)}>{v}</option>)}
              </select>
            </div>
            <button type="button" className="apex-btn" onClick={() => setShowActions((v) => !v)}><SlidersHorizontal className="h-3.5 w-3.5" />Actions<ChevronDown className="h-3 w-3 text-gray-500" /></button>
          </div>

          {showActions && (
            <div className="mb-2 flex flex-wrap gap-2 rounded border border-[#e5e5e5] bg-[#fafafa] px-3 py-2">
              <button type="button" className="apex-btn" onClick={() => void load()}><RefreshCw className="h-3.5 w-3.5" />Refresh</button>
              <button type="button" className="apex-btn" onClick={downloadCsv}><Download className="h-3.5 w-3.5" />Download (CSV)</button>
            </div>
          )}

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
              {formDef && (
                <section className="apex-region" aria-label={`${title} Records`}>
                  <div className="apex-region-header min-h-[30px]"><span className="text-xs font-semibold text-[#333]">{title} — Saved Records</span></div>
                  <div className="apex-region-body">
                    <ApexTable columns={tableColumns} rows={tableRows} emptyText={config.empty || `${title} Data Not Found …!`} maxHeight="50vh" />
                  </div>
                </section>
              )}
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

      {showAdd && formDef && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/35 p-4">
          <form onSubmit={submitForm} className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded border border-gray-300 bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">{editTarget ? `Update — ${formDef.formTitle || formDef.createLabel}` : formDef.formTitle || formDef.createLabel}</h2>
              <button type="button" onClick={() => { setShowAdd(false); setEditTarget(null) }} className="text-xl text-gray-500">×</button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {formDef.fields.map((f) => <FormInput key={f.key} field={f} value={formValues[f.key] ?? ''} onChange={(v) => setFormValues((prev) => ({ ...prev, [f.key]: v }))} />)}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="apex-btn" onClick={() => { setShowAdd(false); setEditTarget(null) }}>Cancel</button>
              <button type="submit" className="apex-btn apex-btn--primary" disabled={savingForm}>{savingForm ? 'Saving…' : (formDef.submitLabel || 'Save Record')}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

function FormInput({ field, value, onChange }: { field: FormFieldDef; value: string; onChange: (v: string) => void }) {
  const id = `mf-${field.key.replace(/[^a-zA-Z0-9]/g, '-')}`
  const label = (
    <label className="apex-form-label" htmlFor={id}>
      {field.label}{field.required ? ' *' : ''}
    </label>
  )
  if (field.type === 'select') {
    return (
      <div className={field.full ? 'sm:col-span-2 lg:col-span-3' : ''}>
        {label}
        <select id={id} className="apex-select w-full" value={value} onChange={(e) => onChange(e.target.value)} required={field.required}>
          <option value="">-- {field.label} --</option>
          {(field.options || []).map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    )
  }
  if (field.type === 'radio') {
    return (
      <div className={field.full ? 'sm:col-span-2 lg:col-span-3' : ''}>
        <span className="apex-form-label">{field.label}{field.required ? ' *' : ''}</span>
        <div className="mt-1 flex gap-4">
          {(field.options || []).map((o) => (
            <label key={o} className="flex items-center gap-1.5 text-xs text-gray-700">
              <input type="radio" name={id} checked={value === o} onChange={() => onChange(o)} /> {o}
            </label>
          ))}
        </div>
      </div>
    )
  }
  if (field.type === 'textarea') {
    return (
      <div className="sm:col-span-2 lg:col-span-3">
        {label}
        <textarea id={id} className="mt-1 min-h-[64px] w-full rounded border border-[#ccc] p-2 text-sm" value={value} onChange={(e) => onChange(e.target.value)} required={field.required} />
      </div>
    )
  }
  const inputType = field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : field.type === 'url' ? 'url' : 'text'
  return (
    <div className={field.full ? 'sm:col-span-2 lg:col-span-3' : ''}>
      {label}
      <input id={id} type={inputType} className="apex-input w-full" value={value} onChange={(e) => onChange(e.target.value)} required={field.required} />
    </div>
  )
}

function ApexTabs({ tabs, tab, onTab }: { tabs: string[]; tab: number; onTab: (i: number) => void }) {
  return (
    <div className="mb-0 flex flex-wrap gap-px overflow-hidden rounded-t border border-b-0 border-[#d6d6d6] bg-[#f5f5f5]" role="tablist">
      {tabs.map((t, i) => (
        <button key={t} type="button" role="tab" aria-selected={tab === i} onClick={() => onTab(i)}
          className={`px-3 py-1.5 text-xs font-medium transition-colors ${tab === i ? 'border-b-2 border-[#1565c0] bg-white text-[#1565c0]' : 'text-gray-600 hover:bg-white/60'}`}>
          {t}
        </button>
      ))}
    </div>
  )
}
