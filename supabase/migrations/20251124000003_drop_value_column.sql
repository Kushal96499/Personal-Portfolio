-- Drop the unused 'value' column from easter_eggs table
-- This column is likely a legacy artifact and is causing insert errors due to NOT NULL constraint

ALTER TABLE public.easter_eggs 
DROP COLUMN IF EXISTS value;

-- Force schema cache reload
NOTIFY pgrst, 'reload config';
