/**
 * PDF Tools Theme
 * Consistent design system for all PDF tools
 */

export const PDFToolsTheme = {
    // Colors
    colors: {
        // Primary accent (cyber purple/cyan)
        accent: {
            primary: 'hsl(var(--accent))',
            light: 'hsl(var(--accent) / 0.8)',
            lighter: 'hsl(var(--accent) / 0.5)',
            dark: 'hsl(var(--accent) / 0.9)',
        },
        // Success states
        success: {
            primary: '#10b981',
            light: '#34d399',
            bg: 'rgba(16, 185, 129, 0.1)',
        },
        // Error states
        error: {
            primary: '#ef4444',
            light: '#f87171',
            bg: 'rgba(239, 68, 68, 0.1)',
        },
        // Warning states
        warning: {
            primary: '#f59e0b',
            light: '#fbbf24',
            bg: 'rgba(245, 158, 11, 0.1)',
        },
        // Info states
        info: {
            primary: '#3b82f6',
            light: '#60a5fa',
            bg: 'rgba(59, 130, 246, 0.1)',
        },
        // Glassmorphism
        glass: {
            bg: 'rgba(255, 255, 255, 0.05)',
            border: 'rgba(255, 255, 255, 0.1)',
            hover: 'rgba(255, 255, 255, 0.1)',
            active: 'rgba(255, 255, 255, 0.15)',
        },
    },

    // Typography
    typography: {
        fontFamily: {
            sans: 'Inter, system-ui, sans-serif',
            mono: 'JetBrains Mono, monospace',
        },
        fontSize: {
            xs: '0.75rem',     // 12px
            sm: '0.875rem',    // 14px
            base: '1rem',      // 16px
            lg: '1.125rem',    // 18px
            xl: '1.25rem',     // 20px
            '2xl': '1.5rem',   // 24px
            '3xl': '1.875rem', // 30px
            '4xl': '2.25rem',  // 36px
            '5xl': '3rem',     // 48px
            '6xl': '3.75rem',  // 60px
        },
        fontWeight: {
            normal: '400',
            medium: '500',
            semibold: '600',
            bold: '700',
        },
    },

    // Spacing
    spacing: {
        xs: '0.25rem',   // 4px
        sm: '0.5rem',    // 8px
        md: '1rem',      // 16px
        lg: '1.5rem',    // 24px
        xl: '2rem',      // 32px
        '2xl': '3rem',   // 48px
        '3xl': '4rem',   // 64px
    },

    // Border Radius
    borderRadius: {
        sm: '0.375rem',  // 6px
        md: '0.5rem',    // 8px
        lg: '0.75rem',   // 12px
        xl: '1rem',      // 16px
        '2xl': '1.5rem', // 24px
        full: '9999px',
    },

    // Shadows
    shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        glow: '0 0 20px rgba(var(--accent-rgb), 0.3)',
        neonGlow: '0 0 30px rgba(var(--accent-rgb), 0.5), 0 0 60px rgba(var(--accent-rgb), 0.3)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    },

    // Animations
    animations: {
        durations: {
            fast: '150ms',
            normal: '300ms',
            slow: '500ms',
        },
        easings: {
            default: 'cubic-bezier(0.4, 0, 0.2, 1)',
            in: 'cubic-bezier(0.4, 0, 1, 1)',
            out: 'cubic-bezier(0, 0, 0.2, 1)',
            inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        },
    },

    // Breakpoints
    breakpoints: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
    },
};

/**
 * Glassmorphism utility classes
 */
export const glassClasses = {
    panel: 'bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl',
    card: 'bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg hover:bg-white/10 transition-all',
    button: 'bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/15 transition-all',
    input: 'bg-black/20 border border-white/10 focus:border-accent/50 transition-all',
};

/**
 * Common component styles
 */
export const componentStyles = {
    // Tool page container
    toolPage: {
        container: 'min-h-screen w-full bg-void-black relative overflow-x-hidden selection:bg-accent/30',
        content: 'relative z-10 container mx-auto px-4 pt-32 pb-12 max-w-7xl',
    },

    // Upload zone
    uploadZone: {
        container: 'border-2 border-dashed border-white/20 hover:border-accent/50 rounded-2xl p-8 transition-all cursor-pointer',
        active: 'border-accent bg-accent/10',
        icon: 'w-16 h-16 mx-auto mb-4 text-muted-foreground',
        title: 'text-lg font-semibold text-white mb-2',
        subtitle: 'text-sm text-muted-foreground',
    },

    // Processing state
    processing: {
        container: 'flex flex-col items-center justify-center py-12 space-y-6',
        spinner: 'w-16 h-16 border-4 border-accent/30 border-t-accent rounded-full animate-spin',
        progress: 'w-full max-w-md h-2 bg-white/10 rounded-full overflow-hidden',
        progressBar: 'h-full bg-gradient-to-r from-accent to-cyan-500 transition-all duration-300',
        text: 'text-sm text-muted-foreground',
    },

    // Preview
    preview: {
        container: 'relative rounded-xl overflow-hidden border border-white/10 bg-black/40',
        canvas: 'w-full h-auto',
        controls: 'absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10',
        button: 'p-2 hover:bg-white/10 rounded-full transition-all',
    },

    // Configuration panel
    config: {
        container: 'space-y-6 p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl sticky top-24',
        title: 'text-sm font-semibold text-white mb-4 uppercase tracking-wider',
        section: 'space-y-4',
        label: 'text-sm text-white/60',
        control: 'w-full',
    },

    // Output card
    output: {
        container: 'flex flex-col items-center justify-center py-12 space-y-6',
        icon: 'w-20 h-20 text-success-primary',
        title: 'text-2xl font-bold text-white',
        subtitle: 'text-sm text-muted-foreground',
        actions: 'flex items-center gap-4',
    },

    // Thumbnail grid
    thumbnails: {
        grid: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4',
        item: 'relative group rounded-lg overflow-hidden border-2 transition-all duration-200 cursor-pointer',
        itemActive: 'border-accent ring-2 ring-accent/20',
        itemInactive: 'border-transparent hover:border-white/20',
        image: 'w-full h-full object-contain bg-white',
        badge: 'absolute bottom-1 right-1 bg-black/70 text-white text-xs px-2 py-1 rounded',
    },

    // Page controls
    pageControls: {
        container: 'flex items-center gap-2',
        button: 'p-2 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed',
        info: 'text-sm text-white/60 px-4',
    },

    // Toolbar
    toolbar: {
        container: 'flex items-center gap-2 p-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-x-auto',
        button: 'p-2 rounded-md hover:bg-white/10 transition-all',
        buttonActive: 'bg-accent text-white',
        buttonInactive: 'text-white/60',
        divider: 'w-px h-6 bg-white/10 mx-1',
    },
};

/**
 * Utility function to generate glassmorphic styles
 */
export function getGlassStyles(opacity = 0.05, blur = 'xl') {
    return {
        background: `rgba(255, 255, 255, ${opacity})`,
        backdropFilter: `blur(${blur === 'xl' ? '20px' : blur === 'lg' ? '16px' : '12px'})`,
        border: '1px solid rgba(255, 255, 255, 0.1)',
    };
}

/**
 * Utility function to generate gradient text
 */
export function getGradientTextStyles() {
    return {
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        backgroundImage: 'linear-gradient(to bottom, white, rgba(255, 255, 255, 0.6))',
    };
}

/**
 * Common utility class combinations
 */
export const utilityClasses = {
    // Text
    headingGradient: 'bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60',
    textMuted: 'text-muted-foreground',
    textWhite: 'text-white',

    // Buttons
    buttonPrimary: 'bg-accent hover:bg-accent/90 text-white font-medium px-6 py-3 rounded-lg transition-all shadow-glow hover:shadow-neon-glow',
    buttonSecondary: 'bg-white/5 hover:bg-white/10 text-white font-medium px-6 py-3 rounded-lg transition-all border border-white/10',
    buttonGhost: 'hover:bg-white/5 text-white/60 hover:text-white transition-all',

    // Layout
    flexCenter: 'flex items-center justify-center',
    flexBetween: 'flex items-center justify-between',

    // Spacing
    section: 'space-y-6',
    sectionLg: 'space-y-8',
};

export default PDFToolsTheme;
