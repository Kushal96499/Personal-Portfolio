-- Fix permissions for activity_logs to allow triggers from anon users
-- The contact form (anon) triggers an insert into activity_logs, which fails if anon doesn't have permission

BEGIN;

-- 1. Grant INSERT on activity_logs to anon
-- This is required because the trigger runs with the permissions of the user who triggered it (SECURITY INVOKER)
GRANT INSERT ON "public"."activity_logs" TO anon;
GRANT INSERT ON "public"."activity_logs" TO authenticated;

-- 2. Ensure RLS on activity_logs allows anon inserts
-- We already have "System can insert activity logs" with CHECK (true), but let's be explicit
DROP POLICY IF EXISTS "Allow anon inserts for triggers" ON "public"."activity_logs";

CREATE POLICY "Allow anon inserts for triggers"
ON "public"."activity_logs"
FOR INSERT
TO public
WITH CHECK (true);

-- 3. Alternative: Make the trigger function SECURITY DEFINER
-- This would make it run as the table owner (postgres/admin) instead of the user
-- This is safer as we don't need to expose activity_logs to anon directly
ALTER FUNCTION log_activity() SECURITY DEFINER;

-- 4. Grant usage on the sequence if needed (though UUIDs are used)
-- Just in case
GRANT USAGE ON SCHEMA public TO anon;

COMMIT;
