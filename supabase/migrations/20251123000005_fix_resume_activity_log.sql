-- Fix Resume Activity Log Function and Check Constraint

-- 1. Update the check constraint for activity_logs to include 'resume'
ALTER TABLE activity_logs DROP CONSTRAINT IF EXISTS activity_logs_entity_type_check;
ALTER TABLE activity_logs ADD CONSTRAINT activity_logs_entity_type_check 
    CHECK (entity_type IN ('project', 'blog', 'testimonial', 'certificate', 'contact_message', 'skill', 'easter_egg', 'resume'));

-- 2. Update the log_resume_activity function to remove the incorrect text cast
CREATE OR REPLACE FUNCTION log_resume_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO activity_logs (action_type, entity_type, entity_id, entity_name, description)
        VALUES (
            'updated',
            'resume',
            NEW.id, -- Removed ::text cast, now passing UUID directly
            'Resume Data',
            'Resume data updated'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
