-- Check current state of contact_messages table

-- 1. Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'contact_messages';

-- 2. Check all policies
SELECT policyname, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'contact_messages';

-- 3. Check permissions
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'contact_messages';

-- 4. Check triggers
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'contact_messages';
