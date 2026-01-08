import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

// Mock Data
const projects = [
    { id: 1, title: "Project Alpha", category: "Web3", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" },
    { id: 2, title: "Neon Horizon", category: "WebGL", image: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2670&auto=format&fit=crop" },
    { id: 3, title: "Cyber Deck", category: "App", image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2670&auto=format&fit=crop" },
    { id: 4, title: "Void Walker", category: "Game", image: "https://images.unsplash.com/photo-1515630278258-407f66498911?q=80&w=2698&auto=format&fit=crop" },
];

const WorkSection = () => {
    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
    });

    const x = useTransform(scrollYProgress, [0, 1], ["1%", "-95%"]);

    return (
        <section ref={targetRef} className="relative h-[300vh] bg-neutral-900/50">
            <div className="sticky top-0 flex h-screen items-center overflow-hidden">
                <motion.div style={{ x }} className="flex gap-20 px-20">
                    {/* Title Card */}
                    <div className="flex flex-col justify-center min-w-[400px]">
                        <h2 className="text-8xl font-bold text-white/10 font-heading">SELECTED<br />WORKS</h2>
                        <p className="text-white/40 mt-4 max-w-xs">A collection of digital experiences crafted with precision and passion.</p>
                    </div>

                    {projects.map((project) => (
                        <div key={project.id} className="group relative h-[60vh] w-[40vw] min-w-[400px] overflow-hidden rounded-2xl bg-neutral-800">
                            <motion.div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                style={{ backgroundImage: `url(${project.image})` }}
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />

                            {/* Glass Distortion Overlay (Simulated with backdrop-filter) */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 backdrop-blur-[2px]" />

                            <div className="absolute bottom-0 left-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                <span className="text-accent text-sm uppercase tracking-widest">{project.category}</span>
                                <h3 className="text-4xl font-bold text-white mt-2">{project.title}</h3>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default WorkSection;
