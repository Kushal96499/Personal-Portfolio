import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';

const useDecoder = (text: string, speed: number = 50) => {
    const [displayText, setDisplayText] = useState('');

    useEffect(() => {
        let iteration = 0;
        let interval: NodeJS.Timeout;

        const startDecoding = () => {
            interval = setInterval(() => {
                setDisplayText(
                    text
                        .split('')
                        .map((letter, index) => {
                            if (index < iteration) {
                                return text[index];
                            }
                            return characters[Math.floor(Math.random() * characters.length)];
                        })
                        .join('')
                );

                if (iteration >= text.length) {
                    clearInterval(interval);
                }

                iteration += 1 / 3;
            }, speed);
        };

        // Delay start slightly
        const timeout = setTimeout(startDecoding, 500);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [text, speed]);

    return displayText;
};

const HeroSection = () => {
    const name = useDecoder("YOUR NAME"); // Replace with actual name or dynamic prop
    const role = useDecoder("CREATIVE TECHNOLOGIST");

    return (
        <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden z-10">
            {/* Content */}
            <div className="text-center z-20 mix-blend-difference">
                <h1 className="text-6xl md:text-9xl font-bold tracking-tighter text-white mb-4 font-heading">
                    {name}
                </h1>
                <p className="text-xl md:text-2xl text-white/60 tracking-[0.5em] font-light">
                    {role}
                </p>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                className="absolute bottom-12 flex flex-col items-center gap-2 text-white/40 mix-blend-difference cursor-pointer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 1 }}
                whileHover={{ scale: 1.1, color: "white" }}
            >
                <span className="text-xs uppercase tracking-widest">Initiate</span>
                <ArrowDown className="w-4 h-4 animate-bounce" />
            </motion.div>
        </section>
    );
};

export default HeroSection;
