-- Create branding_settings table for logo and branding customization
CREATE TABLE IF NOT EXISTS branding_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  logo_type TEXT NOT NULL DEFAULT 'text' CHECK (logo_type IN ('text', 'image')),
  logo_url TEXT,
  logo_size INTEGER NOT NULL DEFAULT 45 CHECK (logo_size >= 30 AND logo_size <= 80),
  neon_glow BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings (text logo "KK" with neon glow)
INSERT INTO branding_settings (logo_type, logo_size, neon_glow)
SELECT 'text', 45, true
WHERE NOT EXISTS (SELECT 1 FROM branding_settings);

-- Enable RLS
ALTER TABLE branding_settings ENABLE ROW LEVEL SECURITY;

-- Allow public to read branding settings
CREATE POLICY "Allow public read access to branding_settings"
ON branding_settings FOR SELECT
TO public
USING (true);

-- Allow authenticated users (admins) to update
CREATE POLICY "Allow authenticated users to update branding_settings"
ON branding_settings FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS set_branding_settings_updated_at ON branding_settings;
CREATE TRIGGER set_branding_settings_updated_at
BEFORE UPDATE ON branding_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE branding_settings IS 'Controls logo and branding appearance on the portfolio website';
