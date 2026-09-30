'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { ApexTabs } from './ui/apex-tabs'
import { ApexTable, type ApexTableColumn } from './ui/apex-table'
import {
  EMPLOYEE_LIST_TABS,
  EMPLOYEE_TABLE_COLUMNS,
  REPORTS_LIST,
  ROWS_PER_PAGE,
} from '@/lib/constants'
import { fmtDate, fmtTenure, toStr } from '@/lib/date'

interface DistrictOption { id: string; name: string; }
interface SchoolOption { id: string; emisCode: string; name: string; gender: string; districtId?: string | null; tehsilId?: string | null; }
interface DistrictsResponse {
  districts: DistrictOption[]
  tehsils: { id: string; name: string; districtId?: string | null }[]
  unionCouncils: { id: string; name: string; districtId?: string | null; tehsilId?: string | null }[]
  schools: SchoolOption[]
}

interface EmployeeRow {
  id: string
  empId: string
  name: string
  fatherOrHusbandName: string | null
  gender: string | null
  cnic: string | null
  personnelNo: string | null
  emisCode: string | null
  schoolName: string | null
  schoolGender: string | null
  ddoCode: string | null
  placementType: string | null
  postingType: string | null
  externalPlacement: string | null
  workingDesignation: string | null
  workingBPS: number | null
  currentPostingDate: string | null
  tenureYears: number | null
  tenureMonths: number | null
  tenureDays: number | null
  dateOfBirth: string | null
  dateOfEntryIntoGovtService: string | null
  mobileSms: string | null
  isDeputation: string | null
  tehsilName: string | null
  domicile: string | null
  initialRecruitmentInESED: string | null
  districtName: string | null
  email: string | null
  initialRecruitment1stOrderDate: string | null
  level: string | null
  cadreGroup: string | null
  cadreDesignation: string | null
  status: string | null
  jobType: string | null
  [key: string]: unknown
}

interface EmployeeListResponse {
  total: number
  page: number
  pageSize: number
  totalPages: number
  employees: EmployeeRow[]
}

interface EmployeeProfilesPageProps {
  onOpenEmployee: (empId: string) => void
}

/**
 * Employee Profiles page — matches 03-employee-profiles.html
 *
 * - 4 tabs at top (only first is functional with data)
 * - Two-column layout: LEFT filter panel + RIGHT 32-col data table
 */
export function EmployeeProfilesPage({ onOpenEmployee }: EmployeeProfilesPageProps) {
  const [activeTab, setActiveTab] = React.useState('posted-employees-list')

  // Filters
  const [statusFilter, setStatusFilter] = React.useState<'Working' | 'Active'>('Working')
  const [officeSchool, setOfficeSchool] = React.useState<'Both' | 'Office' | 'School'>('Both')
  const [district, setDistrict] = React.useState('MOHMAND')
  const [tehsil, setTehsil] = React.useState('')
  const [uc, setUc] = React.useState('')
  const [schoolGender, setSchoolGender] = React.useState('')
  const [schoolEmis, setSchoolEmis] = React.useState('')
  const [employeeQ, setEmployeeQ] = React.useState('')

  // Table state
  const [search, setSearch] = React.useState('')
  const [report, setReport] = React.useState(REPORTS_LIST[0])
  const [pageSize, setPageSize] = React.useState<string | number>(50)
  const [page, setPage] = React.useState(1)
  // No client-side sort by default — the API already returns rows ordered by
  // Preserve the API's default employee-id ordering until the user sorts.
  const [sortKey, setSortKey] = React.useState('')
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('asc')

  // Data
  const [districts, setDistricts] = React.useState<DistrictsResponse | null>(null)
  const [data, setData] = React.useState<EmployeeListResponse | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [employeesForDropdown, setEmployeesForDropdown] = React.useState<EmployeeRow[]>([])

  // Fetch districts list once
  React.useEffect(() => {
    fetch('/api/districts', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        // Only trust the payload if it has the shape the filters below expect —
        // an error/HTML response would otherwise crash the whole page.
        if (
          d &&
          Array.isArray(d.districts) &&
          Array.isArray(d.tehsils) &&
          Array.isArray(d.unionCouncils) &&
          Array.isArray(d.schools)
        ) {
          setDistricts(d as DistrictsResponse)
        } else {
          setDistricts(null)
        }
      })
      .catch(() => toast.error('Failed to load districts'))
  }, [])

  // Fetch employee list whenever filters change
  React.useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({
      status: statusFilter,
      officeSchool,
      district,
      tehsil,
      unionCouncil: uc,
      schoolGender,
      schoolEmis,
      search,
      page: String(page),
      pageSize: String(pageSize),
    })
    fetch(`/api/employees?${params}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (d?.employees) {
          setData(d)
          setEmployeesForDropdown(d.employees)
        } else {
          setData(null)
          setEmployeesForDropdown([])
        }
      })
      .catch(() => toast.error('Failed to load employees'))
      .finally(() => setLoading(false))
  }, [statusFilter, officeSchool, district, tehsil, uc, schoolGender, schoolEmis, search, page, pageSize])

  // Filter schools by selected district
  const schoolsForDistrict = React.useMemo(() => {
    if (!districts?.districts || !districts.schools) return []
    const d = districts.districts.find((x) => x.name === district)
    if (!d) return []
    return districts.schools.filter((s) => s.districtId === d.id)
  }, [districts, district])

  // Filter tehsils by district
  const tehsilsForDistrict = React.useMemo(() => {
    if (!districts?.districts || !districts.tehsils) return []
    const d = districts.districts.find((x) => x.name === district)
    if (!d) return []
    return districts.tehsils.filter((t) => t.districtId === d.id)
  }, [districts, district])

  const unionCouncilsForSelection = React.useMemo(() => {
    if (!districts?.unionCouncils) return []
    const districtOption = districts.districts.find((item) => item.name === district)
    const tehsilOption = tehsilsForDistrict.find((item) => item.name === tehsil)
    return districts.unionCouncils.filter((item) =>
      (!item.districtId || item.districtId === districtOption?.id) &&
      (!tehsil || item.tehsilId === tehsilOption?.id)
    )
  }, [districts, district, tehsil, tehsilsForDistrict])

  // Sort client-side for sortable columns (only when a sort key is selected —
  // by default no client-side sort is applied, so the API's empId-asc order is
  // preserved, matching the captured real site).
  const sortedEmployees = React.useMemo(() => {
    if (!data) return []
    const arr = [...data.employees]
    if (sortKey) {
      arr.sort((a, b) => {
        const av = toStr(a[sortKey])
        const bv = toStr(b[sortKey])
        if (av === bv) return 0
        const cmp = av.localeCompare(bv, undefined, { numeric: true })
        return sortDir === 'asc' ? cmp : -cmp
      })
    }
    return arr
  }, [data, sortKey, sortDir])

  function onSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  // Build the 32-column data table config
  const columns: ApexTableColumn[] = EMPLOYEE_TABLE_COLUMNS.map((c) => {
    // Action column — show link icon per row
    if (c.key === '_action') {
      return {
        key: c.key,
        label: c.label,
        headerAlign: 'center',
        cellAlign: 'center',
        render: (row) => (
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onOpenEmployee(String((row as EmployeeRow).empId))
            }}
            title="View Employee"
            className="inline-flex h-5 w-5 items-center justify-center text-[#1565c0] hover:bg-[#e8f0fb] rounded"
          >
            <LinkIcon />
          </a>
        ),
      }
    }
    if (c.key === 'name') {
      return {
        key: 'name',
        label: 'Name',
        sortable: true,
        render: (row) => (
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onOpenEmployee(String((row as EmployeeRow).empId))
            }}
            className="text-[#1565c0] hover:underline font-medium"
          >
            {toStr((row as EmployeeRow).name)}
          </a>
        ),
      }
    }
    // Date columns
    if ((c as { date?: boolean }).date) {
      return {
        key: c.key,
        label: c.label,
        sortable: true,
        render: (row) => fmtDate((row as EmployeeRow)[c.key] as string | null),
      }
    }
    if (c.key === 'tenure') {
      return {
        key: 'tenure',
        label: 'Tenure',
        render: (row) =>
          fmtTenure(
            (row as EmployeeRow).tenureYears,
            (row as EmployeeRow).tenureMonths,
            (row as EmployeeRow).tenureDays
          ),
      }
    }
    if (c.key === 'workingBPS') {
      return {
        key: 'workingBPS',
        label: 'BPS',
        sortable: true,
        render: (row) => {
          const v = (row as EmployeeRow).workingBPS
          return v ? `BPS-${v}` : ''
        },
      }
    }
    return {
      key: c.key,
      label: c.label,
      sortable: true,
      render: (row) => toStr((row as EmployeeRow)[c.key]),
    }
  })

  // Convert employee rows to plain records for the table
  const rows: Array<Record<string, unknown>> = sortedEmployees.map((e) => ({ ...e }))

  // Pagination range text
  const rangeStart = data && data.total > 0 ? (page - 1) * (typeof pageSize === 'number' ? pageSize : 50) + 1 : 0
  const rangeEnd = data ? Math.min(page * (typeof pageSize === 'number' ? pageSize : 50), data.total) : 0

  // Tab list for top tabs
  const tabs = EMPLOYEE_LIST_TABS.map((label, i) => ({
    id: i === 0 ? 'posted-employees-list' : `tab-${i}`,
    label,
  }))

  return (
    <div>
      <h1 className="mb-3 text-lg font-bold text-[#1565c0] sm:text-xl">Employee Profiles</h1>

      {/* Tab strip */}
      <ApexTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {activeTab !== 'posted-employees-list' ? (
        <div className="apex-region mt-3">
          <div className="apex-region-body">
            <div className="text-center text-gray-500 italic py-8">
              Data Not Found...!
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-col lg:flex-row gap-3">
          {/* LEFT filter panel */}
          <div className="w-full lg:w-[280px] shrink-0">
            <div className="apex-region">
              {/* APEX renders a zero-width placeholder header here; it is dead
                  space on a phone, so it only shows from the sm breakpoint up. */}
              <div className="apex-region-header hidden sm:flex" aria-hidden>
                <span className="text-transparent">HIDE_VALUE</span>
              </div>
              <div className="apex-region-body">
                {/* Status radios */}
                <fieldset className="apex-form-row">
                  <legend className="apex-form-label">Status</legend>
                  <div className="flex flex-col gap-1 text-xs">
                    {[
                      { label: 'Working', val: 'Working' as const },
                      { label: 'Active\\Deputation & Others', val: 'Active' as const },
                    ].map((s) => (
                      <label key={s.val} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          checked={statusFilter === s.val}
                          onChange={() => setStatusFilter(s.val)}
                          className="h-3 w-3 accent-[#1565c0]"
                        />
                        {s.label}
                      </label>
                    ))}
                  </div>
                </fieldset>

                {/* Office/School radios */}
                <fieldset className="apex-form-row">
                  <legend className="apex-form-label">Office/School</legend>
                  <div className="flex flex-col gap-1 text-xs">
                    {(['Both', 'Office', 'School'] as const).map((s) => (
                      <label key={s} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="officeSchool"
                          checked={officeSchool === s}
                          onChange={() => setOfficeSchool(s)}
                          className="h-3 w-3 accent-[#1565c0]"
                        />
                        {s}
                      </label>
                    ))}
                  </div>
                </fieldset>

                {/* District combobox */}
                <div className="apex-form-row">
                  <label className="apex-form-label">District</label>
                  <select
                    value={district}
                    onChange={(e) => {
                      setDistrict(e.target.value)
                      setTehsil('')
                      setSchoolEmis('')
                      setUc('')
                    }}
                    className="apex-select"
                  >
                    {districts?.districts.map((d) => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

                {/* Tehsil combobox */}
                <div className="apex-form-row">
                  <label className="apex-form-label">Tehsil</label>
                  <select
                    value={tehsil}
                    onChange={(e) => setTehsil(e.target.value)}
                    className="apex-select"
                  >
                    <option value="">— Select —</option>
                    {tehsilsForDistrict.map((t) => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>

                {/* Union Council combobox */}
                <div className="apex-form-row">
                  <label className="apex-form-label">Union Council</label>
                  <select
                    value={uc}
                    onChange={(e) => setUc(e.target.value)}
                    className="apex-select"
                  >
                    <option value="">— Select —</option>
                    {unionCouncilsForSelection.map((item) => (
                      <option key={item.id} value={item.name}>{item.name}</option>
                    ))}
                  </select>
                </div>

                {/* School Gender combobox */}
                <div className="apex-form-row">
                  <label className="apex-form-label">School Gender</label>
                  <select
                    value={schoolGender}
                    onChange={(e) => setSchoolGender(e.target.value)}
                    className="apex-select"
                  >
                    <option value="">-- Select Gender --</option>
                    <option value="MALE">MALE</option>
                    <option value="FEMALE">FEMALE</option>
                    <option value="MIXED">MIXED</option>
                  </select>
                </div>

                {/* Office/School List */}
                <div className="apex-form-row">
                  <label className="apex-form-label">Office/School List</label>
                  <select
                    value={schoolEmis}
                    onChange={(e) => setSchoolEmis(e.target.value)}
                    className="apex-select"
                  >
                    <option value="">— Select —</option>
                    {schoolsForDistrict.map((s) => (
                      <option key={s.id} value={s.emisCode}>
                        {s.name} ({s.emisCode})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Employee List */}
                <div className="apex-form-row">
                  <label className="apex-form-label">Employee List</label>
                  <select
                    value={employeeQ}
                    onChange={(e) => {
                      setEmployeeQ(e.target.value)
                      if (e.target.value) {
                        onOpenEmployee(e.target.value)
                      }
                    }}
                    className="apex-select"
                  >
                    <option value="">— Select —</option>
                    {employeesForDropdown.map((emp) => (
                      <option key={emp.id} value={emp.empId}>
                        {emp.name} ({emp.empId})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT data table panel */}
          <div className="flex-1 min-w-0">
            <div className="apex-region">
              <div className="apex-region-header">
                <span>Posted Employees List</span>
                <span className="text-xs text-gray-500">
                  {loading
                    ? 'Loading…'
                    : `${rangeStart} - ${rangeEnd} of ${data?.total ?? 0}`}
                </span>
              </div>
              <div className="apex-region-body p-2">
                {/* Toolbar */}
                <div className="flex flex-wrap items-end gap-2 mb-2">
                  <button type="button" className="apex-btn">
                    Select columns to search
                  </button>
                  <div className="flex-1 min-w-[180px]">
                    <label className="apex-form-label">Search Report</label>
                    <input
                      type="text"
                      placeholder="Search…"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value)
                        setPage(1)
                      }}
                      className="apex-input"
                    />
                  </div>
                  <button
                    type="button"
                    className="apex-btn apex-btn--primary"
                    onClick={() => {
                      setPage(1)
                    }}
                  >
                    Search
                  </button>
                  <div className="min-w-[180px]">
                    <label className="apex-form-label">Reports</label>
                    <select
                      value={report}
                      onChange={(e) => setReport(e.target.value)}
                      className="apex-select"
                    >
                      {REPORTS_LIST.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <button type="button" className="apex-btn">
                    View Report
                  </button>
                  <button type="button" className="apex-btn">
                    View Pivot
                  </button>
                  <div>
                    <label className="apex-form-label">Rows</label>
                    <select
                      value={String(pageSize)}
                      onChange={(e) => {
                        const v = e.target.value
                        setPageSize(v === 'All' ? 'All' : parseInt(v, 10))
                        setPage(1)
                      }}
                      className="apex-select w-[80px] sm:w-[90px]"
                    >
                      {ROWS_PER_PAGE.map((v) => (
                        <option key={String(v)} value={String(v)}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <button type="button" className="apex-btn">
                    Actions
                  </button>
                  <button type="button" className="apex-btn" disabled title="School admin role — disabled">
                    Add Employee
                  </button>
                </div>

                {/* Data table */}
                <ApexTable
                  columns={columns}
                  rows={rows}
                  emptyText="Employee Data Not Found...!"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={onSort}
                />

                {/* Pagination */}
                <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
                  <span>
                    {rangeStart} - {rangeEnd} of {data?.total ?? 0}
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      className="apex-btn"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      « Prev
                    </button>
                    <span className="px-2 py-1">{page} / {data?.totalPages ?? 1}</span>
                    <button
                      type="button"
                      className="apex-btn"
                      disabled={!data || page >= data.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next »
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function LinkIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}
