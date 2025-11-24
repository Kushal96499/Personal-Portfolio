-- Add found column to easter_eggs table
-- This tracks which eggs have been unlocked by users

-- Add found column if it doesn't exist
ALTER TABLE easter_eggs 
ADD COLUMN IF NOT EXISTS found BOOLEAN DEFAULT false;

-- Add index for faster queries on found eggs
CREATE INDEX IF NOT EXISTS idx_easter_eggs_found 
ON easter_eggs(found) 
WHERE found = true;

-- Add comment for documentation
COMMENT ON COLUMN easter_eggs.found IS 'Tracks whether this egg has been found/unlocked by users';
