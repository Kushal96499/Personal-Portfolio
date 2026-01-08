import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronRight, Info, AlertCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

interface UniversalToolLayoutProps {
    title: string;
    description: string;
    children: React.ReactNode;
    isProcessing?: boolean;
    steps?: string[];
    disclaimer?: string;
    className?: string;
    error?: string | null;
    onResetError?: () => void;
    parentPath?: string;
    parentName?: string;
    about?: string | React.ReactNode;
}

const UniversalToolLayout: React.FC<UniversalToolLayoutProps> = ({
    title,
    description,
    children,
    isProcessing = false,
    steps,
    disclaimer,
    className,
    error,
    onResetError,
    parentPath,
    parentName,
    about
}) => {
    const location = useLocation();

    // Determine category from URL path
    const getCategoryInfo = () => {
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
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8 sm:mb-12">
                    {/* Left: Breadcrumbs */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-wrap items-center gap-2 text-sm"
                    >
                        <Link to="/tools" className="text-muted-foreground hover:text-white transition-colors">
                            Tools
                        </Link>
                        <ChevronRight className="w-4 h-4 text-white/20" />
                        <Link to={category.path} className="text-muted-foreground hover:text-white transition-colors">
                            {category.name}
                        </Link>
                        <ChevronRight className="w-4 h-4 text-white/20" />
                        <span className="text-white font-medium truncate max-w-[150px] sm:max-w-none">{title}</span>
                    </motion.div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-3 self-end sm:self-auto">
                        <Link to="/tools">
                            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-white">
                                <ArrowLeft className="w-4 h-4" />
                                Back to Tools
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Hero Header (Centered - Matched to ToolPageLayout) */}
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

                {/* About Section (Universal Layout) */}
                {about && (
                    <div className="max-w-4xl mx-auto mb-10 text-center">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
                            <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">About This Tool</h2>
                            <div className="text-muted-foreground leading-relaxed">
                                {about}
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content Area */}
                <main className={cn("relative min-h-[600px] mb-24", className)}>
                    {/* Global Error Boundary Display */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="absolute top-0 left-0 right-0 z-50 mb-6"
                            >
                                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center justify-between backdrop-blur-md">
                                    <div className="flex items-center gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-400" />
                                        <p className="text-red-200 text-sm">{error}</p>
                                    </div>
                                    {onResetError && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={onResetError}
                                            className="text-red-300 hover:text-red-100 hover:bg-red-500/20"
                                        >
                                            Dismiss
                                        </Button>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Tool Interface */}
                    <GlassPanel className="h-full p-0 overflow-hidden bg-black/40 border-white/5 shadow-2xl backdrop-blur-xl">
                        {children}
                    </GlassPanel>
                </main>

                {/* SEO Content & Info Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                    {/* How it Works */}
                    {steps && (
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-white">How to use {title}</h3>
                            <div className="space-y-4">
                                {steps.map((step, index) => (
                                    <div key={index} className="flex gap-4 items-start group">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-sm font-bold text-white group-hover:bg-blue-500/20 group-hover:border-blue-500/50 transition-colors">
                                            {index + 1}
                                        </div>
                                        <p className="text-gray-400 pt-1 group-hover:text-gray-300 transition-colors">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}


                </div>

                {/* Footer / Disclaimer */}
                <footer className="mt-24 border-t border-white/5 pt-8 text-center">
                    <p className="text-sm text-muted-foreground/50 max-w-2xl mx-auto">
                        {disclaimer || "Disclaimer: This tool runs entirely in your web browser. No files are uploaded to any server. Your data remains completely private and secure on your own device."}
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default UniversalToolLayout;
