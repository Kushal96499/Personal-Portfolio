-- =====================================================
-- Personal Portfolio - Supabase Database Schema
-- =====================================================
-- Run this SQL in your Supabase SQL Editor to create all tables
-- Project URL: https://ubqnsxalrfalgoohvtfp.supabase.co

-- =====================================================
-- 1. BLOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS blogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    thumbnail_url TEXT,
    reading_time INTEGER, -- in minutes
    visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_blogs_created_at ON blogs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blogs_visible ON blogs(visible);

-- =====================================================
-- 2. PROJECTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    tech_stack TEXT[] DEFAULT '{}',
    github_link TEXT,
    demo_link TEXT,
    thumbnail_url TEXT,
    visible BOOLEAN DEFAULT true,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_projects_order ON projects("order");
CREATE INDEX IF NOT EXISTS idx_projects_visible ON projects(visible);

-- =====================================================
-- 3. TESTIMONIALS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    message TEXT NOT NULL,
    avatar_url TEXT,
    visible BOOLEAN DEFAULT true,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_testimonials_order ON testimonials("order");
CREATE INDEX IF NOT EXISTS idx_testimonials_visible ON testimonials(visible);

-- =====================================================
-- 4. CERTIFICATES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    credential_link TEXT,
    status TEXT DEFAULT 'Completed', -- 'Completed' or 'In Progress'
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_certificates_order ON certificates("order");

-- =====================================================
-- 5. CONTACT MESSAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for filtering
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_read ON contact_messages(read);
CREATE INDEX IF NOT EXISTS idx_contact_messages_resolved ON contact_messages(resolved);

-- =====================================================
-- 6. EASTER EGGS CONFIGURATION TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS easter_eggs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique index on key
CREATE UNIQUE INDEX IF NOT EXISTS idx_easter_eggs_key ON easter_eggs(key);

-- Insert default easter eggs configuration
INSERT INTO easter_eggs (key, value) VALUES
    ('logo_animation', 'true'),
    ('game_trigger', 'true'),
    ('hacker_mode', 'false'),
    ('secret_keyword', 'konami'),
    ('animation_speed', '1.0')
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================
-- Enable RLS on all tables
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE easter_eggs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES - PUBLIC READ ACCESS
-- =====================================================
-- Allow public read access to visible content
DROP POLICY IF EXISTS "Public can view visible blogs" ON blogs;
CREATE POLICY "Public can view visible blogs" ON blogs
    FOR SELECT USING (visible = true);

DROP POLICY IF EXISTS "Public can view visible projects" ON projects;
CREATE POLICY "Public can view visible projects" ON projects
    FOR SELECT USING (visible = true);

DROP POLICY IF EXISTS "Public can view visible testimonials" ON testimonials;
CREATE POLICY "Public can view visible testimonials" ON testimonials
    FOR SELECT USING (visible = true);

DROP POLICY IF EXISTS "Public can view all certificates" ON certificates;
CREATE POLICY "Public can view all certificates" ON certificates
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view easter eggs config" ON easter_eggs;
CREATE POLICY "Public can view easter eggs config" ON easter_eggs
    FOR SELECT USING (true);

-- =====================================================
-- RLS POLICIES - ADMIN FULL ACCESS
-- =====================================================
-- Admin can do everything (authenticated users)
DROP POLICY IF EXISTS "Authenticated users can manage blogs" ON blogs;
CREATE POLICY "Authenticated users can manage blogs" ON blogs
    FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can manage projects" ON projects;
CREATE POLICY "Authenticated users can manage projects" ON projects
    FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can manage testimonials" ON testimonials;
CREATE POLICY "Authenticated users can manage testimonials" ON testimonials
    FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can manage certificates" ON certificates;
CREATE POLICY "Authenticated users can manage certificates" ON certificates
    FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can manage contact messages" ON contact_messages;
CREATE POLICY "Authenticated users can manage contact messages" ON contact_messages
    FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can manage easter eggs" ON easter_eggs;
CREATE POLICY "Authenticated users can manage easter eggs" ON easter_eggs
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- RLS POLICIES - CONTACT FORM SUBMISSION
-- =====================================================
-- Allow anyone to insert contact messages
DROP POLICY IF EXISTS "Anyone can submit contact messages" ON contact_messages;
CREATE POLICY "Anyone can submit contact messages" ON contact_messages
    FOR INSERT WITH CHECK (true);

-- =====================================================
-- FUNCTIONS FOR AUTO-UPDATE TIMESTAMPS
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for auto-updating timestamps
DROP TRIGGER IF EXISTS update_blogs_updated_at ON blogs;
CREATE TRIGGER update_blogs_updated_at
    BEFORE UPDATE ON blogs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_easter_eggs_updated_at ON easter_eggs;
CREATE TRIGGER update_easter_eggs_updated_at
    BEFORE UPDATE ON easter_eggs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMPLETED!
-- =====================================================
-- Next steps:
-- 1. Create a storage bucket named 'portfolio-assets' in Supabase Storage
-- 2. Enable public access on the bucket
-- 3. Create folders: blogs/, projects/, testimonials/, certificates/
