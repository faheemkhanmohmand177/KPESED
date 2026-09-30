-- ============================================================
-- KPESE HRMIS - Supabase Database Schema (v2)
-- Matches the ACTUAL KPESE HRMIS site (iemis.kpese.gov.pk) field structure
-- Mirrors the Prisma schema at /prisma/schema.prisma
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('school admin', 'DDEO', 'DEO', 'Admin', 'employee');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE gender AS ENUM ('MALE', 'FEMALE', 'OTHER');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE relation_type AS ENUM ('FATHER', 'HUSBAND', 'MOTHER', 'WIFE');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE employee_status AS ENUM ('Verified', 'Working', 'Inactive', 'Retired', 'Suspended');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE placement_type AS ENUM ('Initial Appointment', 'Transfer', 'Promotion', 'Deputation');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS districts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  code TEXT UNIQUE NOT NULL,
  division TEXT,
  region TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tehsils (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  district_id UUID REFERENCES districts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS union_councils (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  tehsil_id UUID REFERENCES tehsils(id) ON DELETE CASCADE,
  district_id UUID REFERENCES districts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  emis_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  school_type TEXT,
  gender TEXT,
  ddo_code TEXT,
  district_id UUID REFERENCES districts(id),
  tehsil_id UUID REFERENCES tehsils(id),
  address TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  established_year INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS designations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT UNIQUE NOT NULL,
  bps INT NOT NULL,
  category TEXT,
  level TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User accounts (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- for fallback auth; use Supabase Auth for prod
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'school admin',
  emis_code TEXT,
  school_name TEXT,
  district TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EMPLOYEE — master HR record (60+ fields matching real site)
-- ============================================================
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  emp_id TEXT UNIQUE NOT NULL, -- employee identifier
  name TEXT NOT NULL,           -- employee name
  father_or_husband_name TEXT,  -- MIR ZAMAN
  relation_type TEXT,            -- FATHER / HUSBAND
  gender TEXT,                   -- MALE / FEMALE
  cnic TEXT,                     -- 21402-8610274-1
  personnel_no TEXT,             -- 50386836
  emis_code TEXT,                -- EMIS code
  school_id UUID REFERENCES schools(id),
  school_name TEXT,              -- school name cache
  school_gender TEXT,            -- MALE
  ddo_code TEXT,                 -- MG6015
  district_id UUID REFERENCES districts(id),
  district_name TEXT,            -- MOHMAND (cached)
  tehsil_id UUID REFERENCES tehsils(id),
  tehsil_name TEXT,              -- UPPER MOHMAND (cached)
  union_council_id UUID REFERENCES union_councils(id),
  uc_name TEXT,                  -- VC DURBA KHEL-1 (cached)
  domicile TEXT,                 -- MOHMAND
  country TEXT DEFAULT 'PAKISTAN',
  province TEXT DEFAULT 'KHYBER PAKHTUNKHWA',
  division TEXT,                 -- PESHAWAR
  -- PRO_1 fields
  date_of_birth DATE,
  phone TEXT,                    -- 0303-8525075
  marital_status TEXT,           -- MARRIED
  mother_tongue TEXT,            -- PASHTO
  gp_fund TEXT,                  -- 5741
  email TEXT,                    -- employee email
  spouse_employment_status TEXT,
  religion TEXT DEFAULT 'ISLAM',
  initial_recruitment_in_esed TEXT, -- NTS
  esed_appointment_quota TEXT,    -- OPEN
  x_coordinate DECIMAL,
  current_address TEXT,
  -- PRO_2 fields
  date_of_entry_into_govt_service DATE,
  mobile_sms TEXT,                -- 0345-5925075
  blood_group TEXT,               -- O+
  disability TEXT,
  ntn_no TEXT,
  passport_no TEXT,               -- NIL
  is_spouse_working_in_esed TEXT,
  chronic_disease TEXT,
  initial_recruitment_1st_order_date DATE,
  dual_nationality TEXT DEFAULT 'NO',
  y_coordinate DECIMAL,
  permanent_address TEXT,
  -- COVID section
  covid_vaccinated TEXT,          -- YES/NO
  covid_reason TEXT,
  covid_message TEXT,
  -- Employment summary
  placement_type TEXT,            -- Initial Appointment
  posting_type TEXT,              -- Internal
  external_placement TEXT,
  working_designation TEXT,       -- SST-GENERAL
  designation_id UUID REFERENCES designations(id),
  working_bps INT,                -- 16
  current_posting_date DATE,
  tenure_years INT,
  tenure_months INT,
  tenure_days INT,
  is_deputation TEXT DEFAULT 'NO',
  level TEXT,                     -- MIDDLE
  cadre_group TEXT,               -- Teaching
  cadre_designation TEXT,         -- SST-GENERAL (BPS-16)
  status TEXT,                    -- Verified
  job_type TEXT,                  -- Regular
  photo_url TEXT,
  minority BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_employees_emp_id ON employees(emp_id);
CREATE INDEX IF NOT EXISTS idx_employees_cnic ON employees(cnic);
CREATE INDEX IF NOT EXISTS idx_employees_personnel_no ON employees(personnel_no);
CREATE INDEX IF NOT EXISTS idx_employees_emis_code ON employees(emis_code);
CREATE INDEX IF NOT EXISTS idx_employees_school_id ON employees(school_id);
CREATE INDEX IF NOT EXISTS idx_employees_district_id ON employees(district_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);

-- ============================================================
-- Sub-tables for each tab on the Employee Detail page
-- ============================================================

-- Service Records (Posting / Transfer tab history)
CREATE TABLE IF NOT EXISTS service_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  record_type TEXT,
  from_designation TEXT,
  to_designation TEXT,
  from_bps INT,
  to_bps INT,
  effective_date DATE NOT NULL,
  end_date DATE,
  status TEXT,
  remarks TEXT,
  notification_detail TEXT,
  notification_title TEXT,
  retirement_notification TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Posting / Transfer tab — current view
CREATE TABLE IF NOT EXISTS posting_transfers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  ddo_code TEXT,
  school_name TEXT,
  emis_code TEXT,
  designation TEXT,
  bps INT,
  from_date DATE,
  to_date DATE,
  status TEXT,
  placement_type TEXT,
  posting_type TEXT,
  is_deputation TEXT,
  notification_detail TEXT,
  notification_title TEXT,
  retirement_notification TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- BPS tab
CREATE TABLE IF NOT EXISTS bps_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  bps INT NOT NULL,
  from_date DATE,
  to_date DATE,
  status TEXT,
  remarks TEXT,
  notification_detail TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job Type tab
CREATE TABLE IF NOT EXISTS job_type_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL,
  from_date DATE,
  to_date DATE,
  status TEXT,
  remarks TEXT,
  notification_detail TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cadre Group tab
CREATE TABLE IF NOT EXISTS cadre_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  cadre_group TEXT NOT NULL,
  designation TEXT,
  bps INT,
  from_date DATE,
  to_date DATE,
  status TEXT,
  seniority_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Education / Professional Qualification tab
CREATE TABLE IF NOT EXISTS qualifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- Academic, Professional, Diploma
  specialty TEXT,
  college_university TEXT,
  board TEXT,
  total_marks DECIMAL,
  obtained_marks DECIMAL,
  percentage DECIMAL,
  regular_private TEXT,
  session_year TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Family Detail tab
CREATE TABLE IF NOT EXISTS family_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  dependent_name TEXT NOT NULL,
  relationship TEXT,
  gender TEXT,
  date_of_birth DATE,
  personnel_no TEXT,
  department TEXT,
  designation_bps TEXT,
  is_dependent TEXT,
  disability TEXT,
  cnic_or_form_b TEXT,
  next_of_kin TEXT,
  kin_signature TEXT,
  kin_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bank Detail tab
CREATE TABLE IF NOT EXISTS bank_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  account_title TEXT,
  bank_name TEXT,
  bank_code TEXT,
  account_no TEXT,
  iban TEXT,
  monthly_salary DECIMAL,
  address TEXT,
  district TEXT,
  for_pensioner TEXT,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leaves Detail tab
CREATE TABLE IF NOT EXISTS leaves_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type TEXT,
  from_date DATE,
  to_date DATE,
  days DECIMAL,
  reason TEXT,
  status TEXT,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Training Detail tab
CREATE TABLE IF NOT EXISTS training_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  training_title TEXT,
  institute TEXT,
  from_date DATE,
  to_date DATE,
  duration TEXT,
  status TEXT,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents tab
CREATE TABLE IF NOT EXISTS employee_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  doc_type TEXT,
  doc_name TEXT,
  file_url TEXT,
  uploaded_at TIMESTAMPTZ,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attendance (Teacher Attendance page)
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  status TEXT DEFAULT 'present',
  remarks TEXT,
  marked_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, attendance_date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_employee_id ON attendance(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(attendance_date);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  category TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  link TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- ============================================================
-- ROW LEVEL SECURITY (basic patterns)
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE posting_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bps_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_type_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE cadre_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaves_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tehsils ENABLE ROW LEVEL SECURITY;
ALTER TABLE union_councils ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE designations ENABLE ROW LEVEL SECURITY;

-- Authenticated users can SELECT from reference tables
DROP POLICY IF EXISTS "reference_tables_read_authenticated" ON districts;
CREATE POLICY "reference_tables_read_authenticated" ON districts FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "tehsils_read" ON tehsils;
CREATE POLICY "tehsils_read" ON tehsils FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "ucs_read" ON union_councils;
CREATE POLICY "ucs_read" ON union_councils FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "schools_read" ON schools;
CREATE POLICY "schools_read" ON schools FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "designations_read" ON designations;
CREATE POLICY "designations_read" ON designations FOR SELECT TO authenticated USING (true);

-- Users can see their own row; admins see all
DROP POLICY IF EXISTS "users_select_own_or_admin" ON users;
CREATE POLICY "users_select_own_or_admin" ON users
  FOR SELECT TO authenticated USING (
    id::text = (auth.uid())::text
    OR EXISTS (SELECT 1 FROM users u WHERE u.id::text = (auth.uid())::text AND u.role IN ('Admin', 'DDEO', 'DEO'))
  );

-- All authenticated users can read employees (school admin sees their school's employees)
DROP POLICY IF EXISTS "employees_select_authenticated" ON employees;
CREATE POLICY "employees_select_authenticated" ON employees
  FOR SELECT TO authenticated USING (true);

-- Admin/HR can modify
DROP POLICY IF EXISTS "employees_modify_admin" ON employees;
CREATE POLICY "employees_modify_admin" ON employees
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id::text = (auth.uid())::text AND u.role IN ('Admin', 'DDEO', 'DEO', 'school admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM users u WHERE u.id::text = (auth.uid())::text AND u.role IN ('Admin', 'DDEO', 'DEO', 'school admin')));

-- Sub-tables: same as employees
DROP POLICY IF EXISTS "sub_select_authenticated" ON service_records;
CREATE POLICY "sub_select_authenticated" ON service_records FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "sub_select_authenticated" ON posting_transfers;
CREATE POLICY "sub_select_authenticated" ON posting_transfers FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "sub_select_authenticated" ON bps_history;
CREATE POLICY "sub_select_authenticated" ON bps_history FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "sub_select_authenticated" ON job_type_history;
CREATE POLICY "sub_select_authenticated" ON job_type_history FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "sub_select_authenticated" ON cadre_history;
CREATE POLICY "sub_select_authenticated" ON cadre_history FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "sub_select_authenticated" ON qualifications;
CREATE POLICY "sub_select_authenticated" ON qualifications FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "sub_select_authenticated" ON family_members;
CREATE POLICY "sub_select_authenticated" ON family_members FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "sub_select_authenticated" ON bank_details;
CREATE POLICY "sub_select_authenticated" ON bank_details FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "sub_select_authenticated" ON leaves_details;
CREATE POLICY "sub_select_authenticated" ON leaves_details FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "sub_select_authenticated" ON training_details;
CREATE POLICY "sub_select_authenticated" ON training_details FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "sub_select_authenticated" ON employee_documents;
CREATE POLICY "sub_select_authenticated" ON employee_documents FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "sub_select_authenticated" ON attendance;
CREATE POLICY "sub_select_authenticated" ON attendance FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "sub_modify_admin" ON service_records;
CREATE POLICY "sub_modify_admin" ON service_records FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id::text = (auth.uid())::text AND u.role IN ('Admin', 'DDEO', 'DEO', 'school admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM users u WHERE u.id::text = (auth.uid())::text AND u.role IN ('Admin', 'DDEO', 'DEO', 'school admin')));

DROP POLICY IF EXISTS "sub_modify_admin_pt" ON posting_transfers;
CREATE POLICY "sub_modify_admin_pt" ON posting_transfers FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id::text = (auth.uid())::text AND u.role IN ('Admin', 'DDEO', 'DEO', 'school admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM users u WHERE u.id::text = (auth.uid())::text AND u.role IN ('Admin', 'DDEO', 'DEO', 'school admin')));

DROP POLICY IF EXISTS "sub_modify_admin_bps" ON bps_history;
CREATE POLICY "sub_modify_admin_bps" ON bps_history FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id::text = (auth.uid())::text AND u.role IN ('Admin', 'DDEO', 'DEO', 'school admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM users u WHERE u.id::text = (auth.uid())::text AND u.role IN ('Admin', 'DDEO', 'DEO', 'school admin')));

DROP POLICY IF EXISTS "sub_modify_admin_jt" ON job_type_history;
CREATE POLICY "sub_modify_admin_jt" ON job_type_history FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id::text = (auth.uid())::text AND u.role IN ('Admin', 'DDEO', 'DEO', 'school admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM users u WHERE u.id::text = (auth.uid())::text AND u.role IN ('Admin', 'DDEO', 'DEO', 'school admin')));

DROP POLICY IF EXISTS "sub_modify_admin_ch" ON cadre_history;
CREATE POLICY "sub_modify_admin_ch" ON cadre_history FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id::text = (auth.uid())::text AND u.role IN ('Admin', 'DDEO', 'DEO', 'school admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM users u WHERE u.id::text = (auth.uid())::text AND u.role IN ('Admin', 'DDEO', 'DEO', 'school admin')));

DROP POLICY IF EXISTS "sub_modify_admin_q" ON qualifications;
CREATE POLICY "sub_modify_admin_q" ON qualifications FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id::text = (auth.uid())::text AND u.role IN ('Admin', 'DDEO', 'DEO', 'school admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM users u WHERE u.id::text = (auth.uid())::text AND u.role IN ('Admin', 'DDEO', 'DEO', 'school admin')));

DROP POLICY IF EXISTS "sub_modify_admin_fm" ON family_members;
CREATE POLICY "sub_modify_admin_fm" ON family_members FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id::text = (auth.uid())::text AND u.role IN ('Admin', 'DDEO', 'DEO', 'school admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM users u WHERE u.id::text = (auth.uid())::text AND u.role IN ('Admin', 'DDEO', 'DEO', 'school admin')));

DROP POLICY IF EXISTS "sub_modify_admin_bd" ON bank_details;
CREATE POLICY "sub_modify_admin_bd" ON bank_details FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id::text = (auth.uid())::text AND u.role IN ('Admin', 'DDEO', 'DEO', 'school admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM users u WHERE u.id::text = (auth.uid())::text AND u.role IN ('Admin', 'DDEO', 'DEO', 'school admin')));

DROP POLICY IF EXISTS "sub_modify_admin_ld" ON leaves_details;
CREATE POLICY "sub_modify_admin_ld" ON leaves_details FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id::text = (auth.uid())::text AND u.role IN ('Admin', 'DDEO', 'DEO', 'school admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM users u WHERE u.id::text = (auth.uid())::text AND u.role IN ('Admin', 'DDEO', 'DEO', 'school admin')));

DROP POLICY IF EXISTS "sub_modify_admin_td" ON training_details;
CREATE POLICY "sub_modify_admin_td" ON training_details FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id::text = (auth.uid())::text AND u.role IN ('Admin', 'DDEO', 'DEO', 'school admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM users u WHERE u.id::text = (auth.uid())::text AND u.role IN ('Admin', 'DDEO', 'DEO', 'school admin')));

DROP POLICY IF EXISTS "sub_modify_admin_ed" ON employee_documents;
CREATE POLICY "sub_modify_admin_ed" ON employee_documents FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id::text = (auth.uid())::text AND u.role IN ('Admin', 'DDEO', 'DEO', 'school admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM users u WHERE u.id::text = (auth.uid())::text AND u.role IN ('Admin', 'DDEO', 'DEO', 'school admin')));

DROP POLICY IF EXISTS "attendance_modify_admin" ON attendance;
CREATE POLICY "attendance_modify_admin" ON attendance FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id::text = (auth.uid())::text AND u.role IN ('Admin', 'DDEO', 'DEO', 'school admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM users u WHERE u.id::text = (auth.uid())::text AND u.role IN ('Admin', 'DDEO', 'DEO', 'school admin')));

-- Notifications: user sees own only
DROP POLICY IF EXISTS "notifications_own" ON notifications;
CREATE POLICY "notifications_own" ON notifications
  FOR SELECT TO authenticated USING (user_id::text = (auth.uid())::text);
DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE TO authenticated USING (user_id::text = (auth.uid())::text);

-- ============================================================
-- TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_users ON users;
CREATE TRIGGER set_updated_at_users BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS set_updated_at_employees ON employees;
CREATE TRIGGER set_updated_at_employees BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS set_updated_at_service_records ON service_records;
CREATE TRIGGER set_updated_at_service_records BEFORE UPDATE ON service_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS set_updated_at_posting_transfers ON posting_transfers;
CREATE TRIGGER set_updated_at_posting_transfers BEFORE UPDATE ON posting_transfers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS set_updated_at_bps_history ON bps_history;
CREATE TRIGGER set_updated_at_bps_history BEFORE UPDATE ON bps_history FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS set_updated_at_job_type_history ON job_type_history;
CREATE TRIGGER set_updated_at_job_type_history BEFORE UPDATE ON job_type_history FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS set_updated_at_cadre_history ON cadre_history;
CREATE TRIGGER set_updated_at_cadre_history BEFORE UPDATE ON cadre_history FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS set_updated_at_qualifications ON qualifications;
CREATE TRIGGER set_updated_at_qualifications BEFORE UPDATE ON qualifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS set_updated_at_family_members ON family_members;
CREATE TRIGGER set_updated_at_family_members BEFORE UPDATE ON family_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS set_updated_at_bank_details ON bank_details;
CREATE TRIGGER set_updated_at_bank_details BEFORE UPDATE ON bank_details FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS set_updated_at_leaves_details ON leaves_details;
CREATE TRIGGER set_updated_at_leaves_details BEFORE UPDATE ON leaves_details FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS set_updated_at_training_details ON training_details;
CREATE TRIGGER set_updated_at_training_details BEFORE UPDATE ON training_details FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS set_updated_at_employee_documents ON employee_documents;
CREATE TRIGGER set_updated_at_employee_documents BEFORE UPDATE ON employee_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS set_updated_at_attendance ON attendance;
CREATE TRIGGER set_updated_at_attendance BEFORE UPDATE ON attendance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS set_updated_at_notifications ON notifications;
CREATE TRIGGER set_updated_at_notifications BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS set_updated_at_districts ON districts;
CREATE TRIGGER set_updated_at_districts BEFORE UPDATE ON districts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS set_updated_at_tehsils ON tehsils;
CREATE TRIGGER set_updated_at_tehsils BEFORE UPDATE ON tehsils FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS set_updated_at_schools ON schools;
CREATE TRIGGER set_updated_at_schools BEFORE UPDATE ON schools FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS set_updated_at_designations ON designations;
CREATE TRIGGER set_updated_at_designations BEFORE UPDATE ON designations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- INITIAL REFERENCE DATA
-- ============================================================

INSERT INTO districts (name, code, division, region) VALUES
('MOHMAND', 'MHD', 'PESHAWAR', 'North'),
('PESHAWAR', 'PSH', 'PESHAWAR', 'Central'),
('MARDAN', 'MRD', 'MARDAN', 'Central'),
('CHARSADDA', 'CHA', 'PESHAWAR', 'Central'),
('NOWSHERA', 'NWR', 'PESHAWAR', 'Central'),
('KOHAT', 'KHT', 'KOHAT', 'South'),
('DERA ISMAIL KHAN', 'DIK', 'DIKHAN', 'South'),
('BANNU', 'BNN', 'BANNU', 'South'),
('ABBOTTABAD', 'ATD', 'HAZARA', 'Hazara'),
('MANSEHRA', 'MNS', 'HAZARA', 'Hazara'),
('SWAT', 'SWT', 'MALAKAND', 'North'),
('DIR UPPER', 'DIR', 'MALAKAND', 'North'),
('DIR LOWER', 'DLR', 'MALAKAND', 'North'),
('CHITRAL', 'CHT', 'MALAKAND', 'North'),
('BUNER', 'BNR', 'MALAKAND', 'North'),
('SWABI', 'SWB', 'MARDAN', 'Central')
ON CONFLICT DO NOTHING;

INSERT INTO tehsils (name, district_id) VALUES
('UPPER MOHMAND', (SELECT id FROM districts WHERE code='MHD' LIMIT 1)),
('LOWER MOHMAND', (SELECT id FROM districts WHERE code='MHD' LIMIT 1)),
('PESHAWAR CITY', (SELECT id FROM districts WHERE code='PSH' LIMIT 1)),
('PESHAWAR RURAL', (SELECT id FROM districts WHERE code='PSH' LIMIT 1)),
('MARDAN', (SELECT id FROM districts WHERE code='MRD' LIMIT 1)),
('SWAT', (SELECT id FROM districts WHERE code='SWT' LIMIT 1)),
('ABBOTTABAD', (SELECT id FROM districts WHERE code='ATD' LIMIT 1))
ON CONFLICT DO NOTHING;

INSERT INTO union_councils (name, tehsil_id, district_id) VALUES
('VC DURBA KHEL-1', (SELECT id FROM tehsils WHERE name='UPPER MOHMAND' LIMIT 1), (SELECT id FROM districts WHERE code='MHD' LIMIT 1))
ON CONFLICT DO NOTHING;

INSERT INTO designations (title, bps, category, level) VALUES
('PST', 12, 'Teaching', 'PRIMARY'),
('CT', 12, 'Teaching', 'MIDDLE'),
('CT-IT', 12, 'Teaching', 'MIDDLE'),
('DM', 14, 'Teaching', 'MIDDLE'),
('AT', 14, 'Teaching', 'MIDDLE'),
('PET', 14, 'Teaching', 'MIDDLE'),
('TT', 14, 'Teaching', 'MIDDLE'),
('SST-GENERAL', 16, 'Teaching', 'HIGH'),
('SST-BIO', 16, 'Teaching', 'HIGH'),
('SUBJECT SPECIALIST', 17, 'Teaching', 'HIGH'),
('SENIOR SUBJECT SPECIALIST', 18, 'Teaching', 'HIGHER SECONDARY'),
('PRINCIPAL', 19, 'Admin', 'HIGHER SECONDARY'),
('HEADMASTER', 18, 'Admin', 'HIGH'),
('HEADMISTRESS', 18, 'Admin', 'HIGH'),
('SENIOR HEADMASTER', 19, 'Admin', 'HIGHER SECONDARY'),
('DEO', 19, 'Admin', 'DISTRICT'),
('DDEO', 18, 'Admin', 'DISTRICT'),
('ADEO', 17, 'Admin', 'DISTRICT'),
('DIRECTOR', 20, 'Admin', 'PROVINCIAL'),
('CLERK', 11, 'Non-Teaching', 'OFFICE'),
('SENIOR CLERK', 14, 'Non-Teaching', 'OFFICE'),
('JUNIOR CLERK', 7, 'Non-Teaching', 'OFFICE'),
('COMPUTER OPERATOR', 12, 'Non-Teaching', 'OFFICE'),
('ACCOUNTANT', 14, 'Non-Teaching', 'OFFICE'),
('NAIB QASID', 5, 'Support', 'OFFICE'),
('BEARER', 1, 'Support', 'OFFICE'),
('SWEEPER', 1, 'Support', 'OFFICE'),
('CHOWKIDAR', 1, 'Support', 'OFFICE'),
('MALI', 1, 'Support', 'OFFICE')
ON CONFLICT DO NOTHING;

-- Clean initial Admin account for first-time setup (password: 112345678)
INSERT INTO users (username, password, full_name, email, phone, role, emis_code, school_name, district) VALUES
('Khan', '$2b$10$OVB4aWsmEm/L9kcWYCz2HuWpL.eN5n1PK/BiXyVHNxRSmZVoBGHDi', 'Khan Administrator',
 'admin@hrmis-portal.local', '112345678', 'Admin', NULL, NULL, NULL)
ON CONFLICT (username) DO UPDATE SET role='Admin', emis_code=NULL, school_name=NULL, district=NULL;

-- No school, employee, or teacher records are seeded. Admins add them through the portal.
