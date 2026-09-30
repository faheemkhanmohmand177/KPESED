-- Integrated EMIS portal navigation catalog
-- Safe, additive migration: stores UI metadata only and does not touch HR/student records.
-- Seed values mirror the LIVE iemis.kpese.gov.pk School Admin sidebar
-- (12 top-level groups / 58 leaf features, 3-level SSR nesting), audit 2026-09-29.

CREATE TABLE IF NOT EXISTS portal_modules (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  module_type TEXT NOT NULL DEFAULT 'group' CHECK (module_type IN ('group', 'link')),
  icon_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portal_features (
  id TEXT PRIMARY KEY,
  module_id TEXT NOT NULL REFERENCES portal_modules(id) ON DELETE CASCADE,
  parent_feature_id TEXT REFERENCES portal_features(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  route_key TEXT,
  sort_order INTEGER NOT NULL,
  feature_type TEXT NOT NULL DEFAULT 'link' CHECK (feature_type IN ('group', 'link')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portal_features_module_order ON portal_features(module_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_portal_features_parent_order ON portal_features(parent_feature_id, sort_order);

CREATE TABLE IF NOT EXISTS portal_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_key TEXT NOT NULL,
  title TEXT,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portal_records_module_key ON portal_records(module_key);

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

-- Leaf features: ids/route_keys are the LIVE Oracle APEX page slugs
-- (including live spellings student-attendence, students-class_update,
-- classwise-enrollment-report-ss and dps-iemis-updation-emrollment).
INSERT INTO portal_features (id, module_id, label, route_key, sort_order, feature_type) VALUES
('office-school-list','office-school-mis','Office/School Profile(s)','office-school-list',1,'link'),
('office-school-reports','office-school-mis','Office/School Reports',NULL,2,'group'),
('monthly-data-updation-report','office-school-mis','School Data Certificates','monthly-data-updation-report',3,'link'),
('content-for-social-media-report','office-school-mis','Content for Social Media','content-for-social-media-report',4,'link'),
('employee-search','hr-mis','Employee Profiles','employee-search',1,'link'),
('teacher-attendance','hr-mis','Teacher Attendance','teacher-attendance',2,'link'),
('teacher-attendance-report','hr-mis','Teachers Attendance Report','teacher-attendance-report',3,'link'),
('staff-leaves-report','hr-mis','Employee Leaves Report','staff-leaves-report',4,'link'),
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
('ssr-entry-form','ssr','School Self Report (SSR) Form','ssr-entry-form',1,'group'),
('asset-profile','assets-mis','Asset Profile','asset-profile',1,'link'),
('assets-detail','assets-mis','Asset Details','assets-detail',2,'link'),
('assets-report','assets-mis','Assets Report','assets-report',3,'link'),
('ptc-headwise-balance','ptc-mis','PTC HEADWISE AVAILABLE AMOUNT','ptc-headwise-balance',1,'link'),
('ptc-schools-list','ptc-mis','PTC Schools List (Demand)','ptc-schools-list',2,'link'),
('applicants-list-ptc','ptc-hiring','Applicants List (PTC)','applicants-list-ptc',1,'link'),
('text-book-board-details','textbook-board','Free Textbook Demand List','text-book-board-details',1,'link'),
('book-demand-details','textbook-board','Book Demand Details','book-demand-details',2,'link'),
('dps-iemis-updation-osmis','dps','iEMIS Updation (Office-School MIS)','dps-iemis-updation-osmis',1,'link'),
('dps-iemis-updation-human-resource-mis','dps','iEMIS Updation (Human Resource MIS)','dps-iemis-updation-human-resource-mis',2,'link'),
('dps-iemis-updation-emrollment','dps','iEMIS Updation (Enrollment)','dps-iemis-updation-emrollment',3,'link')
ON CONFLICT (id) DO UPDATE SET module_id=EXCLUDED.module_id, parent_feature_id=EXCLUDED.parent_feature_id, label=EXCLUDED.label, route_key=EXCLUDED.route_key, sort_order=EXCLUDED.sort_order, feature_type=EXCLUDED.feature_type;

-- Office/School Reports has six leaf reports.
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

-- The sixteen SSR reports nest UNDER "School Self Report (SSR) Form",
-- exactly as the live School Admin tree renders them.
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
