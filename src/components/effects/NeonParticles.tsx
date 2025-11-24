import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface NeonParticlesProps {
    onComplete?: () => void;
}

const NeonParticles = ({ onComplete }: NeonParticlesProps) => {
    useEffect(() => {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

        function randomInRange(min: number, max: number) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                clearInterval(interval);
                onComplete?.();
                return;
            }

            const particleCount = 50 * (timeLeft / duration);

            // Neon cyan particles
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
                colors: ['#00EAFF', '#0FF', '#00D4FF']
            });

            // Neon magenta particles
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
                colors: ['#FF00EA', '#F0F', '#FF00D4']
            });
        }, 250);

        return () => clearInterval(interval);
    }, [onComplete]);

    return null;
};

export default NeonParticles;
