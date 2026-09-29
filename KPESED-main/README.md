# Integrated EMIS Portal

Integrated EMIS is a Next.js education-management portal with an Oracle APEX-style interface, protected sessions, school profiles, employee records, attendance, reports, and extensible module records.

## Features

- Responsive blue/charcoal portal shell
- Expandable navigation tree with 12 modules
- School profile management
- School-admin login provisioning
- School-admin scoped access to the school assigned to that account
- Employee profiles and employee detail records
- Teacher attendance marking and saving
- Assets MIS: Asset Profile, Asset Details, and Assets Report with school-admin scoping
- Searchable report tables
- Rows-per-page controls
- CSV downloads
- Add, update, delete, and refresh actions
- PWA install support
- Tutorial, user manual, password change, and sign-out controls
- Supabase SQL schema and Prisma local development schema

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React, TypeScript, Tailwind CSS |
| UI | Lucide icons and reusable APEX-style components |
| Local database | Prisma with SQLite or PostgreSQL |
| Production database | Supabase Postgres |
| Authentication | Protected cookie session with bcrypt password hashes |

## Local setup

```bash
npm install
cp .env.example .env
npx prisma db push
npx prisma generate
npm run seed
npm run dev
```

Open `http://localhost:3000`.

For production, configure the Supabase URL and service-role key in the deployment environment, run the base schema, then run the portal migration:

```bash
supabase db push
psql "$DATABASE_URL" -f supabase/portal-navigation.sql
psql "$DATABASE_URL" -f supabase/asset-profile.sql
```

The asset migration creates lookup tables and the `assets` table, seeds lookup values, and inserts one representative EMIS `66013` record only when that school already exists. It does not import the source portal's private dataset.

See [`docs/kpese-live-audit-2026-09-29.md`](docs/kpese-live-audit-2026-09-29.md) for the read-only KPESED feature audit, observed fields and controls, implementation scope, and limitations.

## Creating a school and school login

1. Sign in with an elevated account (`Admin`, `DEO`, or `DDEO`).
2. Open **Office/School MIS → Office/School Profile(s)**.
3. Click **Add Office/School**.
4. Enter the EMIS code, school name, level/type, gender, DDO code, and address.
5. In **Create school login**, enter a username and temporary password.
6. Save the form.
7. Give the generated credentials to the school administrator.

The school account is stored in `users` with role `school admin` and an assigned EMIS code. Passwords are bcrypt-hashed; the temporary password is only displayed in the success message at creation time.

## How school administrators use the portal

A school administrator signs in through the normal login screen. The account is scoped to its assigned EMIS code:

- It can see its own school profile.
- It can edit its own school profile.
- It cannot edit another school through the school API.
- It can use the employee, attendance, report, and module workflows allowed by the application.
- An elevated user can manage all schools and provision new school logins.

The school administrator can change the password from the top-right user menu.

## Adding portal data

### School profiles

Use the **Add Office/School** form. School profiles are stored in the `schools` table and can be searched, downloaded, and edited.

### Employees

Use the existing employee APIs and employee screens. Employee records belong to a school through the EMIS code/school relation. The employee endpoint supports search, district, tehsil, gender, status, pagination, and school-admin scoping.

### Attendance

Open **HR MIS → Teacher Attendance**, choose the attendance date, set attendance values, and use **Save**. Attendance records are stored with the employee, school, date, and marking user.

### Other modules

The generic module pages support protected records through:

```text
GET    /api/portal-records?module=students-profiles
POST   /api/portal-records
PATCH  /api/portal-records/:id
DELETE /api/portal-records/:id
```

Example record payload:

```json
{
  "moduleKey": "students-profiles",
  "data": {
    "student_name": "Example Student",
    "emis_code": "<school-emis-code>",
    "class": "8",
    "gender": "MALE"
  }
}
```

The feature page then provides search, refresh, CSV download, add, and delete operations for those records.

## Database files

- `prisma/schema.prisma` — local and Prisma-managed database models
- `supabase/schema.sql` — base production schema
- `supabase/portal-navigation.sql` — navigation and generic portal-record migration
- `supabase/twin-sync-2026-09-29.sql` — **safe, idempotent migration that syncs an existing deployment to the live KPESED portal structure** (12 top-level groups / 58 leaf features, real APEX page slugs, 3-level SSR nesting, and legacy `portal_records.module_key` remapping)
- `scripts/seed.ts` — local reference districts, tehsils, designations, and Admin user

Run the SQL files in this order:

1. `supabase/schema.sql`
2. `supabase/portal-navigation.sql`

### Updating an existing deployment (twin sync)

If your Supabase already has the old navigation seed, run
`supabase/twin-sync-2026-09-29.sql` in the Supabase SQL editor. It is
additive and idempotent (only `INSERT … ON CONFLICT DO UPDATE` plus
key-preserving `UPDATE`s of `portal_records.module_key`), so it is safe to
re-run and never deletes data.

### Feature parity with the live portal (2026-09-29 audit)

The sidebar mirrors the live School Admin menu exactly: 12 top-level groups,
58 leaf features, live page slugs (`office-school-list`, `students-search`,
`staff-leaves-report`, `ptc-headwise-balance`, `dps-iemis-updation-emrollment`,
the live spellings `student-attendence` / `students-class_update` /
`classwise-enrollment-report-ss`, and the sixteen SSR reports nested under
**School Self Report (SSR) Form**). Every captured report page renders its
real columns, filter fields, saved-report names, and empty-state texts via
`src/lib/real-modules.ts` + `src/components/hrmis/real-module-page.tsx`,
including the PTC HEADWISE AVAILABLE AMOUNT workspace (rupees-only notice,
**PTC Available Balance Entry Form / PTC Amount (Report)** tabs, 30-column
editable grid with Bank Remarks Active/Dormant/Inactive), the Monitoring
Dashboard's four ASC & iEMIS comparison charts, and the DPS - Rankings
attachment list. Record data itself is **not** copied from the source portal;
school admins enter their own data through the same screens.

The base schema starts with reference districts/designations and an unscoped Admin; schools and employees are added by the Admin through the portal.

## Main API routes

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/change-password`
- `GET /api/schools`
- `POST /api/schools`
- `PATCH /api/schools/:id`
- `DELETE /api/schools/:id` (Admin/DEO/DDEO only; refuses deletion while employees are attached)
- `GET/POST /api/portal-records`
- `PATCH/DELETE /api/portal-records/:id`
- `GET /api/employees`
- `GET/PATCH /api/employees/:empId`
- `GET/POST /api/attendance`

## Verification

```bash
npx prisma generate
npm run build
npm run lint
```

The repository is configured to deploy from the `main` branch.
