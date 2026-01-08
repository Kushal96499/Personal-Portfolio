import { useState, useRef, useEffect, useCallback } from "react";
import {
    Upload, Download, Image as ImageIcon, RefreshCw, Settings,
    ArrowRight, Trash2, Layers, MoveHorizontal, ZoomIn, ZoomOut,
    Maximize2, Grid, Columns, FileImage, X, Check, Info, Sparkles,
    Zap, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import JSZip from "jszip";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---
interface ProcessedImage {
    id: string;
    file: File;
    originalPreview: string;
    compressedPreview: string | null;
    originalSize: number;
    compressedSize: number;
    status: "pending" | "processing" | "done" | "error";
}

type ViewMode = "preview" | "split" | "side-by-side";

const ImageCompressor = () => {
    // --- State ---
    const [images, setImages] = useState<ProcessedImage[]>([]);
    const [quality, setQuality] = useState(80);
    const [format, setFormat] = useState<"image/jpeg" | "image/png" | "image/webp" | "image/avif">("image/webp");
    const [resizeWidth, setResizeWidth] = useState<number | "">("");
    const [keepExif, setKeepExif] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>("split");
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // --- Derived State ---
    const selectedImage = images.find(img => img.id === selectedImageId);
    const totalOriginalSize = images.reduce((acc, img) => acc + img.originalSize, 0);
    const totalCompressedSize = images.reduce((acc, img) => acc + (img.compressedSize || 0), 0);
    const totalSavings = totalOriginalSize > 0 && totalCompressedSize > 0
        ? ((1 - totalCompressedSize / totalOriginalSize) * 100).toFixed(1)
        : "0";

    // --- File Handling ---
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) addFiles(Array.from(e.target.files));
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files) addFiles(Array.from(e.dataTransfer.files));
    };

    const addFiles = (files: File[]) => {
        const newImages = files
            .filter(file => file.type.startsWith("image/"))
            .map(file => ({
                id: Math.random().toString(36).substr(2, 9),
                file,
                originalPreview: URL.createObjectURL(file),
                compressedPreview: null,
                originalSize: file.size,
                compressedSize: 0,
                status: "pending" as const
            }));

        setImages(prev => [...prev, ...newImages]);
        if (!selectedImageId && newImages.length > 0) {
            setSelectedImageId(newImages[0].id);
        }
    };

    const removeImage = (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setImages(prev => prev.filter(img => img.id !== id));
        if (selectedImageId === id) setSelectedImageId(null);
    };

    // --- Compression Logic ---
    const compressSingle = async (image: ProcessedImage) => {
        return new Promise<ProcessedImage>((resolve) => {
            const img = new Image();
            img.src = image.originalPreview;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;

                if (resizeWidth && typeof resizeWidth === "number" && resizeWidth < width) {
                    const ratio = height / width;
                    width = resizeWidth;
                    height = width * ratio;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");

                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    const compressedDataUrl = canvas.toDataURL(format, quality / 100);
                    const head = "data:" + format + ";base64,";
                    const size = Math.round((compressedDataUrl.length - head.length) * 3 / 4);

                    resolve({
                        ...image,
                        compressedPreview: compressedDataUrl,
                        compressedSize: size,
                        status: "done"
                    });
                } else {
                    resolve({ ...image, status: "error" });
                }
            };
            img.onerror = () => resolve({ ...image, status: "error" });
        });
    };

    const processAll = async () => {
        if (images.length === 0) return;
        setIsProcessing(true);
        const processed = await Promise.all(images.map(img => compressSingle(img)));
        setImages(processed);
        setIsProcessing(false);
        toast.success(`Compressed ${images.length} images!`);
    };

    // --- Download Logic ---
    const downloadAllZip = async () => {
        const zip = new JSZip();
        const ext = format.split("/")[1];

        images.forEach(img => {
            if (img.compressedPreview) {
                const data = img.compressedPreview.split(',')[1];
                zip.file(`${img.file.name.split('.')[0]}-compressed.${ext}`, data, { base64: true });
            }
        });

        const content = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(content);
        const link = document.createElement("a");
        link.href = url;
        link.download = "compressed-images.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("ZIP downloaded!");
    };

    // --- Slider Logic ---
    const handleMouseDown = useCallback(() => setIsDragging(true), []);
    const handleMouseUp = useCallback(() => setIsDragging(false), []);
    const handleMouseMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (!isDragging || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const x = clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setSliderPosition(percentage);
    }, [isDragging]);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchend', handleMouseUp);
        } else {
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchend', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, [isDragging, handleMouseUp]);

    // --- Helper ---
    const formatSize = (bytes: number) => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const HOW_IT_WORKS = [
        "Upload your images (JPG, PNG, WebP, AVIF supported).",
        "Adjust the compression quality slider to balance size vs. clarity.",
        "Select your desired output format (e.g., convert PNG to WebP).",
        "Optionally resize images or strip metadata (EXIF) for privacy.",
        "Compare original vs. compressed in real-time and download individually or as a ZIP."
    ];

    const DISCLAIMER = "All compression happens locally in your browser. Your images are never uploaded to any server, ensuring 100% privacy. Very large files might take a moment to process depending on your device's speed.";

    return (
        <ToolPageLayout
            title="Image Compressor"
            description="Professional grade image compression with real-time preview."
            about={
                <div>
                    <p>
                        Optimize your images for the web without sacrificing quality. This client-side tool allows you to compress, resize, and convert images to modern formats like WebP and AVIF, all within your browser.
                    </p>
                    <p className="mt-2">
                        It features a side-by-side comparison view so you can see exactly how the compression affects your image before downloading.
                    </p>
                </div>
            }
            howItWorks={HOW_IT_WORKS}
            disclaimer={DISCLAIMER}
            parentPath="/tools/other"
            parentName="Developer Tools"
        >
            <div className="max-w-4xl mx-auto space-y-8 pb-20">

                {/* 1. UPLOAD CARD */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative group cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative bg-black/40 backdrop-blur-xl border-2 border-dashed border-white/10 group-hover:border-cyan-500/50 rounded-3xl p-10 flex flex-col items-center justify-center text-center transition-all duration-300 min-h-[200px]">
                        <div className="bg-white/5 p-5 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                            <Upload className="w-10 h-10 text-cyan-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Upload Images</h3>
                        <p className="text-muted-foreground text-sm max-w-md">
                            Drag & drop or click to select multiple files. <br />
                            Supports JPG, PNG, WebP, AVIF.
                        </p>
                        <input type="file" ref={fileInputRef} multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                    </div>
                </motion.div>

                {/* 2. SELECTED FILES LIST */}
                <AnimatePresence>
                    {images.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4"
                        >
                            <div className="flex justify-between items-center px-2">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <Layers className="text-cyan-400" size={20} />
                                    Selected Files ({images.length})
                                </h3>
                                <Button variant="ghost" size="sm" onClick={() => setImages([])} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                                    <Trash2 size={16} className="mr-2" /> Clear All
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {images.map(img => (
                                    <motion.div
                                        layout
                                        key={img.id}
                                        onClick={() => setSelectedImageId(img.id)}
                                        className={`relative group rounded-xl overflow-hidden border cursor-pointer transition-all aspect-square ${selectedImageId === img.id
                                            ? "border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)] ring-1 ring-cyan-500"
                                            : "border-white/10 hover:border-white/30"
                                            }`}
                                    >
                                        <img src={img.originalPreview} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                className="h-8 w-8 rounded-full"
                                                onClick={(e) => removeImage(img.id, e)}
                                            >
                                                <X size={14} />
                                            </Button>
                                        </div>
                                        {img.status === "done" && (
                                            <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full shadow-lg">
                                                <Check size={12} />
                                            </div>
                                        )}
                                        <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur p-2 text-[10px] truncate text-center text-white/90">
                                            {img.file.name}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 3. PREVIEW SECTION */}
                <AnimatePresence>
                    {selectedImage && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden"
                        >
                            {/* Controls Header */}
                            <div className="p-4 border-b border-white/10 flex flex-wrap gap-4 justify-between items-center bg-white/5">
                                <div className="flex items-center gap-2">
                                    <Eye className="text-cyan-400" size={20} />
                                    <span className="font-bold">Preview</span>
                                </div>

                                <div className="bg-black/40 rounded-lg p-1 flex gap-1">
                                    {[
                                        { id: "preview", icon: Maximize2, label: "Full" },
                                        { id: "split", icon: Columns, label: "Split" },
                                        { id: "side-by-side", icon: Grid, label: "Grid" }
                                    ].map((mode) => (
                                        <button
                                            key={mode.id}
                                            onClick={() => setViewMode(mode.id as ViewMode)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === mode.id
                                                ? "bg-cyan-500/20 text-cyan-400 shadow-sm"
                                                : "text-muted-foreground hover:text-white hover:bg-white/5"
                                                }`}
                                        >
                                            <mode.icon size={14} />
                                            <span className="hidden sm:inline">{mode.label}</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoomLevel(z => Math.max(0.5, z - 0.1))}><ZoomOut size={14} /></Button>
                                    <span className="text-xs font-mono w-10 text-center">{Math.round(zoomLevel * 100)}%</span>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoomLevel(z => Math.min(3, z + 0.1))}><ZoomIn size={14} /></Button>
                                </div>
                            </div>

                            {/* Preview Canvas */}
                            <div className="h-[500px] relative bg-[url('/grid-pattern.svg')] bg-repeat overflow-hidden flex items-center justify-center p-8">

                                {/* SPLIT VIEW */}
                                {viewMode === "split" && (
                                    <div
                                        ref={containerRef}
                                        className="relative w-full h-full select-none cursor-col-resize group flex items-center justify-center"
                                        onMouseMove={handleMouseMove}
                                        onTouchMove={handleMouseMove}
                                        onMouseDown={handleMouseDown}
                                        onTouchStart={handleMouseDown}
                                    >
                                        <div className="relative h-full w-full flex items-center justify-center">
                                            <img
                                                src={selectedImage.originalPreview}
                                                className="max-w-full max-h-full object-contain pointer-events-none shadow-2xl"
                                                draggable={false}
                                                style={{ transform: `scale(${zoomLevel})` }}
                                            />
                                            {selectedImage.compressedPreview && (
                                                <div
                                                    className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center"
                                                    style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                                                >
                                                    <img
                                                        src={selectedImage.compressedPreview}
                                                        className="max-w-full max-h-full object-contain"
                                                        draggable={false}
                                                        style={{ transform: `scale(${zoomLevel})` }}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* Slider Handle */}
                                        {selectedImage.compressedPreview && (
                                            <div
                                                className="absolute inset-y-0 w-0.5 bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.8)] z-20"
                                                style={{ left: `${sliderPosition}%` }}
                                            >
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-black/80 border-2 border-cyan-500 rounded-full flex items-center justify-center shadow-lg backdrop-blur cursor-grab active:cursor-grabbing hover:scale-110 transition-transform">
                                                    <MoveHorizontal size={20} className="text-cyan-400" />
                                                </div>
                                            </div>
                                        )}

                                        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur px-3 py-1.5 rounded-full text-xs text-cyan-400 border border-cyan-500/30 font-medium">Compressed</div>
                                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur px-3 py-1.5 rounded-full text-xs text-white/70 border border-white/10 font-medium">Original</div>
                                    </div>
                                )}

                                {/* SIDE BY SIDE */}
                                {viewMode === "side-by-side" && (
                                    <div className="grid grid-cols-2 gap-8 w-full h-full">
                                        <div className="flex flex-col items-center justify-center border-r border-white/10 pr-4">
                                            <div className="text-sm text-muted-foreground mb-4 font-medium">Original</div>
                                            <img src={selectedImage.originalPreview} className="max-w-full max-h-full object-contain shadow-xl" style={{ transform: `scale(${zoomLevel})` }} />
                                        </div>
                                        <div className="flex flex-col items-center justify-center pl-4">
                                            <div className="text-sm text-cyan-400 mb-4 font-medium">Compressed</div>
                                            <img src={selectedImage.compressedPreview || selectedImage.originalPreview} className="max-w-full max-h-full object-contain shadow-xl" style={{ transform: `scale(${zoomLevel})` }} />
                                        </div>
                                    </div>
                                )}

                                {/* PREVIEW (SINGLE) */}
                                {viewMode === "preview" && (
                                    <div className="w-full h-full flex items-center justify-center relative group">
                                        <img
                                            src={selectedImage.compressedPreview || selectedImage.originalPreview}
                                            className="max-w-full max-h-full object-contain transition-transform duration-200 shadow-2xl"
                                            style={{ transform: `scale(${zoomLevel})` }}
                                        />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 4. SETTINGS PANEL */}
                <AnimatePresence>
                    {images.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8"
                        >
                            <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-4">
                                <Settings className="text-cyan-400" size={24} />
                                <h3 className="text-xl font-bold">Compression Settings</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left Side Settings */}
                                <div className="space-y-6">
                                    {/* Quality */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-base">Quality</Label>
                                            <span className="text-sm font-mono text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-lg border border-cyan-500/20">{quality}%</span>
                                        </div>
                                        <Slider
                                            value={[quality]}
                                            onValueChange={(val) => setQuality(val[0])}
                                            max={100}
                                            step={1}
                                            className="cursor-pointer"
                                        />
                                    </div>

                                    {/* Format */}
                                    <div className="space-y-3">
                                        <Label className="text-base">Output Format</Label>
                                        <Select value={format} onValueChange={(val: any) => setFormat(val)}>
                                            <SelectTrigger className="bg-white/5 border-white/10 h-12">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="image/webp">WebP (Best Compression)</SelectItem>
                                                <SelectItem value="image/jpeg">JPEG (Standard)</SelectItem>
                                                <SelectItem value="image/png">PNG (Lossless)</SelectItem>
                                                <SelectItem value="image/avif">AVIF (Next Gen)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Right Side Settings */}
                                <div className="space-y-6">
                                    {/* Resize */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-base">Resize Width</Label>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger><Info size={16} className="text-muted-foreground hover:text-white" /></TooltipTrigger>
                                                    <TooltipContent>Height is calculated automatically.</TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                        <div className="relative">
                                            <Input
                                                type="number"
                                                placeholder="Auto (Keep Original)"
                                                value={resizeWidth}
                                                onChange={(e) => setResizeWidth(e.target.value ? Number(e.target.value) : "")}
                                                className="bg-white/5 border-white/10 pr-10 h-12"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">px</span>
                                        </div>
                                    </div>

                                    {/* Metadata */}
                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors h-20">
                                        <div className="space-y-1">
                                            <Label className="text-base">Strip Metadata</Label>
                                            <p className="text-xs text-muted-foreground">Remove EXIF data for privacy</p>
                                        </div>
                                        <Switch checked={!keepExif} onCheckedChange={(c) => setKeepExif(!c)} />
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between">
                                {images.some(i => i.status === "done") && (
                                    <div className="flex items-center gap-6 text-sm">
                                        <div>
                                            <p className="text-muted-foreground">Total Savings</p>
                                            <p className="text-2xl font-bold text-cyan-400">{totalSavings}%</p>
                                        </div>
                                        <div className="h-8 w-px bg-white/10" />
                                        <div>
                                            <p className="text-muted-foreground">New Size</p>
                                            <p className="text-xl font-bold text-green-400">{formatSize(totalCompressedSize)}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-4 w-full md:w-auto">
                                    <Button
                                        onClick={processAll}
                                        disabled={isProcessing || images.length === 0}
                                        className="flex-1 md:flex-none h-14 px-8 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold text-lg shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all active:scale-95 rounded-xl"
                                    >
                                        {isProcessing ? <RefreshCw className="animate-spin w-6 h-6 mr-2" /> : <Zap className="w-6 h-6 mr-2 fill-current" />}
                                        {isProcessing ? "Compressing..." : "COMPRESS NOW"}
                                    </Button>

                                    {images.some(i => i.status === "done") && (
                                        <Button
                                            variant="outline"
                                            onClick={downloadAllZip}
                                            className="h-14 px-6 border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-400 rounded-xl"
                                        >
                                            <Download className="mr-2 h-5 w-5" /> Download ZIP
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </ToolPageLayout>
    );
};

export default ImageCompressor;
