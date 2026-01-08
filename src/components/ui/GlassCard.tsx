import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
}

const GlassCard = ({ children, className, hoverEffect = true, ...props }: GlassCardProps) => {
    return (
        <motion.div
            className={cn(
                "relative overflow-hidden rounded-2xl border border-white/[0.1] bg-white/[0.04] backdrop-blur-[14px] shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-all duration-300",
                hoverEffect && "hover:-translate-y-1.5 hover:scale-[1.02] hover:border-white/[0.2] hover:shadow-[0_30px_60px_rgba(0,0,0,0.6)]",
                className
            )}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            style={{
                boxShadow: "0 20px 40px rgba(0,0,0,0.5), inset 0 0 0 0.5px rgba(255,255,255,0.15)",
            }}
            {...props}
        >
            {/* Inner Glow Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
};

export default GlassCard;
