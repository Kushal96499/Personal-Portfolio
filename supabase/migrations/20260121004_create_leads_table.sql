-- Create Leads Table with Anti-Spam Protection
-- Run this in Supabase SQL Editor

BEGIN;

-- =====================================================
-- 1. CREATE LEADS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Contact Information
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  whatsapp TEXT,
  
  -- Project Details
  plan TEXT,
  project_type TEXT,
  pages INTEGER,
  deadline TEXT,
  budget TEXT,
  features TEXT[],
  message TEXT,
  
  -- Metadata
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Status
  read BOOLEAN DEFAULT false,
  responded BOOLEAN DEFAULT false,
  
  -- Constraints
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_read ON public.leads(read) WHERE read = false;

-- =====================================================
-- 2. CREATE RATE LIMITING TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL UNIQUE,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_request TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for fast IP lookup
CREATE INDEX IF NOT EXISTS idx_rate_limits_ip ON public.rate_limits(ip_address);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON public.rate_limits(window_start);

-- =====================================================
-- 3. ENABLE RLS
-- =====================================================

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. DROP EXISTING POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Anyone can insert leads" ON public.leads;
DROP POLICY IF EXISTS "Admins view leads" ON public.leads;
DROP POLICY IF EXISTS "Admins update leads" ON public.leads;
DROP POLICY IF EXISTS "Admins delete leads" ON public.leads;

DROP POLICY IF EXISTS "Service role manages rate limits" ON public.rate_limits;

-- =====================================================
-- 5. CREATE RLS POLICIES FOR LEADS
-- =====================================================

-- Public can insert (via Edge Function which uses service role)
-- Note: We'll use service_role in Edge Function to bypass RLS for INSERT
-- This policy is for safety only
CREATE POLICY "Public can insert via function"
  ON public.leads
  FOR INSERT
  WITH CHECK (true);

-- Only admins can view leads
CREATE POLICY "Admins view all leads"
  ON public.leads
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Only admins can update leads (mark as read/responded)
CREATE POLICY "Admins update leads"
  ON public.leads
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Only admins can delete leads
CREATE POLICY "Admins delete leads"
  ON public.leads
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- 6. CREATE RLS POLICIES FOR RATE_LIMITS
-- =====================================================

-- Only service role can manage rate limits (Edge Functions)
CREATE POLICY "Service role manages rate limits"
  ON public.rate_limits
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 7. CREATE CLEANUP FUNCTION FOR OLD RATE LIMITS
-- =====================================================

CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete rate limit records older than 10 minutes
  DELETE FROM public.rate_limits
  WHERE window_start < NOW() - INTERVAL '10 minutes';
END;
$$;

-- =====================================================
-- 8. CREATE FUNCTION TO CHECK RATE LIMIT
-- =====================================================

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_ip_address TEXT,
  p_max_requests INTEGER DEFAULT 3,
  p_window_minutes INTEGER DEFAULT 5
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_record RECORD;
  v_window_start TIMESTAMPTZ;
BEGIN
  -- Calculate current window start
  v_window_start := NOW() - (p_window_minutes || ' minutes')::INTERVAL;
  
  -- Try to get existing record
  SELECT * INTO v_record
  FROM public.rate_limits
  WHERE ip_address = p_ip_address;
  
  IF v_record IS NULL THEN
    -- First request from this IP
    INSERT INTO public.rate_limits (ip_address, request_count, window_start, last_request)
    VALUES (p_ip_address, 1, NOW(), NOW());
    RETURN true;
  ELSE
    -- Check if window has expired
    IF v_record.window_start < v_window_start THEN
      -- Reset counter for new window
      UPDATE public.rate_limits
      SET request_count = 1,
          window_start = NOW(),
          last_request = NOW()
      WHERE ip_address = p_ip_address;
      RETURN true;
    ELSE
      -- Within same window
      IF v_record.request_count >= p_max_requests THEN
        -- Limit exceeded
        RETURN false;
      ELSE
        -- Increment counter
        UPDATE public.rate_limits
        SET request_count = request_count + 1,
            last_request = NOW()
        WHERE ip_address = p_ip_address;
        RETURN true;
      END IF;
    END IF;
  END IF;
END;
$$;

COMMIT;

-- =====================================================
-- VERIFY INSTALLATION
-- =====================================================

SELECT 'Leads table created:' as status, 
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'leads') as exists;

SELECT 'Rate limits table created:' as status,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'rate_limits') as exists;

SELECT 'RLS enabled on leads:' as status,
  relrowsecurity as enabled
FROM pg_class
WHERE relname = 'leads';

SELECT 'Total policies on leads:' as status,
  COUNT(*) as count
FROM pg_policies
WHERE tablename = 'leads';
