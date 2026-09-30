-- Students MIS additive migration for Integrated EMIS.
-- API handlers enforce school-admin scoping by emis_code; these indexes keep scoped reports fast.
CREATE TABLE IF NOT EXISTS student_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), emis_code TEXT NOT NULL, student_id TEXT NOT NULL,
  student_name TEXT NOT NULL, father_name TEXT, gender TEXT, date_of_birth DATE, b_form TEXT,
  admission_no TEXT, admission_date DATE, class_name TEXT, section TEXT, shift TEXT, session TEXT,
  status TEXT DEFAULT 'ACTIVE', religion TEXT, mother_tongue TEXT, disability TEXT, orphan TEXT, minority TEXT,
  address TEXT, village TEXT, guardian_name TEXT, guardian_cnic TEXT, guardian_phone TEXT,
  district TEXT, tehsil TEXT, union_council TEXT, school_name TEXT, previous_school TEXT, medium TEXT,
  transfer_status TEXT, result TEXT, remarks TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (emis_code, student_id)
);
CREATE INDEX IF NOT EXISTS idx_student_profiles_emis_class ON student_profiles(emis_code, class_name);
CREATE TABLE IF NOT EXISTS enrolment_campaign_targets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), emis_code TEXT NOT NULL, session TEXT NOT NULL, class_name TEXT NOT NULL,
  target INTEGER NOT NULL DEFAULT 0, achieved INTEGER NOT NULL DEFAULT 0, remarks TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (emis_code, session, class_name)
);
CREATE TABLE IF NOT EXISTS daily_student_enrolment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), emis_code TEXT NOT NULL, enrolment_date DATE NOT NULL, class_name TEXT NOT NULL,
  male INTEGER NOT NULL DEFAULT 0, female INTEGER NOT NULL DEFAULT 0, transgender INTEGER NOT NULL DEFAULT 0, total INTEGER NOT NULL DEFAULT 0,
  remarks TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (emis_code, enrolment_date, class_name)
);
CREATE TABLE IF NOT EXISTS student_class_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), emis_code TEXT NOT NULL, student_id TEXT NOT NULL, from_class TEXT, to_class TEXT NOT NULL,
  effective_date DATE NOT NULL, remarks TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_student_workflows_emis ON enrolment_campaign_targets(emis_code);
CREATE INDEX IF NOT EXISTS idx_daily_student_enrolment_emis ON daily_student_enrolment(emis_code, enrolment_date);
CREATE INDEX IF NOT EXISTS idx_student_class_updates_emis ON student_class_updates(emis_code, created_at);
