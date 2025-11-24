ALTER TABLE site_controls ADD COLUMN IF NOT EXISTS threat_map_enabled BOOLEAN DEFAULT false;
