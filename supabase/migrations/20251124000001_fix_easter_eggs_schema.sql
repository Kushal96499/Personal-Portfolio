-- Fix missing columns in easter_eggs table
-- This handles cases where the table was created without these columns (e.g. stale schema)

ALTER TABLE public.easter_eggs 
ADD COLUMN IF NOT EXISTS name TEXT DEFAULT 'New Easter Egg',
ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS hint TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'Medium' CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
ADD COLUMN IF NOT EXISTS trigger_type TEXT DEFAULT 'keyword' CHECK (trigger_type IN ('keyword', 'click', 'hover', 'ui')),
ADD COLUMN IF NOT EXISTS trigger_value TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_secret BOOLEAN DEFAULT false;

-- Force schema cache reload (PostgREST should detect DDL changes, but this is a safe measure)
NOTIFY pgrst, 'reload config';
