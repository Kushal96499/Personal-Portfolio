-- Migration: Fix Database Security Issues (Complete) - FIXED VERSION
-- Date: 2026-01-21
-- Fixes: function search_path, RLS policies, admin roles

BEGIN;

-- =====================================================
-- PART 1: Fix function_search_path_mutable warnings
-- =====================================================

-- Dynamically fix all matching functions with correct signatures
DO $$
DECLARE
  r RECORD;
  argtypes text;
  func_signature text;
BEGIN
  FOR r IN
    SELECT p.oid, n.nspname AS schema_name, p.proname,
           pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.proname IN (
      'update_resume_data_updated_at',
      'log_resume_activity',
      'generate_slug',
      'set_blog_slug',
      'log_activity',
      'update_updated_at_column'
    ) AND n.nspname = 'public'
  LOOP
    argtypes := r.args;
    IF argtypes = '' THEN
      func_signature := format('public.%I()', r.proname);
    ELSE
      func_signature := format('public.%I(%s)', r.proname, argtypes);
    END IF;
    EXECUTE format('ALTER FUNCTION %s SET search_path = public', func_signature);
    RAISE NOTICE 'Fixed function: %', func_signature;
  END LOOP;
END
$$;

-- =====================================================
-- PART 2: Create admin_users table for role-based access
-- =====================================================

CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Only admins can view admin list
DROP POLICY IF EXISTS "Admins can view admin list" ON public.admin_users;
CREATE POLICY "Admins can view admin list"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

-- =====================================================
-- PART 3: Fix site_controls RLS policies
-- =====================================================

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Allow public read access to site_controls" ON public.site_controls;
DROP POLICY IF EXISTS "Allow authenticated users to update site controls" ON public.site_controls;
DROP POLICY IF EXISTS "Public Read Site Controls" ON public.site_controls;
DROP POLICY IF EXISTS "Admin Write Site Controls" ON public.site_controls;
DROP POLICY IF EXISTS "Anyone can view site controls" ON public.site_controls;
DROP POLICY IF EXISTS "Admins can update site controls" ON public.site_controls;
DROP POLICY IF EXISTS "Admins can insert site controls" ON public.site_controls;

-- Ensure RLS is enabled
ALTER TABLE public.site_controls ENABLE ROW LEVEL SECURITY;

-- Create new secure policies (NO user_id reference - this is a global config table)
CREATE POLICY "Public can view site controls"
  ON public.site_controls
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Only admins can update site controls"
  ON public.site_controls
  FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Only admins can insert site controls"
  ON public.site_controls
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Only admins can delete site controls"
  ON public.site_controls
  FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

-- =====================================================
-- PART 4: Fix branding_settings RLS policies
-- =====================================================

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Allow authenticated update" ON public.branding_settings;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.branding_settings;
DROP POLICY IF EXISTS "Allow public read access to branding_settings" ON public.branding_settings;
DROP POLICY IF EXISTS "Allow authenticated users to update branding_settings" ON public.branding_settings;
DROP POLICY IF EXISTS "Public Read Branding Settings" ON public.branding_settings;
DROP POLICY IF EXISTS "Admin Write Branding Settings" ON public.branding_settings;
DROP POLICY IF EXISTS "Anyone can view branding settings" ON public.branding_settings;
DROP POLICY IF EXISTS "Admins can update branding settings" ON public.branding_settings;
DROP POLICY IF EXISTS "Admins can insert branding settings" ON public.branding_settings;

-- Ensure RLS is enabled
ALTER TABLE public.branding_settings ENABLE ROW LEVEL SECURITY;

-- Create new secure policies (NO user_id reference - this is a global config table)
CREATE POLICY "Public can view branding settings"
  ON public.branding_settings
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Only admins can update branding settings"
  ON public.branding_settings
  FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Only admins can insert branding settings"
  ON public.branding_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Only admins can delete branding settings"
  ON public.branding_settings
  FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

-- =====================================================
-- PART 5: Fix resume_data RLS policies
-- =====================================================

-- Check if resume_data has user_id column, if so apply user-scoped policies
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'resume_data' 
    AND column_name = 'user_id'
  ) THEN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Allow authenticated insert" ON public.resume_data;
    DROP POLICY IF EXISTS "Allow authenticated update" ON public.resume_data;
    DROP POLICY IF EXISTS "Allow authenticated delete" ON public.resume_data;
    DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.resume_data;
    DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.resume_data;
    DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.resume_data;
    DROP POLICY IF EXISTS "Allow public read access to resume_data" ON public.resume_data;
    DROP POLICY IF EXISTS "Users can view own resume data" ON public.resume_data;
    DROP POLICY IF EXISTS "Users can insert own resume data" ON public.resume_data;
    DROP POLICY IF EXISTS "Users can update own resume data" ON public.resume_data;
    DROP POLICY IF EXISTS "Users can delete own resume data" ON public.resume_data;
    DROP POLICY IF EXISTS "Users view own resume" ON public.resume_data;
    DROP POLICY IF EXISTS "Users insert own resume" ON public.resume_data;
    DROP POLICY IF EXISTS "Users update own resume" ON public.resume_data;
    DROP POLICY IF EXISTS "Users delete own resume" ON public.resume_data;

    -- Enable RLS
    ALTER TABLE public.resume_data ENABLE ROW LEVEL SECURITY;

    -- Create user-scoped policies
    EXECUTE 'CREATE POLICY "Users view own resume" ON public.resume_data FOR SELECT TO authenticated USING (user_id = auth.uid())';
    EXECUTE 'CREATE POLICY "Users insert own resume" ON public.resume_data FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid())';
    EXECUTE 'CREATE POLICY "Users update own resume" ON public.resume_data FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid())';
    EXECUTE 'CREATE POLICY "Users delete own resume" ON public.resume_data FOR DELETE TO authenticated USING (user_id = auth.uid())';
    
    RAISE NOTICE 'Applied user-scoped policies to resume_data';
  ELSE
    -- No user_id column - apply admin-only policies
    DROP POLICY IF EXISTS "Allow authenticated insert" ON public.resume_data;
    DROP POLICY IF EXISTS "Allow authenticated update" ON public.resume_data;
    DROP POLICY IF EXISTS "Allow authenticated delete" ON public.resume_data;
    DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.resume_data;
    DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.resume_data;
    DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.resume_data;
    DROP POLICY IF EXISTS "Allow public read access to resume_data" ON public.resume_data;

    ALTER TABLE public.resume_data ENABLE ROW LEVEL SECURITY;

    EXECUTE 'CREATE POLICY "Anyone can view resume" ON public.resume_data FOR SELECT TO authenticated, anon USING (true)';
    EXECUTE 'CREATE POLICY "Only admins can modify resume" ON public.resume_data FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()))';
    
    RAISE NOTICE 'Applied admin-only policies to resume_data (no user_id column found)';
  END IF;
END $$;

-- =====================================================
-- PART 6: Fix activity_logs RLS policies
-- =====================================================

-- Check if activity_logs has user_id column
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'activity_logs' 
    AND column_name = 'user_id'
  ) THEN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Allow authenticated insert" ON public.activity_logs;
    DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.activity_logs;
    DROP POLICY IF EXISTS "Allow public read access to activity_logs" ON public.activity_logs;
    DROP POLICY IF EXISTS "Users can view own activity logs" ON public.activity_logs;
    DROP POLICY IF EXISTS "Users can insert own activity logs" ON public.activity_logs;
    DROP POLICY IF EXISTS "Admins can view all activity logs" ON public.activity_logs;
    DROP POLICY IF EXISTS "Users view own logs" ON public.activity_logs;
    DROP POLICY IF EXISTS "Users insert own logs" ON public.activity_logs;
    DROP POLICY IF EXISTS "Admins view all logs" ON public.activity_logs;

    ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

    -- Create user-scoped policies
    EXECUTE 'CREATE POLICY "Users view own logs" ON public.activity_logs FOR SELECT TO authenticated USING (user_id = auth.uid())';
    EXECUTE 'CREATE POLICY "Users insert own logs" ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid())';
    EXECUTE 'CREATE POLICY "Admins view all logs" ON public.activity_logs FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()))';
    
    RAISE NOTICE 'Applied user-scoped policies to activity_logs';
  ELSE
    -- No user_id - admin-only
    DROP POLICY IF EXISTS "Allow authenticated insert" ON public.activity_logs;
    DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.activity_logs;

    ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

    EXECUTE 'CREATE POLICY "Only admins can view logs" ON public.activity_logs FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()))';
    EXECUTE 'CREATE POLICY "Only admins can insert logs" ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()))';
    
    RAISE NOTICE 'Applied admin-only policies to activity_logs (no user_id column found)';
  END IF;
END $$;

-- =====================================================
-- PART 7: Fix admin_logs RLS policies
-- =====================================================

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.admin_logs;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.admin_logs;
DROP POLICY IF EXISTS "Allow public read access to admin_logs" ON public.admin_logs;
DROP POLICY IF EXISTS "Admins can view admin logs" ON public.admin_logs;
DROP POLICY IF EXISTS "Admins can insert admin logs" ON public.admin_logs;
DROP POLICY IF EXISTS "Only admins view logs" ON public.admin_logs;
DROP POLICY IF EXISTS "Only admins insert logs" ON public.admin_logs;

-- Ensure RLS is enabled
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Create secure policies (admin-only, NO user_id reference on table)
CREATE POLICY "Only admins view logs"
  ON public.admin_logs
  FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Only admins insert logs"
  ON public.admin_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

COMMIT;

-- =====================================================
-- POST-MIGRATION: Manual steps
-- =====================================================

-- Step 1: Get your user ID and add yourself as admin
-- Run in Supabase SQL Editor:
-- 
-- SELECT id, email FROM auth.users;
-- 
-- INSERT INTO public.admin_users (user_id) 
-- VALUES ('88ff6690-7b70-44fb-a341-dd814c2d8e6b')
-- ON CONFLICT DO NOTHING;

-- Step 2: Enable Leaked Password Protection
-- Dashboard → Authentication → Settings → Password Security
-- Toggle: "Enable Leaked Password Protection"
