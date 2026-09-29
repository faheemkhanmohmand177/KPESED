'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { ArrowLeft, UserCircle, Image as ImageIcon, Plus, Pencil } from 'lucide-react'
import { ApexTabs } from './ui/apex-tabs'
import { ApexTable, type ApexTableColumn } from './ui/apex-table'
import {
  EMPLOYEE_DETAIL_TABS,
  PRO_1_FIELDS,
  PRO_2_FIELDS,
  COVID_FIELDS,
  QUALIFICATION_COLUMNS,
  POSTING_COLUMNS,
  BPS_COLUMNS,
  JOB_TYPE_COLUMNS,
  CADRE_COLUMNS,
  FAMILY_COLUMNS,
  BANK_COLUMNS,
} from '@/lib/constants'
import { fmtDate, toStr } from '@/lib/date'

interface EmployeeDetail {
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
  phone: string | null
  maritalStatus: string | null
  motherTongue: string | null
  gpFund: string | null
  email: string | null
  spouseEmploymentStatus: string | null
  country: string | null
  division: string | null
  tehsilName: string | null
  ucName: string | null
  religion: string | null
  initialRecruitmentInESED: string | null
  esedAppointmentQuota: string | null
  xCoordinate: number | null
  currentAddress: string | null
  dateOfEntryIntoGovtService: string | null
  mobileSms: string | null
  bloodGroup: string | null
  disability: string | null
  ntnNo: string | null
  passportNo: string | null
  isSpouseWorkingInESED: string | null
  province: string | null
  districtName: string | null
  domicile: string | null
  chronicDisease: string | null
  initialRecruitment1stOrderDate: string | null
  dualNationality: string | null
  yCoordinate: number | null
  permanentAddress: string | null
  covidVaccinated: string | null
  covidReason: string | null
  covidMessage: string | null
  level: string | null
  cadreGroup: string | null
  cadreDesignation: string | null
  status: string | null
  jobType: string | null
  isDeputation: string | null
  postings: Array<{
    id: string
    ddoCode: string | null
    schoolName: string | null
    emisCode: string | null
    designation: string | null
    bps: number | null
    fromDate: string | null
    toDate: string | null
    status: string | null
    placementType: string | null
    postingType: string | null
    isDeputation: string | null
    notificationDetail: string | null
    notificationTitle: string | null
    retirementNotification: string | null
  }>
  bpsHistory: Array<{
    id: string
    bps: number
    fromDate: string | null
    toDate: string | null
    status: string | null
    remarks: string | null
    notificationDetail: string | null
  }>
  jobTypeHistory: Array<{
    id: string
    jobType: string
    fromDate: string | null
    toDate: string | null
    status: string | null
    remarks: string | null
    notificationDetail: string | null
  }>
  cadreHistory: Array<{
    id: string
    cadreGroup: string
    designation: string | null
    bps: number | null
    fromDate: string | null
    toDate: string | null
    status: string | null
    seniorityNumber: string | null
  }>
  qualifications: Array<{
    id: string
    category: string
    specialty: string | null
    collegeUniversity: string | null
    board: string | null
    totalMarks: number | null
    obtainedMarks: number | null
    percentage: number | null
    regularPrivate: string | null
    sessionYear: string | null
  }>
  familyMembers: Array<{
    id: string
    dependentName: string
    relationship: string | null
    gender: string | null
    dateOfBirth: string | null
    personnelNo: string | null
    department: string | null
    designationBPS: string | null
    isDependent: string | null
    disability: string | null
    cnicOrFormB: string | null
    nextOfKin: string | null
    kinSignature: string | null
    kinAddress: string | null
  }>
  bankDetails: Array<{
    id: string
    accountTitle: string | null
    bankName: string | null
    bankCode: string | null
    accountNo: string | null
    iban: string | null
    monthlySalary: number | null
    address: string | null
    district: string | null
    forPensioner: string | null
    status: string | null
  }>
  leavesDetail: Array<{ id: string }>
  trainings: Array<{ id: string }>
  documents: Array<{ id: string }>
  [key: string]: unknown
}

interface EmployeeDetailPageProps {
  empId: string
  onBack: () => void
}

/**
 * Employee Detail page — matches 04-employee-detail-with-tabs.html
 *
 * - Top toolbar: Back + Update Profile (disabled) + Update Picture (disabled)
 * - Title: "Employee Details"
 * - 12 tabs — each shows the relevant sub-table or fields
 *   1. Basic Information (PRO_1 + PRO_2 + COVID)
 *   2. Education/Professional Qualification (Academic + Professional + Diploma tables)
 *   3. Posting / Transfer (table)
 *   4. BPS (table)
 *   5. Job Type (table)
 *   6. Cadre Group (table)
 *   7. Speciality (table or empty)
 *   8. Family Detail (table)
 *   9. Bank Detail (table)
 *   10. Leaves Detail (empty state on real site)
 *   11. Training Detail (empty state on real site)
 *   12. Documents (empty state on real site)
 */
export function EmployeeDetailPage({ empId, onBack }: EmployeeDetailPageProps) {
  const [employee, setEmployee] = React.useState<EmployeeDetail | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [activeTab, setActiveTab] = React.useState<string>('basic-information')

  React.useEffect(() => {
    setLoading(true)
    fetch(`/api/employees/${empId}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (d?.employee) setEmployee(d.employee)
        else toast.error('Employee not found')
      })
      .catch(() => toast.error('Failed to load employee'))
      .finally(() => setLoading(false))
  }, [empId])

  const tabs = EMPLOYEE_DETAIL_TABS.map((label, i) => ({
    id: i === 0 ? 'basic-information' : label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    label,
  }))

  return (
    <div>
      {/* Top toolbar */}
      <div className="flex items-center gap-2 mb-3">
        <button type="button" onClick={onBack} className="apex-btn apex-btn--primary">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
        <button type="button" className="apex-btn" disabled title="Disabled — school admin role">
          <Pencil className="h-3.5 w-3.5" /> Update Profile
        </button>
        <button type="button" className="apex-btn" disabled title="Disabled — school admin role">
          <ImageIcon className="h-3.5 w-3.5" /> Update Picture
        </button>
        <div className="ml-auto text-xs text-gray-500">
          {employee ? (
            <>
              <span className="font-medium">{employee.name}</span>
              {employee.cnic ? ` · CNIC ${employee.cnic}` : ''}
              {employee.personnelNo ? ` · Pers. # ${employee.personnelNo}` : ''}
            </>
          ) : null}
        </div>
      </div>

      <h1 className="mb-3 text-lg font-bold text-[#1565c0] sm:text-xl">Employee Details</h1>

      {loading ? (
        <div className="apex-region">
          <div className="apex-region-body py-12 text-center text-gray-500 text-sm">
            Loading employee…
          </div>
        </div>
      ) : !employee ? (
        <div className="apex-region">
          <div className="apex-region-body py-12 text-center text-gray-500 italic">
            Employee not found.
          </div>
        </div>
      ) : (
        <>
          <ApexTabs tabs={tabs} active={activeTab} onChange={setActiveTab} className="mt-3" />
          <div className="mt-3">
            <TabContent
              tab={activeTab}
              employee={employee}
            />
          </div>
        </>
      )}
    </div>
  )
}

function TabContent({ tab, employee }: { tab: string; employee: EmployeeDetail }) {
  switch (tab) {
    case 'basic-information':
      return <BasicInfoTab employee={employee} />
    case 'education-professional-qualification':
      return <EducationTab employee={employee} />
    case 'posting-transfer':
      return <PostingTab employee={employee} />
    case 'bps':
      return <BpsTab employee={employee} />
    case 'job-type':
      return <JobTypeTab employee={employee} />
    case 'cadre-group':
      return <CadreTab employee={employee} />
    case 'speciality':
      return <SpecialityTab employee={employee} />
    case 'family-detail':
      return <FamilyTab employee={employee} />
    case 'bank-detail':
      return <BankTab employee={employee} />
    case 'leaves-detail':
      return <EmptyStateTab title="Leaves Detail" emptyText="Leave Details Data Not Found...!" btnLabel="Add Leaves Detail" />
    case 'training-detail':
      return <EmptyStateTab title="Training Detail" emptyText="Training Details Data Not Found …!" btnLabel="Add Training Detail" />
    case 'documents':
      return <EmptyStateTab title="Documents" emptyText="Document Details Not Found …!" btnLabel="Add Documents" />
    default:
      return null
  }
}

function EmptyStateTab({ title, emptyText, btnLabel }: { title: string; emptyText: string; btnLabel: string }) {
  return (
    <div className="apex-region">
      <div className="apex-region-header">
        <span>{title}</span>
        <button className="apex-btn apex-btn--primary" disabled>
          <Plus className="h-3.5 w-3.5" /> {btnLabel}
        </button>
      </div>
      <div className="apex-region-body">
        <div className="text-center text-gray-500 italic py-8">{emptyText}</div>
      </div>
    </div>
  )
}

// ─── Tab 1: Basic Information ────────────────────────────────────────────────
function BasicInfoTab({ employee }: { employee: EmployeeDetail }) {
  const renderField = (label: string, key: string, date?: boolean) => {
    let val: unknown = employee[key]
    if (date) val = fmtDate(val as string | null)
    return (
      <div className="flex flex-col">
        <span className="text-[11px] text-gray-500 font-semibold">{label} :</span>
        <span className="text-[12px] text-gray-800">{toStr(val) || <span className="text-gray-400">—</span>}</span>
      </div>
    )
  }
  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* PRO_1 */}
        <div className="apex-region">
          <div className="apex-region-header">
            <span>Personal Information (PRO_1)</span>
          </div>
          <div className="apex-region-body">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2">
              {PRO_1_FIELDS.map((f) => (
                <React.Fragment key={f.key}>
                  {renderField(f.label, f.key, f.date)}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
        {/* PRO_2 */}
        <div className="apex-region">
          <div className="apex-region-header">
            <span>Additional Personal Information (PRO_2)</span>
          </div>
          <div className="apex-region-body">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2">
              {PRO_2_FIELDS.map((f) => (
                <React.Fragment key={f.key}>
                  {renderField(f.label, f.key, f.date)}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* COVID section */}
      <div className="apex-region mt-3">
        <div className="apex-region-header">
          <span>COVID-19 Information</span>
        </div>
        <div className="apex-region-body">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-3 gap-y-2">
            {COVID_FIELDS.map((f) => (
              <React.Fragment key={f.key}>
                {renderField(f.label, f.key)}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3">
        <button className="apex-btn apex-btn--primary">
          <UserCircle className="h-3.5 w-3.5" /> Profile Card
        </button>
      </div>
    </div>
  )
}

// ─── Tab 2: Education / Professional Qualification ────────────────────────────
function EducationTab({ employee }: { employee: EmployeeDetail }) {
  const academic = employee.qualifications.filter((q) => q.category === 'Academic')
  const professional = employee.qualifications.filter((q) => q.category === 'Professional')
  const diploma = employee.qualifications.filter((q) => q.category === 'Diploma')

  const makeCols = (): ApexTableColumn[] =>
    QUALIFICATION_COLUMNS.map((label, i) => ({
      key: String(i),
      label,
      render: (row: Record<string, unknown>) => toStr(row[String(i)]),
    }))

  const toRows = (list: EmployeeDetail['qualifications']) =>
    list.map((q) => ({
      0: q.category,
      1: q.specialty,
      2: q.collegeUniversity,
      3: q.totalMarks,
      4: q.obtainedMarks,
      5: q.percentage,
      6: q.regularPrivate,
      7: q.sessionYear,
    } as Record<string, unknown>))

  return (
    <div>
      <div className="flex justify-end mb-2">
        <button className="apex-btn apex-btn--primary" disabled title="Disabled — school admin role">
          <Plus className="h-3.5 w-3.5" /> Add Qualification Record
        </button>
      </div>

      {/* Academic */}
      <div className="apex-region">
        <div className="apex-region-header">
          <span>Academic</span>
          <span className="text-xs text-gray-500">Total Records : {academic.length}</span>
        </div>
        <div className="apex-region-body p-0">
          <ApexTable
            columns={makeCols()}
            rows={toRows(academic)}
            emptyText="Academic Data Not Found...!"
          />
        </div>
      </div>

      {/* Professional */}
      <div className="apex-region">
        <div className="apex-region-header">
          <span>Professional</span>
          <span className="text-xs text-gray-500">Total Records : {professional.length}</span>
        </div>
        <div className="apex-region-body p-0">
          <ApexTable
            columns={makeCols()}
            rows={toRows(professional)}
            emptyText="Professional Data Not Found...!"
          />
        </div>
      </div>

      {/* Diploma/Certificate */}
      <div className="apex-region">
        <div className="apex-region-header">
          <span>Diploma/Certificate</span>
          <span className="text-xs text-gray-500">Total Records : {diploma.length}</span>
        </div>
        <div className="apex-region-body p-0">
          <ApexTable
            columns={makeCols()}
            rows={toRows(diploma)}
            emptyText="Diploma/Certificate Data Not Found...!"
          />
        </div>
      </div>
    </div>
  )
}

// ─── Tab 3: Posting / Transfer ────────────────────────────────────────────────
function PostingTab({ employee }: { employee: EmployeeDetail }) {
  const columns: ApexTableColumn[] = POSTING_COLUMNS.map((label, i) => ({
    key: String(i),
    label,
    render: (row: Record<string, unknown>) => {
      if (label === 'BPS') {
        // The real captured Posting/Transfer tab shows BPS as just the number
        // (e.g. "16", "12") — NOT prefixed with "BPS-".
        const v = row.bps
        return v !== null && v !== undefined && v !== '' ? String(v) : ''
      }
      if (label === 'From Date' || label === 'To Date') {
        return fmtDate(row[label] as string | null)
      }
      // Last column — add Update Notification link
      if (i === POSTING_COLUMNS.length - 1) {
        const v = toStr(row[label])
        return (
          <span>
            {v || <span className="text-gray-400">—</span>}{' '}
            <a href="#" onClick={(e) => e.preventDefault()} className="text-[#1565c0] hover:underline text-[11px]">
              Update Notification
            </a>
          </span>
        )
      }
      return toStr(row[label])
    },
  }))

  const rows = employee.postings.map((p) => ({
    'DDO Code': p.ddoCode,
    'Office/School': p.schoolName,
    'Designation': p.designation,
    'BPS': p.bps,
    'From Date': p.fromDate,
    'To Date': p.toDate,
    'Status': p.status,
    'Placement Type': p.placementType,
    'Posting Type': p.postingType,
    'Is Deputation': p.isDeputation,
    'Notification Detail': p.notificationDetail,
    'Notification Title': p.notificationTitle,
    'Retirement Notification': p.retirementNotification,
  } as Record<string, unknown>))

  return (
    <div>
      <div className="flex justify-end gap-2 mb-2">
        <button className="apex-btn">Change Requests</button>
        <button className="apex-btn apex-btn--primary" disabled>
          <Plus className="h-3.5 w-3.5" /> Add New Record
        </button>
      </div>
      <div className="apex-region">
        <div className="apex-region-header">
          <span>Posting / Transfer</span>
          <span className="text-xs text-gray-500">Total Records : {employee.postings.length}</span>
        </div>
        <div className="apex-region-body p-0">
          <ApexTable columns={columns} rows={rows} emptyText="Posting Data Not Found...!" />
        </div>
      </div>
    </div>
  )
}

// ─── Tab 4: BPS ──────────────────────────────────────────────────────────────
function BpsTab({ employee }: { employee: EmployeeDetail }) {
  const columns: ApexTableColumn[] = BPS_COLUMNS.map((label) => ({
    key: label,
    label,
    render: (row: Record<string, unknown>) => {
      if (label === 'BPS') {
        const v = row.bps
        return v ? `BPS-${v}` : ''
      }
      if (label === 'From Date' || label === 'To Date') {
        return fmtDate(row[label] as string | null)
      }
      return toStr(row[label])
    },
  }))
  const rows = employee.bpsHistory.map((b) => ({
    'BPS': b.bps,
    'From Date': b.fromDate,
    'To Date': b.toDate,
    'Status': b.status,
    'Remarks': b.remarks,
    'Notification Detail': b.notificationDetail,
  } as Record<string, unknown>))
  return (
    <div>
      <div className="flex justify-end mb-2">
        <button className="apex-btn apex-btn--primary" disabled>
          <Plus className="h-3.5 w-3.5" /> Add BPS Record
        </button>
      </div>
      <div className="apex-region">
        <div className="apex-region-header">
          <span>BPS</span>
          <span className="text-xs text-gray-500">Total Records : {employee.bpsHistory.length}</span>
        </div>
        <div className="apex-region-body p-0">
          <ApexTable columns={columns} rows={rows} emptyText="BPS Data Not Found...!" />
        </div>
      </div>
    </div>
  )
}

// ─── Tab 5: Job Type ─────────────────────────────────────────────────────────
function JobTypeTab({ employee }: { employee: EmployeeDetail }) {
  const columns: ApexTableColumn[] = JOB_TYPE_COLUMNS.map((label) => ({
    key: label,
    label,
    render: (row: Record<string, unknown>) => {
      if (label === 'From Date' || label === 'To Date') {
        return fmtDate(row[label] as string | null)
      }
      return toStr(row[label])
    },
  }))
  const rows = employee.jobTypeHistory.map((j) => ({
    'Job Type': j.jobType,
    'From Date': j.fromDate,
    'To Date': j.toDate,
    'Status': j.status,
    'Remarks': j.remarks,
    'Notification Detail': j.notificationDetail,
  } as Record<string, unknown>))
  return (
    <div>
      <div className="flex justify-end mb-2">
        <button className="apex-btn apex-btn--primary" disabled>
          <Plus className="h-3.5 w-3.5" /> Add Job Type Record
        </button>
      </div>
      <div className="apex-region">
        <div className="apex-region-header">
          <span>Job Type</span>
          <span className="text-xs text-gray-500">Total Records : {employee.jobTypeHistory.length}</span>
        </div>
        <div className="apex-region-body p-0">
          <ApexTable columns={columns} rows={rows} emptyText="Job Type Data Not Found...!" />
        </div>
      </div>
    </div>
  )
}

// ─── Tab 6: Cadre Group ───────────────────────────────────────────────────────
function CadreTab({ employee }: { employee: EmployeeDetail }) {
  const columns: ApexTableColumn[] = CADRE_COLUMNS.map((label) => ({
    key: label,
    label,
    render: (row: Record<string, unknown>) => {
      if (label === 'BPS') {
        const v = row.bps
        return v ? `BPS-${v}` : ''
      }
      if (label === 'From Date' || label === 'To Date') {
        return fmtDate(row[label] as string | null)
      }
      return toStr(row[label])
    },
  }))
  const rows = employee.cadreHistory.map((c) => ({
    'Cadre Group': c.cadreGroup,
    'Designation': c.designation,
    'BPS': c.bps,
    'From Date': c.fromDate,
    'To Date': c.toDate,
    'Status': c.status,
    'Seniority Number': c.seniorityNumber,
  } as Record<string, unknown>))
  return (
    <div>
      <div className="flex justify-end mb-2">
        <button className="apex-btn apex-btn--primary" disabled>
          <Plus className="h-3.5 w-3.5" /> Add Cadre Record
        </button>
      </div>
      <div className="apex-region">
        <div className="apex-region-header">
          <span>Cadre Group</span>
          <span className="text-xs text-gray-500">Total Records : {employee.cadreHistory.length}</span>
        </div>
        <div className="apex-region-body p-0">
          <ApexTable columns={columns} rows={rows} emptyText="Cadre Data Not Found...!" />
        </div>
      </div>
    </div>
  )
}

// ─── Tab 7: Speciality ────────────────────────────────────────────────────────
function SpecialityTab({ employee }: { employee: EmployeeDetail }) {
  // The real site has either an empty state OR shows a "Research work" record
  // We don't have a speciality field on Employee in the schema, but we can
  // derive one: if any qualification contains "Research", show it.
  const researchQuals = employee.qualifications.filter((q) =>
    (q.specialty || '').toLowerCase().includes('research')
  )
  const columns: ApexTableColumn[] = ['Specialty', 'Specialty Tree'].map((label, i) => ({
    key: String(i),
    label,
  }))
  const rows = researchQuals.map((q) => ({
    0: q.specialty,
    1: 'Research work',
  } as Record<string, unknown>))
  return (
    <div>
      <div className="flex justify-end mb-2">
        <button className="apex-btn apex-btn--primary" disabled>
          <Plus className="h-3.5 w-3.5" /> Add Specialty Record
        </button>
      </div>
      <div className="apex-region">
        <div className="apex-region-header">
          <span>Speciality</span>
          <span className="text-xs text-gray-500">Total Records : {rows.length}</span>
        </div>
        <div className="apex-region-body p-0">
          <ApexTable columns={columns} rows={rows} emptyText="Specialty Data Not Found...!" />
        </div>
      </div>
    </div>
  )
}

// ─── Tab 8: Family Detail ──────────────────────────────────────────────────────
function FamilyTab({ employee }: { employee: EmployeeDetail }) {
  const columns: ApexTableColumn[] = FAMILY_COLUMNS.map((label, i) => ({
    key: String(i),
    label,
    render: (row: Record<string, unknown>) => {
      if (label === 'Date of Birth') {
        return fmtDate(row[i] as string | null)
      }
      if (label === 'Kin Signature') {
        return (
          <a href="#" onClick={(e) => e.preventDefault()} className="text-[#1565c0] hover:underline text-[11px]">
            Add Kin Signature
          </a>
        )
      }
      return toStr(row[i])
    },
  }))
  const rows = employee.familyMembers.map((m) => ({
    0: m.dependentName,
    1: m.relationship,
    2: m.gender,
    3: m.dateOfBirth,
    4: m.personnelNo,
    5: m.department,
    6: m.designationBPS,
    7: m.isDependent,
    8: m.disability,
    9: m.cnicOrFormB,
    10: m.nextOfKin,
    11: m.kinSignature,
    12: m.kinAddress,
  } as Record<string, unknown>))
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-2 mb-2">
        <div className="flex items-end gap-2">
          <div>
            <label className="apex-form-label">Search:</label>
            <input type="text" placeholder="All Text Columns" className="apex-input" />
          </div>
          <button className="apex-btn">Actions</button>
        </div>
        <button className="apex-btn apex-btn--primary" disabled>
          <Plus className="h-3.5 w-3.5" /> Add Family Record
        </button>
      </div>
      <div className="apex-region">
        <div className="apex-region-header">
          <span>Family Detail</span>
          <span className="text-xs text-gray-500">Total Records : {employee.familyMembers.length}</span>
        </div>
        <div className="apex-region-body p-0">
          <ApexTable columns={columns} rows={rows} emptyText="Family Data Not Found...!" />
        </div>
      </div>
    </div>
  )
}

// ─── Tab 9: Bank Detail ────────────────────────────────────────────────────────
function BankTab({ employee }: { employee: EmployeeDetail }) {
  const columns: ApexTableColumn[] = BANK_COLUMNS.map((label, i) => ({
    key: String(i),
    label,
    render: (row: Record<string, unknown>) => toStr(row[i]),
  }))
  const rows = employee.bankDetails.map((b) => ({
    0: b.accountTitle,
    1: b.bankName,
    2: b.bankCode,
    3: b.accountNo,
    4: b.iban,
    5: b.monthlySalary,
    6: b.address,
    7: b.district,
    8: b.forPensioner,
    9: b.status,
  } as Record<string, unknown>))
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-2 mb-2">
        <div className="flex items-end gap-2">
          <div>
            <label className="apex-form-label">Search:</label>
            <input type="text" placeholder="All Text Columns" className="apex-input" />
          </div>
          <button className="apex-btn">Actions</button>
        </div>
        <button className="apex-btn apex-btn--primary" disabled>
          <Plus className="h-3.5 w-3.5" /> Add Bank Detail
        </button>
      </div>
      <div className="apex-region">
        <div className="apex-region-header">
          <span>Bank Detail</span>
          <span className="text-xs text-gray-500">Total Records : {employee.bankDetails.length}</span>
        </div>
        <div className="apex-region-body p-0">
          <ApexTable columns={columns} rows={rows} emptyText="Bank Data Not Found...!" />
        </div>
      </div>
    </div>
  )
}
