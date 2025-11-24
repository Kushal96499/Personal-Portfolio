-- Create admin_logs table
CREATE TABLE IF NOT EXISTS admin_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL, -- 'login', 'error', 'system'
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can view logs" ON admin_logs
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins and System can insert logs" ON admin_logs
    FOR INSERT WITH CHECK (true); -- Allow inserts from authenticated users (admins) and potentially anon if needed for login failures (though usually we only log success which is auth)

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON admin_logs(action);
