-- Drop the unused 'key' column from easter_eggs table
-- This column is likely a legacy artifact and is causing insert errors due to NOT NULL constraint

ALTER TABLE public.easter_eggs 
DROP COLUMN IF EXISTS key;

-- Force schema cache reload
NOTIFY pgrst, 'reload config';
