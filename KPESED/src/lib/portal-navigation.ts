export interface NavItem {
  id: string
  label: string
  module?: string
  children?: NavItem[]
  icon?: string
}

const leaf = (id: string, label: string, parent: string): NavItem => ({
  id,
  label,
  module: id,
  icon: parent,
})

/**
 * NAV_TREE — verified against the live iemis.kpese.gov.pk School Admin sidebar
 * (captured 2026-09-29 via read-only audit of the real portal).
 *
 * Structure: 12 top-level groups, 58 leaf features. The real site nests the
 * sixteen SSR reports *under* "School Self Report (SSR) Form" (3-level tree).
 * Feature ids match the live Oracle APEX page slugs (including the live
 * spellings `student-attendence`, `students-class_update`,
 * `classwise-enrollment-report-ss` and `dps-iemis-updation-emrollment`).
 */
export const NAV_TREE: NavItem[] = [
  {
    id: 'office-school-mis',
    label: 'Office/School MIS',
    children: [
      leaf('office-school-list', 'Office/School Profile(s)', 'Office/School MIS'),
      {
        id: 'office-school-reports',
        label: 'Office/School Reports',
        children: [
          leaf('basic-facilities-report', 'Basic Facilities Report', 'Office/School Reports'),
          leaf('security-measures-report', 'Security Measures Report', 'Office/School Reports'),
          leaf('school-stories-report', 'School Stories (Room) Report', 'Office/School Reports'),
          leaf('school-ptc-details', 'PTC Details', 'Office/School Reports'),
          leaf('school-commodities', 'Commodities', 'Office/School Reports'),
          leaf('school-it-lab-report', 'IT Lab Details', 'Office/School Reports'),
        ],
      },
      leaf('monthly-data-updation-report', 'School Data Certificates', 'Office/School MIS'),
      leaf('content-for-social-media-report', 'Content for Social Media', 'Office/School MIS'),
    ],
  },
  {
    id: 'hr-mis',
    label: 'HR MIS',
    children: [
      leaf('employee-search', 'Employee Profiles', 'HR MIS'),
      leaf('teacher-attendance', 'Teacher Attendance', 'HR MIS'),
      leaf('teacher-attendance-report', 'Teachers Attendance Report', 'HR MIS'),
      leaf('staff-leaves-report', 'Employee Leaves Report', 'HR MIS'),
    ],
  },
  {
    id: 'students-mis',
    label: 'Students MIS',
    children: [
      leaf('students-search', 'Students Profiles', 'Students MIS'),
      leaf('target-student-enrolment', 'Enrolment Campaign Target', 'Students MIS'),
      leaf('daily-students-enrolment', 'Daily Students Enrolment', 'Students MIS'),
      leaf('student-data-uploading', 'Student Data Uploading', 'Students MIS'),
      leaf('enrolment-campaign-status', 'Enrolment Campaign Report', 'Students MIS'),
      leaf('student-class-promotion', 'Student Promotion (Manual)', 'Students MIS'),
      leaf('section-classes-section', 'School Classes Section', 'Students MIS'),
      leaf('enrolment-campaign-activities', 'Enrollment Campaign Activities', 'Students MIS'),
      leaf('student-attendence', 'Student Attendance', 'Students MIS'),
      leaf('students-class_update', 'Students Class Update', 'Students MIS'),
      leaf('student-migration', 'Student Migration', 'Students MIS'),
      leaf('student-class-promotion-double-shift', 'Double Shift Student Promotion (Manual)', 'Students MIS'),
      leaf('student-attendance-report', 'Students Attendance Report', 'Students MIS'),
      leaf('active-student-session-wise-student', 'Active Student Session Wise Student Report', 'Students MIS'),
    ],
  },
  {
    id: 'ssr',
    label: 'School Self Reporting (SSR)',
    children: [
      {
        id: 'ssr-entry-form',
        label: 'School Self Report (SSR) Form',
        module: 'ssr-entry-form',
        children: [
          leaf('teacher-disable-report-ssr', 'Teacher Disable Report (SSR)', 'School Self Report (SSR) Form'),
          leaf('staff-detail-report-ssr', 'Staff Detail Report (SSR)', 'School Self Report (SSR) Form'),
          leaf('sanctioned-filled-posts-detail-report-ssr', 'Sanctioned/Filled Posts Detail Report (SSR)', 'School Self Report (SSR) Form'),
          leaf('school-basic-information-ssr-report', 'School Basic Information SSR Report', 'School Self Report (SSR) Form'),
          leaf('school-it-information-ssr-report', 'School IT Information SSR Report (IT Lab Excluded)', 'School Self Report (SSR) Form'),
          leaf('school-nature-of-construction-ssr-report', 'School Nature of Construction SSR Report (SSR)', 'School Self Report (SSR) Form'),
          leaf('school-commodities-for-students-ssr-report', 'School Commodities for Students SSR Report', 'School Self Report (SSR) Form'),
          leaf('enrollment-by-group-section-ssr', 'Student Enrollment by Group/Section', 'School Self Report (SSR) Form'),
          leaf('school-ptc-details-members', 'School PTC Members (SSR)', 'School Self Report (SSR) Form'),
          leaf('data-missing-in-ssr', 'Sanction/HR/Enrollment Data (SSR)', 'School Self Report (SSR) Form'),
          leaf('new-staff-details', 'New Staff Details (SSR)', 'School Self Report (SSR) Form'),
          leaf('building-details-data-missing-in-ssr', 'Building Data (SSR)', 'School Self Report (SSR) Form'),
          leaf('basic-facilities-data-missing-in-ssr', 'Basic Facilities Data (SSR)', 'School Self Report (SSR) Form'),
          leaf('classwise-enrollment-report-ss', 'Classwise Enrollment Report (SSR)', 'School Self Report (SSR) Form'),
          leaf('learning-difficult-students-report-ssr', 'Learning Difficult Students Report (SSR)', 'School Self Report (SSR) Form'),
          leaf('disable-students-report-ssr', 'Disable Students Report (SSR)', 'School Self Report (SSR) Form'),
        ],
      },
    ],
  },
  {
    id: 'assets-mis',
    label: 'Assets MIS',
    children: [
      // The live portal labels these entries with a literal ".." prefix
      // (visible in the real sidebar); module keys stay unchanged.
      { id: 'asset-profile', label: '..Asset Profile', module: 'asset-profile', icon: 'Assets MIS' },
      { id: 'assets-detail', label: '..Asset Details', module: 'assets-detail', icon: 'Assets MIS' },
      { id: 'assets-report', label: '..Assets Report', module: 'assets-report', icon: 'Assets MIS' },
    ],
  },
  { id: 'survey-tree-form', label: 'Survey - Environment Friendly Trees Form', module: 'survey-tree-form' },
  {
    id: 'ptc-mis',
    label: 'PTC MIS',
    children: [
      leaf('ptc-headwise-balance', 'PTC HEADWISE AVAILABLE AMOUNT', 'PTC MIS'),
      leaf('ptc-schools-list', 'PTC Schools List (Demand)', 'PTC MIS'),
    ],
  },
  {
    id: 'ptc-hiring',
    label: 'PTC Hiring (Talent Pool)',
    children: [leaf('applicants-list-ptc', 'Applicants List (PTC)', 'PTC Hiring (Talent Pool)')],
  },
  {
    id: 'textbook-board',
    label: 'Textbook Board',
    icon: 'book',
    children: [
      leaf('text-book-board-details', 'Free Textbook Demand List', 'Textbook Board'),
      leaf('book-demand-details', 'Book Demand Details', 'Textbook Board'),
    ],
  },
  { id: 'monitoring-dashboard', label: 'Monitoring Dashboard', module: 'monitoring-dashboard' },
  { id: 'dengue-control-campaign', label: 'Dengue Control Campaign', module: 'dengue-control-campaign' },
  {
    id: 'dps',
    label: 'District Performance ScoreCard (DPS)',
    children: [
      leaf('dps-iemis-updation-osmis', 'iEMIS Updation (Office-School MIS)', 'District Performance ScoreCard (DPS)'),
      leaf('dps-iemis-updation-human-resource-mis', 'iEMIS Updation (Human Resource MIS)', 'District Performance ScoreCard (DPS)'),
      leaf('dps-iemis-updation-emrollment', 'iEMIS Updation (Enrollment)', 'District Performance ScoreCard (DPS)'),
    ],
  },
]

export function flattenNav(items: NavItem[] = NAV_TREE, parent = 'Main'): Array<NavItem & { parent: string }> {
  return items.flatMap((item) => {
    const current = item.module ? [{ ...item, parent }] : []
    return [...current, ...(item.children ? flattenNav(item.children, item.label) : [])]
  })
}

export const NAV_LEAF_COUNT = flattenNav().length

/**
 * Legacy feature ids (pre twin-sync) mapped to the live-site slugs above.
 * Kept so previously saved portal records and old deep-links keep working.
 */
export const LEGACY_MODULE_ALIASES: Record<string, string> = {
  'office-school-profiles': 'office-school-list',
  'employee-profiles': 'employee-search',
  'attendance-report': 'teacher-attendance-report',
  'leaves-report': 'staff-leaves-report',
  'students-profiles': 'students-search',
  'enrolment-campaign-target': 'target-student-enrolment',
  'students-class-update': 'students-class_update',
  'enrolment-campaign-report': 'enrolment-campaign-status',
  'student-promotion-manual': 'student-class-promotion',
  'school-classes-section': 'section-classes-section',
  'student-attendance': 'student-attendence',
  'double-shift-student-promotion': 'student-class-promotion-double-shift',
  'active-student-session-wise': 'active-student-session-wise-student',
  'school-data-certificates': 'monthly-data-updation-report',
  'social-media-content': 'content-for-social-media-report',
  'sanctioned-filled-posts-report-ssr': 'sanctioned-filled-posts-detail-report-ssr',
  'school-nature-construction-ssr-report': 'school-nature-of-construction-ssr-report',
  'school-commodities-students-ssr-report': 'school-commodities-for-students-ssr-report',
  'building-details-data-missing-ssr': 'building-details-data-missing-in-ssr',
  'basic-facilities-data-missing-ssr': 'basic-facilities-data-missing-in-ssr',
  'classwise-enrollment-report-ssr': 'classwise-enrollment-report-ss',
  'trees-survey': 'survey-tree-form',
  'dengue-campaign': 'dengue-control-campaign',
  'dps-iemis-updation-enrollment': 'dps-iemis-updation-emrollment',
}

export function resolveModuleKey(module: string): string {
  return LEGACY_MODULE_ALIASES[module] ?? module
}
