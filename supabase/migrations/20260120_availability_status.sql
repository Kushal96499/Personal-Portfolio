-- Create availability status table for admin-controlled service availability
CREATE TABLE IF NOT EXISTS public.availability_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  available boolean NOT NULL DEFAULT true,
  message text,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Insert default availability record (only if table is empty)
INSERT INTO public.availability_status (available, message) 
SELECT true, 'Available for new projects'
WHERE NOT EXISTS (SELECT 1 FROM public.availability_status);

-- Enable RLS
ALTER TABLE public.availability_status ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access" ON public.availability_status;
DROP POLICY IF EXISTS "Authenticated update access" ON public.availability_status;

-- Allow public read access (anyone can check availability)
CREATE POLICY "Public read access" 
ON public.availability_status 
FOR SELECT 
TO anon, authenticated
USING (true);

-- Allow authenticated users to update (admin only)
CREATE POLICY "Authenticated update access" 
ON public.availability_status 
FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

-- Create or replace function to auto-update timestamp
CREATE OR REPLACE FUNCTION public.update_availability_timestamp()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS set_availability_timestamp ON public.availability_status;

-- Create trigger
CREATE TRIGGER set_availability_timestamp
BEFORE UPDATE ON public.availability_status
FOR EACH ROW
EXECUTE FUNCTION public.update_availability_timestamp();
