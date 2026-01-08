import React, { useCallback } from 'react';
import { useDropzone, DropzoneOptions } from 'react-dropzone';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface IngestionZoneProps {
    onDrop: (files: File[]) => void;
    accept?: DropzoneOptions['accept'];
    multiple?: boolean;
    files?: File[];
    className?: string;
    variant?: 'default' | 'compact';
}

const IngestionZone: React.FC<IngestionZoneProps> = ({
    onDrop,
    accept,
    multiple = false,
    files = [],
    className,
    variant = 'default'
}) => {
    const handleDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles?.length > 0) {
            onDrop(acceptedFiles);
        }
    }, [onDrop]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: handleDrop,
        accept,
        multiple
    });

    if (variant === 'compact') {
        return (
            <div
                {...getRootProps()}
                className={cn(
                    "cursor-pointer rounded-lg border border-dashed transition-all duration-200 flex items-center justify-center gap-3",
                    isDragActive ? "border-blue-500 bg-blue-500/10" : "border-white/10 hover:border-white/20 hover:bg-white/5",
                    className
                )}
            >
                <input {...getInputProps()} />
                <UploadCloud className={cn("w-5 h-5", isDragActive ? "text-blue-400" : "text-gray-400")} />
                <span className="text-sm text-gray-400 font-medium">
                    {isDragActive ? "Drop files here" : "Add more files"}
                </span>
            </div>
        );
    }

    return (
        <div
            {...getRootProps()}
            className={cn(
                "relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-300 overflow-hidden group",
                isDragActive
                    ? "border-blue-500 bg-blue-500/5 scale-[1.01] shadow-2xl shadow-blue-500/10"
                    : "border-white/10 hover:border-white/20 hover:bg-white/5",
                className
            )}
        >
            <input {...getInputProps()} />

            {/* Background Gradient Animation */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10 flex flex-col items-center justify-center h-full p-6 text-center space-y-4">
                <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg",
                    isDragActive ? "bg-blue-500 text-white scale-110 rotate-3" : "bg-[#1A1A1A] text-gray-400 group-hover:text-white group-hover:scale-105"
                )}>
                    <UploadCloud className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                    <p className="text-lg font-semibold text-white">
                        {isDragActive ? "Drop your files here" : "Click or drag files to upload"}
                    </p>
                    <p className="text-sm text-gray-500 max-w-xs mx-auto">
                        {multiple ? "Upload multiple files" : "Upload a single file"} to start processing
                    </p>
                </div>

                {/* File Type Badges (Optional visualization) */}
                {accept && (
                    <div className="flex gap-2 justify-center flex-wrap opacity-50">
                        {Object.keys(accept).map((mime) => (
                            <span key={mime} className="text-[10px] uppercase px-2 py-1 rounded bg-white/5 border border-white/5">
                                {accept[mime].join(', ').replace(/\./g, '')}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default IngestionZone;
