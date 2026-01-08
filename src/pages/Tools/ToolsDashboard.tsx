import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FileText, Image as ImageIcon, FileSpreadsheet, Presentation, Code, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import '@/styles/antiGravity.css';

const tools = [
    {
        id: 'word-to-pdf',
        title: 'Word to PDF',
        description: 'Convert DOCX to professional PDF documents.',
        icon: FileText,
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        link: '/tools/pdf/word-to-pdf'
    },
    {
        id: 'image-to-pdf',
        title: 'Image to PDF',
        description: 'Transform photos into a single PDF file.',
        icon: ImageIcon,
        color: 'text-purple-400',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
        link: '/tools/pdf/image-to-pdf'
    },
    {
        id: 'excel-to-pdf',
        title: 'Excel to PDF',
        description: 'Convert spreadsheets to PDF tables.',
        icon: FileSpreadsheet,
        color: 'text-green-400',
        bg: 'bg-green-500/10',
        border: 'border-green-500/20',
        link: '/tools/pdf/excel-to-pdf'
    },
    {
        id: 'ppt-to-pdf',
        title: 'PowerPoint to PDF',
        description: 'Slides to PDF with perfect layout.',
        icon: Presentation,
        color: 'text-orange-400',
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/20',
        link: '/tools/pdf/powerpoint-to-pdf'
    },
    {
        id: 'html-to-pdf',
        title: 'HTML to PDF',
        description: 'Web pages and code to PDF.',
        icon: Code,
        color: 'text-pink-400',
        bg: 'bg-pink-500/10',
        border: 'border-pink-500/20',
        link: '/tools/pdf/html-to-pdf'
    }
];

const ToolCard = ({ tool, index }: { tool: typeof tools[0], index: number }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const rotateX = useTransform(y, [-100, 100], [10, -10]);
    const rotateY = useTransform(x, [-100, 100], [-10, 10]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set(e.clientX - centerX);
        y.set(e.clientY - centerY);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <Link to={tool.link}>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                style={{ rotateX, rotateY, perspective: 1000 }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className={cn(
                    "relative w-[300px] h-[400px] flex-shrink-0 rounded-3xl p-8 flex flex-col justify-between cursor-pointer group",
                    "bg-black/40 backdrop-blur-xl border border-white/10",
                    "hover:border-white/20 transition-colors duration-300",
                    "ag-glass-card"
                )}
            >
                {/* Glow Effect */}
                <div className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl blur-2xl -z-10",
                    tool.bg
                )} />

                <div className="space-y-6">
                    <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center border backdrop-blur-md",
                        tool.bg, tool.border
                    )}>
                        <tool.icon className={cn("w-8 h-8", tool.color)} />
                    </div>

                    <div>
                        <h3 className="text-2xl font-bold text-white mb-2 ag-text-glow">{tool.title}</h3>
                        <p className="text-white/50 leading-relaxed">{tool.description}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-sm font-medium text-white/70 group-hover:text-white transition-colors">
                    <span>Launch Tool</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
            </motion.div>
        </Link>
    );
};

const ToolsDashboard = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollXProgress } = useScroll({ container: containerRef });
    const scaleX = useSpring(scrollXProgress, { stiffness: 100, damping: 30 });

    return (
        <div className="min-h-screen bg-void-black ag-background overflow-hidden flex flex-col">
            {/* Header */}
            <header className="pt-24 px-8 md:px-16 z-10">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl md:text-7xl font-bold text-white mb-6 ag-text-glow"
                >
                    PDF Tools
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl text-white/50 max-w-xl"
                >
                    Professional grade conversion tools. 100% Client-side. Secure, fast, and beautiful.
                </motion.p>
            </header>

            {/* Horizontal Scroll Area */}
            <div className="flex-1 flex items-center relative">
                {/* Scroll Progress Line */}
                <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/5 -z-10" />
                <motion.div
                    style={{ scaleX }}
                    className="absolute top-1/2 left-0 right-0 h-[1px] bg-blue-500/50 origin-left -z-10"
                />

                <div
                    ref={containerRef}
                    className="w-full overflow-x-auto flex items-center gap-8 px-8 md:px-16 py-12 scrollbar-none snap-x snap-mandatory"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {tools.map((tool, index) => (
                        <div key={tool.id} className="snap-center">
                            <ToolCard tool={tool} index={index} />
                        </div>
                    ))}

                    {/* Spacer for end of scroll */}
                    <div className="w-8 flex-shrink-0" />
                </div>
            </div>

            {/* Background Elements */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[60vw] h-[60vw] bg-blue-900/10 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[60vw] h-[60vw] bg-purple-900/10 blur-[150px] rounded-full" />
            </div>
        </div>
    );
};

export default ToolsDashboard;
