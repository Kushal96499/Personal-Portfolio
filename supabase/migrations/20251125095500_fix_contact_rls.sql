-- Fix RLS for contact_messages table

-- 1. Enable RLS (idempotent)
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to ensure clean slate and avoid conflicts
DROP POLICY IF EXISTS "Anyone can submit contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Authenticated users can manage contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Public Insert Contact Messages" ON contact_messages;
DROP POLICY IF EXISTS "Admin Manage Contact Messages" ON contact_messages;
DROP POLICY IF EXISTS "allow_public_inserts" ON contact_messages;
DROP POLICY IF EXISTS "allow_admin_select" ON contact_messages;

-- 3. Create INSERT policy for PUBLIC (anonymous) users
-- Allows anyone to insert rows
CREATE POLICY "allow_public_inserts"
ON contact_messages
FOR INSERT
WITH CHECK (true);

-- 4. Create SELECT policy for ADMIN (authenticated) users only
-- Only authenticated users can read messages
CREATE POLICY "allow_admin_select"
ON contact_messages
FOR SELECT
USING (auth.role() = 'authenticated');

-- 5. Create DELETE/UPDATE policy for ADMIN (authenticated) users only
-- Assuming admins might want to delete or update (mark as read) messages too
CREATE POLICY "allow_admin_all"
ON contact_messages
FOR ALL
USING (auth.role() = 'authenticated');
