import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const experiences = [
    { id: 1, year: "2024", role: "Senior Creative Dev", company: "Agency X", description: "Leading the next gen of web experiences." },
    { id: 2, year: "2022", role: "WebGL Specialist", company: "Studio Y", description: "Building immersive 3D worlds for brands." },
    { id: 3, year: "2020", role: "Frontend Developer", company: "Tech Z", description: "Crafting pixel-perfect UIs." },
];

const ExperienceSection = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start center", "end center"]
    });

    return (
        <section ref={containerRef} className="relative min-h-screen py-20 px-4 md:px-20 flex flex-col items-center">
            <h2 className="text-6xl font-bold text-white mb-20 font-heading">EXPERIENCE</h2>

            <div className="relative w-full max-w-4xl">
                {/* Laser Line */}
                <motion.div
                    className="absolute left-[19px] md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-accent to-transparent shadow-[0_0_15px_rgba(76,140,255,0.8)]"
                    style={{ scaleY: scrollYProgress, originY: 0 }}
                />

                {/* Background Line */}
                <div className="absolute left-[19px] md:left-1/2 top-0 bottom-0 w-0.5 bg-white/5" />

                <div className="space-y-20">
                    {experiences.map((exp, index) => (
                        <div key={exp.id} className={`relative flex flex-col md:flex-row gap-8 md:gap-0 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>

                            {/* Node */}
                            <div className="absolute left-[11px] md:left-1/2 -translate-x-0 md:-translate-x-1/2 w-4 h-4 rounded-full bg-neutral-900 border border-white/20 z-10 group">
                                <motion.div
                                    className="w-full h-full rounded-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_10px_#4C8CFF]"
                                    whileInView={{ opacity: [0, 1, 0.5] }}
                                    viewport={{ margin: "-20% 0px -20% 0px" }}
                                />
                            </div>

                            {/* Content */}
                            <div className="md:w-1/2 pl-12 md:pl-0 md:px-12">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    className={`p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-accent/50 transition-colors duration-300 ${index % 2 === 0 ? 'md:text-left' : 'md:text-right'}`}
                                >
                                    <span className="text-accent font-mono text-sm">{exp.year}</span>
                                    <h3 className="text-2xl font-bold text-white mt-1">{exp.role}</h3>
                                    <h4 className="text-white/60 mb-4">{exp.company}</h4>
                                    <p className="text-white/40 text-sm">{exp.description}</p>
                                </motion.div>
                            </div>

                            {/* Spacer for opposite side */}
                            <div className="md:w-1/2" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ExperienceSection;
