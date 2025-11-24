-- =====================================================
-- COMPLETE FIX: Activity Logs Entity Type Issue
-- =====================================================
-- This fixes the entity_type check constraint violation
-- Run this directly in Supabase SQL Editor

-- =====================================================
-- 1. DROP EXISTING TRIGGERS (to avoid conflicts)
-- =====================================================
DROP TRIGGER IF EXISTS projects_activity_log ON projects;
DROP TRIGGER IF EXISTS blogs_activity_log ON blogs;
DROP TRIGGER IF EXISTS testimonials_activity_log ON testimonials;
DROP TRIGGER IF EXISTS certificates_activity_log ON certificates;
DROP TRIGGER IF EXISTS contact_messages_activity_log ON contact_messages;
DROP TRIGGER IF EXISTS skills_activity_log ON skills;
DROP TRIGGER IF EXISTS easter_eggs_config_activity_log ON easter_eggs_config;

-- =====================================================
-- 2. RECREATE ACTIVITY LOG FUNCTION (FIXED)
-- =====================================================
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
DECLARE
    v_action_type TEXT;
    v_entity_type TEXT;
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

    -- Map table name to entity type (FIXED LOGIC)
    CASE TG_TABLE_NAME
        WHEN 'projects' THEN
            v_entity_type := 'project';
            v_entity_name := COALESCE(NEW.name, OLD.name);
            v_description := 'Project "' || v_entity_name || '" was ' || v_action_type;
        WHEN 'blogs' THEN
            v_entity_type := 'blog';
            v_entity_name := COALESCE(NEW.title, OLD.title);
            v_description := 'Blog post "' || v_entity_name || '" was ' || v_action_type;
        WHEN 'testimonials' THEN
            v_entity_type := 'testimonial';
            v_entity_name := COALESCE(NEW.name, OLD.name);
            v_description := 'Testimonial from "' || v_entity_name || '" was ' || v_action_type;
        WHEN 'certificates' THEN
            v_entity_type := 'certificate';
            v_entity_name := COALESCE(NEW.title, OLD.title);
            v_description := 'Certificate "' || v_entity_name || '" was ' || v_action_type;
        WHEN 'contact_messages' THEN
            v_entity_type := 'contact_message';
            v_entity_name := COALESCE(NEW.name, OLD.name);
            v_description := 'Contact message from "' || v_entity_name || '" was received';
        WHEN 'skills' THEN
            v_entity_type := 'skill';
            v_entity_name := COALESCE(NEW.title, OLD.title);
            v_description := 'Skill "' || v_entity_name || '" was ' || v_action_type;
        WHEN 'easter_eggs_config' THEN
            v_entity_type := 'easter_egg';
            v_entity_name := 'Easter Eggs';
            v_description := 'Easter eggs configuration was updated';
        ELSE
            v_entity_type := 'project'; -- Default fallback
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
        v_entity_type,
        COALESCE(NEW.id, OLD.id),
        v_entity_name,
        v_description
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 3. RECREATE ALL ACTIVITY LOG TRIGGERS
-- =====================================================

-- Projects
CREATE TRIGGER projects_activity_log
    AFTER INSERT OR UPDATE OR DELETE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION log_activity();

-- Blogs
CREATE TRIGGER blogs_activity_log
    AFTER INSERT OR UPDATE OR DELETE ON blogs
    FOR EACH ROW
    EXECUTE FUNCTION log_activity();

-- Testimonials
CREATE TRIGGER testimonials_activity_log
    AFTER INSERT OR UPDATE OR DELETE ON testimonials
    FOR EACH ROW
    EXECUTE FUNCTION log_activity();

-- Certificates
CREATE TRIGGER certificates_activity_log
    AFTER INSERT OR UPDATE OR DELETE ON certificates
    FOR EACH ROW
    EXECUTE FUNCTION log_activity();

-- Contact Messages (only INSERT)
CREATE TRIGGER contact_messages_activity_log
    AFTER INSERT ON contact_messages
    FOR EACH ROW
    EXECUTE FUNCTION log_activity();

-- Skills
CREATE TRIGGER skills_activity_log
    AFTER INSERT OR UPDATE OR DELETE ON skills
    FOR EACH ROW
    EXECUTE FUNCTION log_activity();

-- Easter Eggs Config (only UPDATE)
CREATE TRIGGER easter_eggs_config_activity_log
    AFTER UPDATE ON easter_eggs_config
    FOR EACH ROW
    EXECUTE FUNCTION log_activity();

-- =====================================================
-- DONE! ✅
-- =====================================================
-- The activity log function has been fixed!
-- Skills should now save without errors.
