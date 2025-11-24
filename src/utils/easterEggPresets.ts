// Easter Egg Preset Configurations
// This file contains all preset values for triggers and actions

export const TRIGGER_PRESETS = {
    navigate_section: {
        label: 'Navigate to Section',
        description: 'Triggers when user navigates to a specific section',
        values: [
            { value: '/#home', label: 'Home' },
            { value: '/#about', label: 'About' },
            { value: '/#skills', label: 'Skills' },
            { value: '/#projects', label: 'Projects' },
            { value: '/#blog', label: 'Blog' },
            { value: '/#threat-map', label: 'Threat Map' },
            { value: '/#testimonials', label: 'Testimonials' },
            { value: '/#certificates', label: 'Certificates' },
            { value: '/#resume', label: 'Resume' },
            { value: '/#contact', label: 'Contact' },
            { value: '/easter-eggs', label: 'Easter Eggs Page' },
        ],
        requiresValue: true,
        allowCustom: false,
    },
    ui_interaction: {
        label: 'UI Interaction',
        description: 'Triggers on specific UI element interactions (data-ee attribute)',
        values: [
            { value: 'resume-download', label: 'Resume Download' },
            { value: 'project-open', label: 'Project Card Click' },
            { value: 'contact-submit', label: 'Contact Form Submit' },
            { value: 'blog-read', label: 'Blog Post Read' },
            { value: 'certificate-view', label: 'Certificate View' },
            { value: 'nav-github', label: 'GitHub Icon' },
            { value: 'nav-linkedin', label: 'LinkedIn Icon' },
            { value: 'nav-email', label: 'Email Icon' },
            { value: 'footer-github', label: 'Footer GitHub' },
            { value: 'footer-linkedin', label: 'Footer LinkedIn' },
            { value: 'footer-email', label: 'Footer Email' },
            { value: 'main-logo', label: 'Main Logo' },
            { value: 'threat-map', label: 'Threat Map Canvas' },
        ],
        requiresValue: true,
        allowCustom: false,
    },
    scroll_bottom: {
        label: 'Scroll to Bottom',
        description: 'Triggers when user scrolls to page bottom',
        values: [],
        requiresValue: false,
        allowCustom: false,
    },
    hover_element: {
        label: 'Hover Element',
        description: 'Triggers when hovering over elements with data-ee-hover attribute',
        values: [
            { value: 'hero-name', label: 'Hero Name' },
            { value: 'skills-title', label: 'Skills Section Title' },
            { value: 'footer-logo', label: 'Footer Logo' },
            { value: 'contact-card', label: 'Contact Card' },
            { value: 'profile-photo', label: 'Profile Photo' },
        ],
        requiresValue: true,
        allowCustom: false,
    },
    click_nav_icon: {
        label: 'Click Navigation Icon',
        description: 'Triggers when clicking navigation icons with data-ee attribute',
        values: [
            { value: 'nav-github', label: 'GitHub Icon' },
            { value: 'nav-linkedin', label: 'LinkedIn Icon' },
            { value: 'nav-email', label: 'Email Icon' },
            { value: 'main-logo', label: 'Main Logo' },
        ],
        requiresValue: true,
        allowCustom: false,
    },
    keyword: {
        label: 'Keyword',
        description: 'Triggers when user types a secret keyword',
        values: [],
        requiresValue: true,
        allowCustom: true,
        placeholder: 'Enter secret keyword...',
    },
} as const;

export const ACTION_PRESETS = {
    neon_particles: {
        label: 'Neon Particles Burst',
        description: 'Explosive particle effect with neon colors',
        icon: '✨',
    },
    neon_aura: {
        label: 'Neon Aura Pulse',
        description: 'Pulsing glow around viewport edges',
        icon: '🌟',
    },
    rgb_glow: {
        label: 'RGB Glow',
        description: 'Cycling RGB perimeter glow effect',
        icon: '🌈',
    },
    matrix_rain: {
        label: 'Matrix Rain',
        description: 'Falling green code characters',
        icon: '💚',
    },
    hacker_message: {
        label: 'Hacker Message',
        description: 'Cyber-styled popup message',
        icon: '💬',
    },
    glitch_effect: {
        label: 'Glitch Effect',
        description: 'Screen distortion with RGB split',
        icon: '⚡',
    },
    sound_ping: {
        label: 'Sound Ping',
        description: 'Cyber beep sound effect',
        icon: '🔊',
    },
    trophy_unlock: {
        label: 'Trophy Unlock',
        description: 'Animated trophy with confetti',
        icon: '🏆',
    },
    dino_game: {
        label: 'Play Dino Game',
        description: 'Launches the hidden Dino Runner game',
        icon: '🦖',
    },
} as const;

export type TriggerType = keyof typeof TRIGGER_PRESETS;
export type ActionType = keyof typeof ACTION_PRESETS;
