import { useEffect } from 'react';
import { motion } from 'framer-motion';

interface GlitchEffectProps {
    onComplete?: () => void;
}

const GlitchEffect = ({ onComplete }: GlitchEffectProps) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete?.();
        }, 2000);

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <>
            {/* RGB Split Effect */}
            <motion.div
                className="fixed inset-0 z-[9999] pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{
                    opacity: [0, 1, 0, 1, 0, 1, 0],
                    x: [0, -5, 5, -3, 3, -2, 0],
                }}
                transition={{ duration: 2, times: [0, 0.1, 0.2, 0.4, 0.6, 0.8, 1] }}
                style={{
                    mixBlendMode: 'screen',
                    background: 'linear-gradient(90deg, rgba(255,0,0,0.3) 0%, transparent 50%, rgba(0,255,255,0.3) 100%)',
                }}
            />

            {/* Scanlines */}
            <motion.div
                className="fixed inset-0 z-[9998] pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.3, 0] }}
                transition={{ duration: 2 }}
                style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, transparent 2px, transparent 4px)',
                }}
            />

            {/* Screen Distortion */}
            <motion.div
                className="fixed inset-0 z-[9997] pointer-events-none"
                animate={{
                    scaleX: [1, 1.01, 0.99, 1.02, 0.98, 1],
                    scaleY: [1, 0.99, 1.01, 0.98, 1.02, 1],
                }}
                transition={{ duration: 2, times: [0, 0.2, 0.4, 0.6, 0.8, 1] }}
            />
        </>
    );
};

export default GlitchEffect;
