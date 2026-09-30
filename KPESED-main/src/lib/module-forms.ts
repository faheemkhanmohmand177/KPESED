/**
 * MODULE-FORM CONFIGS — functional data-entry layer for every KPESED module.
 *
 * Field labels, button labels, select options and filter values below mirror
 * the live iemis.kpese.gov.pk School Admin pages (captured 2026-09-30).
 * Every module that shows Create / Add / Save controls on the live portal gets
 * the same entry workflow here: a real form (not raw JSON), inline edit,
 * delete, CSV download and functional filters — backed by the portal_records
 * store keyed by the live APEX page slug.
 */

export interface FormFieldDef {
  key: string
  label: string
  type?: 'text' | 'date' | 'number' | 'select' | 'textarea' | 'radio' | 'url'
  options?: string[]
  required?: boolean
  defaultValue?: string
  full?: boolean
}

export interface ModuleFormDef {
  /** Toolbar button label exactly as on the live page (e.g. "Create"). */
  createLabel: string
  /** Dialog title. Defaults to `Add ${createLabel}`. */
  formTitle?: string
  /** Submit button label. Defaults to "Save Record". */
  submitLabel?: string
  /** Entry form fields (real live-page field labels). */
  fields: FormFieldDef[]
  /** Rows auto-seeded when this module has no records yet (editable grids). */
  seedRows?: Array<Record<string, string>>
  /** Functional filter wired to the stored records. */
  functionalFilter?: { key: string; label: string; options?: string[]; kind?: 'select' | 'date' | 'text' }
  /** Editable-grid columns that render a select with these options. */
  gridSelectCols?: Record<string, string[]>
}

export const SSR_SESSIONS = ['SSR (2025-26) - 2025-26', 'SSR (2026-27) -', 'SSR(2023-24) - 2023-24', 'SSR(2024-25) - 2024-25']
export const SESSION_YEARS = ['2021-22', '2022-23', '2023-24', '2024-25', '2025-26', '2026-27']
export const YES_NO = ['YES', 'NO']
export const CLASSES = ['Kachi', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
const yn = (key: string, label: string, def = 'YES'): FormFieldDef => ({ key, label, type: 'select', options: YES_NO, defaultValue: def })
const num = (key: string, label: string, def = '0'): FormFieldDef => ({ key, label, type: 'number', defaultValue: def })

/** 31 Environment Friendly Tree species rows (live Survey grid is pre-filled). */
const TREE_SPECIES: Array<Record<string, string>> = [
  'Kikar (Acacia nilotica)', 'Palosa (Acacia modesta)', 'Safaida (Eucalyptus)', 'Neem (Azadirachta indica)',
  'Bakain (Melia azedarach)', 'Pipal (Ficus religiosa)', 'Ber (Ziziphus mauritiana)', 'Simbal (Bombax ceiba)',
  'Shahtoot (Mulberry)', 'Shisham (Dalbergia sissoo)', 'Amaltas (Cassia fistula)', 'Gul-e-Nishtar (Erythrina)',
  'Sukh Chain (Pongamia pinnata)', 'Sohanjna (Moringa oleifera)', 'Anar (Pomegranate)', 'Malta (Citrus)',
  'Amrood (Guava)', 'Zaitoon (Olive)', 'Khajoor (Date Palm)', 'Jamun (Java Plum)',
  'Falsa (Grewia asiatica)', 'Limu (Lemon)', 'Anjeer (Fig)', 'Badam (Almond)',
  'Akhrot (Walnut)', 'Chinar (Platanus orientalis)', 'Deodar (Cedrus deodara)', 'Chilghoza Pine (Pinus gerardiana)',
  'Pahari Safeda (Poplar)', 'Bidi (Willow)', 'Frash (Tamarix aphylla)',
].map((tree) => ({ 'Environment Friendly Tree': tree, 'Trees Demand': '0', 'Number of Trees Planted': '0' }))

/** PTC headwise balance — one editable row per school with all fund heads. */
const PTC_HEADS: Array<Record<string, string>> = [{
  'Additional Class Room': '0', 'Group Latrine': '0', 'Boundary Wall': '0', 'Solarization': '0',
  'Electrification': '0', 'Water Supply': '0', 'DSS Settled': '0', 'DSS Merged': '0',
  'CRC': '0', 'Petty Repair': '0', 'Autonomy Budget': '0', 'PTC Hiring': '0',
  'Other Funds Donated by(Name of Org./Donors/NGOs)': '', 'Other FundsTotal Amount': '0',
  'Bank Profit': '0', 'Total AvailableBalance (PKR)': '0',
  'Bank Name': '', 'Bank Remakrs': '', 'Branch Name': '', 'Branch Code': '', 'Account IBAN #': '',
}]

export const MODULE_FORMS: Record<string, ModuleFormDef> = {

  /* ================= Office/School MIS ================= */

  'basic-facilities-report': {
    createLabel: 'Add Basic Facilities Record',
    formTitle: 'Basic Facilities — School Entry',
    fields: [
      { key: 'Visit Date', label: 'Visit Date', type: 'date', required: true },
      yn('Solar', 'Solar'), { key: 'Solar Status', label: 'Solar Status', type: 'select', options: ['OK', 'NOT OK', 'NA'], defaultValue: 'OK' },
      yn('Wapda', 'Wapda'), { key: 'Wapda Status', label: 'Wapda Status', type: 'select', options: ['OK', 'NOT OK', 'NA'], defaultValue: 'OK' },
      yn('Generator', 'Generator'), yn('Turbine', 'Turbine'), yn('Direct Connection', 'Direct Connection'),
      yn('Line From Other', 'Line From Other'), yn('UPS', 'UPS'), yn('Other Source', 'Other Source'),
      yn('Boundary Wall Available', 'Boundary Wall Available'), { key: 'Boundary Wall Status', label: 'Boundary Wall Status', type: 'select', options: ['OK', 'NOT OK', 'NA'], defaultValue: 'OK' },
      yn('Water Well', 'Water Well'), yn('Water Well (Drinkable)', 'Water Well (Drinkable)'),
      yn('Water Bore', 'Water Bore'), yn('Water Bore (Drinkable)', 'Water Bore (Drinkable)'),
      yn('Tubewell', 'Tubewell'), yn('Tubewell (Drinkable)', 'Tubewell (Drinkable)'),
      yn('Water Pipe Connection', 'Water Pipe Connection'), yn('Water Pipe Connection (Drinkable)', 'Water Pipe Connection (Drinkable)'),
      yn('Water Neighbors', 'Water Neighbors'), yn('Water Neighbors (Drinkable)', 'Water Neighbors (Drinkable)'),
      yn('Water Matka Container', 'Water Matka Container'), yn('Water Matka Container (Drinkable)', 'Water Matka Container (Drinkable)'),
      num('No of Toilets (Staff)', 'No of Toilets (Staff)'), num('No of Functional Toilets (Staff)', 'No of Functional Toilets (Staff)'),
      num('No of Toilets (Student)', 'No of Toilets (Student)'), num('No of Functional Toilets (Student)', 'No of Functional Toilets (Student)'),
      num('No of Under Construction Toilets', 'No of Under Construction Toilets'),
      { key: 'Remarks', label: 'Remarks', type: 'textarea', full: true },
    ],
    functionalFilter: { key: 'Visit Date', label: 'Visit Date', kind: 'date' },
  },

  'security-measures-report': {
    createLabel: 'Add Security Measures Record',
    formTitle: 'Security Measures — School Entry',
    fields: [
      { key: 'Visit Date', label: 'Visit Date', type: 'date', required: true },
      yn('School Main Gate Available', 'School Main Gate Available'),
      num('No of School Gates', 'No of School Gates'),
      yn('CCTV Camera', 'CCTV Camera'), num('No of CCTV Camera', 'No of CCTV Camera'), num('No of CCTV Functional Camera', 'No of CCTV Functional Camera'),
      num('No Of Security Guards Private', 'No Of Security Guards Private'),
      num('No Of Weapons School Owned', 'No Of Weapons School Owned'),
      num('No Of Metal Detectors', 'No Of Metal Detectors'),
      yn('Barbed Wire', 'Barbed Wire'), yn('Glass Spikes', 'Glass Spikes'), yn('Entrance Blocks', 'Entrance Blocks'),
      yn('Attacks (Registered FIR)', 'Attacks (Registered FIR)'),
      num('No of Attacks On Institute', 'No of Attacks On Institute'),
      num('No of Attacks On Personnel', 'No of Attacks On Personnel'),
      num('No of Attacks On Student', 'No of Attacks On Student'),
      num('Number of Incidents of corporal Punishment reported in the current year', 'No of Incidents of Corporal Punishment (current year)'),
      { key: 'Remarks', label: 'Remarks', type: 'textarea', full: true },
    ],
    functionalFilter: { key: 'Visit Date', label: 'Visit Date', kind: 'date' },
  },

  'school-stories-report': {
    createLabel: 'Add School Stories (Rooms) Record',
    formTitle: 'School Stories (Rooms) — School Entry',
    fields: [
      num('Room in Basement', 'Room in Basement'), num('Room on Ground', 'Room on Ground'),
      num('Room on First Floor', 'Room on First Floor'), num('Room on Second Floor', 'Room on Second Floor'),
      num('Room on Third Floor', 'Room on Third Floor'),
      { key: 'Remarks', label: 'Remarks', type: 'textarea', full: true },
    ],
  },

  'school-ptc-details': {
    createLabel: 'Add PTC Details',
    formTitle: 'School PTC Details — School Entry',
    fields: [
      { key: 'Bank Name', label: 'Bank Name', type: 'select', options: ['-- Select Bank --', 'National Bank of Pakistan', 'Bank of Khyber', 'Bank Al Falah', 'Habib Bank Limited', 'Allied Bank', 'Meezan Bank', 'United Bank Limited', 'Askari Bank', 'Faysal Bank', 'Dubai Islamic Bank'], required: true },
      { key: 'Branch Code', label: 'Branch Code' },
      { key: 'Branch Name', label: 'Branch Name' },
      { key: 'Account Iban', label: 'Account IBAN', required: true, full: true },
      { key: 'Is Established', label: 'Is Established', type: 'select', options: YES_NO, defaultValue: 'YES' },
      { key: 'Established Date', label: 'Established Date', type: 'date' },
      { key: 'Chairperson Name', label: 'Chairperson Name', required: true },
      { key: 'Chairperson Contact', label: 'Chairperson Contact', required: true },
      { key: 'Is Members Trained', label: 'Is Members Trained', type: 'select', options: YES_NO, defaultValue: 'YES' },
      { key: 'Last Election Date', label: 'Last Election Date', type: 'date' },
      num('Meetings Held Cur Academic Session', 'Meetings Held in Current Academic Session'),
    ],
  },

  'school-commodities': {
    createLabel: 'Add Commodities Record',
    formTitle: 'School Commodities — School Entry',
    fields: [
      ...(['Std Desk 2 Seater', 'Std Desk 3 Seater', 'Std Bench 2 Seater', 'Std Bench 3 Seater', 'Std Chair', 'Tablet Chair', 'Jute Tat', 'Carpet Mat', 'Fan', 'Tlm', 'Bulb Tube', 'Office Teacher Table', 'Office Teacher Chair', 'Computer Table', 'Computer Chair', 'Black Green Board', 'White Board', 'Almirah', 'Black Green Noticeboard', 'White Noticeboard', 'Sm Tablet Chair'].flatMap((item) => [
        num(`${item} Available`, `${item} Available`),
        num(`${item} Useable`, `${item} Useable`),
        num(`${item} Unuseable`, `${item} Unuseable`),
        num(`${item} New Required`, `${item} New Required`),
      ])),
    ],
  },

  'school-it-lab-report': {
    createLabel: 'Add IT Lab Details',
    formTitle: 'School IT Lab Details — School Entry',
    fields: [
      yn('Is IT Lab Available', 'Is IT Lab Available'),
      { key: 'Date of Establishment', label: 'Date of Establishment', type: 'date' },
      yn('Is IT Lab Functional', 'Is IT Lab Functional'),
      { key: 'Established By', label: 'Established By' },
      { key: 'Firm Name', label: 'Firm Name' },
      num('No Of Computer', 'No Of Computer'), num('No Of Functional Computer', 'No Of Functional Computer'),
      yn('Is Internet Available', 'Is Internet Available'), yn('Is Printer Available', 'Is Printer Available'),
      yn('Is Projector Available', 'Is Projector Available'), yn('Is Scanner Available', 'Is Scanner Available'),
      yn('Is Interactive Screen Available', 'Is Interactive Screen Available'),
      yn('Is Interactive Screen Functional', 'Is Interactive Screen Functional'),
      num('Ict No Of Computers', 'ICT No Of Computers'), num('Ict No Of Printers', 'ICT No Of Printers'),
      { key: 'Ineternet Speed In Mb', label: 'Internet Speed in Mb', type: 'number' },
      num('No Of Mobile Tablets', 'No Of Mobile Tablets'), num('No Of Functional Tablets', 'No Of Functional Tablets'),
      yn('Biometric Device Avail', 'Biometric Device Available'), yn('Biometric Device Functional', 'Biometric Device Functional'),
      ...(['Wireless Jazz', 'Wireless Telenor', 'Wireless Ufone', 'Wireless Zong', 'Wired Landline Internet'].map((k) => ({ key: k, label: k, type: 'select' as const, options: ['Available', 'Not Available'] }))),
      { key: 'Wireless Other Name', label: 'Wireless Other Name' },
    ],
  },

  'monthly-data-updation-report': {
    createLabel: 'Add Certificate Record',
    formTitle: 'School Data Certificate — School Entry',
    fields: [
      { key: 'Session Year', label: 'Session Year', type: 'select', options: SESSION_YEARS, defaultValue: '2026-27', required: true },
      { key: 'Month', label: 'Month', type: 'select', options: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], required: true },
      { key: 'Certificate Status', label: 'Certificate Status', type: 'select', options: ['SUBMITTED', 'PENDING', 'NOT SUBMITTED', 'LOCKED'], defaultValue: 'SUBMITTED' },
      { key: 'Submission Date', label: 'Submission Date', type: 'date' },
      { key: 'Headmaster Name', label: 'Headmaster Name' },
      { key: 'Remarks', label: 'Remarks', type: 'textarea', full: true },
    ],
    functionalFilter: { key: 'Session Year', label: 'Session Year', options: SESSION_YEARS },
  },

  'content-for-social-media-report': {
    createLabel: 'Create',
    formTitle: 'Content for Social Media — Create',
    submitLabel: 'Create',
    fields: [
      { key: 'Content Title', label: 'Content Title', required: true, full: true },
      { key: 'Content Type', label: 'Content Type', type: 'select', options: ['Video', 'Photo Story', 'News', 'Article', 'Speech', 'Other'], required: true },
      { key: 'Content Date', label: 'Content Date', type: 'date', required: true },
      { key: 'Description', label: 'Description', type: 'textarea', full: true },
      { key: 'Content Link', label: 'Content Link (YouTube / Drive / URL)', type: 'url', full: true },
      { key: 'Status', label: 'Status', type: 'select', options: ['PENDING', 'RECEIVED', 'PUBLISHED', 'REJECTED'], defaultValue: 'PENDING' },
      { key: 'Remarks', label: 'Remarks', type: 'textarea', full: true },
    ],
    functionalFilter: { key: 'Status', label: 'Status', options: ['PENDING', 'RECEIVED', 'PUBLISHED', 'REJECTED'] },
  },

  /* ================= Students MIS ================= */

  'enrolment-campaign-status': {
    createLabel: 'Add Campaign Status Record',
    formTitle: 'Enrolment Campaign Status — School Entry',
    fields: [
      { key: 'Session Year', label: 'Session Year', type: 'select', options: SESSION_YEARS, defaultValue: '2026-27', required: true },
      { key: 'School Level', label: 'School Level' },
      num('Target', 'Target'), num('Enrolled Fresh', 'Enrolled Fresh'),
      num('Enrolled From Private', 'Enrolled From Private'),
      num('Enrolled From Dropout/OOSC', 'Enrolled From Dropout/OOSC'),
      num('Enrolled From Public', 'Enrolled From Public'),
      { key: 'Remarks', label: 'Remarks', type: 'textarea', full: true },
    ],
    functionalFilter: { key: 'Session Year', label: 'Session Year', options: SESSION_YEARS },
  },

  'enrolment-campaign-activities': {
    createLabel: 'Add Campaign Activity',
    formTitle: 'Enrolment Campaign Activities — Daily Entry',
    fields: [
      { key: 'Activity Date', label: 'Activity Date', type: 'date', required: true },
      num('No of Door To Door Campaign', 'No of Door To Door Campaign'),
      num('No of Meetings with Religious Leaders', 'No of Meetings with Religious Leaders'),
      num('No of Meetings Chief Khateeb', 'No of Meetings Chief Khateeb'),
      num('No of Meetings with Deeni Madaris Scholars', 'No of Meetings with Deeni Madaris Scholars'),
      num('No of Meetings with Hujra Elders', 'No of Meetings with Hujra Elders'),
      num('No of Meetings District Administration', 'No of Meetings District Administration'),
      num('No of Meeting with Tehsil & VC Chairmen', 'No of Meeting with Tehsil & VC Chairmen'),
      num('No of Activities for Campaign using TV, Radio, Social media, Print media', 'No of Activities using TV/Radio/Social/Print media'),
      num('No of Walks, Rallies, Seminar', 'No of Walks, Rallies, Seminar'),
      { key: 'Pictures', label: 'Pictures (URL)', type: 'url', full: true },
    ],
    functionalFilter: { key: 'Activity Date', label: 'Activity Date', kind: 'date' },
  },

  'student-attendance-report': {
    createLabel: 'Add Attendance Record',
    formTitle: 'Student Attendance — Manual Entry',
    fields: [
      { key: 'Attendance Date', label: 'Attendance Date', type: 'date', required: true },
      { key: 'Student ID', label: 'Student ID', required: true },
      { key: 'Student Name', label: 'Student Name' },
      { key: 'Class', label: 'Class', type: 'select', options: CLASSES },
      { key: 'Section', label: 'Section' },
      { key: 'Status', label: 'Status', type: 'select', options: ['Absent', 'Leave', 'Present', 'Sick Leave'], defaultValue: 'Present' },
      { key: 'Remarks', label: 'Remarks', type: 'textarea', full: true },
    ],
    functionalFilter: { key: 'Attendance Date', label: 'Attendance Date', kind: 'date' },
  },

  'active-student-session-wise-student': {
    createLabel: 'Add Session Record',
    formTitle: 'Active Student Session Wise — Entry',
    fields: [
      { key: 'Session Year', label: 'Session Year', type: 'select', options: SESSION_YEARS, required: true },
      num('Total', 'Total Students'),
      { key: 'Remarks', label: 'Remarks', type: 'textarea', full: true },
    ],
    functionalFilter: { key: 'Session Year', label: 'Session Year', options: SESSION_YEARS },
  },

  /* ================= SSR ================= */

  'ssr-entry-form': {
    createLabel: 'Add SSR Record',
    formTitle: 'SSR Entry — School Record',
    fields: [
      { key: 'School Level', label: 'School Level', type: 'select', options: ['PRIMARY', 'MIDDLE', 'HIGH', 'HIGHER SECONDARY'], required: true },
      { key: 'Double Shift', label: 'Double Shift', type: 'select', options: YES_NO, defaultValue: 'NO' },
      { key: 'Model Type', label: 'Model Type' },
      { key: 'School Status', label: 'School Status', type: 'select', options: ['OPERATIONAL', 'NON-OPERATIONAL', 'NEWLY ESTABLISHED OPERATIONAL'], defaultValue: 'OPERATIONAL' },
      { key: 'Status', label: 'SSR Status', type: 'select', options: ['SAVED', 'SUBMITTED', 'LOCKED'], defaultValue: 'SAVED' },
      { key: 'School Lock Date', label: 'School Lock Date', type: 'date' },
      { key: 'Remarks', label: 'Remarks', type: 'textarea', full: true },
    ],
  },

  'ptc-headwise-balance': {
    createLabel: 'Add Row',
    formTitle: 'PTC Available Balance Entry Form',
    submitLabel: 'Save',
    fields: [
      num('Additional Class Room', 'Additional Class Room'),
      num('Group Latrine', 'Group Latrine'),
      num('Boundary Wall', 'Boundary Wall'),
      num('Solarization', 'Solarization'),
      num('Electrification', 'Electrification'),
      num('Water Supply', 'Water Supply'),
      num('DSS Settled', 'DSS Settled'),
      num('DSS Merged', 'DSS Merged'),
      num('CRC', 'CRC'),
      num('Petty Repair', 'Petty Repair'),
      num('Autonomy Budget', 'Autonomy Budget'),
      num('PTC Hiring', 'PTC Hiring'),
      { key: 'Other Funds Donated by(Name of Org./Donors/NGOs)', label: 'Other Funds Donated by (Org/Donors/NGOs)', full: true },
      num('Other FundsTotal Amount', 'Other Funds Total Amount'),
      num('Bank Profit', 'Bank Profit'),
      num('Total AvailableBalance (PKR)', 'Total Available Balance (PKR)'),
      { key: 'Bank Name', label: 'Bank Name' },
      { key: 'Bank Remakrs', label: 'Bank Remarks', type: 'select', options: ['Active', 'Dormant', 'Inactive'] },
      { key: 'Branch Name', label: 'Branch Name' },
      { key: 'Branch Code', label: 'Branch Code' },
      { key: 'Account IBAN #', label: 'Account IBAN #', full: true },
    ],
    seedRows: PTC_HEADS,
    gridSelectCols: { 'Bank Remakrs': ['Active', 'Dormant', 'Inactive'] },
  },

  'survey-tree-form': {
    createLabel: 'Add Row',
    formTitle: 'Survey — Trees Entry',
    submitLabel: 'Save',
    fields: [
      { key: 'Environment Friendly Tree', label: 'Environment Friendly Tree', required: true },
      num('Trees Demand', 'Trees Demand'),
      num('Number of Trees Planted', 'Number of Trees Planted'),
    ],
    seedRows: TREE_SPECIES,
  },

  /* ================= PTC MIS / Hiring ================= */

  'ptc-schools-list': {
    createLabel: 'Add School',
    formTitle: 'PTC Schools List — Add School',
    fields: [
      { key: 'PTC Year', label: 'PTC Year', type: 'select', options: SESSION_YEARS, defaultValue: '2026-27', required: true },
      { key: 'PTC Release', label: 'PTC Release', type: 'select', options: ['1st Release', '2nd Release', '3rd Release', '4th Release'], required: true },
      { key: 'School Name', label: 'School Name', required: true },
      { key: 'PTC Type', label: 'PTC Type', type: 'select', options: ['NEW PTC', 'RE-CONSTITUTED PTC', 'EXISTING PTC'], defaultValue: 'EXISTING PTC' },
      { key: 'Bank Name', label: 'Bank Name' },
      { key: 'Branch Code', label: 'Branch Code' },
      { key: 'Branch Name', label: 'Branch Name' },
      { key: 'Account No', label: 'Account No' },
      { key: 'Account IBAN', label: 'Account IBAN', full: true },
      num('Release Amount (PKR)', 'Release Amount (PKR)'),
      { key: 'Release Date', label: 'Release Date', type: 'date' },
      { key: 'Remarks', label: 'Remarks', type: 'textarea', full: true },
    ],
    functionalFilter: { key: 'PTC Year', label: 'PTC Year', options: SESSION_YEARS },
  },

  'applicants-list-ptc': {
    createLabel: 'Add Applicant',
    formTitle: 'Applicants List (PTC) — Add Applicant',
    fields: [
      { key: 'Applicant Name', label: 'Applicant Name', required: true },
      { key: 'Father Name', label: 'Father Name', required: true },
      { key: 'Gender', label: 'Gender', type: 'select', options: ['MALE', 'FEMALE'], required: true },
      { key: 'CNIC #', label: 'CNIC #', required: true },
      { key: 'Email Address (Username)', label: 'Email Address (Username)', type: 'text' },
      { key: 'Mobile #', label: 'Mobile #' },
      { key: 'Date of Birth', label: 'Date of Birth', type: 'date' },
      { key: 'Domicile', label: 'Domicile' },
      { key: 'Tehsil', label: 'Tehsil' },
      { key: 'Union Council', label: 'Union Council' },
      { key: 'City', label: 'City' },
      { key: 'Degree Certificate', label: 'Degree Certificate' },
      { key: 'Professional Degree', label: 'Professional Degree' },
      num('Obtained Marks', 'Obtained Marks'),
      num('Demo Marks', 'Demo Marks'),
      num('Grant Total', 'Grant Total'),
      { key: 'Designation', label: 'Designation' },
      { key: 'Cadre', label: 'Cadre' },
      { key: 'Posted From', label: 'Posted From', type: 'date' },
      { key: 'DSS Enrollment', label: 'DSS Enrollment', type: 'select', options: YES_NO, defaultValue: 'NO' },
      { key: 'Double Shift', label: 'Double Shift', type: 'select', options: YES_NO, defaultValue: 'NO' },
      { key: 'Head Title', label: 'Head Title' },
      { key: 'Release Year', label: 'Release Year' },
      { key: 'Record Lock', label: 'Record Lock', type: 'select', options: ['LOCKED', 'UNLOCKED'], defaultValue: 'UNLOCKED' },
    ],
    functionalFilter: { key: 'Record Lock', label: 'Record Lock', options: ['LOCKED', 'UNLOCKED'] },
  },

  /* ================= Textbook Board ================= */

  'text-book-board-details': {
    createLabel: 'Add Schools',
    formTitle: 'Free Textbook Demand List — Add Schools',
    fields: [
      { key: 'Session/Demand Year', label: 'Session/Demand Year', type: 'select', options: SESSION_YEARS, defaultValue: '2026-27', required: true },
      { key: 'Shift', label: 'Shift', type: 'select', options: ['MORNING', 'DOUBLE SHIFT (SECOND)'], defaultValue: 'MORNING', required: true },
      { key: 'School Level', label: 'School Level', type: 'select', options: ['PRIMARY', 'MIDDLE', 'HIGH', 'HIGHER SECONDARY'] },
      ...CLASSES.flatMap((c) => [num(`Class ${c} Enrollment`, `Class ${c} Enrollment`), num(`Class ${c} Demand`, `Class ${c} Demand`)]),
      { key: 'Remarks', label: 'Remarks', type: 'textarea', full: true },
    ],
    functionalFilter: { key: 'Session/Demand Year', label: 'Session/Demand Year', options: SESSION_YEARS },
  },

  'book-demand-details': {
    createLabel: 'Add Book Demand',
    formTitle: 'Book Demand Details — Add Demand',
    fields: [
      { key: 'Demand Year', label: 'Demand Year', type: 'select', options: SESSION_YEARS, defaultValue: '2026-27', required: true },
      { key: 'Shift', label: 'Shift', type: 'select', options: ['MORNING', 'DOUBLE SHIFT (SECOND)'], defaultValue: 'MORNING' },
      { key: 'Class', label: 'Class', type: 'select', options: CLASSES, required: true },
      { key: 'Subject / Title', label: 'Subject / Title', required: true },
      num('Quantity Demanded', 'Quantity Demanded'),
      num('Quantity Received', 'Quantity Received'),
      { key: 'Remarks', label: 'Remarks', type: 'textarea', full: true },
    ],
    functionalFilter: { key: 'Demand Year', label: 'Demand Year', options: SESSION_YEARS },
  },

  /* ================= Dengue ================= */

  'dengue-control-campaign': {
    createLabel: 'Add Dengue Control Campaign',
    formTitle: 'Dengue Control Campaign — Add',
    fields: [
      { key: 'Campaign Date', label: 'Campaign Date', type: 'date', required: true },
      { key: 'Larva Found', label: 'Larva Found', type: 'radio', options: YES_NO, defaultValue: 'NO', required: true },
      { key: 'Fogging Conducted', label: 'Fogging Conducted', type: 'radio', options: YES_NO, defaultValue: 'NO' },
      { key: 'Awareness Session Held', label: 'Awareness Session Held', type: 'radio', options: YES_NO, defaultValue: 'NO' },
      { key: 'Water Tanks Covered', label: 'Water Tanks Covered', type: 'number' },
      { key: 'Image / Video Link', label: 'Image / Video Link', type: 'url', full: true },
      { key: 'Remarks', label: 'Remarks', type: 'textarea', full: true },
    ],
    functionalFilter: { key: 'Campaign Date', label: 'Campaign Date', kind: 'date' },
  },

  /* ================= DPS ================= */

  'dps-iemis-updation-osmis': {
    createLabel: 'Add OSMIS Record',
    formTitle: 'DPS - iEMIS Updation (Office-School MIS) — Entry',
    fields: [
      { key: 'Session Year', label: 'Session Year', type: 'select', options: SESSION_YEARS, defaultValue: '2026-27', required: true },
      { key: 'Co-Education', label: 'Co-Education', type: 'select', options: YES_NO, defaultValue: 'NO' },
      { key: 'Weatherzone', label: 'Weatherzone' },
      { key: 'Ownership Status', label: 'Ownership Status' },
      { key: 'NC/ VC', label: 'NC/VC' },
      { key: 'NA', label: 'NA' }, { key: 'PK', label: 'PK' },
      { key: 'X Coordinate', label: 'X Coordinate' }, { key: 'Y Coordinate', label: 'Y Coordinate' },
      { key: 'Is PTC Established', label: 'Is PTC Established', type: 'select', options: YES_NO },
      { key: 'Is PTC Account Updated', label: 'Is PTC Account Updated', type: 'select', options: YES_NO },
      num('PTC Members', 'PTC Members'), num('Sanctioned Posts', 'Sanctioned Posts'), num('Rooms', 'Rooms'),
      num('Storie-wise Rooms', 'Storey-wise Rooms'),
      { key: 'Is Basic Facilities Updated', label: 'Is Basic Facilities Updated', type: 'select', options: YES_NO },
      { key: 'Monthly Updation', label: 'Monthly Updation', type: 'select', options: YES_NO },
      { key: 'Monthly Enrollment', label: 'Monthly Enrollment', type: 'select', options: YES_NO },
    ],
    functionalFilter: { key: 'Session Year', label: 'Session Year', options: SESSION_YEARS },
  },

  'dps-iemis-updation-human-resource-mis': {
    createLabel: 'Add HRMIS Record',
    formTitle: 'DPS - iEMIS Updation (Human Resource MIS) — Entry',
    fields: [
      { key: 'DPS Month', label: 'DPS Month', type: 'select', options: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], required: true },
      { key: 'DPS Year', label: 'DPS Year', type: 'select', options: ['2024', '2025', '2026', '2027'], defaultValue: '2026', required: true },
      { key: 'Name', label: 'Name', required: true },
      { key: 'CNIC', label: 'CNIC', required: true },
      { key: 'EMIS Code', label: 'EMIS Code' },
      { key: 'School', label: 'School' },
      { key: 'Level', label: 'Level' },
      { key: 'DOB', label: 'DOB', type: 'date' },
      { key: 'Union Council', label: 'Union Council' },
      { key: 'Domicile', label: 'Domicile' },
      { key: 'Emergency Contact', label: 'Emergency Contact' },
      { key: 'Govt Entry Date', label: 'Govt Entry Date', type: 'date' },
      { key: 'Appointment Quota', label: 'Appointment Quota' },
      { key: 'Personnel No', label: 'Personnel No' },
      { key: 'Cadre Group', label: 'Cadre Group' },
    ],
    functionalFilter: { key: 'DPS Year', label: 'DPS Year', options: ['2024', '2025', '2026', '2027'] },
  },

  'dps-iemis-updation-emrollment': {
    createLabel: 'Add Enrollment Record',
    formTitle: 'DPS - iEMIS Updation (Enrollment) — Entry',
    fields: [
      { key: 'Session Year', label: 'Session Year', type: 'select', options: SESSION_YEARS, defaultValue: '2026-27', required: true },
      { key: 'Class', label: 'Class', type: 'select', options: CLASSES, required: true },
      num('Class-wise Entry (Profiles)', 'Class-wise Entry (Profiles)'),
      num('SSR / Enrollment Entry', 'SSR / Enrollment Entry'),
      num('Mismatch', 'Mismatch'),
      { key: 'Remarks', label: 'Remarks', type: 'textarea', full: true },
    ],
    functionalFilter: { key: 'Session Year', label: 'Session Year', options: SESSION_YEARS },
  },

  /* ================= HR MIS report (leaves) ================= */

  'staff-leaves-report': {
    createLabel: 'Add Leave Record',
    formTitle: 'Employee Leaves — Manual Entry',
    fields: [
      { key: 'Employee Name', label: 'Employee Name', required: true },
      { key: 'Designation', label: 'Designation' },
      { key: 'Leave Type', label: 'Leave Type', type: 'select', options: ['CASUAL LEAVE', 'EARNED LEAVE', 'SICK LEAVE', 'MATERNITY LEAVE', 'EX-PAKISTAN LEAVE', 'LEAVE WITHOUT PAY'], required: true },
      { key: 'From Date', label: 'From Date', type: 'date', required: true },
      { key: 'To Date', label: 'To Date', type: 'date', required: true },
      num('Days', 'Days'),
      { key: 'Status', label: 'Status', type: 'select', options: ['PENDING', 'APPROVED', 'REJECTED'], defaultValue: 'PENDING' },
      { key: 'Remarks', label: 'Remarks', type: 'textarea', full: true },
    ],
    functionalFilter: { key: 'Status', label: 'Status', options: ['PENDING', 'APPROVED', 'REJECTED'] },
  },

  /* ================= School Classes Section ================= */

  'section-classes-section': {
    createLabel: 'Add Class Section',
    formTitle: 'School Classes Section — Add',
    fields: [
      { key: 'Class Name', label: 'Class Name', type: 'select', options: CLASSES, required: true },
      { key: 'Section', label: 'Section', required: true },
      { key: 'Shift', label: 'Shift', type: 'select', options: ['M', 'S'], defaultValue: 'S' },
      { key: 'Subject Group', label: 'Subject Group' },
      { key: 'Subjects', label: 'Subjects' },
      num('Sections Count', 'Sections Count'),
      { key: 'Remarks', label: 'Remarks', type: 'textarea', full: true },
    ],
  },
}

/* ================= 16 SSR report modules ================= */
/* Each SSR report supports a school entry record filtered by SSR Session Year
   (the live reports filter on the same P347_ASC_ID select). */

function ssrReport(key: string, createLabel: string, fields: FormFieldDef[]): [string, ModuleFormDef] {
  return [key, {
    createLabel,
    formTitle: `${createLabel.replace(/^Add /, '')} — SSR Entry`,
    fields: [
      { key: 'SSR Session Year', label: 'SSR Session Year', type: 'select', options: SSR_SESSIONS, required: true },
      ...fields,
    ],
    functionalFilter: { key: 'SSR Session Year', label: 'SSR Session Year', options: SSR_SESSIONS },
  }]
}

const SSR_REPORT_CONFIGS: Array<[string, ModuleFormDef]> = [
  ssrReport('teacher-disable-report-ssr', 'Add Teacher Disable Record', [
    { key: 'Teacher Name', label: 'Teacher Name', required: true },
    { key: 'CNIC', label: 'CNIC' },
    { key: 'Disability Type', label: 'Disability Type', type: 'select', options: ['PHYSICAL', 'VISUAL', 'HEARING', 'INTELLECTUAL', 'OTHER'] },
    { key: 'Support Provided', label: 'Support Provided', type: 'textarea', full: true },
  ]),
  ssrReport('staff-detail-report-ssr', 'Add Staff Detail Record', [
    { key: 'Staff Name', label: 'Staff Name', required: true },
    { key: 'Designation', label: 'Designation' },
    { key: 'BPS', label: 'BPS', type: 'number' },
    { key: 'Gender', label: 'Gender', type: 'select', options: ['MALE', 'FEMALE'] },
    { key: 'Status', label: 'Status', type: 'select', options: ['WORKING', 'ON LEAVE', 'VACANT POST'] },
  ]),
  ssrReport('sanctioned-filled-posts-detail-report-ssr', 'Add Sanctioned/Filled Posts Record', [
    { key: 'Designation', label: 'Designation', required: true },
    num('Sanctioned Posts', 'Sanctioned Posts'),
    num('Filled Posts', 'Filled Posts'),
    num('Vacant Posts', 'Vacant Posts'),
  ]),
  ssrReport('school-basic-information-ssr-report', 'Add School Basic Information', [
    { key: 'School Level', label: 'School Level', type: 'select', options: ['PRIMARY', 'MIDDLE', 'HIGH', 'HIGHER SECONDARY'] },
    { key: 'Established Year', label: 'Established Year', type: 'number' },
    { key: 'Area (Kanal)', label: 'Area (Kanal)', type: 'number' },
    { key: 'Building Status', label: 'Building Status' },
  ]),
  ssrReport('school-it-information-ssr-report', 'Add School IT Information', [
    { key: 'Is IT Lab Available', label: 'Is IT Lab Available', type: 'select', options: YES_NO },
    num('No of Computers', 'No of Computers'),
    num('No of Functional Computers', 'No of Functional Computers'),
    { key: 'Is Internet Available', label: 'Is Internet Available', type: 'select', options: YES_NO },
    num('Internet Speed (Mb)', 'Internet Speed (Mb)'),
  ]),
  ssrReport('school-nature-of-construction-ssr-report', 'Add Nature of Construction Record', [
    { key: 'Construction Type', label: 'Construction Type', type: 'select', options: ['PAKKA', 'KACHA', 'MIXED', 'SHELTER LESS'] },
    num('Kacha Rooms', 'Kacha Rooms'),
    num('Pakka Rooms', 'Pakka Rooms'),
    { key: 'Boundary Wall', label: 'Boundary Wall', type: 'select', options: YES_NO },
  ]),
  ssrReport('school-commodities-for-students-ssr-report', 'Add Commodities for Students', [
    num('Std Desk 2 Seater Available', 'Std Desk 2 Seater Available'),
    num('Std Chair Available', 'Std Chair Available'),
    num('Fans Available', 'Fans Available'),
    num('TLM Available', 'TLM Available'),
    { key: 'Water Facility', label: 'Water Facility', type: 'select', options: YES_NO },
  ]),
  ssrReport('enrollment-by-group-section-ssr', 'Add Enrollment by Group/Section', [
    { key: 'Class', label: 'Class', type: 'select', options: CLASSES, required: true },
    { key: 'Section', label: 'Section' },
    { key: 'Group/Subject', label: 'Group/Subject' },
    num('Boys', 'Boys'), num('Girls', 'Girls'), num('Total', 'Total'),
  ]),
  ssrReport('school-ptc-details-members', 'Add PTC Member', [
    { key: 'Member Name', label: 'Member Name', required: true },
    { key: 'Office', label: 'Office', type: 'select', options: ['CHAIRPERSON', 'VICE CHAIRPERSON', 'GENERAL SECRETARY', 'JOINT SECRETARY', 'TREASURER', 'MEMBER'] },
    { key: 'Contact No', label: 'Contact No' },
    { key: 'CNIC', label: 'CNIC' },
    { key: 'Is Trained', label: 'Is Trained', type: 'select', options: YES_NO },
  ]),
  ssrReport('data-missing-in-ssr', 'Add Sanction/HR/Enrollment Record', [
    num('Sanction Posts (SSR)', 'Sanction Posts (SSR)'),
    num('HR Posts (HRMIS)', 'HR Posts (HRMIS)'),
    num('Enrollment (SSR)', 'Enrollment (SSR)'),
    num('Enrollment (iEMIS)', 'Enrollment (iEMIS)'),
    { key: 'Missing Detail', label: 'Missing Detail', type: 'textarea', full: true },
  ]),
  ssrReport('new-staff-details', 'Add New Staff Record', [
    { key: 'Staff Name', label: 'Staff Name', required: true },
    { key: 'Designation', label: 'Designation' },
    { key: 'BPS', label: 'BPS', type: 'number' },
    { key: 'Joining Date', label: 'Joining Date', type: 'date' },
    { key: 'Recruitment Type', label: 'Recruitment Type' },
  ]),
  ssrReport('building-details-data-missing-in-ssr', 'Add Building Data Record', [
    num('Total Rooms', 'Total Rooms'),
    num('Kacha Rooms', 'Kacha Rooms'),
    num('Pakka Rooms', 'Pakka Rooms'),
    { key: 'Missing Detail', label: 'Missing Detail', type: 'textarea', full: true },
  ]),
  ssrReport('basic-facilities-data-missing-in-ssr', 'Add Basic Facilities Data', [
    { key: 'Facility', label: 'Facility', type: 'select', options: ['ELECTRICITY', 'WATER', 'TOILET', 'BOUNDARY WALL', 'FURNITURE', 'SOLAR', 'OTHER'], required: true },
    { key: 'Available', label: 'Available', type: 'select', options: YES_NO },
    { key: 'Missing Detail', label: 'Missing Detail', type: 'textarea', full: true },
  ]),
  ssrReport('classwise-enrollment-report-ss', 'Add Classwise Enrollment', [
    { key: 'Class', label: 'Class', type: 'select', options: CLASSES, required: true },
    num('Boys', 'Boys'), num('Girls', 'Girls'), num('Total', 'Total'),
  ]),
  ssrReport('learning-difficult-students-report-ssr', 'Add Learning Difficult Student', [
    { key: 'Student Name', label: 'Student Name', required: true },
    { key: 'Class', label: 'Class', type: 'select', options: CLASSES },
    { key: 'Difficulty Type', label: 'Difficulty Type', type: 'select', options: ['READING', 'WRITING', 'NUMERACY', 'MEMORY', 'OTHER'] },
    { key: 'Support Provided', label: 'Support Provided', type: 'textarea', full: true },
  ]),
  ssrReport('disable-students-report-ssr', 'Add Disable Student', [
    { key: 'Student Name', label: 'Student Name', required: true },
    { key: 'Class', label: 'Class', type: 'select', options: CLASSES },
    { key: 'Disability Type', label: 'Disability Type', type: 'select', options: ['PHYSICAL', 'VISUAL', 'HEARING', 'INTELLECTUAL', 'OTHER'] },
    { key: 'CNIC / Form-B', label: 'CNIC / Form-B' },
  ]),
]

for (const [key, def] of SSR_REPORT_CONFIGS) {
  MODULE_FORMS[key] = def
}
