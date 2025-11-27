import { supabase } from '@/integrations/supabase/client';
import type {
    Blog,
    BlogInsert,
    BlogUpdate,
    Project,
    ProjectInsert,
    ProjectUpdate,
    Testimonial,
    TestimonialInsert,
    TestimonialUpdate,
    Certificate,
    CertificateInsert,
    CertificateUpdate,
    ContactMessage,
    ContactMessageInsert,
    ContactMessageUpdate
} from '@/integrations/supabase/types';

// Re-export types for backward compatibility
export type { Blog };

// Skills Interface
export interface Skill {
    id: string;
    category: string;
    title: string;
    items: string[];
    icon: string;
    order: number;
    created_at: string;
    updated_at: string;
}

export interface SkillInsert {
    category: string;
    title: string;
    items: string[];
    icon: string;
    order?: number;
}

export interface SkillUpdate {
    category?: string;
    title?: string;
    items?: string[];
    icon?: string;
    order?: number;
}

// Easter Eggs Configuration Interface (Legacy - to be removed or mapped)
export interface EasterEggsConfig {
    id?: string;
    logo_animation: boolean;
    game_trigger: boolean;
    hacker_mode: boolean;
    secret_keyword: string;
    animation_speed: number;
    updated_at?: string;
}

// New Easter Egg Interfaces
export interface EasterEgg {
    id: string;
    name: string;
    description: string;
    hint: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    trigger_type: 'navigate_section' | 'ui_interaction' | 'scroll_bottom' | 'hover_element' | 'click_nav_icon' | 'keyword';
    trigger_value: string;
    action_type: 'neon_particles' | 'neon_aura' | 'rgb_glow' | 'matrix_rain' | 'hacker_message' | 'glitch_effect' | 'sound_ping' | 'trophy_unlock';
    is_active: boolean;
    is_secret: boolean;
    found: boolean;
    created_at: string;
}

export interface EasterEggInsert {
    name: string;
    description: string;
    hint: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    trigger_type: 'navigate_section' | 'ui_interaction' | 'scroll_bottom' | 'hover_element' | 'click_nav_icon' | 'keyword';
    trigger_value: string;
    action_type?: 'neon_particles' | 'neon_aura' | 'rgb_glow' | 'matrix_rain' | 'hacker_message' | 'glitch_effect' | 'sound_ping' | 'trophy_unlock';
    is_active?: boolean;
    is_secret?: boolean;
}

export interface EasterEggUpdate {
    name?: string;
    description?: string;
    hint?: string;
    difficulty?: 'Easy' | 'Medium' | 'Hard';
    trigger_type?: 'navigate_section' | 'ui_interaction' | 'scroll_bottom' | 'hover_element' | 'click_nav_icon' | 'keyword';
    trigger_value?: string;
    action_type?: 'neon_particles' | 'neon_aura' | 'rgb_glow' | 'matrix_rain' | 'hacker_message' | 'glitch_effect' | 'sound_ping' | 'trophy_unlock';
    is_active?: boolean;
    is_secret?: boolean;
    found?: boolean;
}


export interface EasterSettings {
    id: string;
    eggs_page_enabled: boolean;
    created_at: string;
}

export interface EasterSettingsUpdate {
    eggs_page_enabled?: boolean;
}


// Site Controls Interface (Section Visibility)
export interface SiteControls {
    id?: string;
    home_hero: boolean;
    about: boolean;
    skills: boolean;
    projects: boolean;
    testimonials: boolean;
    certificates: boolean;
    blog: boolean;
    contact: boolean;
    footer_extras: boolean;
    threat_map_enabled: boolean;
    created_at?: string;
    updated_at?: string;
}

// About Section Interfaces
export interface AboutMe {
    id: string;
    title: string;
    description: string;
    created_at: string;
    updated_at: string;
}

export interface TimelineItem {
    id: string;
    title: string;
    period: string;
    description: string;
    icon_type: 'briefcase' | 'graduation-cap';
    order: number;
    created_at: string;
    updated_at: string;
}

export interface TimelineItemInsert {
    title: string;
    period: string;
    description: string;
    icon_type: 'briefcase' | 'graduation-cap';
    order?: number;
}

export interface TimelineItemUpdate {
    title?: string;
    period?: string;
    description?: string;
    icon_type?: 'briefcase' | 'graduation-cap';
    order?: number;
}

// Branding Settings Interface (Logo & Branding)
export interface BrandingSettings {
    id?: string;
    logo_type: 'text' | 'image';
    logo_url: string | null;
    logo_size: number;
    neon_glow: boolean;
    created_at?: string;
    updated_at?: string;
}

// Resume Management Interfaces
export interface Education {
    id: string;
    degree: string;
    institute: string;
    startYear: string;
    endYear: string;
    description: string;
}

export interface Experience {
    id: string;
    role: string;
    company: string;
    startYear: string;
    endYear: string;
    isPresent: boolean;
    description: string;
}

export interface ResumeStats {
    educationCount: number;
    experienceCount: number;
    projectsCompleted: number;
    yearsOfExperience: number;
}

export interface ResumeData {
    id?: string;
    education: Education[];
    experience: Experience[];
    stats: ResumeStats;
    resume_pdf_path: string | null;
    created_at?: string;
    updated_at?: string;
}

// Activity Log Interface
export interface Activity {
    id: string;
    action_type: 'created' | 'updated' | 'deleted';
    entity_type: 'project' | 'blog' | 'testimonial' | 'certificate' | 'contact_message' | 'skill' | 'easter_egg';
    entity_id: string | null;
    entity_name: string | null;
    description: string;
    created_at: string;
}

// Helper to calculate reading time from content
const calculateReadingTime = (content: string): number => {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
};

export const api = {
    // ==================== ANALYTICS ====================
    getAnalytics: async () => {
        try {
            const [projects, testimonials, messages, certificates, blogs, skills, easterEggs] = await Promise.all([
                supabase.from('projects').select('*', { count: 'exact', head: true }),
                supabase.from('testimonials').select('*', { count: 'exact', head: true }),
                supabase.from('contact_messages').select('*', { count: 'exact', head: true }),
                supabase.from('certificates').select('*', { count: 'exact', head: true }),
                supabase.from('blogs').select('*', { count: 'exact', head: true }),
                supabase.from('skills').select('*', { count: 'exact', head: true }),
                supabase.from('easter_eggs').select('*', { count: 'exact', head: true }),
            ]);

            return {
                projects: projects.count || 0,
                testimonials: testimonials.count || 0,
                messages: messages.count || 0,
                certificates: certificates.count || 0,
                blogs: blogs.count || 0,
                skills: skills.count || 0,
                easterEggs: easterEggs.count || 0,
            };
        } catch (error) {
            console.error('Analytics fetch error:', error);
            throw error;
        }
    },

    getSystemHealth: async () => {
        try {
            const { data, error } = await supabase.functions.invoke('health-check');
            if (error) throw error;
            return data;
        } catch (error) {
            console.warn('Edge Function health-check failed, falling back to client-side check:', error);

            // Client-side fallback checks
            let database = false;
            let storage = false;

            try {
                // Check Database
                const { error: dbError } = await supabase.from('projects').select('count', { count: 'exact', head: true });
                database = !dbError;
            } catch (e) { console.error('Client DB check failed', e); }

            try {
                // Check Storage (might fail due to RLS, but worth a try)
                const { error: storageError } = await supabase.storage.listBuckets();
                storage = !storageError;
            } catch (e) { console.error('Client Storage check failed', e); }

            return {
                database,
                storage,
                mail_service: 'Check Failed (Function unavailable)',
                edge_functions: 'Unreachable (Not Deployed)',
                portfolio_pages: true
            };
        }
    },

    // ==================== BLOGS ====================
    getBlogs: async (): Promise<Blog[]> => {
        const { data, error } = await supabase
            .from('blogs')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    getPublicBlogs: async (): Promise<Blog[]> => {
        try {
            const { data, error } = await supabase
                .from('blogs')
                .select('*')
                .eq('visible', true)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching public blogs:', error);
            return [];
        }
    },

    getBlogById: async (id: string): Promise<Blog | null> => {
        const { data, error } = await supabase
            .from('blogs')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    getBlogBySlug: async (slug: string): Promise<Blog | null> => {
        const { data, error } = await supabase
            .from('blogs')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // No rows returned
                return null;
            }
            throw error;
        }
        return data;
    },

    createBlog: async (blog: Omit<BlogInsert, 'id' | 'created_at' | 'updated_at'>): Promise<Blog> => {
        const reading_time = calculateReadingTime(blog.content);

        const { data, error } = await supabase
            .from('blogs')
            .insert([{ ...blog, reading_time }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    updateBlog: async (id: string, updates: Partial<BlogUpdate>): Promise<Blog> => {
        // Recalculate reading time if content changed
        const updateData = { ...updates };
        if (updates.content) {
            updateData.reading_time = calculateReadingTime(updates.content);
        }

        const { data, error } = await supabase
            .from('blogs')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    deleteBlog: async (id: string): Promise<void> => {
        const { error } = await supabase
            .from('blogs')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // ==================== PROJECTS ====================
    getProjects: async (): Promise<Project[]> => {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('order', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    getPublicProjects: async (): Promise<Project[]> => {
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('visible', true)
                .order('order', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching public projects:', error);
            return [];
        }
    },

    createProject: async (project: Omit<ProjectInsert, 'id' | 'created_at' | 'updated_at'>): Promise<Project> => {
        const { data, error } = await supabase
            .from('projects')
            .insert([project])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    updateProject: async (id: string, updates: Partial<ProjectUpdate>): Promise<Project> => {
        const { data, error } = await supabase
            .from('projects')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    deleteProject: async (id: string): Promise<void> => {
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // ==================== TESTIMONIALS ====================
    getTestimonials: async (): Promise<Testimonial[]> => {
        const { data, error } = await supabase
            .from('testimonials')
            .select('*')
            .order('order', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    getPublicTestimonials: async (): Promise<Testimonial[]> => {
        try {
            const { data, error } = await supabase
                .from('testimonials')
                .select('*')
                .eq('visible', true)
                .order('order', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching public testimonials:', error);
            return [];
        }
    },

    createTestimonial: async (testimonial: Omit<TestimonialInsert, 'id' | 'created_at'>): Promise<Testimonial> => {
        const { data, error } = await supabase
            .from('testimonials')
            .insert([testimonial])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    updateTestimonial: async (id: string, updates: Partial<TestimonialUpdate>): Promise<Testimonial> => {
        const { data, error } = await supabase
            .from('testimonials')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    deleteTestimonial: async (id: string): Promise<void> => {
        const { error } = await supabase
            .from('testimonials')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // ==================== CERTIFICATES ====================
    getCertificates: async (): Promise<Certificate[]> => {
        try {
            const { data, error } = await supabase
                .from('certificates')
                .select('*')
                .order('order', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching certificates:', error);
            return [];
        }
    },

    createCertificate: async (certificate: Omit<CertificateInsert, 'id' | 'created_at'>): Promise<Certificate> => {
        const { data, error } = await supabase
            .from('certificates')
            .insert([certificate])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    updateCertificate: async (id: string, updates: Partial<CertificateUpdate>): Promise<Certificate> => {
        const { data, error } = await supabase
            .from('certificates')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    deleteCertificate: async (id: string): Promise<void> => {
        const { error } = await supabase
            .from('certificates')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // ==================== SKILLS ====================
    getSkills: async (): Promise<Skill[]> => {
        try {
            const { data, error } = await supabase
                .from('skills')
                .select('*')
                .order('order', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching skills:', error);
            return [];
        }
    },

    createSkill: async (skill: SkillInsert): Promise<Skill> => {
        const { data, error } = await supabase
            .from('skills')
            .insert([skill])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    updateSkill: async (id: string, updates: SkillUpdate): Promise<Skill> => {
        const { data, error } = await supabase
            .from('skills')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    deleteSkill: async (id: string): Promise<void> => {
        const { error } = await supabase
            .from('skills')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // ==================== CONTACT MESSAGES ====================
    getMessages: async (): Promise<ContactMessage[]> => {
        const { data, error } = await supabase
            .from('contact_messages')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    submitContactMessage: async (message: Omit<ContactMessageInsert, 'id' | 'created_at'>): Promise<ContactMessage> => {
        // Set default values for optional fields (no status field in DB)
        const { data, error } = await supabase
            .from('contact_messages')
            .insert([{
                name: message.name,
                email: message.email,
                message: message.message,
                read: false,
                resolved: false
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    markMessageAsRead: async (id: string, read: boolean): Promise<ContactMessage> => {
        const { data, error } = await supabase
            .from('contact_messages')
            .update({ read })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    markMessageAsResolved: async (id: string, resolved: boolean): Promise<ContactMessage> => {
        const { data, error } = await supabase
            .from('contact_messages')
            .update({ resolved })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    deleteMessage: async (id: string): Promise<void> => {
        const { error } = await supabase
            .from('contact_messages')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    sendContactEmail: async (data: { name: string; email: string; message: string }): Promise<void> => {
        const { data: responseData, error } = await supabase.functions.invoke('send-contact-mail', {
            body: data
        });

        if (error) throw error;
        if (responseData?.error) throw new Error(responseData.error);
    },

    // ==================== EASTER EGGS ====================
    // ==================== EASTER EGGS ====================
    getEasterEggs: async (): Promise<EasterEgg[]> => {
        const { data, error } = await supabase
            .from('easter_eggs')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data as EasterEgg[];
    },

    createEasterEgg: async (egg: EasterEggInsert): Promise<EasterEgg> => {
        const { data, error } = await supabase
            .from('easter_eggs')
            .insert([egg])
            .select()
            .single();

        if (error) throw error;
        return data as EasterEgg;
    },

    updateEasterEgg: async (id: string, updates: EasterEggUpdate): Promise<EasterEgg> => {
        const { data, error } = await supabase
            .from('easter_eggs')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as EasterEgg;
    },

    deleteEasterEgg: async (id: string): Promise<void> => {
        const { error } = await supabase
            .from('easter_eggs')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    getEasterSettings: async (): Promise<EasterSettings> => {
        const { data, error } = await supabase
            .from('easter_settings')
            .select('*')
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // Return default if not found
                return {
                    id: 'default',
                    eggs_page_enabled: true,
                    created_at: new Date().toISOString()
                };
            }
            throw error;
        }
        return data as EasterSettings;
    },

    updateEasterSettings: async (updates: EasterSettingsUpdate): Promise<EasterSettings> => {
        const { data: existing } = await supabase.from('easter_settings').select('id').single();

        let result;
        if (existing) {
            const { data, error } = await supabase
                .from('easter_settings')
                .update(updates)
                .eq('id', existing.id)
                .select()
                .single();
            if (error) throw error;
            result = data;
        } else {
            const { data, error } = await supabase
                .from('easter_settings')
                .insert([updates as any])
                .select()
                .single();
            if (error) throw error;
            result = data;
        }

        window.dispatchEvent(new CustomEvent('easterSettingsUpdated', { detail: result }));
        return result as EasterSettings;
    },

    subscribeToEasterSettings: (callback: (settings: EasterSettings) => void) => {
        return supabase
            .channel('easter_settings_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'easter_settings'
                },
                (payload) => {
                    if (payload.new) {
                        callback(payload.new as EasterSettings);
                    }
                }
            )
            .subscribe();
    },

    unsubscribeFromEasterSettings: (channel: any) => {
        supabase.removeChannel(channel);
    },

    // Legacy (Deprecated) - kept for temporary compatibility if needed
    getEasterEggsConfig: async (): Promise<EasterEggsConfig> => {
        // Return static defaults since old settings were removed from database
        return {
            logo_animation: false,
            game_trigger: false,
            hacker_mode: false,
            secret_keyword: '',
            animation_speed: 1.0
        };
    },

    // ==================== ABOUT SECTION ====================
    getAboutMe: async (): Promise<AboutMe> => {
        const { data, error } = await supabase
            .from('about_me')
            .select('*')
            .single();

        if (error) {
            // If empty, return default structure (or handle error)
            if (error.code === 'PGRST116') {
                return {
                    id: 'default',
                    title: 'About Me',
                    description: '',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
            }
            throw error;
        }
        return data as AboutMe;
    },

    updateAboutMe: async (data: { title: string; description: string }): Promise<AboutMe> => {
        // Check if exists
        const { data: existing } = await supabase.from('about_me').select('id').single();

        if (existing) {
            const { data: updated, error } = await supabase
                .from('about_me')
                .update(data)
                .eq('id', existing.id)
                .select()
                .single();
            if (error) throw error;
            return updated as AboutMe;
        } else {
            const { data: created, error } = await supabase
                .from('about_me')
                .insert([data])
                .select()
                .single();
            if (error) throw error;
            return created as AboutMe;
        }
    },

    getTimelineItems: async (): Promise<TimelineItem[]> => {
        const { data, error } = await supabase
            .from('timeline_items')
            .select('*')
            .order('order', { ascending: true });

        if (error) throw error;
        return data as TimelineItem[];
    },

    createTimelineItem: async (item: TimelineItemInsert): Promise<TimelineItem> => {
        const { data, error } = await supabase
            .from('timeline_items')
            .insert([item])
            .select()
            .single();

        if (error) throw error;
        return data as TimelineItem;
    },

    updateTimelineItem: async (id: string, updates: TimelineItemUpdate): Promise<TimelineItem> => {
        const { data, error } = await supabase
            .from('timeline_items')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as TimelineItem;
    },

    deleteTimelineItem: async (id: string): Promise<void> => {
        const { error } = await supabase
            .from('timeline_items')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // ==================== ACTIVITY LOGS ====================
    getRecentActivities: async (limit: number = 10): Promise<Activity[]> => {
        const { data, error } = await supabase
            .from('activity_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return (data || []) as Activity[];
    },

    subscribeToActivities: (callback: (activity: Activity) => void) => {
        return supabase
            .channel('activity_logs_changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'activity_logs'
                },
                (payload) => {
                    if (payload.new) {
                        callback(payload.new as Activity);
                    }
                }
            )
            .subscribe();
    },

    unsubscribeFromActivities: (channel: any) => {
        supabase.removeChannel(channel);
    },

    // ==================== SITE CONTROLS ====================
    getSiteControls: async (): Promise<SiteControls> => {
        const { data, error } = await (supabase as any)
            .from('site_controls')
            .select('*')
            .single();

        if (error) {
            // If no config found, return default
            if (error.code === 'PGRST116') {
                return {
                    id: 'default',
                    home_hero: true,
                    about: true,
                    skills: true,
                    projects: true,
                    testimonials: true,
                    certificates: true,
                    blog: true,
                    contact: true,
                    footer_extras: true,
                    threat_map_enabled: false,
                };
            }
            throw error;
        }

        return data as SiteControls;
    },

    updateSiteControls: async (updates: Partial<SiteControls>): Promise<SiteControls> => {
        // Get the existing row ID
        const { data: existing } = await (supabase as any).from('site_controls').select('id').single();

        let result;
        if (existing) {
            const { data, error } = await (supabase as any)
                .from('site_controls')
                .update(updates)
                .eq('id', existing.id)
                .select()
                .single();
            if (error) throw error;
            result = data;
        } else {
            // Should not happen if migration ran, but fallback insert
            const { data, error } = await (supabase as any)
                .from('site_controls')
                .insert([updates as any])
                .select()
                .single();
            if (error) throw error;
            result = data;
        }

        // Dispatch custom event for frontend to listen
        window.dispatchEvent(new CustomEvent('siteControlsUpdated', { detail: result }));

        return result as SiteControls;
    },

    subscribeToSiteControls: (callback: (controls: SiteControls) => void) => {
        return (supabase as any)
            .channel('site_controls_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'site_controls'
                },
                (payload: any) => {
                    if (payload.new) {
                        callback(payload.new as SiteControls);
                    }
                }
            )
            .subscribe();
    },

    unsubscribeFromSiteControls: (channel: any) => {
        supabase.removeChannel(channel);
    },

    // ==================== BRANDING SETTINGS ====================
    getBrandingSettings: async (): Promise<BrandingSettings> => {
        const { data, error } = await supabase
            .from('branding_settings')
            .select('*')
            .single();

        if (error) {
            // If no config found, return default
            if (error.code === 'PGRST116') {
                return {
                    logo_type: 'text',
                    logo_url: null,
                    logo_size: 45,
                    neon_glow: true,
                };
            }
            throw error;
        }

        return data as BrandingSettings;
    },

    updateBrandingSettings: async (updates: Partial<BrandingSettings>): Promise<BrandingSettings> => {
        // Get the existing row ID
        const { data: existing } = await supabase.from('branding_settings').select('id').single();

        let result;
        if (existing) {
            const { data, error } = await supabase
                .from('branding_settings')
                .update(updates)
                .eq('id', existing.id)
                .select()
                .single();
            if (error) throw error;
            result = data;
        } else {
            // Should not happen if migration ran, but fallback insert
            const { data, error } = await supabase
                .from('branding_settings')
                .insert([updates as any])
                .select()
                .single();
            if (error) throw error;
            result = data;
        }

        return result as BrandingSettings;
    },

    subscribeToBrandingSettings: (callback: (settings: BrandingSettings) => void) => {
        return supabase
            .channel('branding_settings_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'branding_settings'
                },
                (payload: any) => {
                    if (payload.new) {
                        callback(payload.new as BrandingSettings);
                    }
                }
            )
            .subscribe();
    },

    unsubscribeFromBrandingSettings: (channel: any) => {
        supabase.removeChannel(channel);
    },

    // ==================== ADMIN LOGS ====================
    getAdminLogs: async (limit: number = 50): Promise<any[]> => {
        const { data, error } = await (supabase as any)
            .from('admin_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    },

    logAdminAction: async (action: string, details: any = {}): Promise<void> => {
        try {
            await (supabase as any).from('admin_logs').insert([{
                action,
                details
            }]);
        } catch (error) {
            console.error('Failed to log admin action:', error);
            // Don't throw, just log to console to avoid breaking the main flow
        }
    },

    // ==================== RESUME MANAGEMENT ====================
    getResumeData: async (): Promise<ResumeData> => {
        const { data, error } = await supabase
            .from('resume_data')
            .select('*')
            .limit(1)
            .maybeSingle();

        if (error) throw error;

        if (!data) {
            return {
                education: [],
                experience: [],
                stats: {
                    educationCount: 0,
                    experienceCount: 0,
                    projectsCompleted: 0,
                    yearsOfExperience: 0,
                },
                resume_pdf_path: null,
            };
        }

        return data as unknown as ResumeData;
    },

    updateResumeData: async (updates: Partial<ResumeData>): Promise<ResumeData> => {
        // Auto-calculate education and experience counts if arrays are updated
        const updateData = { ...updates };

        if (updates.education || updates.experience) {
            const currentData = await api.getResumeData();
            const education = updates.education || currentData.education;
            const experience = updates.experience || currentData.experience;

            updateData.stats = {
                ...(updates.stats || currentData.stats),
                educationCount: education.length,
                experienceCount: experience.length,
            };
        }

        // Get the existing row ID
        const { data: existing } = await (supabase as any)
            .from('resume_data')
            .select('id')
            .limit(1)
            .maybeSingle();

        let result;
        if (existing) {
            const { data, error } = await (supabase as any)
                .from('resume_data')
                .update(updateData)
                .eq('id', existing.id)
                .select()
                .single();
            if (error) throw error;
            result = data;
        } else {
            // Should not happen if migration ran, but fallback insert
            const { data, error } = await (supabase as any)
                .from('resume_data')
                .insert([updateData])
                .select()
                .single();
            if (error) throw error;
            result = data;
        }

        return result as ResumeData;
    },

    uploadResumePDF: async (file: File): Promise<string> => {
        // Validate file type
        if (file.type !== 'application/pdf') {
            throw new Error('Only PDF files are allowed');
        }

        // Validate file size (20MB = 20 * 1024 * 1024 bytes)
        const maxSize = 20 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new Error('File size must be less than 20MB');
        }

        // Delete old resume PDF if exists
        const currentData = await api.getResumeData();
        if (currentData.resume_pdf_path) {
            await api.deleteResumePDF(currentData.resume_pdf_path);
        }

        // Generate unique filename
        const timestamp = Date.now();
        const filename = `resume_${timestamp}.pdf`;
        const filePath = `resumes/${filename}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('portfolio-assets')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('portfolio-assets')
            .getPublicUrl(filePath);

        // Update resume_data with new path
        await api.updateResumeData({ resume_pdf_path: publicUrl });

        return publicUrl;
    },

    deleteResumePDF: async (path?: string): Promise<void> => {
        let filePath = path;

        // If no path provided, get from database
        if (!filePath) {
            const currentData = await api.getResumeData();
            filePath = currentData.resume_pdf_path;
        }

        if (!filePath) return; // Nothing to delete

        // Extract the file path from the public URL
        // URL format: https://[project].supabase.co/storage/v1/object/public/portfolio-assets/resumes/resume_123.pdf
        const pathMatch = filePath.match(/portfolio-assets\/(.+)$/);
        if (pathMatch) {
            const storagePath = pathMatch[1];

            // Delete from storage
            const { error } = await supabase.storage
                .from('portfolio-assets')
                .remove([storagePath]);

            if (error) {
                console.error('Failed to delete file from storage:', error);
                // Don't throw, continue to update database
            }
        }

        // Update database to remove path
        await api.updateResumeData({ resume_pdf_path: null });
    },

    subscribeToResumeData: (callback: (data: ResumeData) => void) => {
        return supabase
            .channel('resume_data_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'resume_data'
                },
                (payload: any) => {
                    if (payload.new) {
                        callback(payload.new as ResumeData);
                    }
                }
            )
            .subscribe();
    },

    unsubscribeFromResumeData: (channel: any) => {
        supabase.removeChannel(channel);
    }
};
