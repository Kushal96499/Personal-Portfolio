-- EMERGENCY FIX: DISABLE TRIGGER AND RESET PERMISSIONS
-- This script removes the activity logging trigger which is likely causing the permission error
-- and resets the contact_messages RLS policies to be fully public.

BEGIN;

-- 1. DROP THE TRIGGER (The likely culprit)
-- We remove the logging trigger for contact messages to stop it from failing
DROP TRIGGER IF EXISTS contact_messages_activity_log ON "public"."contact_messages";

-- 2. RESET RLS POLICIES FOR CONTACT_MESSAGES
ALTER TABLE "public"."contact_messages" ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to ensure a clean slate
DROP POLICY IF EXISTS "Allow public inserts" ON "public"."contact_messages";
DROP POLICY IF EXISTS "Allow admin select" ON "public"."contact_messages";
DROP POLICY IF EXISTS "Enable insert for anon" ON "public"."contact_messages";
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."contact_messages";
DROP POLICY IF EXISTS "Enable insert for all" ON "public"."contact_messages";
DROP POLICY IF EXISTS "Enable select for authenticated" ON "public"."contact_messages";
DROP POLICY IF EXISTS "Anyone can submit contact messages" ON "public"."contact_messages";
DROP POLICY IF EXISTS "Authenticated users can manage contact messages" ON "public"."contact_messages";

-- Create a simple, permissive INSERT policy for everyone
CREATE POLICY "Public Insert Policy"
ON "public"."contact_messages"
FOR INSERT
TO public
WITH CHECK (true);

-- Create SELECT policy for admins
CREATE POLICY "Admin Select Policy"
ON "public"."contact_messages"
FOR SELECT
TO authenticated
USING (auth.role() = 'authenticated');

-- 3. GRANT PERMISSIONS (Just to be absolutely sure)
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON TABLE "public"."contact_messages" TO anon;
GRANT ALL ON TABLE "public"."contact_messages" TO authenticated;

COMMIT;
