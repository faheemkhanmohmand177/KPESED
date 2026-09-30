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
  type?: 'text' | 'date' | 'number' | 'select' | 'textarea' | 'radio' | 'url' | 'static' | 'file' | 'note'
  options?: string[]
  required?: boolean
  defaultValue?: string
  full?: boolean
  /** Helper line rendered under the input (e.g. live OOSC helper text). */
  hint?: string
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

  /* ================= Office/School MIS =================

  The six Office/School Reports (Basic Facilities, Security Measures, School
  Stories, PTC Details, Commodities, IT Lab) and School Data Certificates are
  READ-ONLY Interactive Reports on the live portal (Search + Actions only, no
  Create button). They therefore have no MODULE_FORMS entry here — exact live
  parity is maintained by real-modules.ts column/filter configs. */

  /* Live "Content for Social Media Form" modal (captured 2026-09-30):
     School (readonly display) / Content Type radios Picture-Video (required) /
     Uploade Media file input (live typo preserved) / OR / Google Drive link /
     Comments (required) / Status select [-- Select status -- | Pending Review]. */
  'content-for-social-media-report': {
    createLabel: 'Create',
    formTitle: 'Content for Social Media Form',
    submitLabel: 'Create',
    fields: [
      { key: 'School', label: 'School', type: 'static', required: true, full: true },
      { key: 'Content Type', label: 'Content Type', type: 'radio', options: ['Picture', 'Video'], required: true },
      { key: 'Uploade Media (Picture/Videos) - 10mb max', label: 'Uploade Media (Picture/Videos) - 10mb max', type: 'file', full: true },
      { key: '_or_separator', label: 'OR', type: 'note', full: true },
      { key: 'Google Drive or any other link containing media', label: 'Google Drive or any other link containing media', full: true },
      { key: 'Comments', label: 'Comments', type: 'textarea', required: true, full: true },
      { key: 'Status', label: 'Status', type: 'select', options: ['-- Select status --', 'Pending Review'], required: true },
    ],
    functionalFilter: { key: 'Status', label: 'Status', options: ['Pending Review'] },
  },

  /* ================= Students MIS =================

  Enrolment Campaign Report (enrolment-campaign-status) / Enrollment Campaign
  Activities / Students Attendance Report / Active Student Session Wise are
  read-only reports on the live portal (no Create button) — no forms here.
  Enrolment Campaign Target and Daily Students Enrolment use the dedicated
  StudentsMisPage implementations (live "Save Record" IG workflow).
  */

  /* ================= SSR =================

  Live "School Self Report (SSR) Form" page: SCHOOL LIST report with the
  UPDATE NA/PK/NC/VC action button, Print SSR / LOCK row links. */
  'ssr-entry-form': {
    createLabel: 'UPDATE NA/PK/NC/VC',
    formTitle: 'SSR — Update NA/PK/NC/VC',
    submitLabel: 'Update',
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

  /* ================= PTC MIS / Hiring =================

  Applicants List (PTC) is a read-only talent-pool report on the live portal
  (no Add Applicant button) — no form entry. */

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

  /* Book Demand Details is a read-only report on the live portal
     (Demand Year + Shift filters, Search/Actions only — no Add button). */

  /* ================= Dengue ================= */

  /* Live "Add Dengue Control Campaign" modal: School Details (Office/School Name
     combo) + Add Task (Stagnant Water Status YES/NO, Spray Arranged YES/NO,
     Remarks, Images upload "Image Formats JPEG,PNG,BMP,JPG ...!", Videos upload
     "Video Formats MP4,AVI files …!"). */
  'dengue-control-campaign': {
    createLabel: 'Add Dengue Control Campaign',
    formTitle: 'Add Dengue Control Campaign',
    submitLabel: 'Create',
    fields: [
      { key: 'Office/School Name', label: 'Office/School Name', type: 'static', required: true, full: true },
      { key: 'Stagnant Water Status', label: 'Stagnant Water Status', type: 'radio', options: YES_NO, required: true },
      { key: 'Spray Arranged', label: 'Spray Arranged', type: 'radio', options: YES_NO },
      { key: 'Remarks', label: 'Remarks', type: 'textarea', full: true },
      { key: 'Images', label: 'Images', type: 'file', hint: 'Image Formats JPEG,PNG,BMP,JPG ...!', full: true },
      { key: 'Videos', label: 'Videos', type: 'file', hint: 'Video Formats MP4,AVI files …!', full: true },
    ],
  },

}

/* ================= 16 SSR report modules =================
   All sixteen SSR report pages (Teacher Disable .. Disable Students) are
   READ-ONLY Interactive Reports on the live portal — each shows only the
   SSR Session Year filter (+ Reports select on several) with Search/Actions
   and a "No data found." empty state. No Create/Add buttons exist there, so
   no MODULE_FORMS entries are registered. Data entry happens on the
   "School Self Report (SSR) Form" page itself (UPDATE NA/PK/NC/VC).
*/
