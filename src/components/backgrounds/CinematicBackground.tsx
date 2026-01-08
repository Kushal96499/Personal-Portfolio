import React from 'react';

const CinematicBackground = () => {
    return (
        <div className="fixed inset-0 w-full h-full -z-50 bg-[#050505] overflow-hidden">
            {/* Noise Overlay */}
            <div
                className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }}
            />

            {/* Ambient Lighting - Top Left (Indigo) */}
            <div
                className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full mix-blend-screen opacity-20 animate-pulse-slow"
                style={{
                    background: 'radial-gradient(circle, rgba(79, 70, 229, 0.3) 0%, rgba(0, 0, 0, 0) 70%)',
                    filter: 'blur(120px)',
                }}
            />

            {/* Ambient Lighting - Bottom Right (Cyan) */}
            <div
                className="absolute -bottom-[20%] -right-[10%] w-[70vw] h-[70vw] rounded-full mix-blend-screen opacity-20 animate-pulse-slow"
                style={{
                    background: 'radial-gradient(circle, rgba(6, 182, 212, 0.3) 0%, rgba(0, 0, 0, 0) 70%)',
                    filter: 'blur(120px)',
                    animationDelay: '2s'
                }}
            />
        </div>
    );
};

export default CinematicBackground;
