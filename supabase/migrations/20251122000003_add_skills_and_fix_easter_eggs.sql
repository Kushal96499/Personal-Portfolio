-- =====================================================
-- 7. SKILLS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    items TEXT[] DEFAULT '{}',
    icon TEXT NOT NULL, -- Storing icon name (e.g., "Shield", "Code") or emoji
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_skills_order ON skills("order");

-- =====================================================
-- 8. EASTER EGGS CONFIGURATION TABLE (NEW)
-- =====================================================
-- Dropping the old key-value table if it exists to replace with the new structured one
-- Note: In a real production env with critical data, we would migrate data. 
-- Here we just want to enforce the new structure.
DROP TABLE IF EXISTS easter_eggs;

CREATE TABLE IF NOT EXISTS easter_eggs_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    logo_animation BOOLEAN DEFAULT true,
    game_trigger BOOLEAN DEFAULT true,
    hacker_mode BOOLEAN DEFAULT false,
    secret_keyword TEXT DEFAULT 'konami',
    animation_speed NUMERIC DEFAULT 1.0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default configuration
INSERT INTO easter_eggs_config (logo_animation, game_trigger, hacker_mode, secret_keyword, animation_speed)
VALUES (true, true, false, 'konami', 1.0);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE easter_eggs_config ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Skills: Public read, Admin write
CREATE POLICY "Public can view skills" ON skills
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage skills" ON skills
    FOR ALL USING (auth.role() = 'authenticated');

-- Easter Eggs Config: Public read, Admin write
CREATE POLICY "Public can view easter eggs config" ON easter_eggs_config
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage easter eggs config" ON easter_eggs_config
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- TRIGGERS
-- =====================================================
CREATE TRIGGER update_skills_updated_at
    BEFORE UPDATE ON skills
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_easter_eggs_config_updated_at
    BEFORE UPDATE ON easter_eggs_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
