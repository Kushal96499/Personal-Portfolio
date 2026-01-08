import React from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassPanelProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
}

const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
    ({ children, className, hoverEffect = false, ...props }, ref) => {
        return (
            <motion.div
                ref={ref}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                whileHover={hoverEffect ? { scale: 1.005 } : undefined}
                className={cn(
                    'relative overflow-hidden rounded-2xl border border-white/10',
                    'bg-gradient-to-b from-white/[0.03] to-white/[0.01]',
                    'backdrop-blur-2xl shadow-premium',
                    'before:absolute before:inset-0 before:bg-noise-pattern before:opacity-5',
                    className
                )}
                {...props}
            >
                {/* Inner Glow Effect */}
                <div className="absolute inset-0 pointer-events-none shadow-glass-inset rounded-2xl" />

                {/* Content */}
                <div className="relative z-10">
                    {children}
                </div>
            </motion.div>
        );
    }
);

GlassPanel.displayName = 'GlassPanel';

export { GlassPanel };
