-- =====================================================================
-- KPESED twin-functional migration — 2026-09-30
-- Adds the tables required by the newly functional modules:
--   * student attendance marking   (Students MIS > Student Attendence)
--   * student class promotion      (Students MIS > Student Class Promotion)
-- Safe to run multiple times (idempotent, additive only — never deletes).
-- Run order: schema.sql -> portal-navigation.sql -> asset-profile.sql
--            -> students-mis.sql -> twin-sync-2026-09-29.sql -> THIS FILE
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Student attendance
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS student_attendance (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  emis_code      varchar(20)  NOT NULL,
  student_id     varchar(40)  NOT NULL,
  student_name   varchar(200),
  class_name     varchar(20),
  section        varchar(40),
  session        varchar(20),
  shift          varchar(4)   DEFAULT 'S',
  attendance_date date        NOT NULL,
  status         varchar(30)  DEFAULT 'Present',
  remarks        text,
  marked_by      uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at     timestamptz  DEFAULT now(),
  updated_at     timestamptz  DEFAULT now(),
  CONSTRAINT student_attendance_unique UNIQUE (emis_code, student_id, attendance_date, shift)
);
CREATE INDEX IF NOT EXISTS idx_student_attendance_emis_date ON student_attendance (emis_code, attendance_date);
CREATE INDEX IF NOT EXISTS idx_student_attendance_student ON student_attendance (student_id);

-- ---------------------------------------------------------------------
-- 2. Student promotions (manual + double shift)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS student_promotions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  emis_code      varchar(20)  NOT NULL,
  student_id     varchar(40)  NOT NULL,
  student_name   varchar(200),
  father_name    varchar(200),
  gender         varchar(20),
  father_cnic    varchar(20),
  from_class     varchar(20),
  to_class       varchar(20),
  class_section  varchar(60),
  admission_no   varchar(60),
  new_admission_no varchar(60),
  certificate_issue varchar(10),
  session        varchar(20),
  shift          varchar(4)   DEFAULT 'S',
  status         varchar(20)  DEFAULT 'PROMOTED',
  promoted_date  date,
  remarks        text,
  created_by     uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at     timestamptz  DEFAULT now(),
  updated_at     timestamptz  DEFAULT now(),
  CONSTRAINT student_promotion_unique UNIQUE (emis_code, student_id, session, shift)
);
CREATE INDEX IF NOT EXISTS idx_student_promotions_emis ON student_promotions (emis_code);

-- ---------------------------------------------------------------------
-- 3. Row Level Security — service role (used by the app) bypasses RLS;
--    these policies protect direct anon/authenticated Supabase access.
-- ---------------------------------------------------------------------
ALTER TABLE student_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_promotions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS student_attendance_service_all ON student_attendance;
CREATE POLICY student_attendance_service_all ON student_attendance
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS student_promotions_service_all ON student_promotions;
CREATE POLICY student_promotions_service_all ON student_promotions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------
-- 4. updated_at triggers (same pattern as the base schema)
-- ---------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_student_attendance_updated ON student_attendance;
CREATE TRIGGER trg_student_attendance_updated
  BEFORE UPDATE ON student_attendance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_student_promotions_updated ON student_promotions;
CREATE TRIGGER trg_student_promotions_updated
  BEFORE UPDATE ON student_promotions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
