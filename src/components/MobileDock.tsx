import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Briefcase, Terminal, Mail, Grid, Wrench } from 'lucide-react';
import NavDrawer from './NavDrawer';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const MobileDock = () => {
    const location = useLocation();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const navItems = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Briefcase, label: 'Work', path: '/#projects' },
        { icon: Wrench, label: 'Tools', path: '/tools' },
        { icon: Mail, label: 'Contact', path: '/#contact' },
    ];

    return (
        <>
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 md:hidden w-auto">
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="flex items-center gap-1 px-2 py-2 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-full shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)] ring-1 ring-white/5"
                >
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path || location.hash === item.path.substring(1);
                        return (
                            <Link
                                key={item.label}
                                to={item.path}
                                className="relative group"
                            >
                                <div className={cn(
                                    "p-3 rounded-full transition-all duration-300 flex items-center justify-center relative overflow-hidden",
                                    isActive ? "bg-white/10 text-white" : "text-white/40 hover:text-white hover:bg-white/5"
                                )}>
                                    <item.icon
                                        className="w-5 h-5 relative z-10"
                                        strokeWidth={2}
                                    />
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-white/10 rounded-full"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </div>
                            </Link>
                        );
                    })}

                    <div className="w-px h-6 bg-white/10 mx-1" />

                    {/* Magic Button (Drawer Trigger) */}
                    <button
                        onClick={() => setIsDrawerOpen(true)}
                        className={cn(
                            "p-3 rounded-full transition-all duration-300 flex items-center justify-center relative group",
                            isDrawerOpen ? "bg-white text-black" : "text-white/40 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <Grid
                            className="w-5 h-5 relative z-10"
                            strokeWidth={2}
                        />
                    </button>
                </motion.div>
            </div>

            <NavDrawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />
        </>
    );
};

export default MobileDock;
