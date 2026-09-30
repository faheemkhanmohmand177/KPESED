-- =====================================================================
-- Integrated EMIS — TWIN SYNC migration (2026-09-29)
-- Aligns the portal navigation catalog with the LIVE iemis.kpese.gov.pk
-- School Admin sidebar (12 top-level groups / 58 leaf features), including:
--   * real APEX page slugs for every feature (route_key + portal_records key)
--   * the live 3-level SSR nesting: 16 reports sit UNDER
--     "School Self Report (SSR) Form"
--   * live spellings kept verbatim: student-attendence, students-class_update,
--     classwise-enrollment-report-ss, dps-iemis-updation-emrollment
--
-- SAFE / IDEMPOTENT:
--   * only INSERT ... ON CONFLICT DO UPDATE and key-preserving UPDATEs
--   * no DROP, no TRUNCATE, no deletes of user data
--   * old module keys in portal_records are migrated to the live slugs so
--     previously saved rows keep appearing on the right pages
-- Run inside the Supabase SQL editor (whole file at once). Requires the
-- base files supabase/schema.sql and supabase/portal-navigation.sql to
-- have been applied at least once before.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Migrate legacy portal_records module keys to the live-site slugs
--    (run BEFORE the nav upserts; idempotent — each UPDATE only touches
--    rows that still carry the old key).
-- ---------------------------------------------------------------------
UPDATE portal_records SET module_key = 'office-school-list'                        WHERE module_key = 'office-school-profiles';
UPDATE portal_records SET module_key = 'employee-search'                           WHERE module_key = 'employee-profiles';
UPDATE portal_records SET module_key = 'teacher-attendance-report'                 WHERE module_key = 'attendance-report';
UPDATE portal_records SET module_key = 'staff-leaves-report'                       WHERE module_key = 'leaves-report';
UPDATE portal_records SET module_key = 'students-search'                           WHERE module_key = 'students-profiles';
UPDATE portal_records SET module_key = 'target-student-enrolment'                  WHERE module_key = 'enrolment-campaign-target';
UPDATE portal_records SET module_key = 'students-class_update'                     WHERE module_key = 'students-class-update';
UPDATE portal_records SET module_key = 'enrolment-campaign-status'                 WHERE module_key = 'enrolment-campaign-report';
UPDATE portal_records SET module_key = 'student-class-promotion'                   WHERE module_key = 'student-promotion-manual';
UPDATE portal_records SET module_key = 'section-classes-section'                   WHERE module_key = 'school-classes-section';
UPDATE portal_records SET module_key = 'student-attendence'                        WHERE module_key = 'student-attendance';
UPDATE portal_records SET module_key = 'student-class-promotion-double-shift'      WHERE module_key = 'double-shift-student-promotion';
UPDATE portal_records SET module_key = 'active-student-session-wise-student'       WHERE module_key = 'active-student-session-wise';
UPDATE portal_records SET module_key = 'monthly-data-updation-report'              WHERE module_key = 'school-data-certificates';
UPDATE portal_records SET module_key = 'content-for-social-media-report'           WHERE module_key = 'social-media-content';
UPDATE portal_records SET module_key = 'sanctioned-filled-posts-detail-report-ssr' WHERE module_key = 'sanctioned-filled-posts-report-ssr';
UPDATE portal_records SET module_key = 'school-nature-of-construction-ssr-report'  WHERE module_key = 'school-nature-construction-ssr-report';
UPDATE portal_records SET module_key = 'school-commodities-for-students-ssr-report' WHERE module_key = 'school-commodities-students-ssr-report';
UPDATE portal_records SET module_key = 'building-details-data-missing-in-ssr'      WHERE module_key = 'building-details-data-missing-ssr';
UPDATE portal_records SET module_key = 'basic-facilities-data-missing-in-ssr'      WHERE module_key = 'basic-facilities-data-missing-ssr';
UPDATE portal_records SET module_key = 'classwise-enrollment-report-ss'            WHERE module_key = 'classwise-enrollment-report-ssr';
UPDATE portal_records SET module_key = 'survey-tree-form'                          WHERE module_key = 'trees-survey';
UPDATE portal_records SET module_key = 'dengue-control-campaign'                   WHERE module_key = 'dengue-campaign';
UPDATE portal_records SET module_key = 'dps-iemis-updation-emrollment'             WHERE module_key = 'dps-iemis-updation-enrollment';

-- ---------------------------------------------------------------------
-- 2. Top-level groups (12) — labels verified against the live sidebar
-- ---------------------------------------------------------------------
INSERT INTO portal_modules (id, label, sort_order, module_type) VALUES
('office-school-mis', 'Office/School MIS', 1, 'group'),
('hr-mis', 'HR MIS', 2, 'group'),
('students-mis', 'Students MIS', 3, 'group'),
('ssr', 'School Self Reporting (SSR)', 4, 'group'),
('assets-mis', 'Assets MIS', 5, 'group'),
('survey-tree-form', 'Survey - Environment Friendly Trees Form', 6, 'link'),
('ptc-mis', 'PTC MIS', 7, 'group'),
('ptc-hiring', 'PTC Hiring (Talent Pool)', 8, 'group'),
('textbook-board', 'Textbook Board', 9, 'group'),
('monitoring-dashboard', 'Monitoring Dashboard', 10, 'link'),
('dengue-control-campaign', 'Dengue Control Campaign', 11, 'link'),
('dps', 'District Performance ScoreCard (DPS)', 12, 'group')
ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, sort_order = EXCLUDED.sort_order, module_type = EXCLUDED.module_type;

-- ---------------------------------------------------------------------
-- 3. Level-2 features (live slugs + live labels)
-- ---------------------------------------------------------------------
INSERT INTO portal_features (id, module_id, label, route_key, sort_order, feature_type) VALUES
-- Office/School MIS
('office-school-list','office-school-mis','Office/School Profile(s)','office-school-list',1,'link'),
('office-school-reports','office-school-mis','Office/School Reports',NULL,2,'group'),
('monthly-data-updation-report','office-school-mis','School Data Certificates','monthly-data-updation-report',3,'link'),
('content-for-social-media-report','office-school-mis','Content for Social Media','content-for-social-media-report',4,'link'),
-- HR MIS
('employee-search','hr-mis','Employee Profiles','employee-search',1,'link'),
('teacher-attendance','hr-mis','Teacher Attendance','teacher-attendance',2,'link'),
('teacher-attendance-report','hr-mis','Teachers Attendance Report','teacher-attendance-report',3,'link'),
('staff-leaves-report','hr-mis','Employee Leaves Report','staff-leaves-report',4,'link'),
-- Students MIS
('students-search','students-mis','Students Profiles','students-search',1,'link'),
('target-student-enrolment','students-mis','Enrolment Campaign Target','target-student-enrolment',2,'link'),
('daily-students-enrolment','students-mis','Daily Students Enrolment','daily-students-enrolment',3,'link'),
('student-data-uploading','students-mis','Student Data Uploading','student-data-uploading',4,'link'),
('enrolment-campaign-status','students-mis','Enrolment Campaign Report','enrolment-campaign-status',5,'link'),
('student-class-promotion','students-mis','Student Promotion (Manual)','student-class-promotion',6,'link'),
('section-classes-section','students-mis','School Classes Section','section-classes-section',7,'link'),
('enrolment-campaign-activities','students-mis','Enrollment Campaign Activities','enrolment-campaign-activities',8,'link'),
('student-attendence','students-mis','Student Attendance','student-attendence',9,'link'),
('students-class_update','students-mis','Students Class Update','students-class_update',10,'link'),
('student-migration','students-mis','Student Migration','student-migration',11,'link'),
('student-class-promotion-double-shift','students-mis','Double Shift Student Promotion (Manual)','student-class-promotion-double-shift',12,'link'),
('student-attendance-report','students-mis','Students Attendance Report','student-attendance-report',13,'link'),
('active-student-session-wise-student','students-mis','Active Student Session Wise Student Report','active-student-session-wise-student',14,'link'),
-- School Self Reporting (SSR): the live tree nests everything under the SSR Form
('ssr-entry-form','ssr','School Self Report (SSR) Form','ssr-entry-form',1,'group'),
-- Assets MIS
('asset-profile','assets-mis','Asset Profile','asset-profile',1,'link'),
('assets-detail','assets-mis','Asset Details','assets-detail',2,'link'),
('assets-report','assets-mis','Assets Report','assets-report',3,'link'),
-- PTC MIS
('ptc-headwise-balance','ptc-mis','PTC HEADWISE AVAILABLE AMOUNT','ptc-headwise-balance',1,'link'),
('ptc-schools-list','ptc-mis','PTC Schools List (Demand)','ptc-schools-list',2,'link'),
-- PTC Hiring (Talent Pool)
('applicants-list-ptc','ptc-hiring','Applicants List (PTC)','applicants-list-ptc',1,'link'),
-- Textbook Board
('text-book-board-details','textbook-board','Free Textbook Demand List','text-book-board-details',1,'link'),
('book-demand-details','textbook-board','Book Demand Details','book-demand-details',2,'link'),
-- District Performance ScoreCard (DPS)
('dps-iemis-updation-osmis','dps','iEMIS Updation (Office-School MIS)','dps-iemis-updation-osmis',1,'link'),
('dps-iemis-updation-human-resource-mis','dps','iEMIS Updation (Human Resource MIS)','dps-iemis-updation-human-resource-mis',2,'link'),
('dps-iemis-updation-emrollment','dps','iEMIS Updation (Enrollment)','dps-iemis-updation-emrollment',3,'link')
ON CONFLICT (id) DO UPDATE SET module_id=EXCLUDED.module_id, parent_feature_id=EXCLUDED.parent_feature_id, label=EXCLUDED.label, route_key=EXCLUDED.route_key, sort_order=EXCLUDED.sort_order, feature_type=EXCLUDED.feature_type;

-- Legacy feature ids: keep them resolving to the live slug so older clients
-- that cached the old sidebar still open a valid page.
UPDATE portal_features SET route_key = 'office-school-list',      label = 'Office/School Profile(s)' WHERE id = 'office-school-profiles';
UPDATE portal_features SET route_key = 'employee-search',         label = 'Employee Profiles'        WHERE id = 'employee-profiles';
UPDATE portal_features SET route_key = 'teacher-attendance-report', label = 'Teachers Attendance Report' WHERE id = 'attendance-report';
UPDATE portal_features SET route_key = 'staff-leaves-report',     label = 'Employee Leaves Report'   WHERE id = 'leaves-report';
UPDATE portal_features SET route_key = 'students-search',         label = 'Students Profiles'        WHERE id = 'students-profiles';
UPDATE portal_features SET route_key = 'target-student-enrolment', label = 'Enrolment Campaign Target' WHERE id = 'enrolment-campaign-target';
UPDATE portal_features SET route_key = 'students-class_update',   label = 'Students Class Update'    WHERE id = 'students-class-update';
UPDATE portal_features SET route_key = 'enrolment-campaign-status', label = 'Enrolment Campaign Report' WHERE id = 'enrolment-campaign-report';
UPDATE portal_features SET route_key = 'student-class-promotion', label = 'Student Promotion (Manual)' WHERE id = 'student-promotion-manual';
UPDATE portal_features SET route_key = 'section-classes-section', label = 'School Classes Section'   WHERE id = 'school-classes-section';
UPDATE portal_features SET route_key = 'student-attendence',      label = 'Student Attendance'       WHERE id = 'student-attendance';
UPDATE portal_features SET route_key = 'student-class-promotion-double-shift', label = 'Double Shift Student Promotion (Manual)' WHERE id = 'double-shift-student-promotion';
UPDATE portal_features SET route_key = 'active-student-session-wise-student', label = 'Active Student Session Wise Student Report' WHERE id = 'active-student-session-wise';
UPDATE portal_features SET route_key = 'monthly-data-updation-report', label = 'School Data Certificates' WHERE id = 'school-data-certificates';
UPDATE portal_features SET route_key = 'content-for-social-media-report', label = 'Content for Social Media' WHERE id = 'social-media-content';
UPDATE portal_features SET route_key = 'dps-iemis-updation-emrollment' WHERE id = 'dps-iemis-updation-enrollment';

-- ---------------------------------------------------------------------
-- 4. Level-3 reports:
--    a) Office/School Reports → six leaf reports (unchanged structure)
-- ---------------------------------------------------------------------
INSERT INTO portal_features (id, module_id, parent_feature_id, label, route_key, sort_order, feature_type)
SELECT v.id, 'office-school-mis', 'office-school-reports', v.label, v.route_key, v.sort_order, 'link'
FROM (VALUES
('basic-facilities-report','Basic Facilities Report','basic-facilities-report',1),
('security-measures-report','Security Measures Report','security-measures-report',2),
('school-stories-report','School Stories (Room) Report','school-stories-report',3),
('school-ptc-details','PTC Details','school-ptc-details',4),
('school-commodities','Commodities','school-commodities',5),
('school-it-lab-report','IT Lab Details','school-it-lab-report',6)
) AS v(id,label,route_key,sort_order)
ON CONFLICT (id) DO UPDATE SET parent_feature_id=EXCLUDED.parent_feature_id, module_id=EXCLUDED.module_id, label=EXCLUDED.label, route_key=EXCLUDED.route_key, sort_order=EXCLUDED.sort_order, feature_type=EXCLUDED.feature_type;

--    b) The sixteen SSR reports now nest UNDER 'ssr-entry-form'
--       (matches the live 3-level School Admin tree)
INSERT INTO portal_features (id, module_id, parent_feature_id, label, route_key, sort_order, feature_type)
SELECT v.id, 'ssr', 'ssr-entry-form', v.label, v.route_key, v.sort_order, 'link'
FROM (VALUES
('teacher-disable-report-ssr','Teacher Disable Report (SSR)','teacher-disable-report-ssr',1),
('staff-detail-report-ssr','Staff Detail Report (SSR)','staff-detail-report-ssr',2),
('sanctioned-filled-posts-detail-report-ssr','Sanctioned/Filled Posts Detail Report (SSR)','sanctioned-filled-posts-detail-report-ssr',3),
('school-basic-information-ssr-report','School Basic Information SSR Report','school-basic-information-ssr-report',4),
('school-it-information-ssr-report','School IT Information SSR Report (IT Lab Excluded)','school-it-information-ssr-report',5),
('school-nature-of-construction-ssr-report','School Nature of Construction SSR Report (SSR)','school-nature-of-construction-ssr-report',6),
('school-commodities-for-students-ssr-report','School Commodities for Students SSR Report','school-commodities-for-students-ssr-report',7),
('enrollment-by-group-section-ssr','Student Enrollment by Group/Section','enrollment-by-group-section-ssr',8),
('school-ptc-details-members','School PTC Members (SSR)','school-ptc-details-members',9),
('data-missing-in-ssr','Sanction/HR/Enrollment Data (SSR)','data-missing-in-ssr',10),
('new-staff-details','New Staff Details (SSR)','new-staff-details',11),
('building-details-data-missing-in-ssr','Building Data (SSR)','building-details-data-missing-in-ssr',12),
('basic-facilities-data-missing-in-ssr','Basic Facilities Data (SSR)','basic-facilities-data-missing-in-ssr',13),
('classwise-enrollment-report-ss','Classwise Enrollment Report (SSR)','classwise-enrollment-report-ss',14),
('learning-difficult-students-report-ssr','Learning Difficult Students Report (SSR)','learning-difficult-students-report-ssr',15),
('disable-students-report-ssr','Disable Students Report (SSR)','disable-students-report-ssr',16)
) AS v(id,label,route_key,sort_order)
ON CONFLICT (id) DO UPDATE SET parent_feature_id=EXCLUDED.parent_feature_id, module_id=EXCLUDED.module_id, label=EXCLUDED.label, route_key=EXCLUDED.route_key, sort_order=EXCLUDED.sort_order, feature_type=EXCLUDED.feature_type;

-- ssr-entry-form becomes a group (it now has children on the live site)
UPDATE portal_features SET feature_type = 'group' WHERE id = 'ssr-entry-form';

-- ---------------------------------------------------------------------
-- 5. Integrity check (informational — no mutations):
--    SELECT count(*) FROM portal_features WHERE feature_type='link';
--    Expect 58 live leaf routes (+ any legacy ids you kept).
-- ---------------------------------------------------------------------
