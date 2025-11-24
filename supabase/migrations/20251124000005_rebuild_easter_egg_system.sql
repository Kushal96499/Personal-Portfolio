-- Complete Easter Egg System Rebuild Migration
-- This migration updates the schema to support the new preset-driven architecture

-- IMPORTANT: This will delete all existing easter eggs since they use old trigger/action types
-- Make sure to backup any important eggs before running this migration

-- 1. Delete all existing easter eggs (they use old schema)
DELETE FROM easter_eggs;

-- 2. Convert existing visit_page eggs to navigate_section
UPDATE easter_eggs 
SET trigger_type = 'navigate_section' 
WHERE trigger_type = 'visit_page';

-- 3. Update trigger_type constraint with new preset-based types
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

-- 4. Update action_type constraint with new advanced effects
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

-- 5. Simplify easter_settings table - remove old fields
ALTER TABLE easter_settings DROP COLUMN IF EXISTS secret_keyword;
ALTER TABLE easter_settings DROP COLUMN IF EXISTS logo_animation_enabled;
ALTER TABLE easter_settings DROP COLUMN IF EXISTS game_trigger_enabled;
ALTER TABLE easter_settings DROP COLUMN IF EXISTS hacker_mode_enabled;

-- Ensure eggs_page_enabled exists (should already exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'easter_settings' AND column_name = 'eggs_page_enabled'
  ) THEN
    ALTER TABLE easter_settings ADD COLUMN eggs_page_enabled BOOLEAN DEFAULT true;
  END IF;
END $$;

-- 6. Add comments for documentation
COMMENT ON TABLE easter_eggs IS 'Easter eggs with preset-driven triggers and advanced visual effects';
COMMENT ON COLUMN easter_eggs.trigger_type IS 'Preset trigger type: navigate_section, ui_interaction, scroll_bottom, hover_element, click_nav_icon, keyword';
COMMENT ON COLUMN easter_eggs.action_type IS 'Visual effect type: neon_particles, neon_aura, rgb_glow, matrix_rain, hacker_message, glitch_effect, sound_ping, trophy_unlock';
COMMENT ON COLUMN easter_eggs.trigger_value IS 'Preset value based on trigger type (e.g., /#blog for navigate_section, resume-download for ui_interaction)';
