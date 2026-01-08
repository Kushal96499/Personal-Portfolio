import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface UnderlineInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    containerClassName?: string;
}

const UnderlineInput = React.forwardRef<HTMLInputElement, UnderlineInputProps>(
    ({ className, containerClassName, ...props }, ref) => {
        const [isFocused, setIsFocused] = useState(false);

        return (
            <div className={cn("relative", containerClassName)}>
                <Input
                    ref={ref}
                    className={cn(
                        "border-0 border-b border-white/20 rounded-none px-0 focus-visible:ring-0 focus-visible:border-transparent bg-transparent transition-colors placeholder:text-white/30",
                        className
                    )}
                    onFocus={(e) => {
                        setIsFocused(true);
                        props.onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setIsFocused(false);
                        props.onBlur?.(e);
                    }}
                    {...props}
                />
                <div
                    className={cn(
                        "absolute bottom-0 left-0 h-[1px] bg-blue-500 transition-all duration-300 ease-out",
                        isFocused ? "w-full" : "w-0"
                    )}
                />
            </div>
        );
    }
);

UnderlineInput.displayName = "UnderlineInput";

export default UnderlineInput;
