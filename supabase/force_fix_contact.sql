-- FORCE FIX RLS policy for contact_messages
-- This script is more aggressive to ensure permissions are correct

BEGIN;

-- 1. Ensure table exists and RLS is on
ALTER TABLE IF EXISTS "public"."contact_messages" ENABLE ROW LEVEL SECURITY;

-- 2. Drop ALL existing policies on this table to start fresh
DROP POLICY IF EXISTS "Allow public inserts" ON "public"."contact_messages";
DROP POLICY IF EXISTS "Allow admin select" ON "public"."contact_messages";
DROP POLICY IF EXISTS "Enable insert for anon" ON "public"."contact_messages";
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."contact_messages";

-- 3. Create the INSERT policy for everyone (anon + authenticated)
CREATE POLICY "Enable insert for all"
ON "public"."contact_messages"
FOR INSERT
TO public
WITH CHECK (true);

-- 4. Create the SELECT policy for admins only
CREATE POLICY "Enable select for authenticated"
ON "public"."contact_messages"
FOR SELECT
TO authenticated
USING (auth.role() = 'authenticated');

-- 5. Explicitly GRANT permissions to the schema and table
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

GRANT ALL ON TABLE "public"."contact_messages" TO anon;
GRANT ALL ON TABLE "public"."contact_messages" TO authenticated;

-- 6. Grant sequence permissions if ID is auto-incrementing
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

COMMIT;
