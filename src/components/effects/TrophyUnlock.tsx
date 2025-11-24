import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TrophyUnlockProps {
    eggName: string;
    onComplete?: () => void;
}

const TrophyUnlock = ({ eggName, onComplete }: TrophyUnlockProps) => {
    useEffect(() => {
        // Confetti burst
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FFD700', '#FFA500', '#FF6347']
        });

        const timer = setTimeout(() => {
            onComplete?.();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1] }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
        >
            <div className="glass p-8 rounded-2xl border-2 border-yellow-500/50 shadow-[0_0_30px_rgba(255,215,0,0.5)]">
                <motion.div
                    animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-4" />
                </motion.div>
                <h2 className="text-2xl font-orbitron font-bold text-gradient text-center">
                    Achievement Unlocked!
                </h2>
                <p className="text-primary text-center mt-2">{eggName}</p>
            </div>
        </motion.div>
    );
};

export default TrophyUnlock;
