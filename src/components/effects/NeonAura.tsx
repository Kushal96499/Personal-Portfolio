import { useEffect } from 'react';
import { motion } from 'framer-motion';

interface NeonAuraProps {
    onComplete?: () => void;
}

const NeonAura = ({ onComplete }: NeonAuraProps) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete?.();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: 3, times: [0, 0.1, 0.9, 1] }}
            className="fixed inset-0 pointer-events-none z-[9999]"
            style={{
                boxShadow: 'inset 0 0 100px 20px rgba(0, 234, 255, 0.5), inset 0 0 200px 40px rgba(255, 0, 234, 0.3)',
                background: 'radial-gradient(circle at center, transparent 60%, rgba(0, 234, 255, 0.1) 100%)',
            }}
        />
    );
};

export default NeonAura;
