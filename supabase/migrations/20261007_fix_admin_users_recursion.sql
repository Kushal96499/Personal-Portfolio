-- Migration: Fix infinite recursion in admin_users and repair resume_data RLS
-- Date: 2026-10-07
-- Root Cause: admin_users had a self-referential policy "Admins can view admin list"
-- that queried admin_users, triggering infinite recursion whenever any table's
-- RLS checked admin_users.
-- Fix: Implement a SECURITY DEFINER helper function public.is_admin() with safe search_path,
-- and update all policies to use public.is_admin() instead of direct recursion.

BEGIN;

-- 1. Helper function: public.is_admin()
-- SECURITY DEFINER allows querying public.admin_users without triggering its RLS policies
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE admin_users.user_id = is_admin.user_id
  );
$$;

-- Secure function permissions
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO anon;

-- 2. Fix admin_users RLS policies
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view admin list" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can manage admin list" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can manage admin_users" ON public.admin_users;

CREATE POLICY "Admins can view admin list"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage admin_users"
  ON public.admin_users
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 3. Fix resume_data RLS policies
ALTER TABLE public.resume_data ENABLE ROW LEVEL SECURITY;

-- Drop all duplicate and recursive policies on resume_data
DROP POLICY IF EXISTS "Anyone can view resume" ON public.resume_data;
DROP POLICY IF EXISTS "Only admins can modify resume" ON public.resume_data;
DROP POLICY IF EXISTS "Admins manage resume" ON public.resume_data;
DROP POLICY IF EXISTS "Admin Write Resume Data" ON public.resume_data;
DROP POLICY IF EXISTS "Public Read Resume Data" ON public.resume_data;
DROP POLICY IF EXISTS "Public can view resume data" ON public.resume_data;
DROP POLICY IF EXISTS "Allow public read access to resume_data" ON public.resume_data;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.resume_data;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.resume_data;
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.resume_data;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.resume_data;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.resume_data;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.resume_data;

-- Clean, non-recursive policies for resume_data:
CREATE POLICY "Public can view resume data"
  ON public.resume_data
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can insert resume data"
  ON public.resume_data
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update resume data"
  ON public.resume_data
  FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete resume data"
  ON public.resume_data
  FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- 4. Fix site_controls policies
ALTER TABLE public.site_controls ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only admins can update site controls" ON public.site_controls;
DROP POLICY IF EXISTS "Only admins can insert site controls" ON public.site_controls;
DROP POLICY IF EXISTS "Only admins can delete site controls" ON public.site_controls;
DROP POLICY IF EXISTS "Admins update controls" ON public.site_controls;

CREATE POLICY "Admins can update site controls"
  ON public.site_controls
  FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert site controls"
  ON public.site_controls
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete site controls"
  ON public.site_controls
  FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- 5. Fix branding_settings policies
ALTER TABLE public.branding_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only admins can update branding settings" ON public.branding_settings;
DROP POLICY IF EXISTS "Only admins can insert branding settings" ON public.branding_settings;
DROP POLICY IF EXISTS "Only admins can delete branding settings" ON public.branding_settings;

CREATE POLICY "Admins can update branding settings"
  ON public.branding_settings
  FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert branding settings"
  ON public.branding_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete branding settings"
  ON public.branding_settings
  FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- 6. Fix contact_messages policies
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins update messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins delete messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins view only" ON public.contact_messages;

CREATE POLICY "Admins view contact messages"
  ON public.contact_messages
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins update contact messages"
  ON public.contact_messages
  FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins delete contact messages"
  ON public.contact_messages
  FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- 7. Fix leads policies
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins view all leads" ON public.leads;
DROP POLICY IF EXISTS "Admins update leads" ON public.leads;
DROP POLICY IF EXISTS "Admins delete leads" ON public.leads;

CREATE POLICY "Admins view all leads"
  ON public.leads
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins update leads"
  ON public.leads
  FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins delete leads"
  ON public.leads
  FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- 8. Fix activity_logs and admin_logs policies
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Only admins can view logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Only admins can insert logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Admins insert logs" ON public.activity_logs;

CREATE POLICY "Admins view activity logs"
  ON public.activity_logs
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins insert activity logs"
  ON public.activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Only admins view logs" ON public.admin_logs;
DROP POLICY IF EXISTS "Only admins insert logs" ON public.admin_logs;
DROP POLICY IF EXISTS "Admins insert logs" ON public.admin_logs;

CREATE POLICY "Admins view admin logs"
  ON public.admin_logs
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins insert admin logs"
  ON public.admin_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- 9. Fix availability_status policy if table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'availability_status') THEN
    ALTER TABLE public.availability_status ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Admins update availability" ON public.availability_status;
    EXECUTE 'CREATE POLICY "Admins update availability" ON public.availability_status FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()))';
  END IF;
END $$;

COMMIT;
