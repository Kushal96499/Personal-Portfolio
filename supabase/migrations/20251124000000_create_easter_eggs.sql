-- Create easter_eggs table
CREATE TABLE IF NOT EXISTS public.easter_eggs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    hint TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    trigger_type TEXT NOT NULL CHECK (trigger_type IN ('keyword', 'click', 'hover', 'ui')),
    trigger_value TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_secret BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create easter_settings table
CREATE TABLE IF NOT EXISTS public.easter_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    secret_keyword TEXT NOT NULL DEFAULT 'konami',
    eggs_page_enabled BOOLEAN DEFAULT true,
    hacker_mode_enabled BOOLEAN DEFAULT false,
    logo_animation_enabled BOOLEAN DEFAULT true,
    game_trigger_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.easter_eggs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.easter_settings ENABLE ROW LEVEL SECURITY;

-- Policies for easter_eggs
CREATE POLICY "Allow public read access for easter_eggs" ON public.easter_eggs
    FOR SELECT USING (true);

CREATE POLICY "Allow admin insert for easter_eggs" ON public.easter_eggs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow admin update for easter_eggs" ON public.easter_eggs
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin delete for easter_eggs" ON public.easter_eggs
    FOR DELETE USING (auth.role() = 'authenticated');

-- Policies for easter_settings
CREATE POLICY "Allow public read access for easter_settings" ON public.easter_settings
    FOR SELECT USING (true);

CREATE POLICY "Allow admin insert for easter_settings" ON public.easter_settings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow admin update for easter_settings" ON public.easter_settings
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin delete for easter_settings" ON public.easter_settings
    FOR DELETE USING (auth.role() = 'authenticated');

-- Insert default settings if not exists
INSERT INTO public.easter_settings (secret_keyword, eggs_page_enabled, hacker_mode_enabled, logo_animation_enabled, game_trigger_enabled)
SELECT 'konami', true, false, true, true
WHERE NOT EXISTS (SELECT 1 FROM public.easter_settings);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.easter_eggs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.easter_settings;
