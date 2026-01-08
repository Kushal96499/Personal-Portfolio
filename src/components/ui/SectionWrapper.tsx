import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionWrapperProps extends React.HTMLAttributes<HTMLElement> {
    children: React.ReactNode;
    className?: string;
    id?: string;
}

const SectionWrapper = ({ children, className, id, ...props }: SectionWrapperProps) => {
    return (
        <section
            id={id}
            className={cn("relative py-20 md:py-32 overflow-hidden", className)}
            {...props}
        >
            {/* Section Divider Gradient */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />

            <motion.div
                initial={{ opacity: 0, y: 50, filter: "blur(10px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="container mx-auto px-6 relative z-10"
            >
                {children}
            </motion.div>
        </section>
    );
};

export default SectionWrapper;
