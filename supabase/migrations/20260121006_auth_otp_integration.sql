-- Supabase Auth OTP Integration - Database Migration
-- Run this in Supabase SQL Editor

BEGIN;

-- =====================================================
-- 1. ADD USER_ID TO LEADS TABLE
-- =====================================================

-- Add user_id column to link with auth.users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.leads 
    ADD COLUMN user_id UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);

-- =====================================================
-- 2. UPDATE RLS POLICIES FOR LEADS
-- =====================================================

-- Drop old public insert policy
DROP POLICY IF EXISTS "Public can insert via function" ON public.leads;
DROP POLICY IF EXISTS "Public can submit via function" ON public.leads;

-- Allow authenticated users to insert their own leads
CREATE POLICY "Authenticated users insert own leads"
  ON public.leads
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- =====================================================
-- 3. CREATE FUNCTION TO AUTO-SET USER_ID
-- =====================================================

CREATE OR REPLACE FUNCTION public.set_lead_user_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Auto-set user_id if not provided
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  
  -- Auto-set email from auth.users if not provided
  IF NEW.email IS NULL AND auth.uid() IS NOT NULL THEN
    SELECT email INTO NEW.email
    FROM auth.users
    WHERE id = auth.uid();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS set_lead_user_id_trigger ON public.leads;
CREATE TRIGGER set_lead_user_id_trigger
  BEFORE INSERT ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.set_lead_user_id();

-- =====================================================
-- 4. CREATE VIEW FOR ADMIN TO SEE USER INFO
-- =====================================================

CREATE OR REPLACE VIEW public.leads_with_user_info AS
SELECT 
  l.*,
  u.email as verified_email,
  u.email_confirmed_at,
  u.created_at as user_created_at
FROM public.leads l
LEFT JOIN auth.users u ON l.user_id = u.id;

-- Grant access to admins only
GRANT SELECT ON public.leads_with_user_info TO authenticated;

-- RLS for view (admins only)
ALTER VIEW public.leads_with_user_info SET (security_invoker = on);

COMMIT;

-- =====================================================
--VERIFY INSTALLATION
-- =====================================================

SELECT 'user_id column added to leads:' as status,
  EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'user_id') as exists;

SELECT 'Trigger created:' as status,
  EXISTS(SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'set_lead_user_id_trigger') as exists;

SELECT 'RLS policies updated:' as status,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'leads';
