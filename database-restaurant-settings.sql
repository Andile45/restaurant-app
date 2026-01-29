-- ============================================
-- Restaurant Settings Table (single row)
-- ============================================
-- Stores: restaurant info, operating hours, tax/fees for CMS Settings page.
-- Run in Supabase SQL Editor.
-- After this, run database-connect-restaurant-settings.sql to link this
-- table to orders and payments (foreign keys).
-- ============================================

CREATE TABLE IF NOT EXISTS restaurant_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  restaurant_name text NOT NULL DEFAULT 'BiteX Restaurant',
  address text DEFAULT '',
  contact text DEFAULT '',
  operating_hours jsonb NOT NULL DEFAULT '{
    "monday": {"open": "09:00", "close": "22:00", "enabled": true},
    "tuesday": {"open": "09:00", "close": "22:00", "enabled": true},
    "wednesday": {"open": "09:00", "close": "22:00", "enabled": true},
    "thursday": {"open": "09:00", "close": "22:00", "enabled": true},
    "friday": {"open": "09:00", "close": "23:00", "enabled": true},
    "saturday": {"open": "10:00", "close": "23:00", "enabled": true},
    "sunday": {"open": "10:00", "close": "22:00", "enabled": true}
  }'::jsonb,
  vat_percent numeric(5,2) NOT NULL DEFAULT 15,
  service_fee numeric(10,2) NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Ensure single row
INSERT INTO restaurant_settings (id, restaurant_name)
VALUES (1, 'BiteX Restaurant')
ON CONFLICT (id) DO NOTHING;

-- RLS: only admin can read/update
ALTER TABLE restaurant_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin can manage restaurant_settings" ON restaurant_settings;
CREATE POLICY "admin can manage restaurant_settings"
ON restaurant_settings
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.auth_uid = auth.uid() AND p.role = 'admin'
  )
);

-- Trigger to set updated_at
CREATE OR REPLACE FUNCTION set_restaurant_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS restaurant_settings_updated_at ON restaurant_settings;
CREATE TRIGGER restaurant_settings_updated_at
  BEFORE UPDATE ON restaurant_settings
  FOR EACH ROW EXECUTE FUNCTION set_restaurant_settings_updated_at();
