-- Complete RLS Policy Fix - Remove all USING(true) warnings
-- This migration fixes all remaining RLS policy warnings

BEGIN;

-- =====================================================
-- 1. Fix activity_logs - Remove permissive INSERT policies
-- =====================================================

DROP POLICY IF EXISTS "Allow anon inserts for triggers" ON public.activity_logs;
DROP POLICY IF EXISTS "System can insert activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.activity_logs;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.activity_logs;

-- Only allow if user_id column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'activity_logs' AND column_name = 'user_id'
  ) THEN
    EXECUTE 'CREATE POLICY "Users insert own logs" ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid())';
  ELSE
    -- No user_id, admin only
    EXECUTE 'CREATE POLICY "Admins insert logs" ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()))';
  END IF;
END $$;

-- =====================================================
-- 2. Fix admin_logs - Admin-only INSERT
-- =====================================================

DROP POLICY IF EXISTS "Admins and System can insert logs" ON public.admin_logs;

CREATE POLICY "Admins insert logs"
  ON public.admin_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

-- =====================================================
-- 3. Fix availability_status - Admin-only UPDATE
-- =====================================================

DROP POLICY IF EXISTS "Authenticated update access" ON public.availability_status;
DROP POLICY IF EXISTS "Allow authenticated users to update availability_status" ON public.availability_status;

CREATE POLICY "Admins update availability"
  ON public.availability_status
  FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

-- =====================================================
-- 4. Fix resume_data - Admin-only (no user_id column)
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can insert resume data" ON public.resume_data;
DROP POLICY IF EXISTS "Authenticated users can update resume data" ON public.resume_data;
DROP POLICY IF EXISTS "Authenticated users can delete resume data" ON public.resume_data;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.resume_data;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.resume_data;
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.resume_data;

-- Check if user_id exists, otherwise admin-only
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'resume_data' AND column_name = 'user_id'
  ) THEN
    -- User-scoped policies
    EXECUTE 'CREATE POLICY "Users insert own resume" ON public.resume_data FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid())';
    EXECUTE 'CREATE POLICY "Users update own resume" ON public.resume_data FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid())';
    EXECUTE 'CREATE POLICY "Users delete own resume" ON public.resume_data FOR DELETE TO authenticated USING (user_id = auth.uid())';
  ELSE
    -- Admin-only policies
    EXECUTE 'CREATE POLICY "Admins manage resume" ON public.resume_data FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()))';
  END IF;
END $$;

-- =====================================================
-- 5. Fix site_controls - Admin-only UPDATE
-- =====================================================

DROP POLICY IF EXISTS "Allow authenticated users to update site_controls" ON public.site_controls;

CREATE POLICY "Admins update controls"
  ON public.site_controls
  FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

-- =====================================================
-- 6. contact_messages is CORRECT - keep as is
-- =====================================================

-- The "Anyone can submit messages" policy with WITH CHECK (true) is INTENTIONAL
-- for a public contact form. This is NOT a security issue.
-- No changes needed.

COMMIT;

-- =====================================================
-- Summary of changes:
-- =====================================================

-- activity_logs: User-scoped INSERT (if user_id exists) OR admin-only
-- admin_logs: Admin-only INSERT
-- availability_status: Admin-only UPDATE
-- resume_data: User-scoped OR admin-only (if no user_id)
-- site_controls: Admin-only UPDATE
-- contact_messages: Unchanged (public INSERT is correct for contact forms)

-- REMEMBER: Enable Leaked Password Protection in Dashboard!
-- Dashboard → Authentication → Settings → Password Security → Enable
