import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { GlassPanel } from '@/components/ui/GlassPanel';

interface ToolPageLayoutProps {
    title: string;
    description: string;
    children?: React.ReactNode;
    steps?: string[];
    howItWorks?: string[];
    disclaimer?: string;
    className?: string;
    containerVariant?: 'default' | 'full' | 'raw';
    parentPath?: string;
    parentName?: string;
    about?: string | React.ReactNode;
}

const ToolPageLayout: React.FC<ToolPageLayoutProps> = ({
    title,
    description,
    children,
    steps,
    howItWorks,
    disclaimer,
    className,
    containerVariant = 'default',
    parentPath,
    parentName,
    about
}) => {
    const location = useLocation();

    // Determine category from URL path
    const getCategoryInfo = () => {
        // If parent path and name are provided manually, use them
        if (parentPath && parentName) {
            return { name: parentName, path: parentPath };
        }

        const path = location.pathname.toLowerCase();

        if (path.includes('/tools/pdf')) {
            return { name: 'PDF Tools', path: '/tools/pdf' };
        } else if (path.includes('/tools/cyber')) {
            return { name: 'Cybersecurity', path: '/tools/cyber' };
        } else if (path.includes('/tools/image')) {
            return { name: 'Image Tools', path: '/tools/image' };
        } else if (path.includes('/tools/video')) {
            return { name: 'Video Tools', path: '/tools/video' };
        } else if (path.includes('/tools/audio')) {
            return { name: 'Audio Tools', path: '/tools/audio' };
        } else {
            return { name: 'Tools', path: '/tools' };
        }
    };

    const category = getCategoryInfo();

    // SEO & Title Management
    useEffect(() => {
        document.title = `${title} | AntiGravity Tools`;
        window.scrollTo(0, 0);
    }, [title]);

    // Render logic based on variant
    const renderContent = () => {
        if (containerVariant === 'raw') {
            return (
                <div className={cn("col-span-1 lg:col-span-12", className)}>
                    <AnimatePresence mode="wait">
                        {children}
                    </AnimatePresence>
                </div>
            );
        }

        return (
            <div className={cn("lg:col-span-8 lg:col-start-3", className)}>
                <GlassPanel className="p-6 md:p-8 min-h-[400px] flex flex-col">
                    <AnimatePresence mode="wait">
                        {children}
                    </AnimatePresence>
                </GlassPanel>
            </div>
        );
    };

    return (
        <div className="min-h-screen w-full bg-void-black relative overflow-x-hidden selection:bg-accent/30 font-sans">
            {/* 1. Background Physics Layer */}
            <div className="fixed inset-0 pointer-events-none z-0">
                {/* Global Noise */}
                <div className="absolute inset-0 bg-noise-pattern opacity-5 mix-blend-overlay" />

                {/* Subtle ambient glow - matched to homepage */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] bg-white/[0.02] blur-[150px] rounded-full" />
            </div>

            {/* 2. Content Layer */}
            <div className="relative z-10 container mx-auto px-4 pt-40 pb-12 max-w-[1400px]">
                {/* Navigation Bar */}
                <div className="flex flex-col-reverse md:flex-row gap-4 md:items-center justify-between mb-8 md:mb-12">
                    {/* Left: Breadcrumbs */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-muted-foreground"
                    >
                        <Link to="/tools" className="hover:text-white transition-colors">
                            Tools
                        </Link>
                        <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-white/20" />
                        <Link to={category.path} className="hover:text-white transition-colors whitespace-nowrap">
                            {category.name}
                        </Link>
                        <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-white/20" />
                        <span className="text-white font-medium truncate max-w-[200px] md:max-w-none">{title}</span>
                    </motion.div>

                    {/* Right: Back to Tools */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="self-start md:self-auto w-full md:w-auto flex justify-between md:block"
                    >
                        <Link
                            to="/tools"
                            className="inline-flex items-center gap-2 md:gap-3 text-muted-foreground hover:text-white transition-colors group py-2 md:py-0"
                        >
                            <div className="p-1.5 md:p-2 rounded-full bg-white/5 border border-white/10 group-hover:border-accent/50 transition-colors">
                                <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 group-hover:-translate-x-0.5 transition-transform" />
                            </div>
                            <span className="text-xs md:text-sm font-medium">Back to Tools</span>
                        </Link>
                    </motion.div>
                </div>

                {/* Hero Header */}
                <div className="text-center mb-12 space-y-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60"
                    >
                        {title}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-muted-foreground max-w-2xl mx-auto"
                    >
                        {description}
                    </motion.p>
                </div>

                {/* About Section */}
                {about && (
                    <div className="max-w-4xl mx-auto mb-12 text-center">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
                            <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">About This Tool</h2>
                            <div className="text-muted-foreground leading-relaxed">
                                {about}
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Tool Interface */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left/Center: Tool Logic */}
                    {renderContent()}

                    {/* Right: Sidebar (Optional - for steps/settings) */}
                    {(steps || howItWorks) && (
                        <div className="col-span-1 lg:col-span-3 lg:col-start-10 mt-8 lg:mt-0">
                            <GlassPanel className="p-6 sticky top-24">
                                <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">How it Works</h3>
                                <ul className="space-y-4">
                                    {(steps || howItWorks || []).map((step, index) => (
                                        <li key={index} className="flex gap-3 text-sm text-muted-foreground">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs text-white">
                                                {index + 1}
                                            </span>
                                            <span>{step}</span>
                                        </li>
                                    ))}
                                </ul>
                            </GlassPanel>
                        </div>
                    )}
                </div>

                {/* Footer / Disclaimer */}
                {disclaimer && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-16 text-center"
                    >
                        <p className="text-xs text-muted-foreground/50 max-w-xl mx-auto">
                            {disclaimer}
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default ToolPageLayout;
