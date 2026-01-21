-- Fix RLS for contact_messages table
-- Contact form: Anyone can submit, only admins can view/manage

BEGIN;

-- Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Anyone can insert messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can view messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can update messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can delete messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Public can insert contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Only admins can view contact messages" ON public.contact_messages;

-- Policy 1: Anyone (even anonymous) can submit contact messages
CREATE POLICY "Anyone can submit messages"
  ON public.contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy 2: Only admins can view messages
CREATE POLICY "Admins view messages"
  ON public.contact_messages
  FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

-- Policy 3: Only admins can update messages
CREATE POLICY "Admins update messages"
  ON public.contact_messages
  FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

-- Policy 4: Only admins can delete messages
CREATE POLICY "Admins delete messages"
  ON public.contact_messages
  FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

COMMIT;

-- Verify policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'contact_messages';
