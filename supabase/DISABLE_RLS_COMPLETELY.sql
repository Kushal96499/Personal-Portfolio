-- NUCLEAR OPTION: COMPLETELY DISABLE RLS
-- This will help us determine if RLS is the actual issue

-- Disable RLS entirely on contact_messages
ALTER TABLE "public"."contact_messages" DISABLE ROW LEVEL SECURITY;

-- Verify it's disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'contact_messages';
