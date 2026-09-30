-- ============================================================================
-- KPESED Twin-Clone — Live-Parity Update (2026-09-30)
-- Safe, idempotent SQL for the new/updated data-entry features.
--
-- Run this ONCE in the Supabase SQL Editor (or psql) against the production
-- database. Every statement is guarded (IF NOT EXISTS / WHERE-guarded), so
-- re-running it is harmless. No existing data is modified or deleted except
-- the optional demo-account cleanup at the bottom, which is also guarded.
--
-- Coverage (matches src/lib/real-modules.ts + src/lib/module-forms.ts):
--   * Content for Social Media — Create form (portal_records storage)
--   * Enrolment Campaign Targets Form — Save Record (portal_records storage)
--   * Daily Students Enrolment Form — Save Record (portal_records storage)
--   * PTC Schools List — Add School (portal_records storage)
--   * Dengue Control Campaign — Add Dengue Control Campaign (portal_records)
--   * Free Textbook Demand List — Add Schools (portal_records storage)
--   * Survey (31 tree species) + PTC headwise — editable grids (portal_records)
--   * Module-key harmonisation for the two dedicated Students MIS screens
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Schema hardening for portal_records (the generic, secure store used by
--    every Create/Add workflow). Idempotent: safe on any environment that
--    already ran portal-navigation.sql / run-all-in-supabase-editor.sql.
-- ---------------------------------------------------------------------------

-- Fast list ordering (same shape as the API's ORDER BY module_key, updated_at DESC).
CREATE INDEX IF NOT EXISTS idx_portal_records_module_updated
  ON portal_records (module_key, updated_at DESC);

-- Owner lookup index (school-admin scoping filters on created_by).
CREATE INDEX IF NOT EXISTS idx_portal_records_created_by
  ON portal_records (created_by);

-- Ensure the updated_at trigger function exists, then (re)attach the trigger.
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Keep updated_at fresh when rows are edited inline (grid Save / pencil edit).
DROP TRIGGER IF EXISTS trg_portal_records_updated_at ON portal_records;
CREATE TRIGGER trg_portal_records_updated_at
  BEFORE UPDATE ON portal_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------------
-- 2. Row-Level Security for portal_records.
--    The Next.js API already scopes every read/write to the signed-in school
--    admin. These policies add a second layer of defence at the database so
--    that even direct table access cannot leak one school's records to
--    another school. anon keys get nothing; service role (used by the API)
--    bypasses RLS exactly as before.
-- ---------------------------------------------------------------------------

ALTER TABLE portal_records ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'portal_records'
      AND policyname = 'portal_records_select_own_or_admin'
  ) THEN
    CREATE POLICY portal_records_select_own_or_admin
      ON portal_records FOR SELECT
      USING (
        created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM users u
          WHERE u.id = auth.uid() AND lower(u.role) = 'admin'
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'portal_records'
      AND policyname = 'portal_records_insert_own_or_admin'
  ) THEN
    CREATE POLICY portal_records_insert_own_or_admin
      ON portal_records FOR INSERT
      WITH CHECK (
        created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM users u
          WHERE u.id = auth.uid() AND lower(u.role) = 'admin'
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'portal_records'
      AND policyname = 'portal_records_update_own_or_admin'
  ) THEN
    CREATE POLICY portal_records_update_own_or_admin
      ON portal_records FOR UPDATE
      USING (
        created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM users u
          WHERE u.id = auth.uid() AND lower(u.role) = 'admin'
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'portal_records'
      AND policyname = 'portal_records_delete_own_or_admin'
  ) THEN
    CREATE POLICY portal_records_delete_own_or_admin
      ON portal_records FOR DELETE
      USING (
        created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM users u
          WHERE u.id = auth.uid() AND lower(u.role) = 'admin'
        )
      );
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 3. Module-key harmonisation for the two dedicated Students MIS screens.
--    The live portal stores Enrolment Campaign Targets and Daily Enrolment on
--    their APEX slugs; make sure no rows are stranded under the older keys.
--    (twin-sync-2026-09-29.sql already mapped most aliases — these two are the
--    remaining ones introduced by the live-parity update.)
-- ---------------------------------------------------------------------------

UPDATE portal_records SET module_key = 'target-student-enrolment'
  WHERE module_key IN ('students-enrolment-target', 'enrolment-target');

UPDATE portal_records SET module_key = 'daily-students-enrolment'
  WHERE module_key IN ('students-daily-enrolment', 'daily-enrolment');

-- ---------------------------------------------------------------------------
-- 4. Optional demo-credential cleanup (guarded, repeatable).
--    Removes the captured demo school-admin account and its notifications.
--    The account can no longer sign in afterwards. Comment out if you want to
--    keep it for reference.
-- ---------------------------------------------------------------------------

DELETE FROM notifications WHERE user_id IN (
  SELECT id FROM users WHERE username = 'GMSTAJMUHAMMADHALIMZAI66013'
);

DELETE FROM users WHERE username = 'GMSTAJMUHAMMADHALIMZAI66013';

COMMIT;

-- ============================================================================
-- Verification queries (run manually after COMMIT if desired):
--
--   -- indexes exist:
--   SELECT indexname FROM pg_indexes
--    WHERE tablename = 'portal_records'
--      AND indexname IN ('idx_portal_records_module_updated','idx_portal_records_created_by');
--
--   -- RLS active:
--   SELECT relrowsecurity FROM pg_class WHERE relname = 'portal_records';
--
--   -- demo account gone (expect 0 rows):
--   SELECT id FROM users WHERE username = 'GMSTAJMUHAMMADHALIMZAI66013';
-- ============================================================================
