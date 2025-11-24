import { useEffect } from 'react';
import { motion } from 'framer-motion';

interface RGBGlowProps {
    onComplete?: () => void;
}

const RGBGlow = ({ onComplete }: RGBGlowProps) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete?.();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{
                opacity: [0, 1, 1, 0],
                boxShadow: [
                    'inset 0 0 80px 10px rgba(255, 0, 0, 0.5)',
                    'inset 0 0 80px 10px rgba(0, 255, 0, 0.5)',
                    'inset 0 0 80px 10px rgba(0, 0, 255, 0.5)',
                    'inset 0 0 80px 10px rgba(255, 0, 0, 0.5)',
                ]
            }}
            transition={{
                duration: 3,
                times: [0, 0.33, 0.66, 1],
                ease: 'linear'
            }}
            className="fixed inset-0 pointer-events-none z-[9999]"
        />
    );
};

export default RGBGlow;
