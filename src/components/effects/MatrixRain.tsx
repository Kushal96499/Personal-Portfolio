import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MatrixRainProps {
    onComplete?: () => void;
}

const MatrixRain = ({ onComplete }: MatrixRainProps) => {
    const [columns, setColumns] = useState<number[]>([]);

    useEffect(() => {
        const columnCount = Math.floor(window.innerWidth / 20);
        setColumns(Array.from({ length: columnCount }, (_, i) => i));

        const timer = setTimeout(() => {
            onComplete?.();
        }, 5000);

        return () => clearTimeout(timer);
    }, [onComplete]);

    const characters = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 z-[9999] overflow-hidden pointer-events-none"
            >
                {columns.map((col) => (
                    <motion.div
                        key={col}
                        className="absolute top-0 text-green-500 font-mono text-sm"
                        style={{ left: `${col * 20}px` }}
                        initial={{ y: -100 }}
                        animate={{ y: window.innerHeight + 100 }}
                        transition={{
                            duration: Math.random() * 3 + 2,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                            ease: 'linear'
                        }}
                    >
                        {Array.from({ length: 20 }, () =>
                            characters[Math.floor(Math.random() * characters.length)]
                        ).map((char, i) => (
                            <div key={i} style={{ opacity: 1 - (i * 0.05) }}>
                                {char}
                            </div>
                        ))}
                    </motion.div>
                ))}
            </motion.div>
        </AnimatePresence>
    );
};

export default MatrixRain;
