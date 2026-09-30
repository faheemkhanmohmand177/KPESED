-- KPESE HRMIS Assets MIS migration
-- Additive migration for Asset Profile, Asset Details, and Assets Report.
-- Safe to run after supabase/schema.sql and supabase/portal-navigation.sql.

CREATE TABLE IF NOT EXISTS asset_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS asset_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS asset_names (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  asset_type TEXT,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  emis_code TEXT NOT NULL,
  school_name TEXT NOT NULL,
  district TEXT,
  school_gender TEXT,
  asset_code TEXT,
  asset_name TEXT NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('CONSUMABLE', 'FIXED/MOVABLE')),
  category TEXT,
  donated_by TEXT,
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  status TEXT NOT NULL DEFAULT 'FUNCTIONAL' CHECK (status IN ('FUNCTIONAL', 'NON-FUNCTIONAL')),
  availability TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (availability IN ('AVAILABLE', 'ISSUED', 'DEPLETED')),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assets_emis_code ON assets(emis_code);
CREATE INDEX IF NOT EXISTS idx_assets_school_id ON assets(school_id);
CREATE INDEX IF NOT EXISTS idx_assets_type_category ON assets(asset_type, category);
CREATE INDEX IF NOT EXISTS idx_assets_name ON assets(asset_name);

INSERT INTO asset_types (name) VALUES ('CONSUMABLE'), ('FIXED/MOVABLE') ON CONFLICT (name) DO NOTHING;
INSERT INTO asset_categories (name) VALUES ('Stationery'), ('Furniture'), ('Electronics'), ('Building'), ('Other') ON CONFLICT (name) DO NOTHING;
INSERT INTO asset_names (name, asset_type, category) VALUES
  ('FILE AND FOLDER', 'CONSUMABLE', 'Stationery'),
  ('ATTENDANCE REGISTER STUDENTS', 'CONSUMABLE', 'Stationery'),
  ('SCHOOL LEAVING CERTIFICATE FILE', 'CONSUMABLE', 'Stationery'),
  ('STOCK REGISTER', 'CONSUMABLE', 'Stationery'),
  ('MARKER', 'CONSUMABLE', 'Stationery'),
  ('PENCILS', 'CONSUMABLE', 'Stationery'),
  ('FLAG', 'CONSUMABLE', 'Other'),
  ('WATER STORAGE DRUMS', 'FIXED/MOVABLE', 'Building'),
  ('TABLET CHAIR', 'FIXED/MOVABLE', 'Furniture'),
  ('CEILING FAN', 'FIXED/MOVABLE', 'Electronics'),
  ('OFFICE TABLE', 'FIXED/MOVABLE', 'Furniture')
ON CONFLICT (name) DO NOTHING;

-- No demo asset records are seeded. Schools enter their own asset data
-- through the Asset Profile screen.

ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS assets_school_admin_scope ON assets;
CREATE POLICY assets_school_admin_scope ON assets
  FOR ALL
  USING (
    emis_code = COALESCE(current_setting('request.jwt.claims', true)::jsonb ->> 'emis_code', emis_code)
    OR COALESCE(current_setting('request.jwt.claims', true)::jsonb ->> 'role', '') IN ('Admin', 'DEO', 'DDEO')
  )
  WITH CHECK (
    emis_code = COALESCE(current_setting('request.jwt.claims', true)::jsonb ->> 'emis_code', emis_code)
    OR COALESCE(current_setting('request.jwt.claims', true)::jsonb ->> 'role', '') IN ('Admin', 'DEO', 'DDEO')
  );
