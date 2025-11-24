-- =====================================================
-- Activity Logs Table and Triggers
-- =====================================================
-- This migration creates an activity_logs table to track all changes
-- across the portfolio database for the admin dashboard

-- =====================================================
-- 1. CREATE ACTIVITY_LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_type TEXT NOT NULL CHECK (action_type IN ('created', 'updated', 'deleted')),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('project', 'blog', 'testimonial', 'certificate', 'contact_message', 'skill', 'easter_egg')),
    entity_id UUID,
    entity_name TEXT,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_type ON activity_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action_type ON activity_logs(action_type);

-- =====================================================
-- 2. ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users (admins) to view all activity logs
CREATE POLICY "Authenticated users can view activity logs" ON activity_logs
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow system to insert activity logs (via triggers)
CREATE POLICY "System can insert activity logs" ON activity_logs
    FOR INSERT WITH CHECK (true);

-- =====================================================
-- 3. CREATE TRIGGER FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
DECLARE
    v_action_type TEXT;
    v_entity_name TEXT;
    v_description TEXT;
BEGIN
    -- Determine action type
    IF (TG_OP = 'INSERT') THEN
        v_action_type := 'created';
    ELSIF (TG_OP = 'UPDATE') THEN
        v_action_type := 'updated';
    ELSIF (TG_OP = 'DELETE') THEN
        v_action_type := 'deleted';
    END IF;

    -- Extract entity name based on table
    CASE TG_TABLE_NAME
        WHEN 'projects' THEN
            v_entity_name := COALESCE(NEW.name, OLD.name);
            v_description := 'Project "' || v_entity_name || '" was ' || v_action_type;
        WHEN 'blogs' THEN
            v_entity_name := COALESCE(NEW.title, OLD.title);
            v_description := 'Blog post "' || v_entity_name || '" was ' || v_action_type;
        WHEN 'testimonials' THEN
            v_entity_name := COALESCE(NEW.name, OLD.name);
            v_description := 'Testimonial from "' || v_entity_name || '" was ' || v_action_type;
        WHEN 'certificates' THEN
            v_entity_name := COALESCE(NEW.title, OLD.title);
            v_description := 'Certificate "' || v_entity_name || '" was ' || v_action_type;
        WHEN 'contact_messages' THEN
            v_entity_name := COALESCE(NEW.name, OLD.name);
            v_description := 'Contact message from "' || v_entity_name || '" was received';
        WHEN 'skills' THEN
            v_entity_name := COALESCE(NEW.title, OLD.title);
            v_description := 'Skill "' || v_entity_name || '" was ' || v_action_type;
        WHEN 'easter_eggs_config' THEN
            v_entity_name := 'Easter Eggs';
            v_description := 'Easter eggs configuration was updated';
        ELSE
            v_entity_name := 'Unknown';
            v_description := 'Unknown entity was ' || v_action_type;
    END CASE;

    -- Insert activity log
    INSERT INTO activity_logs (
        action_type,
        entity_type,
        entity_id,
        entity_name,
        description
    ) VALUES (
        v_action_type,
        REPLACE(TG_TABLE_NAME, 's', ''), -- Remove trailing 's' for entity_type
        COALESCE(NEW.id, OLD.id),
        v_entity_name,
        v_description
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. CREATE TRIGGERS ON ALL TABLES
-- =====================================================

-- Projects
DROP TRIGGER IF EXISTS projects_activity_log ON projects;
CREATE TRIGGER projects_activity_log
    AFTER INSERT OR UPDATE OR DELETE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION log_activity();

-- Blogs
DROP TRIGGER IF EXISTS blogs_activity_log ON blogs;
CREATE TRIGGER blogs_activity_log
    AFTER INSERT OR UPDATE OR DELETE ON blogs
    FOR EACH ROW
    EXECUTE FUNCTION log_activity();

-- Testimonials
DROP TRIGGER IF EXISTS testimonials_activity_log ON testimonials;
CREATE TRIGGER testimonials_activity_log
    AFTER INSERT OR UPDATE OR DELETE ON testimonials
    FOR EACH ROW
    EXECUTE FUNCTION log_activity();

-- Certificates
DROP TRIGGER IF EXISTS certificates_activity_log ON certificates;
CREATE TRIGGER certificates_activity_log
    AFTER INSERT OR UPDATE OR DELETE ON certificates
    FOR EACH ROW
    EXECUTE FUNCTION log_activity();

-- Contact Messages (only INSERT to avoid spam from read/resolved updates)
DROP TRIGGER IF EXISTS contact_messages_activity_log ON contact_messages;
CREATE TRIGGER contact_messages_activity_log
    AFTER INSERT ON contact_messages
    FOR EACH ROW
    EXECUTE FUNCTION log_activity();

-- Skills
DROP TRIGGER IF EXISTS skills_activity_log ON skills;
CREATE TRIGGER skills_activity_log
    AFTER INSERT OR UPDATE OR DELETE ON skills
    FOR EACH ROW
    EXECUTE FUNCTION log_activity();

-- Easter Eggs Config (only UPDATE)
DROP TRIGGER IF EXISTS easter_eggs_config_activity_log ON easter_eggs_config;
CREATE TRIGGER easter_eggs_config_activity_log
    AFTER UPDATE ON easter_eggs_config
    FOR EACH ROW
    EXECUTE FUNCTION log_activity();

-- =====================================================
-- COMPLETED!
-- =====================================================
-- Activity logging is now enabled for all main tables
-- Logs will appear in the activity_logs table automatically
