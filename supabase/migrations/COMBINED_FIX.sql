-- Complete Easter Egg System Fix Migration
-- Run this entire script in Supabase SQL Editor

-- STEP 1: Add found column
ALTER TABLE easter_eggs 
ADD COLUMN IF NOT EXISTS found BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_easter_eggs_found 
ON easter_eggs(found) 
WHERE found = true;

COMMENT ON COLUMN easter_eggs.found IS 'Tracks whether this egg has been found/unlocked by users';

-- STEP 2: Convert existing visit_page eggs to navigate_section
UPDATE easter_eggs 
SET trigger_type = 'navigate_section' 
WHERE trigger_type = 'visit_page';

-- STEP 3: Update trigger_type constraint
ALTER TABLE easter_eggs DROP CONSTRAINT IF EXISTS easter_eggs_trigger_type_check;
ALTER TABLE easter_eggs ADD CONSTRAINT easter_eggs_trigger_type_check 
  CHECK (trigger_type IN (
    'navigate_section',
    'ui_interaction',
    'scroll_bottom',
    'hover_element',
    'click_nav_icon',
    'keyword'
  ));

-- STEP 4: Update action_type constraint
ALTER TABLE easter_eggs DROP CONSTRAINT IF EXISTS easter_eggs_action_type_check;
ALTER TABLE easter_eggs ADD CONSTRAINT easter_eggs_action_type_check 
  CHECK (action_type IN (
    'neon_particles',
    'neon_aura',
    'rgb_glow',
    'matrix_rain',
    'hacker_message',
    'glitch_effect',
    'sound_ping',
    'trophy_unlock'
  ));

-- STEP 5: Update comments
COMMENT ON TABLE easter_eggs IS 'Easter eggs with preset-driven triggers and advanced visual effects';
COMMENT ON COLUMN easter_eggs.trigger_type IS 'Preset trigger type: navigate_section, ui_interaction, scroll_bottom, hover_element, click_nav_icon, keyword';
COMMENT ON COLUMN easter_eggs.action_type IS 'Visual effect type: neon_particles, neon_aura, rgb_glow, matrix_rain, hacker_message, glitch_effect, sound_ping, trophy_unlock';
COMMENT ON COLUMN easter_eggs.trigger_value IS 'Preset value based on trigger type (e.g., /#blog for navigate_section, resume-download for ui_interaction)';

-- Done! Your Easter Egg system is now updated.
