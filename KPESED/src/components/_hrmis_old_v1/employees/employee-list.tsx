'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { Plus, Search, Filter, Download, Pencil, Trash2, Eye, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataTable, type Column } from '@/components/hrmis/ui/data-table'
import { StatusBadge } from '@/components/hrmis/ui/status-badge'
import { EmployeeForm } from './employee-form'
import { EmployeeDetail } from './employee-detail'
import { downloadCsv } from '@/lib/csv'
import { EMPLOYEE_STATUS, GENDERS, EMPLOYEE_TYPES, EMPLOYMENT_TYPES, BPS_LABELS } from '@/lib/constants'
import type { SafeUser } from '@/lib/auth'

interface EmployeeListItem {
  id: string
  personalNo: string
  fullName: string
  cnic: string | null
  gender: string
  status: string
  bps: string | null
  designation: { id: string; title: string; bps: string } | null
  district: { id: string; name: string } | null
  school: { id: string; name: string; emisCode: string } | null
}

interface EmployeesModuleProps {
  user: SafeUser
}

export function EmployeesModule({ user }: EmployeesModuleProps) {
  const canEdit = ['admin', 'hr', 'deo'].includes(user.role)
  const canDelete = user.role === 'admin'

  const [items, setItems] = React.useState<EmployeeListItem[]>([])
  const [total, setTotal] = React.useState(0)
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [totalPages, setTotalPages] = React.useState(1)
  const [loading, setLoading] = React.useState(true)

  const [search, setSearch] = React.useState('')
  const [filters, setFilters] = React.useState<Record<string, string>>({})

  const [formOpen, setFormOpen] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [detailId, setDetailId] = React.useState<string | null>(null)

  // Filters data
  const [districts, setDistricts] = React.useState<{ id: string; name: string }[]>([])
  const [designations, setDesignations] = React.useState<{ id: string; title: string; bps: string }[]>([])
  const [schools, setSchools] = React.useState<{ id: string; name: string }[]>([])

  React.useEffect(() => {
    fetch('/api/districts').then((r) => r.json()).then((d) => setDistricts(d.items || [])).catch(console.error)
    fetch('/api/designations').then((r) => r.json()).then((d) => setDesignations(d.items || [])).catch(console.error)
    fetch('/api/schools').then((r) => r.json()).then((d) => setSchools(d.items || [])).catch(console.error)
  }, [])

  const fetchData = React.useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      Object.entries(filters).forEach(([k, v]) => v && params.set(k, v))
      params.set('page', String(page))
      params.set('pageSize', String(pageSize))
      const res = await fetch(`/api/employees?${params.toString()}`, { cache: 'no-store' })
      const data = await res.json()
      setItems(data.items || [])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 1)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load employees')
    } finally {
      setLoading(false)
    }
  }, [search, filters, page, pageSize])

  React.useEffect(() => {
    const t = setTimeout(fetchData, 300)
    return () => clearTimeout(t)
  }, [fetchData])

  function handleExport() {
    downloadCsv(
      items.map((e) => ({
        PersonalNo: e.personalNo,
        Name: e.fullName,
        CNIC: e.cnic || '',
        Gender: e.gender,
        Designation: e.designation?.title || '',
        BPS: e.bps || '',
        District: e.district?.name || '',
        School: e.school?.name || '',
        Status: e.status,
      })),
      'employees.csv'
    )
    toast.success('CSV exported')
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this employee record? This action cannot be undone.')) return
    try {
      const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'Failed to delete')
        return
      }
      toast.success('Employee deleted')
      fetchData()
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete employee')
    }
  }

  const columns: Column<EmployeeListItem>[] = [
    {
      key: 'personalNo',
      header: 'Personal No',
      cell: (row) => <span className="font-mono text-xs">{row.personalNo}</span>,
    },
    {
      key: 'name',
      header: 'Name',
      cell: (row) => (
        <div>
          <p className="font-medium">{row.fullName}</p>
          <p className="text-xs text-muted-foreground">{row.cnic}</p>
        </div>
      ),
    },
    {
      key: 'designation',
      header: 'Designation',
      cell: (row) => (
        <div>
          <p className="text-sm">{row.designation?.title || '—'}</p>
          <p className="text-xs text-muted-foreground">
            {row.bps ? row.bps.replace('bps_', 'BPS-').toUpperCase() : ''}
          </p>
        </div>
      ),
    },
    {
      key: 'district',
      header: 'District / School',
      cell: (row) => (
        <div className="text-xs">
          <p className="font-medium">{row.district?.name || row.school?.name || '—'}</p>
          <p className="text-muted-foreground">{row.school?.emisCode || ''}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} statusMap={EMPLOYEE_STATUS} />,
    },
    {
      key: 'actions',
      header: () => <span className="text-right">Actions</span>,
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setDetailId(row.id) }} title="View">
            <Eye className="h-4 w-4" />
          </Button>
          {canEdit && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setEditingId(row.id); setFormOpen(true) }} title="Edit">
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {canDelete && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700" onClick={(e) => { e.stopPropagation(); handleDelete(row.id) }} title="Delete">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Employees</h2>
          <p className="text-sm text-muted-foreground">
            Manage teaching and non-teaching staff records.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} disabled={items.length === 0}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          {canEdit && (
            <Button size="sm" onClick={() => { setEditingId(null); setFormOpen(true) }}>
              <Plus className="mr-2 h-4 w-4" /> Add Employee
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" /> Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, personal no, CNIC, or EMIS code…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="pl-9"
              />
            </div>
            <Select value={filters.districtId || '_all'} onValueChange={(v) => { setFilters((f) => ({ ...f, districtId: v === '_all' ? '' : v })); setPage(1) }}>
              <SelectTrigger><SelectValue placeholder="All Districts" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All Districts</SelectItem>
                {districts.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.designationId || '_all'} onValueChange={(v) => { setFilters((f) => ({ ...f, designationId: v === '_all' ? '' : v })); setPage(1) }}>
              <SelectTrigger><SelectValue placeholder="All Designations" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All Designations</SelectItem>
                {designations.map((d) => <SelectItem key={d.id} value={d.id}>{d.title}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.status || '_all'} onValueChange={(v) => { setFilters((f) => ({ ...f, status: v === '_all' ? '' : v })); setPage(1) }}>
              <SelectTrigger><SelectValue placeholder="All Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All Status</SelectItem>
                {Object.entries(EMPLOYEE_STATUS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.gender || '_all'} onValueChange={(v) => { setFilters((f) => ({ ...f, gender: v === '_all' ? '' : v })); setPage(1) }}>
              <SelectTrigger><SelectValue placeholder="All Genders" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All Genders</SelectItem>
                {GENDERS.map((g) => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.employeeType || '_all'} onValueChange={(v) => { setFilters((f) => ({ ...f, employeeType: v === '_all' ? '' : v })); setPage(1) }}>
              <SelectTrigger><SelectValue placeholder="All Employee Types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All Types</SelectItem>
                {EMPLOYEE_TYPES.map((g) => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.employmentType || '_all'} onValueChange={(v) => { setFilters((f) => ({ ...f, employmentType: v === '_all' ? '' : v })); setPage(1) }}>
              <SelectTrigger><SelectValue placeholder="All Employment Types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All Employment</SelectItem>
                {EMPLOYMENT_TYPES.map((g) => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
              </SelectContent>
            </Select>
            {(Object.values(filters).some(Boolean) || search) && (
              <Button variant="ghost" size="sm" onClick={() => { setFilters({}); setSearch(''); setPage(1) }}>
                <X className="mr-2 h-4 w-4" /> Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <DataTable
            columns={columns}
            data={items}
            loading={loading}
            rowKey={(r) => r.id}
            onRowClick={(r) => setDetailId(r.id)}
            page={page}
            total={total}
            totalPages={totalPages}
            onPageChange={setPage}
            onPageSizeChange={(s) => { setPageSize(s); setPage(1) }}
            pageSizeOptions={[10, 25, 50]}
          />
        </CardContent>
      </Card>

      {formOpen && (
        <EmployeeForm
          employeeId={editingId}
          onClose={() => setFormOpen(false)}
          onSaved={() => { setFormOpen(false); fetchData() }}
          districts={districts}
          designations={designations}
          schools={schools}
        />
      )}

      {detailId && (
        <EmployeeDetail employeeId={detailId} onClose={() => setDetailId(null)} onEdit={() => { setEditingId(detailId); setDetailId(null); setFormOpen(true) }} />
      )}
    </div>
  )
}

export default EmployeesModule
