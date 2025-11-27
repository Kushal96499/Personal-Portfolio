-- Add 'about' to site_controls if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_controls' AND column_name = 'about') THEN
        ALTER TABLE site_controls ADD COLUMN about BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Create about_me table
CREATE TABLE IF NOT EXISTS about_me (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL DEFAULT 'About Me',
    description TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create timeline_items table
CREATE TABLE IF NOT EXISTS timeline_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    period TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_type TEXT NOT NULL DEFAULT 'briefcase', -- 'briefcase' or 'graduation-cap'
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE about_me ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_items ENABLE ROW LEVEL SECURITY;

-- Create policies for about_me
CREATE POLICY "Allow public read access on about_me" ON about_me FOR SELECT USING (true);
CREATE POLICY "Allow authenticated update on about_me" ON about_me FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated insert on about_me" ON about_me FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policies for timeline_items
CREATE POLICY "Allow public read access on timeline_items" ON timeline_items FOR SELECT USING (true);
CREATE POLICY "Allow authenticated all access on timeline_items" ON timeline_items FOR ALL USING (auth.role() = 'authenticated');

-- Insert default About Me data if empty
INSERT INTO about_me (title, description)
SELECT 'About Me', 'Passionate cybersecurity student with hands-on experience in web development, Python automation, and security tools. Currently interning at leading tech companies while pursuing my degree.'
WHERE NOT EXISTS (SELECT 1 FROM about_me);

-- Insert default Timeline items if empty
INSERT INTO timeline_items (title, period, description, icon_type, "order")
SELECT 'Intern at CodTech', 'Completed', 'Working on cybersecurity projects', 'briefcase', 1
WHERE NOT EXISTS (SELECT 1 FROM timeline_items);

INSERT INTO timeline_items (title, period, description, icon_type, "order")
SELECT 'Intern at Inlighn Tech', 'Completed', 'Developing automated solutions and security tools', 'briefcase', 2
WHERE NOT EXISTS (SELECT 1 FROM timeline_items);

INSERT INTO timeline_items (title, period, description, icon_type, "order")
SELECT 'BCA Student', 'Biyani College of Science & Management', 'Pursuing Bachelor of Computer Applications', 'graduation-cap', 3
WHERE NOT EXISTS (SELECT 1 FROM timeline_items);
