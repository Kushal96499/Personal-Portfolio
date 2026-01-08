import React from 'react';
import CinematicBackground from './backgrounds/CinematicBackground';
import Navbar from './Navbar';
import MobileDock from './MobileDock';

interface PageWrapperProps {
    children: React.ReactNode;
    className?: string;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children, className = "" }) => {
    return (
        <div className={`min-h-screen relative overflow-x-hidden ${className}`}>
            {/* Global Background */}
            <CinematicBackground />

            {/* Desktop Navigation (Top Capsule) */}
            <div className="hidden md:block">
                <Navbar />
            </div>

            {/* Mobile Navigation (Bottom Dock) */}
            <MobileDock />

            {/* Main Content */}
            <main className="relative z-10">
                {children}
            </main>
        </div>
    );
};

export default PageWrapper;
