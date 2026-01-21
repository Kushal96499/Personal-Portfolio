-- Email OTP Verification System - Database Schema
-- Run this in Supabase SQL Editor

BEGIN;

-- =====================================================
-- 1. CREATE EMAIL_OTPS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.email_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  attempts INTEGER DEFAULT 0,
  
  -- Constraints
  CONSTRAINT valid_otp_length CHECK (LENGTH(otp_code) = 6),
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_otps_email ON public.email_otps(email);
CREATE INDEX IF NOT EXISTS idx_otps_email_expires ON public.email_otps(email, expires_at) WHERE NOT verified;
CREATE INDEX IF NOT EXISTS idx_otps_created_at ON public.email_otps(created_at);
CREATE INDEX IF NOT EXISTS idx_otps_verified ON public.email_otps(verified) WHERE verified = false;

-- =====================================================
-- 2. ENABLE RLS
-- =====================================================

ALTER TABLE public.email_otps ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Service role manages OTPs" ON public.email_otps;

-- Only service role can manage OTPs (Edge Functions)
CREATE POLICY "Service role manages OTPs"
  ON public.email_otps
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 3. CREATE CLEANUP FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete OTPs older than 30 minutes
  DELETE FROM public.email_otps
  WHERE created_at < NOW() - INTERVAL '30 minutes';
END;
$$;

-- =====================================================
-- 4. CREATE OTP RATE LIMIT CHECK FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.check_otp_rate_limit(
  p_email TEXT,
  p_max_requests INTEGER DEFAULT 3,
  p_window_minutes INTEGER DEFAULT 10
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
  v_window_start TIMESTAMPTZ;
BEGIN
  -- Calculate window start time
  v_window_start := NOW() - (p_window_minutes || ' minutes')::INTERVAL;
  
  -- Count OTP requests in the time window
  SELECT COUNT(*) INTO v_count
  FROM public.email_otps
  WHERE email = p_email
    AND created_at >= v_window_start;
  
  -- Return true if under limit, false if exceeded
  RETURN v_count < p_max_requests;
END;
$$;

-- =====================================================
-- 5. CREATE OTP GENERATION FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.generate_otp()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  -- Generate random 6-digit OTP
  RETURN LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
END;
$$;

-- =====================================================
-- 6. CREATE OTP VALIDATION FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.validate_otp(
  p_email TEXT,
  p_otp_code TEXT
)
RETURNS TABLE (
  valid BOOLEAN,
  message TEXT,
  otp_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_otp RECORD;
BEGIN
  -- Find the most recent unverified OTP for this email
  SELECT * INTO v_otp
  FROM public.email_otps
  WHERE email = p_email
    AND verified = false
    AND expires_at > NOW()
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- No OTP found or expired
  IF v_otp IS NULL THEN
    RETURN QUERY SELECT false, 'No valid OTP found or OTP expired'::TEXT, NULL::UUID;
    RETURN;
  END IF;
  
  -- Check attempt limit
  IF v_otp.attempts >= 5 THEN
    RETURN QUERY SELECT false, 'Too many attempts. Please request a new OTP'::TEXT, NULL::UUID;
    RETURN;
  END IF;
  
  -- Increment attempts
  UPDATE public.email_otps
  SET attempts = attempts + 1
  WHERE id = v_otp.id;
  
  -- Validate OTP code
  IF v_otp.otp_code = p_otp_code THEN
    -- Mark as verified
    UPDATE public.email_otps
    SET verified = true,
        verified_at = NOW()
    WHERE id = v_otp.id;
    
    RETURN QUERY SELECT true, 'OTP verified successfully'::TEXT, v_otp.id;
  ELSE
    RETURN QUERY SELECT false, 'Invalid OTP code'::TEXT, NULL::UUID;
  END IF;
END;
$$;

-- =====================================================
-- 7. UPDATE LEADS TABLE (ADD EMAIL_VERIFIED COLUMN)
-- =====================================================

-- Add email_verified column to leads table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'email_verified'
  ) THEN
    ALTER TABLE public.leads 
    ADD COLUMN email_verified BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add otp_id reference
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'otp_id'
  ) THEN
    ALTER TABLE public.leads 
    ADD COLUMN otp_id UUID REFERENCES public.email_otps(id);
  END IF;
END $$;

COMMIT;

-- =====================================================
-- VERIFY INSTALLATION
-- =====================================================

SELECT 'Email OTPs table created:' as status, 
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'email_otps') as exists;

SELECT 'Total functions created:' as status,
  COUNT(*) as count
FROM information_schema.routines
WHERE routine_name IN ('cleanup_expired_otps', 'check_otp_rate_limit', 'generate_otp', 'validate_otp');

SELECT 'Leads table updated with email_verified:' as status,
  EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'email_verified') as exists;
