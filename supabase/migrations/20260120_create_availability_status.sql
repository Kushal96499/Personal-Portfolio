-- Create availability status table for admin-controlled service availability
CREATE TABLE IF NOT EXISTS availability_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  available boolean NOT NULL DEFAULT true,
  message text,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Insert default availability record
INSERT INTO availability_status (available, message) 
VALUES (true, 'Available for new projects')
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE availability_status ENABLE ROW LEVEL SECURITY;

-- Allow public read access (anyone can check availability)
CREATE POLICY "Public read access" 
ON availability_status 
FOR SELECT 
TO anon, authenticated
USING (true);

-- Allow authenticated users to update (admin only)
CREATE POLICY "Authenticated update access" 
ON availability_status 
FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

-- Create function to auto-update timestamp
CREATE OR REPLACE FUNCTION update_availability_timestamp()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER set_availability_timestamp
BEFORE UPDATE ON availability_status
FOR EACH ROW
EXECUTE FUNCTION update_availability_timestamp();
