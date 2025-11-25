-- ULTIMATE FIX: Complete reset of contact_messages security
-- Run this entire script at once

BEGIN;

-- Step 1: Drop ALL triggers
DROP TRIGGER IF EXISTS contact_messages_activity_log ON "public"."contact_messages";

-- Step 2: Completely disable RLS
ALTER TABLE "public"."contact_messages" DISABLE ROW LEVEL SECURITY;

-- Step 3: Drop all existing policies (just in case)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'contact_messages') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.contact_messages';
    END LOOP;
END $$;

-- Step 4: Grant full permissions to anon
GRANT ALL ON TABLE "public"."contact_messages" TO anon;
GRANT ALL ON TABLE "public"."contact_messages" TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Step 5: Verify the changes
SELECT 
    'RLS Status' as check_type,
    tablename, 
    rowsecurity::text as status
FROM pg_tables 
WHERE tablename = 'contact_messages'

UNION ALL

SELECT 
    'Policies' as check_type,
    'contact_messages' as tablename,
    COUNT(*)::text as status
FROM pg_policies 
WHERE tablename = 'contact_messages'

UNION ALL

SELECT 
    'Triggers' as check_type,
    'contact_messages' as tablename,
    COUNT(*)::text as status
FROM information_schema.triggers
WHERE event_object_table = 'contact_messages';

COMMIT;
