-- Quick Fix: Contact Messages RLS Policy
-- Run this in Supabase SQL Editor (Production)

BEGIN;

-- Enable RLS if not enabled
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Drop any conflicting policies
DROP POLICY IF EXISTS "Anyone can insert messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Anyone can submit messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Public can insert contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.contact_messages;

-- Create the correct policy - Allow ANYONE to submit
CREATE POLICY "Public can submit contact messages"
  ON public.contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Verify policy was created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'contact_messages';

COMMIT;
