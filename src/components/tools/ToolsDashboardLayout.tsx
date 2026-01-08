import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight, Search, ExternalLink, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Input } from '@/components/ui/input';
import { useFavorites } from '@/hooks/useFavorites';

interface Tool {
    id: string;
    name: string;
    description: string;
    icon: React.ElementType;
    path: string;
}

interface Category {
    id: string;
    name: string;
    icon: React.ElementType;
    tools: Tool[];
}

interface ToolsDashboardLayoutProps {
    title: string;
    description: string;
    categories: Category[];
    basePath: string;
}

const ToolsDashboardLayout: React.FC<ToolsDashboardLayoutProps> = ({
    title,
    description,
    categories,
    basePath
}) => {
    // SEO & Title Management
    useEffect(() => {
        document.title = `${title} | AntiGravity Tools`;
        window.scrollTo(0, 0);
    }, [title]);

    const [searchQuery, setSearchQuery] = React.useState("");
    const { favorites, toggleFavorite } = useFavorites();

    // Filter tools based on search
    const filteredCategories = categories.map(category => ({
        ...category,
        tools: category.tools.filter(tool =>
            tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(category => category.tools.length > 0);

    return (
        <div className="min-h-screen w-full bg-void-black relative overflow-x-hidden selection:bg-accent/30 font-sans">
            {/* 1. Background Physics Layer */}
            <div className="fixed inset-0 pointer-events-none z-0">
                {/* Global Noise */}
                <div className="absolute inset-0 bg-noise-pattern opacity-5 mix-blend-overlay" />

                {/* Orbital Glows */}
                <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-purple-900/20 blur-[120px] rounded-full animate-pulse-slow" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-cyan-900/20 blur-[120px] rounded-full animate-pulse-slow delay-1000" />

                {/* Moving Gradient Mesh - REMOVED as per user request */}
                {/* <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" /> */}
            </div>

            {/* 2. Content Layer */}
            <div className="relative z-10 container mx-auto px-4 pt-32 pb-12 max-w-7xl">
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
                        <span className="text-white font-medium truncate max-w-[150px] sm:max-w-none">{title}</span>
                    </motion.div>

                    {/* Right: Back to Tools */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="self-end sm:self-auto"
                    >
                        <Link
                            to="/tools"
                            className="inline-flex items-center gap-3 text-muted-foreground hover:text-white transition-colors group"
                        >
                            <span className="text-sm font-medium">Back to Tools</span>
                            <div className="p-2 rounded-full bg-white/5 border border-white/10 group-hover:border-accent/50 transition-colors">
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                            </div>
                        </Link>
                    </motion.div>
                </div>

                {/* Hero Header */}
                <div className="text-center mb-12 space-y-6">
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

                    {/* Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="max-w-md mx-auto relative"
                    >
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <Input
                            placeholder="Search tools..."
                            className="pl-10 bg-white/5 border-white/10 focus:border-accent/50 transition-colors"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </motion.div>
                </div>

                {/* Categories & Tools Grid */}
                <div className="space-y-16">
                    {filteredCategories.length > 0 ? (
                        filteredCategories.map((category, catIndex) => (
                            <motion.div
                                key={category.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + (catIndex * 0.1) }}
                            >
                                <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                                    <div className="p-2 rounded-lg bg-accent/10 text-accent">
                                        <category.icon className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">{category.name}</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {category.tools.map((tool, toolIndex) => (
                                        <Link key={tool.id} to={tool.path}>
                                            <GlassPanel
                                                className="h-full p-6 hover:bg-white/5 transition-all duration-300 group cursor-pointer border-white/5 hover:border-accent/30"
                                                hoverEffect={true}
                                            >
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 group-hover:bg-accent/10 group-hover:border-accent/20 transition-colors">
                                                        <tool.icon className="w-6 h-6 text-white group-hover:text-accent transition-colors" />
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            toggleFavorite(tool.id);
                                                        }}
                                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors z-10"
                                                        aria-label={favorites.includes(tool.id) ? "Remove from favorites" : "Add to favorites"}
                                                    >
                                                        <Star
                                                            className={cn(
                                                                "w-4 h-4 transition-all",
                                                                favorites.includes(tool.id)
                                                                    ? "fill-yellow-400 text-yellow-400"
                                                                    : "text-white/40 hover:text-white/60"
                                                            )}
                                                        />
                                                    </button>
                                                </div>

                                                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-accent transition-colors">
                                                    {tool.name}
                                                </h3>
                                                <p className="text-sm text-muted-foreground group-hover:text-gray-300 transition-colors line-clamp-2">
                                                    {tool.description}
                                                </p>
                                            </GlassPanel>
                                        </Link>
                                    ))}
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-20">
                            <p className="text-muted-foreground">No tools found matching "{searchQuery}"</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ToolsDashboardLayout;
