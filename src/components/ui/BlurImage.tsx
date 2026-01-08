import { useState } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface BlurImageProps extends HTMLMotionProps<"img"> {
    src: string;
    alt: string;
    className?: string;
}

export const BlurImage = ({ src, alt, className, ...props }: BlurImageProps) => {
    const [isLoading, setLoading] = useState(true);

    return (
        <div className={cn("relative overflow-hidden", className)}>
            <motion.img
                src={src}
                alt={alt}
                initial={{ filter: "blur(10px)", opacity: 0 }}
                animate={{
                    filter: isLoading ? "blur(10px)" : "blur(0px)",
                    opacity: isLoading ? 0 : 1,
                }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                onLoad={() => setLoading(false)}
                className={cn(
                    "h-full w-full object-cover",
                    isLoading ? "scale-110" : "scale-100",
                    className
                )}
                {...props}
            />
            {isLoading && (
                <div className="absolute inset-0 bg-white/5 animate-pulse" />
            )}
        </div>
    );
};
