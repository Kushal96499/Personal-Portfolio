import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface HackerMessageProps {
    title: string;
    message: string;
    onComplete?: () => void;
}

const HackerMessage = ({ title, message, onComplete }: HackerMessageProps) => {
    const [displayedText, setDisplayedText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showCursor, setShowCursor] = useState(true);

    // Typing animation
    useEffect(() => {
        if (currentIndex < message.length) {
            const timeout = setTimeout(() => {
                setDisplayedText(prev => prev + message[currentIndex]);
                setCurrentIndex(prev => prev + 1);
            }, 50); // 50ms per character for typing effect

            return () => clearTimeout(timeout);
        } else {
            // Auto-close after message is fully typed
            const closeTimeout = setTimeout(() => {
                onComplete?.();
            }, 3000);

            return () => clearTimeout(closeTimeout);
        }
    }, [currentIndex, message, onComplete]);

    // Blinking cursor
    useEffect(() => {
        const interval = setInterval(() => {
            setShowCursor(prev => !prev);
        }, 500);

        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm"
            onClick={onComplete}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative w-full max-w-2xl mx-4"
            >
                {/* Terminal Window */}
                <div className="bg-black border-2 border-[#00ff41] rounded-lg shadow-[0_0_30px_rgba(0,255,65,0.3)] overflow-hidden">
                    {/* Terminal Header */}
                    <div className="bg-[#001a0d] border-b-2 border-[#00ff41] px-4 py-2 flex items-center gap-2">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <div className="flex-1 text-center">
                            <span className="text-[#00ff41] font-mono text-sm font-bold">
                                SYSTEM_ACCESS_GRANTED.exe
                            </span>
                        </div>
                    </div>

                    {/* Terminal Body */}
                    <div className="relative bg-black p-6 font-mono text-[#00ff41] min-h-[300px]">
                        {/* Scanline effect */}
                        <motion.div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                background: 'repeating-linear-gradient(0deg, rgba(0, 255, 65, 0.03) 0px, rgba(0, 255, 65, 0.03) 1px, transparent 1px, transparent 2px)',
                            }}
                            animate={{
                                opacity: [0.3, 0.5, 0.3],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />

                        {/* CRT flicker effect */}
                        <motion.div
                            className="absolute inset-0 pointer-events-none bg-[#00ff41]/5"
                            animate={{
                                opacity: [0, 0.1, 0],
                            }}
                            transition={{ duration: 0.1, repeat: Infinity, repeatDelay: 3 }}
                        />

                        <div className="relative z-10 space-y-3">
                            {/* Boot sequence */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="text-[#00ff41]/60 text-xs mb-2">
                                    [ROOT@SYSTEM] Initializing brute force attack...
                                </div>
                                <div className="text-[#00ff41]/60 text-xs mb-2">
                                    [ROOT@SYSTEM] Bypassing mainframe security... SUCCESS
                                </div>
                                <div className="text-[#00ff41]/60 text-xs mb-4">
                                    [ROOT@SYSTEM] Admin privileges acquired.
                                </div>
                            </motion.div>

                            {/* Title with glitch */}
                            <motion.div
                                className="text-xl font-bold mb-4"
                                animate={{
                                    textShadow: [
                                        '0 0 10px rgba(0, 255, 65, 0.8)',
                                        '0 0 20px rgba(0, 255, 65, 0.8)',
                                        '0 0 10px rgba(0, 255, 65, 0.8)',
                                    ],
                                }}
                                transition={{ duration: 1, repeat: Infinity }}
                            >
                                <span className="text-[#00ff41]">{'>'}</span> {title}
                            </motion.div>

                            {/* Typed message */}
                            <div className="text-base leading-relaxed">
                                <span className="text-[#00ff41]/80">{'>'}</span>{' '}
                                <span className="text-[#00ff41]">
                                    {displayedText}
                                    {showCursor && currentIndex < message.length && (
                                        <span className="inline-block w-2 h-4 bg-[#00ff41] ml-1 animate-pulse"></span>
                                    )}
                                </span>
                            </div>

                            {/* Status indicator */}
                            {currentIndex >= message.length && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mt-6 pt-4 border-t border-[#00ff41]/20"
                                >
                                    <div className="flex items-center gap-2 text-xs text-[#00ff41]/60">
                                        <motion.span
                                            animate={{ opacity: [0.5, 1, 0.5] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                        >
                                            ●
                                        </motion.span>
                                        <span>Click anywhere to close terminal</span>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Matrix-style rain effect in background */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
                            {[...Array(10)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute text-[#00ff41] text-xs font-mono"
                                    style={{
                                        left: `${i * 10}%`,
                                        top: '-20px',
                                    }}
                                    animate={{
                                        y: ['0vh', '100vh'],
                                    }}
                                    transition={{
                                        duration: 3 + Math.random() * 2,
                                        repeat: Infinity,
                                        delay: Math.random() * 2,
                                    }}
                                >
                                    {String.fromCharCode(33 + Math.random() * 94)}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Outer glow */}
                <div className="absolute inset-0 -z-10 blur-xl bg-[#00ff41]/20 rounded-lg"></div>
            </motion.div>
        </motion.div>
    );
};

export default HackerMessage;
