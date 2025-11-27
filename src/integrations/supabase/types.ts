export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            about_me: {
                Row: {
                    id: string
                    title: string
                    description: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    title?: string
                    description?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            timeline_items: {
                Row: {
                    id: string
                    title: string
                    period: string
                    description: string
                    icon_type: 'briefcase' | 'graduation-cap'
                    order: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    period: string
                    description: string
                    icon_type?: 'briefcase' | 'graduation-cap'
                    order?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    period?: string
                    description?: string
                    icon_type?: 'briefcase' | 'graduation-cap'
                    order?: number
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            blogs: {
                Row: {
                    id: string
                    title: string
                    slug: string
                    description: string | null
                    content: string
                    tags: string[]
                    thumbnail_url: string | null
                    reading_time: number | null
                    visible: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    slug?: string
                    description?: string | null
                    content: string
                    tags?: string[]
                    thumbnail_url?: string | null
                    reading_time?: number | null
                    visible?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    slug?: string
                    description?: string | null
                    content?: string
                    tags?: string[]
                    thumbnail_url?: string | null
                    reading_time?: number | null
                    visible?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            projects: {
                Row: {
                    id: string
                    name: string
                    description: string
                    tech_stack: string[]
                    github_link: string | null
                    demo_link: string | null
                    thumbnail_url: string | null
                    visible: boolean
                    order: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description: string
                    tech_stack?: string[]
                    github_link?: string | null
                    demo_link?: string | null
                    thumbnail_url?: string | null
                    show_demo?: boolean
                    visible?: boolean
                    order?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string
                    tech_stack?: string[]
                    github_link?: string | null
                    demo_link?: string | null
                    thumbnail_url?: string | null
                    show_demo?: boolean
                    visible?: boolean
                    order?: number
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            testimonials: {
                Row: {
                    id: string
                    name: string
                    role: string
                    message: string
                    avatar_url: string | null
                    visible: boolean
                    order: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    role: string
                    message: string
                    avatar_url?: string | null
                    visible?: boolean
                    order?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    role?: string
                    message?: string
                    avatar_url?: string | null
                    visible?: boolean
                    order?: number
                    created_at?: string
                }
                Relationships: []
            }
            certificates: {
                Row: {
                    id: string
                    title: string
                    image_url: string
                    credential_link: string | null
                    status: string | null
                    order: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    image_url: string
                    credential_link?: string | null
                    status?: string | null
                    order?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    image_url?: string
                    credential_link?: string | null
                    status?: string | null
                    order?: number
                    created_at?: string
                }
                Relationships: []
            }
            contact_messages: {
                Row: {
                    id: string
                    name: string
                    email: string
                    message: string
                    read: boolean
                    resolved: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    email: string
                    message: string
                    read?: boolean
                    resolved?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    email?: string
                    message?: string
                    read?: boolean
                    resolved?: boolean
                    created_at?: string
                }
                Relationships: []
            }
            easter_eggs: {
                Row: {
                    id: string
                    name: string
                    description: string
                    hint: string
                    difficulty: 'Easy' | 'Medium' | 'Hard'
                    trigger_type: 'navigate_section' | 'ui_interaction' | 'scroll_bottom' | 'hover_element' | 'click_nav_icon' | 'keyword'
                    trigger_value: string
                    action_type: 'neon_particles' | 'neon_aura' | 'rgb_glow' | 'matrix_rain' | 'hacker_message' | 'glitch_effect' | 'sound_ping' | 'trophy_unlock'
                    is_active: boolean
                    is_secret: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description: string
                    hint: string
                    difficulty: 'Easy' | 'Medium' | 'Hard'
                    trigger_type: 'navigate_section' | 'ui_interaction' | 'scroll_bottom' | 'hover_element' | 'click_nav_icon' | 'keyword'
                    trigger_value: string
                    action_type?: 'neon_particles' | 'neon_aura' | 'rgb_glow' | 'matrix_rain' | 'hacker_message' | 'glitch_effect' | 'sound_ping' | 'trophy_unlock'
                    is_active?: boolean
                    is_secret?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string
                    hint?: string
                    difficulty?: 'Easy' | 'Medium' | 'Hard'
                    trigger_type?: 'navigate_section' | 'ui_interaction' | 'scroll_bottom' | 'hover_element' | 'click_nav_icon' | 'keyword'
                    trigger_value?: string
                    action_type?: 'neon_particles' | 'neon_aura' | 'rgb_glow' | 'matrix_rain' | 'hacker_message' | 'glitch_effect' | 'sound_ping' | 'trophy_unlock'
                    is_active?: boolean
                    is_secret?: boolean
                    created_at?: string
                }
                Relationships: []
            }
            easter_settings: {
                Row: {
                    id: string
                    eggs_page_enabled: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    eggs_page_enabled?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    eggs_page_enabled?: boolean
                    created_at?: string
                }
                Relationships: []
            }
            easter_eggs_config: {
                Row: {
                    id: string
                    logo_animation: boolean
                    game_trigger: boolean
                    hacker_mode: boolean
                    secret_keyword: string
                    animation_speed: number
                    updated_at: string
                }
                Insert: {
                    id?: string
                    logo_animation?: boolean
                    game_trigger?: boolean
                    hacker_mode?: boolean
                    secret_keyword?: string
                    animation_speed?: number
                    updated_at?: string
                }
                Update: {
                    id?: string
                    logo_animation?: boolean
                    game_trigger?: boolean
                    hacker_mode?: boolean
                    secret_keyword?: string
                    animation_speed?: number
                    updated_at?: string
                }
                Relationships: []
            }
            site_controls: {
                Row: {
                    id: string
                    home_hero: boolean
                    about: boolean
                    skills: boolean
                    projects: boolean
                    testimonials: boolean
                    certificates: boolean
                    blog: boolean
                    contact: boolean
                    footer_extras: boolean
                    threat_map_enabled: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    home_hero?: boolean
                    about?: boolean
                    skills?: boolean
                    projects?: boolean
                    testimonials?: boolean
                    certificates?: boolean
                    blog?: boolean
                    contact?: boolean
                    footer_extras?: boolean
                    threat_map_enabled?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    home_hero?: boolean
                    about?: boolean
                    skills?: boolean
                    projects?: boolean
                    testimonials?: boolean
                    certificates?: boolean
                    blog?: boolean
                    contact?: boolean
                    footer_extras?: boolean
                    threat_map_enabled?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            activity_logs: {
                Row: {
                    id: string
                    action_type: 'created' | 'updated' | 'deleted'
                    entity_type: 'project' | 'blog' | 'testimonial' | 'certificate' | 'contact_message' | 'skill' | 'easter_egg'
                    entity_id: string | null
                    entity_name: string | null
                    description: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    action_type: 'created' | 'updated' | 'deleted'
                    entity_type: 'project' | 'blog' | 'testimonial' | 'certificate' | 'contact_message' | 'skill' | 'easter_egg'
                    entity_id?: string | null
                    entity_name?: string | null
                    description: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    action_type?: 'created' | 'updated' | 'deleted'
                    entity_type?: 'project' | 'blog' | 'testimonial' | 'certificate' | 'contact_message' | 'skill' | 'easter_egg'
                    entity_id?: string | null
                    entity_name?: string | null
                    description?: string
                    created_at?: string
                }
                Relationships: []
            }
            skills: {
                Row: {
                    id: string
                    category: string
                    title: string
                    items: string[]
                    icon: string
                    order: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    category: string
                    title: string
                    items: string[]
                    icon: string
                    order?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    category?: string
                    title?: string
                    items?: string[]
                    icon?: string
                    order?: number
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            branding_settings: {
                Row: {
                    id: string
                    logo_type: 'text' | 'image'
                    logo_url: string | null
                    logo_size: number
                    neon_glow: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    logo_type: 'text' | 'image'
                    logo_url?: string | null
                    logo_size: number
                    neon_glow: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    logo_type?: 'text' | 'image'
                    logo_url?: string | null
                    logo_size?: number
                    neon_glow?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            resume_data: {
                Row: {
                    id: string
                    education: Json
                    experience: Json
                    stats: Json
                    resume_pdf_path: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    education: Json
                    experience: Json
                    stats: Json
                    resume_pdf_path?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    education?: Json
                    experience?: Json
                    stats?: Json
                    resume_pdf_path?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

export type Tables<
    PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
    ? R
    : never
    : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
    EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
    ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never

// Convenience types for use in the application
export type Blog = Database['public']['Tables']['blogs']['Row'];
export type BlogInsert = Database['public']['Tables']['blogs']['Insert'];
export type BlogUpdate = Database['public']['Tables']['blogs']['Update'];

export type Project = Database['public']['Tables']['projects']['Row'];
export type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
export type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

export type Testimonial = Database['public']['Tables']['testimonials']['Row'];
export type TestimonialInsert = Database['public']['Tables']['testimonials']['Insert'];
export type TestimonialUpdate = Database['public']['Tables']['testimonials']['Update'];

export type Certificate = Database['public']['Tables']['certificates']['Row'];
export type CertificateInsert = Database['public']['Tables']['certificates']['Insert'];
export type CertificateUpdate = Database['public']['Tables']['certificates']['Update'];

export type ContactMessage = Database['public']['Tables']['contact_messages']['Row'];
export type ContactMessageInsert = Database['public']['Tables']['contact_messages']['Insert'];
export type ContactMessageUpdate = Database['public']['Tables']['contact_messages']['Update'];

export type EasterEgg = Database['public']['Tables']['easter_eggs']['Row'];
export type EasterEggInsert = Database['public']['Tables']['easter_eggs']['Insert'];
export type EasterEggUpdate = Database['public']['Tables']['easter_eggs']['Update'];
