-- Upgrade easter_eggs table for Smart Triggers and Actions

-- 1. Add action_type column
ALTER TABLE public.easter_eggs 
ADD COLUMN IF NOT EXISTS action_type TEXT DEFAULT 'confetti';

-- 2. Drop the old check constraint for trigger_type
ALTER TABLE public.easter_eggs 
DROP CONSTRAINT IF EXISTS easter_eggs_trigger_type_check;

-- 3. Add new check constraint for trigger_type with expanded options
ALTER TABLE public.easter_eggs 
ADD CONSTRAINT easter_eggs_trigger_type_check 
CHECK (trigger_type IN (
    'keyword', 
    'click_logo', 
    'click_profile', 
    'click_copyright', 
    'click_nav',
    'hover_logo', 
    'hover_profile', 
    'scroll_bottom', 
    'page_visit',
    'dblclick'
));

-- 4. Add check constraint for action_type
ALTER TABLE public.easter_eggs 
ADD CONSTRAINT easter_eggs_action_type_check 
CHECK (action_type IN (
    'confetti', 
    'sound', 
    'neon_flash', 
    'hacker_mode', 
    'redirect', 
    'particles',
    'modal'
));

-- 5. Make trigger_value optional (nullable) effectively, though it's text so we just ensure it can be null if we want, 
-- or we just ignore it in the app logic. 
-- Let's just leave it as is (TEXT DEFAULT '') but acknowledge it's not always needed.

-- Force schema cache reload
NOTIFY pgrst, 'reload config';
