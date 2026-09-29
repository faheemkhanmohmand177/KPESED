/**
 * REAL-MODULE CONFIGS — generated from a read-only capture of the live
 * iemis.kpese.gov.pk School Admin portal (2026-09-29).
 *
 * Every title, filter, column, empty-state message, tab and saved-report name
 * below is copied verbatim from the live pages so the clone renders 1:1 report
 * workspaces. Data itself is NOT copied — records live in this app's own DB.
 */

export type RealFilterKind = 'select' | 'text' | 'date' | 'radio' | 'readonly'

export interface RealFilterField {
  label: string
  kind: RealFilterKind
  options?: string[]
  value?: string
  disabled?: boolean
}

export interface RealRegion {
  title: string
  columns: string[]
  empty: string
}

export type RealModuleMode = 'irr' | 'ig' | 'charts' | 'form' | 'ora' | 'attachments'

export interface RealModuleConfig {
  key: string
  parent: string
  title: string
  mode: RealModuleMode
  notice?: string
  tabs?: string[]
  filters?: RealFilterField[]
  columns?: string[]
  igColumns?: string[]
  regions?: RealRegion[]
  empty?: string
  savedReports?: string[]
  actions?: string[]
  charts?: string[]
  oraText?: string
  rows?: Array<Record<string, string>>
  formFields?: RealFilterField[]
  displayVals?: string[]
  bankRemarksOptions?: string[]
}

export const REAL_MODULES: Record<string, RealModuleConfig> = {

  "active-student-session-wise-student": {
    key: "active-student-session-wise-student",
    parent: "Students MIS",
    title: "Active Student Session Wise Student Report",
    mode: "irr",
    columns: ["District", "School Gender", "Session Year", "Total"],
    empty: "No data found.",
  },
  "applicants-list-ptc": {
    key: "applicants-list-ptc",
    parent: "PTC Hiring (Talent Pool)",
    title: "Applicants List (PTC)",
    mode: "irr",
    filters: [
      { label: "School Gender", kind: "select", options: ["-- Select Gender --", "MALE"], value: "MALE" },
    ],
    columns: ["Email Address (Username)", "CNIC #", "Applicant Name", "Father Name", "Gender", "Degree Certificate", "Professional Degree", "Mobile #", "Date of Birth", "Domicile", "Tehsil", "Union Council", "Vaccinated", "City", "Bank", "Account #", "Obtained Marks", "Demo Marks", "Grant Total", "School District", "EMIS Code", "School Name", "School Gender", "Designation", "Cadre", "Posted From", "DSS Enrollment", "District", "Double Shift", "Head Title", "Release Year", "Last Applied Date", "Record Lock"],
    empty: "No data found.",
    savedReports: ["1. Primary Report", "2. DSS HR", "1. Double Shift", "2. Total Applied", "3. Total Hired"],
  },
  "basic-facilities-data-missing-in-ssr": {
    key: "basic-facilities-data-missing-in-ssr",
    parent: "School Self Report (SSR) Form",
    title: "Basic Facilities Data Missing in SSR",
    mode: "irr",
    filters: [
      { label: "SSR Session Year", kind: "select", options: ["-- Select SSR session year --", "SSR (2025-26) - 2025-26", "SSR (2026-27) -", "SSR(2023-24) - 2023-24", "SSR(2024-25) - 2024-25"], value: "" },
    ],
    empty: "Basic Facilities Data Missing in SSR No data found.",
  },
  "basic-facilities-report": {
    key: "basic-facilities-report",
    parent: "Office/School Reports",
    title: "Basic Facilities Report",
    mode: "irr",
    columns: ["EMIS Code", "School Name", "School Gender", "District", "Tehsil", "Directorate", "Visit Date", "Solar", "Solar Status", "Wapda", "Wapda Status", "Generator", "Turbine", "Direct Connection", "Line From Other", "UPS", "Other Source", "Boundary Wall Available", "Boundary Wall Status", "Water Well", "Water Well (Drinkable)", "Water Bore", "Water Bore (Drinkable)", "Tubewell", "Tubewell (Drinkable)", "Water Pipe Connection", "Water Pipe Connection (Drinkable)", "Water Neighbors", "Water Neighbors (Drinkable)", "Water Matka Container", "Water Matka Container (Drinkable)", "No of Toilets (Staff)", "No of Functional Toilets (Staff)", "No of Toilets (Student)", "No of Functional Toilets (Student)", "No of Under Construction Toilets"],
    empty: "No data found.",
  },
  "book-demand-details": {
    key: "book-demand-details",
    parent: "Textbook Board",
    title: "Book Demand Details",
    mode: "irr",
    empty: "No data found.",
    savedReports: ["1. Primary Report", "1. BOOK DEMAND", "2. BOOK DEMAND", "3. books demand", "4. Books demand", "5. Books Demand GGPS Zarif Abad", "6. Books demond List GPS Atani", "7. Demand Book Saidallian", "8. DEMANDS OF BOOKS 2023-2024", "9. Free text books proferma2027", "10. GPS Atani", "11. Ifti", "12. ZZZZ"],
  },
  "building-details-data-missing-in-ssr": {
    key: "building-details-data-missing-in-ssr",
    parent: "School Self Report (SSR) Form",
    title: "Building Details Data Missing in SSR",
    mode: "irr",
    filters: [
      { label: "SSR Session Year", kind: "select", options: ["-- Select SSR session year --", "SSR (2025-26) - 2025-26", "SSR (2026-27) -", "SSR(2023-24) - 2023-24", "SSR(2024-25) - 2024-25"], value: "" },
    ],
    empty: "Building Details Data Missing in SSR No data found.",
  },
  "classwise-enrollment-report-ss": {
    key: "classwise-enrollment-report-ss",
    parent: "School Self Report (SSR) Form",
    title: "Classwise Enrollment Report (SSR)",
    mode: "irr",
    filters: [
      { label: "SSR Session Year", kind: "select", options: ["-- Select SSR session year --", "SSR (2025-26) - 2025-26", "SSR (2026-27) -", "SSR(2023-24) - 2023-24", "SSR(2024-25) - 2024-25"], value: "" },
    ],
    empty: "No data found.",
  },
  "content-for-social-media-report": {
    key: "content-for-social-media-report",
    parent: "Office/School MIS",
    title: "Content for Social Media",
    mode: "irr",
    tabs: ["Content Received"],
    empty: "No data found.",
    actions: ["Create"],
  },
  "data-missing-in-ssr": {
    key: "data-missing-in-ssr",
    parent: "School Self Report (SSR) Form",
    title: "Sanction/HR/Enrollments Details Data Missing in SSR",
    mode: "irr",
    filters: [
      { label: "SSR Session Year", kind: "select", options: ["-- Select SSR session year --", "SSR (2025-26) - 2025-26", "SSR (2026-27) -", "SSR(2023-24) - 2023-24", "SSR(2024-25) - 2024-25"], value: "" },
    ],
    empty: "No data found.",
  },
  "dengue-control-campaign": {
    key: "dengue-control-campaign",
    parent: "Main",
    title: "Dengue Control Campaign",
    mode: "irr",
    empty: "Dengue Control Campaign List Data Not Found …!",
    actions: ["Add Dengue Control Campaign"],
  },
  "disable-students-report-ssr": {
    key: "disable-students-report-ssr",
    parent: "School Self Report (SSR) Form",
    title: "Disable Students Report SSR",
    mode: "irr",
    filters: [
      { label: "SSR Session Year", kind: "select", options: ["-- Select SSR session year --", "SSR (2025-26) - 2025-26", "SSR (2026-27) -", "SSR(2023-24) - 2023-24", "SSR(2024-25) - 2024-25"], value: "" },
    ],
    empty: "Disable Students Report (SSR) No data found.",
  },
  "dps-iemis-updation-emrollment": {
    key: "dps-iemis-updation-emrollment",
    parent: "District Performance ScoreCard (DPS)",
    title: "DPS - iEMIS Updation (Enrollment - Comparison b/w Class-wise Entry and Profiles) - 5 Marks",
    mode: "irr",
    empty: "No data found.",
    displayVals: ["MOHMAND", "MALE"],
  },
  "dps-iemis-updation-human-resource-mis": {
    key: "dps-iemis-updation-human-resource-mis",
    parent: "District Performance ScoreCard (DPS)",
    title: "DPS - iEMIS Updation (Human Resource MIS) - 10 Marks",
    mode: "irr",
    empty: "No data found.",
    displayVals: ["MOHMAND", "MALE"],
  },
  "dps-iemis-updation-osmis": {
    key: "dps-iemis-updation-osmis",
    parent: "District Performance ScoreCard (DPS)",
    title: "DPS - iEMIS Updation (Office-School MIS) - 10 Marks",
    mode: "irr",
    empty: "No data found.",
    displayVals: ["MOHMAND", "MALE"],
  },
  "dps-rankings": {
    key: "dps-rankings",
    parent: "Topbar",
    title: "DPS - Rankings",
    mode: "attachments",
    columns: ["Title", "Attachment"],
    rows: [
      {"Title": "DPS for the month of September & October 2024", "Attachment": "Download"},
      {"Title": "District/Intra District Performance Score Card Final Scorecard (Cycle-1)", "Attachment": "Download"},
      {"Title": "DPS for the month of Jan & Feb 2025", "Attachment": "Download"},
      {"Title": "DPS for the month of March & April 2025", "Attachment": "Download"},
    ],
  },
  "enrollment-by-group-section-ssr": {
    key: "enrollment-by-group-section-ssr",
    parent: "School Self Report (SSR) Form",
    title: "Student Enrollment by Group/ Section",
    mode: "irr",
    filters: [
      { label: "SSR Session Year", kind: "select", options: ["-- Select SSR session year --", "SSR (2025-26) - 2025-26", "SSR (2026-27) -", "SSR(2023-24) - 2023-24", "SSR(2024-25) - 2024-25"], value: "" },
    ],
    empty: "No data found.",
  },
  "enrolment-campaign-activities": {
    key: "enrolment-campaign-activities",
    parent: "Students MIS",
    title: "ENROLMENT CAMPAIGN ACTIVITIES",
    mode: "irr",
    tabs: ["Daily Campaign Activities"],
    empty: "No data found.",
  },
  "learning-difficult-students-report-ssr": {
    key: "learning-difficult-students-report-ssr",
    parent: "School Self Report (SSR) Form",
    title: "Learning Difficult Students Report (SSR)",
    mode: "irr",
    filters: [
      { label: "SSR Session Year", kind: "select", options: ["-- Select SSR session year --", "SSR (2025-26) - 2025-26", "SSR (2026-27) -", "SSR(2023-24) - 2023-24", "SSR(2024-25) - 2024-25"], value: "" },
    ],
    empty: "Learning Difficult Students Report (SSR) No data found.",
  },
  "monitoring-dashboard": {
    key: "monitoring-dashboard",
    parent: "Main",
    title: "Monitoring Dashboard",
    mode: "charts",
    charts: ["Employee Comparison (ASC & iEMIS)", "Schools Comparison (ASC & iEMIS)", "Students Comparison (ASC & iEMIS)", "Sanction Posts Comparison (ASC & iEMIS)"],
  },
  "monthly-data-updation-report": {
    key: "monthly-data-updation-report",
    parent: "Office/School MIS",
    title: "School Data Certificates",
    mode: "irr",
    filters: [
      { label: "School Gender", kind: "select", options: ["-- Select Gender --", "MALE"], value: "MALE" },
    ],
    empty: "No data found.",
    savedReports: ["1. Primary Report", "1. 1Jun 2024", "2. 23719", "3. Anwar khan", "4. August updation", "5. BILAL ENROLLMEN56", "6. bilal monthly report", "7. bilal Monthly Updation Report", "8. DEFAULTERS SCHOOLS (MOHMAND-M) BY ARM", "9. DEFAULTERS SCHOOLS (MOHMAND-M) BY ARM", "10. GGHS DAG GOSAM", "11. GGMS Urmal Dhere July 2024 Rwport", "12. GHS sehakiBala monthly report", "13. GMSSANDOWA", "14. Jun 2024", "15. Mehreen Abid", "16. monthly report", "17. monthly report", "18. monthly report", "19. monthly report"],
  },
  "new-staff-details": {
    key: "new-staff-details",
    parent: "School Self Report (SSR) Form",
    title: "New Staff Details",
    mode: "irr",
    filters: [
      { label: "SSR Session Year", kind: "select", options: ["-- Select SSR session year --", "SSR (2025-26) - 2025-26", "SSR (2026-27) -", "SSR(2023-24) - 2023-24", "SSR(2024-25) - 2024-25"], value: "" },
    ],
    empty: "No data found.",
  },
  "ptc-headwise-balance": {
    key: "ptc-headwise-balance",
    parent: "PTC MIS",
    title: "HEADWISE AVAILABLE AMOUNT IN PTC ACCOUNT",
    mode: "ig",
    notice: "AMOUNT MUST BE ENTERED IN PAK RUPEES ONLY (NOT IN MILLION OR BILLION)",
    tabs: ["PTC Available Balance Entry Form", "PTC Amount (Report)"],
    igColumns: ["Emis Code", "School Name", "School Gender", "School Level", "District", "Tehsil", "NC/VC Name", "Additional Class Room", "Group Latrine", "Boundary Wall", "Solarization", "Electrification", "Water Supply", "DSS Settled", "DSS Merged", "CRC", "Petty Repair", "Autonomy Budget", "PTC Hiring", "Other Funds Donated by(Name of Org./Donors/NGOs)", "Other FundsTotal Amount", "Bank Profit", "Total AvailableBalance (PKR)", "Bank Name", "Bank Remakrs", "Branch Name", "Branch Code", "Account IBAN #", "Update By", "Update Date"],
    empty: "No data found",
    savedReports: ["1. Primary Report", "2. District-wise Total Balance Including Bank Profit", "3. Work Status District-wise"],
    bankRemarksOptions: ["Active", "Dormant", "Inactive"],
  },
  "ptc-schools-list": {
    key: "ptc-schools-list",
    parent: "PTC MIS",
    title: "PTC Schools List",
    mode: "irr",
    empty: "PTC Data Not Found...!",
    actions: ["Add School"],
  },
  "sanctioned-filled-posts-detail-report-ssr": {
    key: "sanctioned-filled-posts-detail-report-ssr",
    parent: "School Self Report (SSR) Form",
    title: "Sanctioned/Filled Posts Detail Report (SSR)",
    mode: "irr",
    filters: [
      { label: "SSR Session Year", kind: "select", options: ["-- Select SSR session year --", "SSR (2025-26) - 2025-26", "SSR (2026-27) -", "SSR(2023-24) - 2023-24", "SSR(2024-25) - 2024-25"], value: "" },
    ],
    empty: "Sanctioned/Filled Posts Detail Report (SSR) No data found.",
  },
  "school-basic-information-ssr-report": {
    key: "school-basic-information-ssr-report",
    parent: "School Self Report (SSR) Form",
    title: "School Basic Information SSR Report",
    mode: "irr",
    filters: [
      { label: "SSR Session Year", kind: "select", options: ["-- Select SSR session year --", "SSR (2025-26) - 2025-26", "SSR (2026-27) -", "SSR(2023-24) - 2023-24", "SSR(2024-25) - 2024-25"], value: "" },
    ],
    empty: "School Basic Information SSR Report No data found.",
  },
  "school-commodities": {
    key: "school-commodities",
    parent: "Office/School Reports",
    title: "School Commodities",
    mode: "irr",
    columns: ["District", "Tehsil", "EMIS Code", "School Name", "Level", "School Gender", "Std Desk 2 Seater Available", "Std Desk 2 Seater Useable", "Std Desk 2 Seater Unuseable", "Std Desk 2 Seater New Required", "Std Desk 2 Seater New Provided", "Std Desk 2 Seater Repaired", "Std Desk 3 Seater Available", "Std Desk 3 Seater Useable", "Std Desk 3 Seater Unuseable", "Std Desk 3 Seater New Required", "Std Desk 3 Seater New Provided", "Std Desk 3 Seater Repaired", "Std Bench 2 Seater Available", "Std Bench 2 Seater Useable", "Std Bench 2 Seater Unuseable", "Std Bench 2 Seater New Required", "Std Bench 2 Seater New Provided", "Std Bench 2 Seater Repaired", "Std Bench 3 Seater Available", "Std Bench 3 Seater Useable", "Std Bench 3 Seater Unuseable", "Std Bench 3 Seater New Required", "Std Bench 3 Seater New Provided", "Std Bench 3 Seater Repaired", "Std Chair Available", "Std Chair Useable", "Std Chair Unuseable", "Std Chair New Required", "Std Chair New Provided", "Std Chair Repaired", "Tablet Chair Available", "Tablet Chair Useable", "Tablet Chair Unuseable", "Tablet Chair New Required", "Tablet Chair New Provided", "Tablet Chair Repaired", "Jute Tat Available", "Jute Tat Useable", "Jute Tat Unuseable", "Jute Tat New Required", "Jute Tat New Provided", "Jute Tat Repaired", "Carpet Mat Available", "Carpet Mat Useable", "Carpet Mat Unuseable", "Carpet Mat New Required", "Carpet Mat New Provided", "Carpet Mat Repaired", "Fan Available", "Fan Useable", "Fan Unuseable", "Fan New Required", "Fan New Provided", "Fan Repaired", "Tlm Available", "Tlm Useable", "Tlm Unuseable", "Tlm New Required", "Tlm New Provided", "Tlm Repaired", "Bulb Tube Available", "Bulb Tube Useable", "Bulb Tube Unuseable", "Bulb Tube New Required", "Bulb Tube New Provided", "Bulb Tube Repaired", "Office Teacher Table Available", "Office Teacher Table Useable", "Office Teacher Table Unuseable", "Office Teacher Table New Required", "Office Teacher Table New Provided", "Office Teacher Table Repaired", "Office Teacher Chair Available", "Office Teacher Chair Useable", "Office Teacher Chair Unuseable", "Office Teacher Chair New Required", "Office Teacher Chair New Provided", "Office Teacher Chair Repaired", "Computer Table Available", "Computer Table Useable", "Computer Table Unuseable", "Computer Table New Required", "Computer Table New Provided", "Computer Table Repaired", "Computer Chair Available", "Computer Chair Useable", "Computer Chair Unuseable", "Computer Chair New Required", "Computer Chair New Provided", "Computer Chair Repaired", "Black Green Board Available", "Black Green Board Useable", "Black Green Board Unuseable", "Black Green Board New Required", "Black Green Board New Provided", "Black Green Board Repaired", "White Board Available", "White Board Useable", "White Board Unuseable", "White Board New Required", "White Board New Provided", "White Board Repaired", "Almirah Available", "Almirah Useable", "Almirah Unuseable", "Almirah New Required", "Almirah New Provided", "Almirah Repaired", "Black Green Noticeboard Available", "Black Green Noticeboard Useable", "Black Green Noticeboard Unuseable", "Black Green Noticeboard New Required", "Black Green Noticeboard New Provided", "Black Green Noticeboard Repaired", "White Noticeboard Available", "White Noticeboard Useable", "White Noticeboard Unuseable", "White Noticeboard New Required", "White Noticeboard New Provided", "White Noticeboard Repaired", "Sm Tablet Chair Available", "Sm Tablet Chair Newprov", "Sm Tablet Chair Newreq", "Sm Tablet Chair Repaired", "Sm Tablet Chair Unuseable", "Sm Tablet Chair Useable"],
    empty: "No data found.",
  },
  "school-commodities-for-students-ssr-report": {
    key: "school-commodities-for-students-ssr-report",
    parent: "School Self Report (SSR) Form",
    title: "School Commodities for Students SSR Report",
    mode: "irr",
    filters: [
      { label: "SSR Session Year", kind: "select", options: ["-- Select SSR session year --", "SSR (2025-26) - 2025-26", "SSR (2026-27) -", "SSR(2023-24) - 2023-24", "SSR(2024-25) - 2024-25"], value: "" },
    ],
    empty: "School Commodities for Students SSR Report No data found.",
  },
  "school-it-information-ssr-report": {
    key: "school-it-information-ssr-report",
    parent: "School Self Report (SSR) Form",
    title: "School IT Information SSR Report (IT Lab Excluded)",
    mode: "irr",
    filters: [
      { label: "SSR Session Year", kind: "select", options: ["-- Select SSR session year --", "SSR (2025-26) - 2025-26", "SSR (2026-27) -", "SSR(2023-24) - 2023-24", "SSR(2024-25) - 2024-25"], value: "" },
    ],
    empty: "School IT Information SSR Report (IT Lab Excluded) No data found.",
  },
  "school-it-lab-report": {
    key: "school-it-lab-report",
    parent: "Office/School Reports",
    title: "School IT Lab Details",
    mode: "irr",
    columns: ["District", "Tehsil", "EMIS Code", "School Name", "Level", "School Gender", "Is IT Lab Available", "Date of Establishment", "Is IT Lab Functional", "Established By", "Firm Name", "No Of Computer", "No Of Functional Computer", "Is Internet Available", "Is Printer Available", "Is Projector Available", "Is Scanner Available", "Is Interactive Screen Available", "Is Interactive Screen Functional", "Generator For Wb Avail", "Ict Computer Avail", "Ict For Pedagogy In Use", "Ict Material In Use Online", "Ict No Of Computers", "Ict No Of Printers", "Ict Printer Avail", "Ineternet Speed In Mb", "Interactive Wb Available", "Interactive Wb Functional", "Mobile Tablet Avail", "No Of Functional Tablets", "No Of Mobile Tablets", "Solar Sys For Wb Avail", "Ups For Wb Avail", "Wired Landline Internet", "Wireless Jazz", "Wireless Other Name", "Wireless Telenor", "Wireless Ufone", "Wireless Zong", "Biometric Device Avail", "Biometric Device Functional"],
    empty: "No data found.",
  },
  "school-nature-of-construction-ssr-report": {
    key: "school-nature-of-construction-ssr-report",
    parent: "School Self Report (SSR) Form",
    title: "School Nature of Construction SSR Report",
    mode: "irr",
    filters: [
      { label: "SSR Session Year", kind: "select", options: ["-- Select SSR session year --", "SSR (2025-26) - 2025-26", "SSR (2026-27) -", "SSR(2023-24) - 2023-24", "SSR(2024-25) - 2024-25"], value: "" },
    ],
    empty: "School Nature of Construction SSR Report No data found.",
  },
  "school-ptc-details": {
    key: "school-ptc-details",
    parent: "Office/School Reports",
    title: "School PTC Details",
    mode: "irr",
    columns: ["District", "Tehsil", "EMIS Code", "School", "School Gender", "Level", "Bank Name", "Branch Code", "Branch Name", "Account Iban", "Is Established", "Established Date", "Chairperson Name", "Chairperson Contact", "Is Members Trained", "Last Election Date", "Meetings Held Cur Academic Session"],
    empty: "No data found.",
    savedReports: ["1. Primary Report", "2. PTC Data Completed", "3. PTC Not Established or Wrong Entries", "4. PTC Not Reported"],
  },
  "school-ptc-details-members": {
    key: "school-ptc-details-members",
    parent: "School Self Report (SSR) Form",
    title: "School PTC Members",
    mode: "irr",
    filters: [
      { label: "SSR Session Year", kind: "select", options: ["-- Select SSR session year --", "SSR (2025-26) - 2025-26", "SSR (2026-27) -", "SSR(2023-24) - 2023-24", "SSR(2024-25) - 2024-25"], value: "" },
    ],
    empty: "No data found.",
  },
  "school-stories-report": {
    key: "school-stories-report",
    parent: "Office/School Reports",
    title: "School Stories (Room) Report",
    mode: "irr",
    columns: ["District", "Tehsil", "EMIS Code", "School Name", "Level", "School Gender", "Directorate", "Room in Basement", "Room on Ground", "Room on First Floor", "Room on Second Floor", "Room on Third Floor", "Total Rooms"],
    empty: "No data found.",
  },
  "section-classes-section": {
    key: "section-classes-section",
    parent: "Students MIS",
    title: "School Classes Section",
    mode: "irr",
    filters: [
      { label: "Shift", kind: "radio", options: ["S", "M"], value: "S" },
    ],
    regions: [
      { title: "Classes Name List", columns: [], empty: "Classes Name List Not Found..!" },
      { title: "Subject Groups", columns: [], empty: "Subject Groups Data Not Found..!" },
      { title: "Subject List", columns: [], empty: "Subject List Data Not Found..!" },
      { title: "CLASS SECTION LIST", columns: [], empty: "Class Section Record Not Found...!" },
    ],
  },
  "security-measures-report": {
    key: "security-measures-report",
    parent: "Office/School Reports",
    title: "Security Measures Report",
    mode: "irr",
    columns: ["EMIS Code", "School Name", "School Gender", "District", "Tehsil", "Directorate", "Visit Date", "School Main Gate Available", "No of School Gates", "CCTV Camera", "No of CCTV Camera", "No of CCTV Functional Camera", "No Of Security Guards Private", "No Of Weapons School Owned", "No Of Metal Detectors", "Barbed Wire", "Glass Spikes", "Entrance Blocks", "Attacks (Registered FIR)", "No of Attacks On Institute", "No of Attacks On Personnel", "No of Attacks On Student", "Number of Incidents of corporal Punishment reported in the c"],
    empty: "No data found.",
  },
  "ssr-entry-form": {
    key: "ssr-entry-form",
    parent: "School Self Reporting (SSR)",
    title: "SSR Monitoring Dashboard",
    mode: "irr",
    empty: "No data found.",
    actions: ["UPDATE NA/PK/NC/VC"],
  },
  "staff-detail-report-ssr": {
    key: "staff-detail-report-ssr",
    parent: "School Self Report (SSR) Form",
    title: "Staff Detail Report (SSR)",
    mode: "irr",
    filters: [
      { label: "SSR Session Year", kind: "select", options: ["-- Select SSR session year --", "SSR (2025-26) - 2025-26", "SSR (2026-27) -", "SSR(2023-24) - 2023-24", "SSR(2024-25) - 2024-25"], value: "" },
    ],
    empty: "Staff Detail Report (SSR) No data found.",
  },
  "staff-leaves-report": {
    key: "staff-leaves-report",
    parent: "HR MIS",
    title: "Employee Leaves Report",
    mode: "irr",
    filters: [
      { label: "School Gender", kind: "select", options: ["-- Select Gender --", "MALE"], value: "MALE" },
    ],
    empty: "Staff Leaves Report Not Found...!",
    savedReports: ["1. Primary Report", "2. Employees currently on Leave", "1. Tayyaba Begum"],
  },
  "student-attendance-report": {
    key: "student-attendance-report",
    parent: "Students MIS",
    title: "SCHOOL DETAIL",
    mode: "irr",
    filters: [
      { label: "Attendance Date", kind: "text", value: "" },
    ],
    empty: "No data found.",
  },
  "student-attendence": {
    key: "student-attendence",
    parent: "Students MIS",
    title: "Student Attendance",
    mode: "ig",
    filters: [
      { label: "Attendance Date", kind: "text", value: "", disabled: true },
    ],
    igColumns: ["ID", "Name", "Father Name", "Gender", "Section", "Class Roll #", "Session", "Status"],
    empty: "Student Attendance Data Not Found...!",
    actions: ["Edit", "Save", "Add Row", "Reset", "Report View"],
  },
  "student-class-promotion": {
    key: "student-class-promotion",
    parent: "Students MIS",
    title: "SCHOOL DETAIL",
    mode: "ig",
    filters: [
      { label: "New Session", kind: "readonly", value: "" },
      { label: "For Migration", kind: "radio", options: ["Y"], value: "Y" },
      { label: "Promoted Date", kind: "text", value: "", disabled: true },
    ],
    igColumns: ["Student ID", "Name", "Father Name", "Gender", "Father CNIC", "Class", "Section", "Subject Group", "Admission #", "Status", "To Class", "Class Section", "New Admission #", "Certificate Issue"],
    empty: "Promotion Student List Not Found …!",
    actions: ["Edit", "Save", "Add Row", "Reset", "Report View"],
  },
  "student-class-promotion-double-shift": {
    key: "student-class-promotion-double-shift",
    parent: "Students MIS",
    title: "SCHOOL DETAIL",
    mode: "ig",
    filters: [
      { label: "New Session", kind: "readonly", value: "" },
      { label: "For Migration", kind: "radio", options: ["Y"], value: "Y" },
      { label: "Promoted Date", kind: "text", value: "", disabled: true },
    ],
    igColumns: ["Student ID", "Name", "Father Name", "Gender", "Father CNIC", "Class", "Section", "Subject Group", "Admission #", "Status", "To Class", "Class Section", "New Admission #", "Certificate Issue"],
    empty: "Promotion Student List Not Found …!",
    actions: ["Edit", "Save", "Add Row", "Reset", "Report View"],
  },
  "student-migration": {
    key: "student-migration",
    parent: "Students MIS",
    title: "Student Migration",
    mode: "form",
    tabs: ["Student", "Profile", "Family Detail", "Classes Detail", "View Certificate List"],
    formFields: [
      { label: "District", kind: "text", value: "MOHMAND" },
      { label: "School Gender", kind: "text", value: "MALE" },
      { label: "Select School", kind: "text", value: "GMS TAJ MUHAMMAD HALIMZAI" },
      { label: "Co-Education", kind: "readonly", value: "" },
      { label: "Student ID", kind: "text", value: "" },
      { label: "Student Name", kind: "readonly", value: "" },
      { label: "Father Name", kind: "readonly", value: "" },
      { label: "Mother Name", kind: "readonly", value: "" },
      { label: "Form-B/CNIC #", kind: "readonly", value: "" },
      { label: "Gender", kind: "readonly", value: "" },
    ],
  },
  "survey-tree-form": {
    key: "survey-tree-form",
    parent: "Main",
    title: "Survey Form - Demand for Environment Friendly Trees",
    mode: "ig",
    igColumns: ["Environment Friendly Tree", "Trees Demand", "Number of Trees Planted"],
    empty: "No data found",
    displayVals: ["GMS TAJ MUHAMMAD HALIMZAI"],
  },
  "teacher-attendance-report": {
    key: "teacher-attendance-report",
    parent: "HR MIS",
    title: "SCHOOL DETAIL",
    mode: "ora",
    filters: [
      { label: "Attendance Date", kind: "text", value: "" },
    ],
    oraText: "ORA-00904: \"A\".\"EMP_ID\": invalid identifier",
  },
  "teacher-disable-report-ssr": {
    key: "teacher-disable-report-ssr",
    parent: "School Self Report (SSR) Form",
    title: "Teacher Disable Report (SSR)",
    mode: "irr",
    filters: [
      { label: "SSR Session Year", kind: "select", options: ["-- Select SSR session year --", "SSR (2025-26) - 2025-26", "SSR (2026-27) -", "SSR(2023-24) - 2023-24", "SSR(2024-25) - 2024-25"], value: "" },
    ],
    empty: "Teacher Disable Report (SSR) No data found.",
  },
  "text-book-board-details": {
    key: "text-book-board-details",
    parent: "Textbook Board",
    title: "Text Book Board List",
    mode: "irr",
    empty: "No data found.",
    actions: ["Add Schools"],
  },
}
