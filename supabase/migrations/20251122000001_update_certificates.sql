-- Add credential_link and status columns to certificates table if they don't exist

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'credential_link') THEN
        ALTER TABLE certificates ADD COLUMN credential_link TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'status') THEN
        ALTER TABLE certificates ADD COLUMN status TEXT DEFAULT 'Completed';
    END IF;
END $$;
