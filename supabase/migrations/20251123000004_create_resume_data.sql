-- Resume Management Module
-- This migration creates the resume_data table for managing education, experience, stats, and PDF uploads

-- Create resume_data table
CREATE TABLE IF NOT EXISTS resume_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    education JSONB DEFAULT '[]'::jsonb NOT NULL,
    experience JSONB DEFAULT '[]'::jsonb NOT NULL,
    stats JSONB DEFAULT '{"educationCount": 0, "experienceCount": 0, "projectsCompleted": 0, "yearsOfExperience": 0}'::jsonb NOT NULL,
    resume_pdf_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE resume_data ENABLE ROW LEVEL SECURITY;

-- Public can read resume data
CREATE POLICY "Public can view resume data"
    ON resume_data FOR SELECT
    USING (true);

-- Only authenticated users can insert
CREATE POLICY "Authenticated users can insert resume data"
    ON resume_data FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Only authenticated users can update
CREATE POLICY "Authenticated users can update resume data"
    ON resume_data FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Only authenticated users can delete
CREATE POLICY "Authenticated users can delete resume data"
    ON resume_data FOR DELETE
    TO authenticated
    USING (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_resume_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER resume_data_updated_at
    BEFORE UPDATE ON resume_data
    FOR EACH ROW
    EXECUTE FUNCTION update_resume_data_updated_at();

-- Insert initial row with default values
INSERT INTO resume_data (education, experience, stats, resume_pdf_path)
VALUES (
    '[]'::jsonb,
    '[]'::jsonb,
    '{"educationCount": 0, "experienceCount": 0, "projectsCompleted": 0, "yearsOfExperience": 0}'::jsonb,
    NULL
)
ON CONFLICT DO NOTHING;

-- Add activity logging for resume updates
CREATE OR REPLACE FUNCTION log_resume_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO activity_logs (action_type, entity_type, entity_id, entity_name, description)
        VALUES (
            'updated',
            'resume',
            NEW.id,
            'Resume Data',
            'Resume data updated'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER resume_activity_log
    AFTER UPDATE ON resume_data
    FOR EACH ROW
    EXECUTE FUNCTION log_resume_activity();
