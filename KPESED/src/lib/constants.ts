/*
 * KPESE HRMIS — Constants
 *
 * Integrated EMIS portal navigation structure.
 *
 * Reference: agent-ctx/SITE-STRUCTURE.md
 */

// ─── Navigation Tree (sidebar) ──────────────────────────────────────────────
// Matches the 12 top-level items on the real site's sidebar tree.
// HR MIS expands to 4 sub-items.
export { NAV_TREE, NAV_LEAF_COUNT } from './portal-navigation'
export type { NavItem } from './portal-navigation'

// ─── Employee Profiles page tabs ─────────────────────────────────────────────
export const EMPLOYEE_LIST_TABS = [
  'Posted Employees List',
  'All Retired Employees',
  'Resign/Death/Shuhada/Removed/Others Employees',
  'Not Posted Employees List',
] as const

// ─── 32-column employee table definition ────────────────────────────────────
export interface EmployeeColumn {
  key: string
  label: string
  // Format function applies a transformation to the value
  // (e.g. date formatting)
}

export const EMPLOYEE_TABLE_COLUMNS: EmployeeColumn[] = [
  { key: '_action', label: '' }, // 1: action column with link icon
  { key: 'name', label: 'Name' }, // 2
  { key: 'fatherOrHusbandName', label: 'Father/Husband Name' }, // 3
  { key: 'gender', label: 'Gender' }, // 4
  { key: 'cnic', label: 'CNIC #' }, // 5
  { key: 'personnelNo', label: 'Personnel #' }, // 6
  { key: 'emisCode', label: 'EMIS Code' }, // 7
  { key: 'schoolName', label: 'Office/School' }, // 8
  { key: 'schoolGender', label: 'School Gender' }, // 9
  { key: 'ddoCode', label: 'DDO Code' }, // 10
  { key: 'placementType', label: 'Placement Type' }, // 11
  { key: 'postingType', label: 'Posting Type' }, // 12
  { key: 'externalPlacement', label: 'External Placement' }, // 13
  { key: 'workingDesignation', label: 'Working Designation' }, // 14
  { key: 'workingBPS', label: 'BPS' }, // 15
  { key: 'currentPostingDate', label: 'Current Posting Date', date: true } as EmployeeColumn & { date: true }, // 16
  { key: 'tenure', label: 'Tenure' }, // 17 — formatted "Y (Y) M (M) D (D)"
  { key: 'dateOfBirth', label: 'Date of Birth', date: true } as EmployeeColumn & { date: true }, // 18
  { key: 'dateOfEntryIntoGovtService', label: 'Date of 1st Entry', date: true } as EmployeeColumn & { date: true }, // 19
  { key: 'mobileSms', label: 'Mobile #' }, // 20
  { key: 'isDeputation', label: 'Is Deputation' }, // 21
  { key: 'tehsilName', label: 'Tehsil' }, // 22
  { key: 'domicile', label: 'Domicile' }, // 23
  { key: 'initialRecruitmentInESED', label: 'Initial recruitment in ESED' }, // 24
  { key: 'districtName', label: 'District' }, // 25
  { key: 'email', label: 'Email' }, // 26
  { key: 'initialRecruitment1stOrderDate', label: 'Initial recruitment in ESED (1st Order Date)', date: true } as EmployeeColumn & { date: true }, // 27
  { key: 'level', label: 'Level' }, // 28
  { key: 'cadreGroup', label: 'Cadre Group' }, // 29
  { key: 'cadreDesignation', label: 'Cadre Designation' }, // 30
  { key: 'status', label: 'Status' }, // 31
  { key: 'jobType', label: 'Job Type' }, // 32
]

// ─── 57 reports list (faithfully captured from the real site's Reports dropdown) ────
// These are the actual reports shown in the "Public" optgroup of the IRR saved
// reports selector on /employee-search (R520365247587798985_saved_reports).
export const REPORTS_LIST: string[] = [
  '1. Primary Report', // default optgroup "Default"
  '1. 0.new appointment',
  '2. 0.new appointment Saleem',
  '3. 16 AND BELOW WRONG POSTING REPORT',
  '4. 17 AND ABOVE WRONG POSTING REPORT BY NOOR',
  '5. 17 AND POSTING TRANSFER',
  '6. Age Report',
  '7. Appointment Quota Report',
  '8. BASICS MINORITY AND DISABLED',
  '9. BILAL FILE UPDATION _',
  '10. BILAL MISSING FILE 1',
  '11. bilal teachers',
  '12. CIRCLE MARDAN KHASS ONLY',
  '13. CORRECTION IN PLACEMENT TYPE OF EMPLOYEES',
  '14. Date of 1st Entery',
  '15. Employee having null DDO Code',
  '16. EMPLOYEE VERIFICATION-PEMIS REPORT',
  '17. employees basics',
  '18. Employees having Null or wrong DDO Codes-Directorate E&SE',
  '19. Employees NULL DDO',
  '20. EMPLOYEES NULL FILEDS UPDATION IN PROFILE',
  '21. GHS Ambar',
  '22. GMS Mahora',
  '23. Middle Schools1982024',
  '24. MISSING FILEDS',
  '25. MISSING FILEDS (UPDATED STYLE)',
  '26. Not enter employee name',
  '27. Office on Disposal (Zahid)',
  '28. Officers on Disposal (Zahid)',
  '29. Ok',
  '30. personal number and phone',
  '31. PST82024',
  '32. REGULAR EMPLOYEES',
  '33. Report showing variation in Cadre Group, Cadre Designation and Working Designation',
  '34. Report showing variation in Cadre Group, Cadre Designation and Working Designation',
  '35. Retired',
  '36. Retired Employees with Retirement Date 28-8-2025',
  '37. Saleem Akhtar',
  '38. Saleem Akhtar new appointees',
  '39. Sarwat bagm',
  '40. School Wise Control Break',
  '41. SCHOOL WISE HR REPORT (MOHMAND) BY ARM',
  '42. SCHOOLWISE HR REPORT (MOHMAND)',
  '43. SCHOOLWISE STAFF',
  '44. Shoukat',
  '45. Staff List',
  '46. Staff List',
  '47. TAHIR ECE',
  '48. teachers important data fields',
  '49. test',
  '50. training',
  '51. UPDATION/VERIFICATION OF HR',
  '52. UPDATION/VERIFICATION OF HR By ARM (Excluding UC)',
  '53. WRONG DATE OF BIRTH i.e UNDERAGE EMPLOYEES',
  '54. WRONG DATE OF BIRTH/RETIRED  EMPLOYEES REPORT',
  '55. Wrong DDO codes (South)',
  '56. WRONG POSTING REPORT BY NOOR',
  '57. ZZZZZZZZZ',
]

// ─── Rows-per-page options for the employee table ────────────────────────────
export const ROWS_PER_PAGE: (number | string)[] = [1, 5, 10, 15, 20, 25, 50, 100, 1000, 'All']

// ─── Employee Detail — 12 tabs ───────────────────────────────────────────────
export const EMPLOYEE_DETAIL_TABS = [
  'Basic Information',
  'Education/Professional Qualification',
  'Posting / Transfer',
  'BPS',
  'Job Type',
  'Cadre Group',
  'Speciality',
  'Family Detail',
  'Bank Detail',
  'Leaves Detail',
  'Training Detail',
  'Documents',
] as const

// ─── PRO_1 fields for Basic Information tab ──────────────────────────────────
// Matches the real captured PRO_1 region from employee-detail page.
export const PRO_1_FIELDS: { label: string; key: string; date?: boolean }[] = [
  { label: 'Date of Birth', key: 'dateOfBirth', date: true },
  { label: 'Phone #', key: 'phone' },
  { label: 'Marital Status', key: 'maritalStatus' },
  { label: 'Mother Tongue', key: 'motherTongue' },
  { label: 'GP Fund', key: 'gpFund' },
  { label: 'Email Address', key: 'email' },
  { label: 'Spouse Employment Status', key: 'spouseEmploymentStatus' },
  { label: 'Country', key: 'country' },
  { label: 'Division', key: 'division' },
  { label: 'Tehsil', key: 'tehsilName' },
  { label: 'NC/VC', key: 'ucName' },
  { label: 'Religion', key: 'religion' },
  { label: 'Initial recruitment in ESED', key: 'initialRecruitmentInESED' },
  { label: 'ESED Appointment Quota', key: 'esedAppointmentQuota' },
  { label: 'X Coordinate', key: 'xCoordinate' },
  { label: 'Current Address', key: 'currentAddress' },
]

export const PRO_2_FIELDS: { label: string; key: string; date?: boolean }[] = [
  { label: 'Date of Entry into Govt. Service', key: 'dateOfEntryIntoGovtService', date: true },
  { label: 'Mobile # (SMS)', key: 'mobileSms' },
  { label: 'Blood Group', key: 'bloodGroup' },
  { label: 'Disability', key: 'disability' },
  { label: 'NTN #', key: 'ntnNo' },
  { label: 'Passport #', key: 'passportNo' },
  { label: 'Is spouse working in E&SED', key: 'isSpouseWorkingInESED' },
  { label: 'Province', key: 'province' },
  { label: 'District', key: 'districtName' },
  // The real captured PRO_2 shows "Union Council : UPPER MOHMAND" — the tehsil name
  // is used here (the real site's PRO_2 field is sourced from tehsil, not UC).
  { label: 'Union Council', key: 'tehsilName' },
  { label: 'Domicile', key: 'domicile' },
  { label: 'Chronic Disease', key: 'chronicDisease' },
  { label: 'Initial recruitment in ESED (1st Order Date)', key: 'initialRecruitment1stOrderDate', date: true },
  { label: 'Dual Nationality', key: 'dualNationality' },
  { label: 'Y Coordinate', key: 'yCoordinate' },
  { label: 'Permanent Address', key: 'permanentAddress' },
]

export const COVID_FIELDS: { label: string; key: string }[] = [
  { label: 'COVID-19 Vaccinated', key: 'covidVaccinated' },
  { label: 'Covid Reason', key: 'covidReason' },
  { label: 'Covid 19 Message', key: 'covidMessage' },
]

// ─── Education Qualifications tab — three sub-tables ────────────────────────
export const QUALIFICATION_COLUMNS = [
  'Academic',
  'Specialty',
  'College/University',
  'Total Marks',
  'Obtained Marks',
  '% age',
  'Regular/Private',
  'Session Year',
] as const

// ─── Posting / Transfer tab — 13 columns ─────────────────────────────────────
export const POSTING_COLUMNS = [
  'DDO Code',
  'Office/School',
  'Designation',
  'BPS',
  'From Date',
  'To Date',
  'Status',
  'Placement Type',
  'Posting Type',
  'Is Deputation',
  'Notification Detail',
  'Notification Title',
  'Retirement Notification',
] as const

// ─── BPS tab — 6 columns ──────────────────────────────────────────────────────
export const BPS_COLUMNS = [
  'BPS',
  'From Date',
  'To Date',
  'Status',
  'Remarks',
  'Notification Detail',
] as const

// ─── Job Type tab — 6 columns ─────────────────────────────────────────────────
export const JOB_TYPE_COLUMNS = [
  'Job Type',
  'From Date',
  'To Date',
  'Status',
  'Remarks',
  'Notification Detail',
] as const

// ─── Cadre Group tab — 7 columns ─────────────────────────────────────────────
export const CADRE_COLUMNS = [
  'Cadre Group',
  'Designation',
  'BPS',
  'From Date',
  'To Date',
  'Status',
  'Seniority Number',
] as const

// ─── Family Detail tab — 13 columns ──────────────────────────────────────────
export const FAMILY_COLUMNS = [
  'Dependent Name',
  'Relationship',
  'Gender',
  'Date of Birth',
  'Personnel #',
  'Department',
  'Designation/BPS',
  'Is-Dependent',
  'Disability',
  'CNIC/Form-B',
  'Next Of Kin',
  'Kin Signature',
  'Kin Address',
] as const

// ─── Bank Detail tab — 10 columns ─────────────────────────────────────────────
export const BANK_COLUMNS = [
  'Account Title',
  'Bank Name',
  'Bank Code',
  'Account No',
  'IBAN #',
  'Monthly Salary',
  'Address',
  'District',
  'For Pensioner',
  'Status',
] as const

// ─── Teacher Attendance columns ─────────────────────────────────────────────
export const ATTENDANCE_COLUMNS = [
  'Name',
  'Father Name',
  'Gender',
  'Designation',
  'Contact #',
  'Attendance',
] as const

export const ATTENDANCE_STATUSES = ['Present', 'Absent', 'Late', 'Leave', 'Holiday'] as const

// ─── Topbar right-side links ──────────────────────────────────────────────────
export const TOPBAR_LINKS = [
  { label: 'Install App', icon: 'cloud-download' },
  { label: 'District Performance ScoreCard', icon: 'bar-chart' },
  { label: 'HRIS Tutorial', icon: 'file-video' },
  { label: 'iEMIS User Manual', icon: 'file-pdf' },
] as const
