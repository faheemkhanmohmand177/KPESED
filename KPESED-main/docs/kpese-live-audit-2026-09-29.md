# KPESED live audit — 29 September 2026

## Scope and safety

The live portal was inspected with the supplied **School Admin** account for `GMS TAJ MUHAMMAD HALIMZAI` (EMIS `66013`). The audit was read-only: no record was created, edited, deleted, saved, submitted, uploaded, downloaded, or locked. Lookup dialogs and report menus were opened only when they did not apply a change.

The portal is an Oracle APEX-style Integrated EMIS application with a blue top bar, dark tree navigation, compact report regions, interactive-report Actions menus, saved reports, rows-per-page controls, horizontal scrolling, and the footer `Developed By : EMIS E&SE Department`.

## Navigation coverage

The authenticated menu exposed these 12 top-level feature groups:

1. Office/School MIS — school profile, six office/school reports, certificates, social media.
2. HR MIS — employee profiles, teacher attendance, attendance report, leaves report.
3. Students MIS — 14 student/enrolment/promotion/attendance features.
4. School Self Reporting (SSR) — SSR form/monitoring dashboard plus role-dependent SSR routes in the navigation catalog.
5. Assets MIS — Asset Profile, Asset Details, Assets Report.
6. Survey — Environment Friendly Trees Form.
7. PTC MIS — PTC headwise balance and PTC school demand.
8. PTC Hiring (Talent Pool) — Applicants List (PTC).
9. Textbook Board — Free Textbook Demand List and Book Demand Details.
10. Monitoring Dashboard — four comparison charts.
11. Dengue Control Campaign.
12. District Performance ScoreCard (DPS) — DPS Rankings attachment report and related navigation entries.

## Key observations by group

| Group | Observed behavior | Important fields/controls |
|---|---|---|
| Office/School MIS | School-scoped reports and navigation shell; employee/student/SSR/asset routes are reachable from the same tree | Search, saved reports, Actions, rows 1/5/10/15/20/25/50/100/1000/All, View Report, View Pivot |
| HR MIS | Employee report returned 8 school-scoped employees; attendance is date-gated; leaves report empty; teacher attendance report showed `ORA-00904: "A"."EMP_ID": invalid identifier` | Employee tabs: Posted, Retired, Resign/Death/Shuhada/Removed/Others, Not Posted; attendance values Absent/Leave/On Duty/Present |
| Students MIS | Student report returned 63 records for EMIS 66013; target and daily-enrolment forms expose session/year/date and target inputs; upload, promotion, migration, classes, attendance and class-update workflows are present | Student columns include identity, school, class, session, status, vaccination, disability, admission, guardian and contact fields |
| SSR | SSR Monitoring Dashboard returned one row for EMIS 66013 with Print SSR and LOCK actions | EMIS Code, School Name, Gender, Co-Education, District, Tehsil, Level, Double Shift, Model Type, School Status, Status, Directorate, Lock Date |
| Assets MIS | Asset Profile has dependent school/type/category/name lookups and Save; Asset Details returned 228 assets; Assets Report returned 51 assets across two pages | Profile columns: Serial#, Code, Name, Date, Status, Type, Category, Donated By, Availability, Delete; report columns: District, School/Office, Level, EMIS, Gender, Asset Type, Category, Asset Name, Status, Total Asset |
| Trees survey | Interactive Grid with 31 tree rows, Edit/Save, Add Row, Reset, report Actions and editable Number of Trees Planted | Environment Friendly Tree, Trees Demand, Number of Trees Planted; observed Kikar 8 demand / 7 planted |
| PTC MIS | Headwise balance entry grid and report/pivot views; school row total balance was 603 | Head amount columns, bank/account fields, Bank Remarks choices Active/Dormant/Inactive, report/pivot controls |
| PTC Hiring | Applicants List returned 9 rows | Applicant identity, qualification, marks, posting, school, district and lock columns; saved reports include Primary, DSS HR, Double Shift, Total Applied, Total Hired |
| Textbook Board | Free Textbook Demand List returned the school row with Add Classes Book Demand; Add Schools dialog exposes morning/double-shift enrollment; Book Demand Details is year/shift dependent | Session/Demand Year, Shift, class demand, enrollment, report column shuttle and filter operators |
| Monitoring Dashboard | Four charts: employees, schools, students, sanction posts; ASC vs iEMIS series | Maximize/Restore, Horizontal/Vertical, Stack/Unstack; district/category axes |
| Dengue | Empty list state; Add dialog supports school lookup, YES/NO radios, remarks, image/video attachments | Empty text: `Dengue Control Campaign List Data Not Found …!`; Actions includes filter, chart, download and subscription |
| DPS | DPS Rankings report returned four attachment rows; temporary non-match search showed `No data found.` | Title and Attachment columns; four Download links; standard interactive-report Actions/Columns/Filter/Download/Help |

## Asset Profile behavior captured

The live Asset Profile page showed:

- District: `Select District` with `MOHMAND` available.
- School Gender: `MALE`.
- School Name: `GMS TAJ MUHAMMAD HALIMZAI`.
- Type: `CONSUMABLE` and `FIXED/MOVABLE`.
- Category and Asset Name dependent lookups.
- Donated By, Purchase Date defaulting to the current date, Quantity.
- Clear and Save controls.
- Saved report names including `1. Primary Report` and `1. Asset record of GMS Taj mohammad`.
- Example rows including `FILE AND FOLDER`, `ATTENDANCE REGISTER STUDENTS`, `SCHOOL LEAVING CERTIFICATE FILE`, `STOCK REGISTER`, and `MARKER`.
- Status values `FUNCTIONAL` / `NON-FUNCTIONAL` and availability `AVAILABLE`.

## Changes implemented in this repository

- Added `assets`, `asset_types`, `asset_categories`, and `asset_names` Supabase migration.
- Added a school-admin-scoped `Asset` Prisma model.
- Added authenticated `/api/assets` lookup, profile, details, report and create endpoints.
- Added authenticated `/api/assets/:id` delete endpoint with elevated-role override.
- Added dedicated Asset Profile, Asset Details and Assets Report pages, including report search, rows-per-page, CSV download, Actions/Refresh/Reset controls, dependent lookup data, empty states, and APEX-style columns.
- Wired all three asset routes into the existing portal shell.
- Seeded only the known school and one representative asset record when the matching school already exists; the migration does **not** import the source portal’s private dataset.

## Validation

- `npm run lint` — passed.
- `npx prisma generate` — passed.
- `npm run build` — passed.

## Limitations and honesty statement

This audit is comprehensive across the visible feature groups and menu structure, but it is not proof that every hidden role-specific route, every saved report variant, every dropdown value, every validation branch, or every attachment document was exhaustively cloned. Those behaviors would require mutation, download, alternate roles, or changing filters, which were intentionally not performed. The existing repository still uses the generic module shell for many non-asset features; the audit findings are preserved here so those modules can be implemented incrementally without claiming unsupported 100% parity.
