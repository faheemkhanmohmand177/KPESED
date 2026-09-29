-- One-time cleanup for the old captured demo data.
-- Run only against the KPESED production database after confirming the exact scope.
-- Removes the screenshot school (EMIS 66013), all employees attached to it,
-- the captured Jamshad record and all dependent records, plus the old account.
BEGIN;

-- Delete all dependent employee records attached to the screenshot school.
DELETE FROM attendance WHERE employee_id IN (
  SELECT id FROM employees WHERE emis_code = '66013' OR school_id = (SELECT id FROM schools WHERE emis_code = '66013')
);
DELETE FROM service_records WHERE employee_id IN (
  SELECT id FROM employees WHERE emis_code = '66013' OR school_id = (SELECT id FROM schools WHERE emis_code = '66013')
);
DELETE FROM posting_transfers WHERE employee_id IN (
  SELECT id FROM employees WHERE emis_code = '66013' OR school_id = (SELECT id FROM schools WHERE emis_code = '66013')
);
DELETE FROM bps_history WHERE employee_id IN (
  SELECT id FROM employees WHERE emis_code = '66013' OR school_id = (SELECT id FROM schools WHERE emis_code = '66013')
);
DELETE FROM job_type_history WHERE employee_id IN (
  SELECT id FROM employees WHERE emis_code = '66013' OR school_id = (SELECT id FROM schools WHERE emis_code = '66013')
);
DELETE FROM cadre_history WHERE employee_id IN (
  SELECT id FROM employees WHERE emis_code = '66013' OR school_id = (SELECT id FROM schools WHERE emis_code = '66013')
);
DELETE FROM qualifications WHERE employee_id IN (
  SELECT id FROM employees WHERE emis_code = '66013' OR school_id = (SELECT id FROM schools WHERE emis_code = '66013')
);
DELETE FROM family_members WHERE employee_id IN (
  SELECT id FROM employees WHERE emis_code = '66013' OR school_id = (SELECT id FROM schools WHERE emis_code = '66013')
);
DELETE FROM bank_details WHERE employee_id IN (
  SELECT id FROM employees WHERE emis_code = '66013' OR school_id = (SELECT id FROM schools WHERE emis_code = '66013')
);
DELETE FROM leaves_details WHERE employee_id IN (
  SELECT id FROM employees WHERE emis_code = '66013' OR school_id = (SELECT id FROM schools WHERE emis_code = '66013')
);
DELETE FROM training_details WHERE employee_id IN (
  SELECT id FROM employees WHERE emis_code = '66013' OR school_id = (SELECT id FROM schools WHERE emis_code = '66013')
);
DELETE FROM employee_documents WHERE employee_id IN (
  SELECT id FROM employees WHERE emis_code = '66013' OR school_id = (SELECT id FROM schools WHERE emis_code = '66013')
);
DELETE FROM employees WHERE emis_code = '66013'
   OR school_id = (SELECT id FROM schools WHERE emis_code = '66013');

-- Remove notifications and the old captured school-admin account.
DELETE FROM notifications WHERE user_id IN (
  SELECT id FROM users WHERE username = 'GMSTAJMUHAMMADHALIMZAI66013'
);
DELETE FROM users WHERE username = 'GMSTAJMUHAMMADHALIMZAI66013';

-- Remove the school shown in the screenshot.
DELETE FROM schools WHERE emis_code = '66013'
  AND upper(name) LIKE '%TAJ MUHAMMAD HALIMZAI%';

-- Ensure the intended first Admin account exists and is not school-scoped.
INSERT INTO users (username, password, full_name, email, phone, role, emis_code, school_name, district)
VALUES (
  'Khan',
  '$2b$10$OVB4aWsmEm/L9kcWYCz2HuWpL.eN5n1PK/BiXyVHNxRSmZVoBGHDi',
  'Khan Administrator',
  'admin@hrmis-portal.local',
  '112345678',
  'Admin', NULL, NULL, NULL
)
ON CONFLICT (username) DO UPDATE SET
  role = 'Admin', emis_code = NULL, school_name = NULL, district = NULL;

COMMIT;
