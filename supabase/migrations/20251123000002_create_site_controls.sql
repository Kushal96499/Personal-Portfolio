-- Create site_controls table for section visibility management
CREATE TABLE IF NOT EXISTS site_controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_hero BOOLEAN DEFAULT true,
  skills BOOLEAN DEFAULT true,
  projects BOOLEAN DEFAULT true,
  testimonials BOOLEAN DEFAULT true,
  certificates BOOLEAN DEFAULT true,
  blog BOOLEAN DEFAULT true,
  contact BOOLEAN DEFAULT true,
  footer_extras BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create trigger function for updated_at if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for site_controls updated_at
DROP TRIGGER IF EXISTS set_site_controls_updated_at ON site_controls;
CREATE TRIGGER set_site_controls_updated_at
BEFORE UPDATE ON site_controls
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert default row (all sections enabled) only if table is empty
INSERT INTO site_controls (id)
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM site_controls);

-- Enable RLS
ALTER TABLE site_controls ENABLE ROW LEVEL SECURITY;

-- Allow public to read site controls
CREATE POLICY "Allow public read access to site_controls"
ON site_controls FOR SELECT
TO public
USING (true);

-- Allow authenticated users (admins) to update
CREATE POLICY "Allow authenticated users to update site_controls"
ON site_controls FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

COMMENT ON TABLE site_controls IS 'Controls visibility of sections on the portfolio website';
