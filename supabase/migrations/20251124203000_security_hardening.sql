-- =====================================================
-- SECURITY HARDENING: Enable RLS and Policies
-- =====================================================

-- 1. Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE branding_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE easter_eggs ENABLE ROW LEVEL SECURITY;
ALTER TABLE easter_eggs_config ENABLE ROW LEVEL SECURITY;

-- 2. Create Policies

-- PROJECTS (Public Read, Admin Write)
DROP POLICY IF EXISTS "Public Read Projects" ON projects;
CREATE POLICY "Public Read Projects" ON projects FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin Write Projects" ON projects;
CREATE POLICY "Admin Write Projects" ON projects FOR ALL USING (auth.role() = 'authenticated');

-- BLOGS (Public Read, Admin Write)
DROP POLICY IF EXISTS "Public Read Blogs" ON blogs;
CREATE POLICY "Public Read Blogs" ON blogs FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin Write Blogs" ON blogs;
CREATE POLICY "Admin Write Blogs" ON blogs FOR ALL USING (auth.role() = 'authenticated');

-- TESTIMONIALS (Public Read, Admin Write)
DROP POLICY IF EXISTS "Public Read Testimonials" ON testimonials;
CREATE POLICY "Public Read Testimonials" ON testimonials FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin Write Testimonials" ON testimonials;
CREATE POLICY "Admin Write Testimonials" ON testimonials FOR ALL USING (auth.role() = 'authenticated');

-- CERTIFICATES (Public Read, Admin Write)
DROP POLICY IF EXISTS "Public Read Certificates" ON certificates;
CREATE POLICY "Public Read Certificates" ON certificates FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin Write Certificates" ON certificates;
CREATE POLICY "Admin Write Certificates" ON certificates FOR ALL USING (auth.role() = 'authenticated');

-- SKILLS (Public Read, Admin Write)
DROP POLICY IF EXISTS "Public Read Skills" ON skills;
CREATE POLICY "Public Read Skills" ON skills FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin Write Skills" ON skills;
CREATE POLICY "Admin Write Skills" ON skills FOR ALL USING (auth.role() = 'authenticated');

-- CONTACT MESSAGES (Public Insert, Admin Read/Delete)
DROP POLICY IF EXISTS "Public Insert Contact Messages" ON contact_messages;
CREATE POLICY "Public Insert Contact Messages" ON contact_messages FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admin Manage Contact Messages" ON contact_messages;
CREATE POLICY "Admin Manage Contact Messages" ON contact_messages FOR ALL USING (auth.role() = 'authenticated');

-- ACTIVITY LOGS (Admin Read Only)
DROP POLICY IF EXISTS "Admin Read Activity Logs" ON activity_logs;
CREATE POLICY "Admin Read Activity Logs" ON activity_logs FOR SELECT USING (auth.role() = 'authenticated');

-- SITE CONTROLS (Public Read, Admin Write)
DROP POLICY IF EXISTS "Public Read Site Controls" ON site_controls;
CREATE POLICY "Public Read Site Controls" ON site_controls FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin Write Site Controls" ON site_controls;
CREATE POLICY "Admin Write Site Controls" ON site_controls FOR ALL USING (auth.role() = 'authenticated');

-- BRANDING SETTINGS (Public Read, Admin Write)
DROP POLICY IF EXISTS "Public Read Branding Settings" ON branding_settings;
CREATE POLICY "Public Read Branding Settings" ON branding_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin Write Branding Settings" ON branding_settings;
CREATE POLICY "Admin Write Branding Settings" ON branding_settings FOR ALL USING (auth.role() = 'authenticated');

-- RESUME DATA (Public Read, Admin Write)
DROP POLICY IF EXISTS "Public Read Resume Data" ON resume_data;
CREATE POLICY "Public Read Resume Data" ON resume_data FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin Write Resume Data" ON resume_data;
CREATE POLICY "Admin Write Resume Data" ON resume_data FOR ALL USING (auth.role() = 'authenticated');

-- EASTER EGGS (Public Read, Admin Write)
DROP POLICY IF EXISTS "Public Read Easter Eggs" ON easter_eggs;
CREATE POLICY "Public Read Easter Eggs" ON easter_eggs FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin Write Easter Eggs" ON easter_eggs;
CREATE POLICY "Admin Write Easter Eggs" ON easter_eggs FOR ALL USING (auth.role() = 'authenticated');

-- EASTER EGGS CONFIG (Public Read, Admin Write)
DROP POLICY IF EXISTS "Public Read Easter Eggs Config" ON easter_eggs_config;
CREATE POLICY "Public Read Easter Eggs Config" ON easter_eggs_config FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin Write Easter Eggs Config" ON easter_eggs_config;
CREATE POLICY "Admin Write Easter Eggs Config" ON easter_eggs_config FOR ALL USING (auth.role() = 'authenticated');
