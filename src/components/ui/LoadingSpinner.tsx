import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
    className?: string;
    size?: number;
}

const LoadingSpinner = ({ className, size = 32 }: LoadingSpinnerProps) => {
    return (
        <div className="flex flex-col items-center justify-center gap-4 min-h-[50vh]">
            <div className="relative">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
                <Loader2
                    className={cn("text-blue-500 animate-spin", className)}
                    size={size}
                />
            </div>
            <p className="text-white/50 text-sm font-light tracking-wider animate-pulse">
                Loading...
            </p>
        </div>
    );
};

export default LoadingSpinner;
