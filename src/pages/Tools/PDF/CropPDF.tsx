import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Crop, Download, RefreshCw, Move, Ruler, Check, Settings2, MousePointer2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import UniversalToolLayout from '@/components/UniversalToolLayout';
import IngestionZone from '@/components/tools/IngestionZone';
import { initPDFWorker } from '@/utils/pdfWorker';
import PDFViewer from '@/components/tools/PDFViewer';

// Initialize PDF.js worker
initPDFWorker();

type Unit = 'percent' | 'point' | 'inch' | 'mm';
type InteractionMode = 'none' | 'drawing' | 'moving' | 'resizing-tl' | 'resizing-tr' | 'resizing-bl' | 'resizing-br';

const PRESETS = [
    { label: "Free Form", value: "free" },
    { label: "A4 (210x297mm)", value: "a4", w: 595.28, h: 841.89 },
    { label: "Letter (8.5x11\")", value: "letter", w: 612, h: 792 },
    { label: "Square (1:1)", value: "square", ratio: 1 },
    { label: "ID Card (3.375x2.125\")", value: "id", w: 243, h: 153 },
];

const CropPDF = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultBlob, setResultBlob] = useState<Blob | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Page Info (in PDF Points)
    const [pageDimensions, setPageDimensions] = useState({ width: 0, height: 0 });
    const [numPages, setNumPages] = useState(0);
    const [scale, setScale] = useState(0.75); // Start slightly zoomed out for better fit view

    // Crop State (Stored as Percentages 0-100)
    const [crop, setCrop] = useState({ x: 0, y: 0, width: 100, height: 100 });
    const [unit, setUnit] = useState<Unit>('percent');

    // Interaction State
    const [interactionMode, setInteractionMode] = useState<InteractionMode>('none');
    const [dragStart, setDragStart] = useState<{ x: number, y: number, initialCrop: typeof crop } | null>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const previewContainerRef = useRef<HTMLDivElement>(null); // Ref for auto-fit calculation

    const handleFileSelect = (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0]);
            setResultBlob(null);
            setError(null);
            setCrop({ x: 10, y: 10, width: 80, height: 80 });
            // Reset to a safe default, auto-fit will trigger on load
            setScale(0.75);
        }
    };

    const handlePageLoad = (details: { width: number; height: number }) => {
        // Check if dimensions changed or if it's the first standard execution
        // We'll auto-fit if the current scale is the default starting value (e.g., 0.75) 
        // to ensure the user gets a full view initially.

        // Calculate standard "Fit Page" scale
        if (previewContainerRef.current) {
            const { clientWidth, clientHeight } = previewContainerRef.current;
            const padding = 64; // Approx padding (p-4 = 32px total, plus margin)
            const availW = clientWidth - padding;
            const availH = clientHeight - padding;

            const scaleW = availW / details.width;
            const scaleH = availH / details.height;
            const fitScale = Math.min(scaleW, scaleH) * 0.95; // 95% fit

            // Apply only if dimensions changed significantly OR we are at the initial "guess" scale
            const isFirstLoad = Math.abs(scale - 0.75) < 0.01;
            const dimsChanged = Math.abs(details.width - pageDimensions.width) > 1 || Math.abs(details.height - pageDimensions.height) > 1;

            if (dimsChanged || isFirstLoad) {
                setPageDimensions({ width: details.width, height: details.height });
                setScale(fitScale);
            }
        } else if (Math.abs(details.width - pageDimensions.width) > 1) {
            setPageDimensions({ width: details.width, height: details.height });
        }
    };

    // --- Unit Conversion Helpers ---
    const toUnit = (percentVal: number, dimensionSize: number, u: Unit): number => {
        if (!dimensionSize) return 0;
        const points = (percentVal / 100) * dimensionSize;
        if (u === 'percent') return parseFloat(percentVal.toFixed(2));
        if (u === 'point') return parseFloat(points.toFixed(2));
        if (u === 'inch') return parseFloat((points / 72).toFixed(3));
        if (u === 'mm') return parseFloat((points * 0.352778).toFixed(2));
        return 0;
    };

    const fromUnit = (val: number, dimensionSize: number, u: Unit): number => {
        if (dimensionSize === 0) return 0;
        let points = 0;
        if (u === 'percent') points = (val / 100) * dimensionSize;
        else if (u === 'point') points = val;
        else if (u === 'inch') points = val * 72;
        else if (u === 'mm') points = val / 0.352778;
        return (points / dimensionSize) * 100;
    };

    // --- User Inputs ---
    const handleInputChange = (field: 'x' | 'y' | 'width' | 'height', valueStr: string) => {
        const val = parseFloat(valueStr);
        if (isNaN(val)) return;

        const maxDim = (field === 'x' || field === 'width') ? pageDimensions.width : pageDimensions.height;
        const percentVal = fromUnit(val, maxDim, unit);

        setCrop(prev => ({ ...prev, [field]: percentVal }));
    };

    const handlePresetChange = (val: string) => {
        const preset = PRESETS.find(p => p.value === val);
        if (!preset || preset.value === 'free') return;

        if (preset.w && preset.h && pageDimensions.width > 0) {
            const newW = (preset.w / pageDimensions.width) * 100;
            const newH = (preset.h / pageDimensions.height) * 100;

            // Center the new crop
            const newX = (100 - newW) / 2;
            const newY = (100 - newH) / 2;

            setCrop({
                x: Math.max(0, newX),
                y: Math.max(0, newY),
                width: Math.min(100, newW),
                height: Math.min(100, newH)
            });
        }
    };

    // --- Interaction Logic ---
    const getPercentagePos = (clientX: number, clientY: number) => {
        if (!overlayRef.current) return { x: 0, y: 0 };
        const rect = overlayRef.current.getBoundingClientRect();
        return {
            x: ((clientX - rect.left) / rect.width) * 100,
            y: ((clientY - rect.top) / rect.height) * 100
        };
    };

    const [applyToAll, setApplyToAll] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent, mode: InteractionMode) => {
        // Stop propagation to prevent starting a new drawing when clicking handles/box
        e.stopPropagation();

        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        const pos = getPercentagePos(clientX, clientY);
        setDragStart({ x: pos.x, y: pos.y, initialCrop: { ...crop } });
        setInteractionMode(mode);

        if (mode === 'drawing') {
            setCrop({ x: pos.x, y: pos.y, width: 0, height: 0 });
        }
    };

    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (interactionMode === 'none' || !dragStart || !overlayRef.current) return;

        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        const current = getPercentagePos(clientX, clientY);
        const dx = current.x - dragStart.x;
        const dy = current.y - dragStart.y;

        const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val));

        if (interactionMode === 'moving') {
            const init = dragStart.initialCrop;
            let newX = init.x + dx;
            let newY = init.y + dy;

            newX = clamp(newX, 0, 100 - init.width);
            newY = clamp(newY, 0, 100 - init.height);

            setCrop({ ...init, x: newX, y: newY });
        }
        else if (interactionMode === 'drawing') {
            const minX = Math.min(dragStart.x, current.x);
            const maxX = Math.max(dragStart.x, current.x);
            const minY = Math.min(dragStart.y, current.y);
            const maxY = Math.max(dragStart.y, current.y);

            const finalX = clamp(minX, 0, 100);
            const finalY = clamp(minY, 0, 100);
            const finalW = clamp(maxX - minX, 0, 100 - finalX);
            const finalH = clamp(maxY - minY, 0, 100 - finalY);

            setCrop({ x: finalX, y: finalY, width: finalW, height: finalH });
        }
        else if (interactionMode.startsWith('resizing')) {
            const init = dragStart.initialCrop;
            let newCrop = { ...init };

            if (interactionMode.includes('l')) { // Left
                const targetX = init.x + dx;
                const maxLeft = init.x + init.width - 1;
                const finalX = clamp(targetX, 0, maxLeft);
                newCrop.x = finalX;
                newCrop.width = init.width + (init.x - finalX);
            }
            if (interactionMode.includes('r')) { // Right
                const targetW = init.width + dx;
                newCrop.width = clamp(targetW, 1, 100 - init.x);
            }
            if (interactionMode.includes('t')) { // Top
                const targetY = init.y + dy;
                const maxTop = init.y + init.height - 1;
                const finalY = clamp(targetY, 0, maxTop);
                newCrop.y = finalY;
                newCrop.height = init.height + (init.y - finalY);
            }
            if (interactionMode.includes('b')) { // Bottom
                const targetH = init.height + dy;
                newCrop.height = clamp(targetH, 1, 100 - init.y);
            }

            setCrop(newCrop);
        }
    };

    const handleMouseUp = () => {
        setInteractionMode('none');
        setDragStart(null);
    };

    const handleApplyCrop = async () => {
        if (!file) return;
        setIsProcessing(true);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const pages = pdfDoc.getPages();

            pages.forEach((page, index) => {
                // If not applying to all, only process the current page (index + 1 matches currentPage)
                if (!applyToAll && (index + 1) !== currentPage) return;

                const { width, height } = page.getSize();
                const cropX = (crop.x / 100) * width;
                const cropY = height - ((crop.y + crop.height) / 100) * height; // PDF Y is from bottom
                const cropWidth = (crop.width / 100) * width;
                const cropHeight = (crop.height / 100) * height;

                page.setCropBox(cropX, cropY, cropWidth, cropHeight);
                page.setMediaBox(cropX, cropY, cropWidth, cropHeight);
            });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
            setResultBlob(blob);
            toast.success(applyToAll ? "All pages cropped!" : `Page ${currentPage} cropped!`);
        } catch (err: any) {
            console.error("Crop failed:", err);
            setError("Failed to crop PDF.");
            toast.error("Crop Failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (resultBlob && file) {
            const url = URL.createObjectURL(resultBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${file.name.replace(/\.pdf$/i, '')}_crop.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };

    return (
        <UniversalToolLayout
            title="Advanced Crop PDF"
            description="Precision cropping with unit support and visual preview."
            steps={["Upload PDF", "Select Area (Drag, Resize, or Preset)", "Crop & Download"]}
            isProcessing={isProcessing}
            error={error}
            onResetError={() => setError(null)}
            about={
                <>
                    <p>
                        Precisely crop your PDF pages to remove unwanted margins or focus on specific content.
                        With a visual editor and unit support (inches, mm, points), you can adjust the visible area of your document with accuracy and ease.
                    </p>
                </>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-12 h-screen max-h-[800px] gap-6">

                {/* --- LEFT: VISUAL PREVIEW --- */}
                <div
                    className="lg:col-span-8 bg-[#0A0A0A] border rounded-xl border-white/10 p-4 flex flex-col relative select-none overflow-hidden"
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchEnd={handleMouseUp}
                >
                    {!file ? (
                        <div className="flex-1 flex items-center justify-center">
                            <IngestionZone onDrop={handleFileSelect} accept={{ 'application/pdf': ['.pdf'] }} multiple={false} files={[]} className="w-full max-w-xl h-64" />
                        </div>
                    ) : (
                        <div className="w-full h-full flex flex-col">
                            <div className="flex justify-between items-center mb-2 px-2 h-10">
                                <span className="text-sm font-medium text-white/50 truncate max-w-[200px]">{file.name}</span>

                                <div className="flex items-center gap-2">
                                    {/* Page Navigation */}
                                    <div className="flex items-center bg-[#111] rounded-lg border border-white/10 p-0.5">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage <= 1}
                                            className="h-7 w-8 text-gray-400 hover:text-white disabled:opacity-30"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </Button>
                                        <div className="h-4 w-px bg-white/10 mx-1" />
                                        <span className="text-xs font-mono text-gray-500 px-2 min-w-[3rem] text-center">
                                            {currentPage} / {numPages}
                                        </span>
                                        <div className="h-4 w-px bg-white/10 mx-1" />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setCurrentPage(prev => Math.min(numPages, prev + 1))}
                                            disabled={currentPage >= numPages}
                                            className="h-7 w-8 text-gray-400 hover:text-white disabled:opacity-30"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    {/* Zoom Navigation */}
                                    <div className="flex items-center bg-[#111] rounded-lg border border-white/10 p-0.5">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setScale(s => Math.max(0.25, s - 0.25))}
                                            className="h-7 w-8 text-gray-400 hover:text-white"
                                        >
                                            <ZoomOut className="w-4 h-4" />
                                        </Button>
                                        <div className="h-4 w-px bg-white/10 mx-1" />
                                        <span className="text-xs font-mono text-gray-500 px-1 w-[3rem] text-center">
                                            {Math.round(scale * 100)}%
                                        </span>
                                        <div className="h-4 w-px bg-white/10 mx-1" />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setScale(s => Math.min(5.0, s + 0.25))}
                                            className="h-7 w-8 text-gray-400 hover:text-white"
                                        >
                                            <ZoomIn className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                <Button variant="ghost" size="sm" onClick={() => setFile(null)} className="h-8 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:bg-transparent">
                                    Change File
                                </Button>
                            </div>

                            <div className="flex-1 relative bg-[#111] rounded-lg overflow-auto flex items-center justify-center p-4 border border-white/5" ref={previewContainerRef}>
                                <PDFViewer
                                    file={file}
                                    onPageLoad={handlePageLoad}
                                    onDocumentLoad={(d) => setNumPages(d.numPages)}
                                    currentPage={currentPage}
                                    onPageChange={setCurrentPage}
                                    scale={scale}
                                    onScaleChange={setScale}
                                    hideControls={true}
                                >
                                    <div
                                        ref={overlayRef}
                                        className="absolute inset-0 z-30 touch-none"
                                        style={{ cursor: 'crosshair' }}
                                        onMouseDown={(e) => handleMouseDown(e, 'drawing')}
                                        onMouseMove={handleMouseMove}
                                        onTouchStart={(e) => handleMouseDown(e, 'drawing')}
                                        onTouchMove={handleMouseMove}
                                    >
                                        <div className="absolute inset-0 pointer-events-none">
                                            {/* Crop Box */}
                                            <div
                                                className="absolute border border-blue-400 bg-blue-500/10 shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] box-content pointer-events-auto group"
                                                style={{ left: `${crop.x}%`, top: `${crop.y}%`, width: `${crop.width}%`, height: `${crop.height}%`, cursor: 'move' }}
                                                onMouseDown={(e) => handleMouseDown(e, 'moving')}
                                                onTouchStart={(e) => handleMouseDown(e, 'moving')}
                                            >
                                                {/* Corner Handles */}
                                                {/* Corner Handles - Larger Hit Area */}
                                                <div
                                                    className="absolute -top-3 -left-3 w-6 h-6 flex items-center justify-center cursor-nw-resize z-40"
                                                    onMouseDown={(e) => handleMouseDown(e, 'resizing-tl')}
                                                    onTouchStart={(e) => handleMouseDown(e, 'resizing-tl')}
                                                >
                                                    <div className="w-3.5 h-3.5 bg-white border-2 border-blue-600 shadow-sm" />
                                                </div>
                                                <div
                                                    className="absolute -top-3 -right-3 w-6 h-6 flex items-center justify-center cursor-ne-resize z-40"
                                                    onMouseDown={(e) => handleMouseDown(e, 'resizing-tr')}
                                                    onTouchStart={(e) => handleMouseDown(e, 'resizing-tr')}
                                                >
                                                    <div className="w-3.5 h-3.5 bg-white border-2 border-blue-600 shadow-sm" />
                                                </div>
                                                <div
                                                    className="absolute -bottom-3 -left-3 w-6 h-6 flex items-center justify-center cursor-sw-resize z-40"
                                                    onMouseDown={(e) => handleMouseDown(e, 'resizing-bl')}
                                                    onTouchStart={(e) => handleMouseDown(e, 'resizing-bl')}
                                                >
                                                    <div className="w-3.5 h-3.5 bg-white border-2 border-blue-600 shadow-sm" />
                                                </div>
                                                <div
                                                    className="absolute -bottom-3 -right-3 w-6 h-6 flex items-center justify-center cursor-se-resize z-40"
                                                    onMouseDown={(e) => handleMouseDown(e, 'resizing-br')}
                                                    onTouchStart={(e) => handleMouseDown(e, 'resizing-br')}
                                                >
                                                    <div className="w-3.5 h-3.5 bg-white border-2 border-blue-600 shadow-sm" />
                                                </div>

                                                {/* Dimensions Label */}
                                                <div className="absolute -top-8 left-0 text-xs bg-blue-600 px-2 py-1 rounded text-white font-mono whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-50">
                                                    {toUnit(crop.width, pageDimensions.width, unit)} x {toUnit(crop.height, pageDimensions.height, unit)} {unit === 'percent' ? '%' : unit === 'point' ? 'pt' : unit === 'inch' ? '"' : 'mm'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </PDFViewer>
                            </div>
                        </div>
                    )}
                </div>

                {/* --- RIGHT: PRECISE CONTROLS --- */}
                <div className="lg:col-span-4 bg-[#0A0A0A] rounded-xl border border-white/10 p-6 flex flex-col h-full overflow-y-auto">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
                                <Crop className="w-5 h-5 text-blue-400" /> Crop Settings
                            </h3>
                            <p className="text-xs text-gray-500">Define precise crop dimensions.</p>
                        </div>

                        {/* Presets */}
                        <div className="space-y-2">
                            <Label className="text-xs uppercase text-gray-500 font-bold">Preset</Label>
                            <Select onValueChange={handlePresetChange}>
                                <SelectTrigger className="h-9 bg-[#111] border-white/10 text-white">
                                    <SelectValue placeholder="Select a preset..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {PRESETS.map(p => (
                                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Unit Selection */}
                        <div className="space-y-2">
                            <Label className="text-xs uppercase text-gray-500 font-bold">Units</Label>
                            <div className="grid grid-cols-4 gap-1 p-1 bg-black rounded-lg border border-white/10">
                                {(['percent', 'point', 'inch', 'mm'] as Unit[]).map(u => (
                                    <button
                                        key={u}
                                        onClick={() => setUnit(u)}
                                        className={`text-xs py-1.5 rounded-md transition-all ${unit === u ? 'bg-blue-600 text-white font-medium' : 'text-gray-500 hover:text-gray-300'}`}
                                    >
                                        {u === 'percent' ? '%' : u === 'point' ? 'pt' : u === 'inch' ? 'in' : u}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Dimensions Inputs */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label className="text-xs text-gray-400">X Position</Label>
                                <Input
                                    type="number"
                                    value={toUnit(crop.x, pageDimensions.width, unit)}
                                    onChange={(e) => handleInputChange('x', e.target.value)}
                                    className="h-9 bg-[#111] border-white/10 focus:border-blue-500/50 text-right font-mono"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-gray-400">Y Position</Label>
                                <Input
                                    type="number"
                                    value={toUnit(crop.y, pageDimensions.height, unit)}
                                    onChange={(e) => handleInputChange('y', e.target.value)}
                                    className="h-9 bg-[#111] border-white/10 focus:border-blue-500/50 text-right font-mono"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-gray-400">Width</Label>
                                <Input
                                    type="number"
                                    value={toUnit(crop.width, pageDimensions.width, unit)}
                                    onChange={(e) => handleInputChange('width', e.target.value)}
                                    className="h-9 bg-[#111] border-white/10 focus:border-blue-500/50 text-right font-mono text-blue-400"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-gray-400">Height</Label>
                                <Input
                                    type="number"
                                    value={toUnit(crop.height, pageDimensions.height, unit)}
                                    onChange={(e) => handleInputChange('height', e.target.value)}
                                    className="h-9 bg-[#111] border-white/10 focus:border-blue-500/50 text-right font-mono text-blue-400"
                                />
                            </div>
                        </div>

                        {/* Page Info */}
                        <div className="bg-white/5 rounded-lg p-3 text-xs flex justify-between items-center text-gray-400">
                            <span>Original Size:</span>
                            <span className="font-mono text-white">
                                {toUnit(100, pageDimensions.width, unit)} x {toUnit(100, pageDimensions.height, unit)} {unit === 'percent' ? '%' : unit === 'point' ? 'pt' : unit === 'inch' ? '"' : 'mm'}
                            </span>
                        </div>
                    </div>

                    {/* Scope Settings */}
                    <div className="mt-8 pt-6 border-t border-white/5">
                        <Label className="text-xs uppercase text-gray-500 font-bold mb-3 block">Process Scope</Label>
                        <div
                            onClick={() => setApplyToAll(!applyToAll)}
                            className={`
                                group flex items-center p-4 rounded-xl border cursor-pointer transition-all duration-200
                                ${applyToAll
                                    ? 'bg-blue-500/10 border-blue-500/50 hover:bg-blue-500/20'
                                    : 'bg-[#111] border-white/10 hover:border-white/30 hover:bg-white/5'}
                            `}
                        >
                            <div className={`
                                w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors
                                ${applyToAll ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-500 group-hover:border-gray-400 bg-transparent'}
                            `}>
                                {applyToAll && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                            </div>
                            <div className="flex-1">
                                <p className={`text-sm font-medium ${applyToAll ? 'text-blue-200' : 'text-gray-300'}`}>Apply crop to all pages</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {applyToAll ? "Current crop applies to entire document" : "Crop only affects the current page"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto space-y-3 pt-6 border-t border-white/5">
                        {!resultBlob ? (
                            <Button
                                onClick={handleApplyCrop}
                                disabled={!file || isProcessing || crop.width === 0}
                                className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold"
                            >
                                {isProcessing ? <RefreshCw className="animate-spin mr-2" /> : <Crop className="mr-2" />}
                                Crop PDF
                            </Button>
                        ) : (
                            <div className="space-y-3">
                                <Button onClick={handleDownload} className="w-full h-12 bg-green-600 hover:bg-green-500 text-white font-bold shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                                    <Download className="mr-2" /> Download Cropped PDF
                                </Button>
                                <Button variant="ghost" onClick={() => setResultBlob(null)} className="w-full text-xs text-gray-400 hover:text-white">
                                    Reset
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </UniversalToolLayout>
    );
};

export default CropPDF;
