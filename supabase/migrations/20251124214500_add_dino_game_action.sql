-- Migration to add 'dino_game' to the allowed action types for Easter Eggs

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
    'trophy_unlock',
    'dino_game'
  ));

COMMENT ON COLUMN easter_eggs.action_type IS 'Visual effect type: neon_particles, neon_aura, rgb_glow, matrix_rain, hacker_message, glitch_effect, sound_ping, trophy_unlock, dino_game';
