-- Fix RLS policy for contact_messages to allow public inserts
-- This is necessary for the contact form to work for anonymous users

-- 1. Enable RLS on the table (if not already enabled)
ALTER TABLE "public"."contact_messages" ENABLE ROW LEVEL SECURITY;

-- 2. Create a policy to allow anonymous users to insert data
-- We check if the policy already exists to avoid errors, or just drop and recreate
DROP POLICY IF EXISTS "Allow public inserts" ON "public"."contact_messages";

CREATE POLICY "Allow public inserts"
ON "public"."contact_messages"
FOR INSERT
TO public
WITH CHECK (true);

-- 3. Grant INSERT permission to the anon and authenticated roles
GRANT INSERT ON "public"."contact_messages" TO anon;
GRANT INSERT ON "public"."contact_messages" TO authenticated;

-- 4. Optional: Allow users to view their own messages (if you implement auth later)
-- For now, maybe only admin can view?
-- Let's ensure admin can view all
DROP POLICY IF EXISTS "Allow admin select" ON "public"."contact_messages";
CREATE POLICY "Allow admin select"
ON "public"."contact_messages"
FOR SELECT
TO authenticated
USING (auth.role() = 'authenticated'); -- Or check for specific admin role/email if you have that setup
