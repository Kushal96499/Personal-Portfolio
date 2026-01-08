import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ShieldCheck,
    FileText,
    ArrowRight,
    Star,
    Hash,
    Link as LinkIcon,
    QrCode,
    Lightbulb,
    Wrench,
    Regex,
    FileJson,
    Palette,
    Image,
    Globe,
    Lock,
    Clock,
    Activity,
    Microscope,
    Briefcase
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/Footer";
import { useFavorites } from "@/hooks/useFavorites";
import MagneticButton from "@/components/ui/MagneticButton";
import { cn } from "@/lib/utils";

const toolCategories = [
    {
        id: 'cyber',
        name: 'Cyber Security',
        description: 'Advanced tools for hashing, password strength, and URL safety analysis.',
        icon: ShieldCheck,
        path: '/tools/cyber',
        category: 'Security',
        colSpan: "md:col-span-2 lg:col-span-2",
        gradient: "from-blue-500/20 to-purple-500/20"
    },
    {
        id: 'pdf',
        name: 'PDF Utilities',
        description: 'Comprehensive suite for merging, splitting, and converting PDF documents.',
        icon: FileText,
        path: '/tools/pdf',
        category: 'Productivity',
        colSpan: "md:col-span-1 lg:col-span-1",
        gradient: "from-emerald-500/20 to-teal-500/20"
    },
    {
        id: 'other',
        name: 'Developer Tools',
        description: 'Essential utilities for developers including regex testing and format conversion.',
        icon: Wrench,
        path: '/tools/other',
        category: 'Development',
        colSpan: "md:col-span-1 lg:col-span-2",
        gradient: "from-orange-500/20 to-red-500/20"
    },
    {
        id: 'business',
        name: 'Business & Finance',
        description: 'Smart tools for invoicing, loans, and everyday financial planning.',
        icon: Briefcase,
        path: '/tools/business',
        category: 'Finance',
        colSpan: "md:col-span-2 lg:col-span-1",
        gradient: "from-yellow-500/20 to-amber-500/20"
    }
];

import { allPdfTools } from "@/data/pdfTools";

const allTools = [
    { id: 'hash-generator', name: 'Hash Generator', description: 'Generate cryptographic hashes.', icon: Hash, path: '/tools/hash', category: 'Cyber' },
    { id: 'url-safety', name: 'URL Safety', description: 'Check if a URL is safe.', icon: LinkIcon, path: '/tools/url-safety', category: 'Cyber' },
    { id: 'attack-surface', name: 'Attack Surface', description: 'Analyze URL attack surface.', icon: Microscope, path: '/tools/attack-surface', category: 'Cyber' },
    { id: 'qr', name: 'QR Generator', description: 'Create QR codes instantly.', icon: QrCode, path: '/tools/qr', category: 'Other' },
    { id: 'cyber-tips', name: 'Cyber Tips', description: 'Security best practices.', icon: Lightbulb, path: '/tools/tips', category: 'Cyber' },
    { id: 'mini-tools', name: 'Mini Tools', description: 'Quick calculations and utilities.', icon: Wrench, path: '/tools/mini', category: 'Other' },
    { id: 'regex', name: 'Regex Tester', description: 'Test regular expressions.', icon: Regex, path: '/tools/regex-tester', category: 'Dev' },
    { id: 'markdown', name: 'Markdown Converter', description: 'Convert Markdown to HTML.', icon: FileJson, path: '/tools/markdown-converter', category: 'Dev' },
    { id: 'color', name: 'Color Tools', description: 'Palette generator and converter.', icon: Palette, path: '/tools/color-tools', category: 'Design' },
    { id: 'image-compressor', name: 'Image Compressor', description: 'Optimize images for web.', icon: Image, path: '/tools/image-compressor', category: 'Media' },
    { id: 'ip-address', name: 'IP Address', description: 'My IP information.', icon: Globe, path: '/tools/ip-address', category: 'Cyber' },
    { id: 'password-strength', name: 'Password Strength', description: 'Test password complexity.', icon: Lock, path: '/tools/password-strength', category: 'Cyber' },
    { id: 'time', name: 'Time & Date', description: 'Time zone converter.', icon: Clock, path: '/tools/time-date', category: 'Other' },
    { id: 'ping-tester', name: 'Network Ping', description: 'Test network latency.', icon: Activity, path: '/tools/ping', category: 'Cyber' },
    { id: 'invoice-generator', name: 'Invoice Generator', description: 'Create professional invoices.', icon: FileText, path: '/tools/business/invoice-generator', category: 'Business' },
    { id: 'gst-invoice-generator', name: 'GST Invoice Generator', description: 'India GST Invoicing.', icon: FileText, path: '/tools/business/gst-invoice-generator', category: 'Business' },
    { id: 'emi-calculator', name: 'EMI Calculator', description: 'Loan EMI calculator.', icon: Briefcase, path: '/tools/business/emi-calculator', category: 'Business' },
    { id: 'gst-calculator', name: 'GST Calculator', description: 'GST inclusive/exclusive calc.', icon: Briefcase, path: '/tools/business/gst-calculator', category: 'Business' },
    { id: 'expense-tracker', name: 'Expense Tracker', description: 'Track business expenses.', icon: Briefcase, path: '/tools/business/expense-tracker', category: 'Business' },
    ...allPdfTools
];

const ToolsOverview = () => {
    const { favorites, toggleFavorite } = useFavorites();
    const favoriteTools = allTools.filter(tool => favorites.includes(tool.id));

    return (
        <div className="text-white selection:bg-blue-500/30 min-h-screen flex flex-col">
            <main className="pt-40 pb-20 container mx-auto px-4 md:px-6 relative z-10 flex-grow">
                <div className="text-center mb-20 space-y-6">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-bold tracking-tighter"
                    >
                        The <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/60">Grid Armory</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-white/50 max-w-2xl mx-auto font-light"
                    >
                        A collection of powerful tools for developers and security professionals.
                    </motion.p>
                </div>

                {/* Masonry Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
                    {toolCategories.map((category, index) => (
                        <motion.div
                            key={category.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={cn("relative group", category.colSpan)}
                        >
                            <Link to={category.path} className="block h-full">
                                <div className="h-full bg-white/[0.03] backdrop-blur-[20px] border border-white/10 rounded-3xl p-8 hover:bg-white/[0.05] transition-all duration-500 relative overflow-hidden group-hover:scale-[1.02] group-hover:shadow-2xl group-hover:shadow-purple-500/10">
                                    {/* Hover Spotlight */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(600px_at_var(--mouse-x)_var(--mouse-y),rgba(255,255,255,0.06),transparent)] pointer-events-none" />

                                    {/* Gradient Blob */}
                                    <div className={cn("absolute -right-20 -top-20 w-64 h-64 rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity duration-500 bg-gradient-to-br", category.gradient)} />

                                    <div className="relative z-10 flex flex-col h-full justify-between">
                                        <div className="flex justify-between items-start mb-8">
                                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 group-hover:border-white/20 transition-colors">
                                                <category.icon size={32} className="text-white/80" strokeWidth={1.5} />
                                            </div>
                                            <Badge variant="outline" className="border-white/10 text-white/40 bg-white/5 px-3 py-1 uppercase tracking-wider text-xs font-medium">
                                                {category.category}
                                            </Badge>
                                        </div>

                                        <div>
                                            <h3 className="text-3xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                                                {category.name}
                                            </h3>
                                            <p className="text-white/60 font-light leading-relaxed">
                                                {category.description}
                                            </p>
                                        </div>

                                        <div className="mt-8 flex items-center text-sm font-medium text-white/40 group-hover:text-white transition-colors">
                                            Explore <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Favorite Tools Section */}
                <div className="mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex items-center justify-between mb-8"
                    >
                        <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                            <Star className="fill-yellow-400 text-yellow-400" size={24} />
                            Favorites
                        </h2>
                    </motion.div>

                    {favoriteTools.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="text-center py-20 bg-white/[0.02] rounded-3xl border border-white/5 border-dashed"
                        >
                            <p className="text-white/40 text-lg font-light">
                                Star your most used tools to access them quickly here.
                            </p>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {favoriteTools.map((tool, index) => (
                                <motion.div
                                    key={tool.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 + index * 0.05 }}
                                >
                                    <Link to={tool.path} className="block h-full">
                                        <div className="h-full bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/[0.08] transition-all duration-300 group relative">
                                            <div className="flex justify-between items-start mb-4">
                                                <tool.icon size={24} className="text-white/70 group-hover:text-blue-400 transition-colors" strokeWidth={1.5} />
                                                <MagneticButton
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10 rounded-full"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        toggleFavorite(tool.id);
                                                    }}
                                                >
                                                    <Star className="w-4 h-4 fill-yellow-400" />
                                                </MagneticButton>
                                            </div>
                                            <h4 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                                                {tool.name}
                                            </h4>
                                            <p className="text-sm text-white/50 line-clamp-2 font-light">
                                                {tool.description}
                                            </p>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ToolsOverview;
