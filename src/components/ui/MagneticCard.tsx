import { useRef, useState } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface MagneticCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
}

const MagneticCard = ({ children, className, ...props }: MagneticCardProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;

        const { left, top, width, height } = ref.current.getBoundingClientRect();
        const x = (e.clientX - left - width / 2) / 25; // Sensitivity
        const y = (e.clientY - top - height / 2) / 25;

        setPosition({ x, y });
    };

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => {
        setIsHovered(false);
        setPosition({ x: 0, y: 0 });
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            animate={{
                rotateX: isHovered ? -position.y : 0,
                rotateY: isHovered ? position.x : 0,
                scale: isHovered ? 1.02 : 1,
            }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
            className={cn(
                "relative rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-lg shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] overflow-hidden transition-colors duration-300 hover:border-purple-500/50",
                className
            )}
            style={{
                transformStyle: "preserve-3d",
                perspective: "1000px",
            }}
            {...props}
        >
            {/* Hover Glow */}
            <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-500"
                style={{
                    opacity: isHovered ? 1 : 0,
                    background: "radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(76, 140, 255, 0.15), transparent 40%)"
                }}
            />

            <div style={{ transform: "translateZ(20px)" }}>
                {children}
            </div>
        </motion.div>
    );
};

export default MagneticCard;
