import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import {
    Edit3, Download, RefreshCw, Type, Image as ImageIcon,
    Move, Trash2, Square, Circle, Minus, MousePointer2,
    Settings2, Palette, Type as TypeIcon, Layout,
    ChevronLeft, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import UniversalToolLayout from '@/components/UniversalToolLayout';
import IngestionZone from '@/components/tools/IngestionZone';
import { initPDFWorker } from '@/utils/pdfWorker';
import { cn } from '@/lib/utils';

// Initialize PDF.js worker
initPDFWorker();

interface EditorElement {
    id: string;
    type: 'text' | 'image' | 'rectangle' | 'circle' | 'line';
    content?: string | File;
    x: number; // Percentage
    y: number; // Percentage
    width?: number; // Percentage
    height?: number; // Percentage
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    borderColor?: string;
    borderWidth?: number;
    opacity?: number;
    rotation?: number;
    page: number; // 1-indexed page number
}

const EditPDF = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultBlob, setResultBlob] = useState<Blob | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [elements, setElements] = useState<EditorElement[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [pdfDimensions, setPdfDimensions] = useState<{ width: number; height: number } | null>(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [numPages, setNumPages] = useState(0);
    const [pdfDocProxy, setPdfDocProxy] = useState<pdfjsLib.PDFDocumentProxy | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const dragStart = useRef<{ x: number; y: number } | null>(null);
    const elementStart = useRef<{ x: number; y: number } | null>(null);

    const handleFileSelect = async (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0]);
            setResultBlob(null);
            setError(null);
            setElements([]);
            setCurrentPage(1);
            loadPDFDocument(files[0]);
        }
    };

    const loadPDFDocument = async (pdfFile: File) => {
        try {
            const arrayBuffer = await pdfFile.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            setPdfDocProxy(pdf);
            setNumPages(pdf.numPages);
            generatePreview(pdf, 1);
        } catch (err) {
            console.error("PDF Load failed:", err);
            toast.error("Failed to load PDF");
        }
    };

    const generatePreview = async (pdf: pdfjsLib.PDFDocumentProxy, pageNum: number) => {
        try {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: 1.5 });

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context!, viewport }).promise;
            setPreviewUrl(canvas.toDataURL());
            setPdfDimensions({ width: viewport.width, height: viewport.height });
        } catch (err) {
            console.error("Preview generation failed:", err);
            toast.error("Failed to generate preview");
        }
    };

    const changePage = (delta: number) => {
        if (!pdfDocProxy) return;
        const newPage = Math.min(Math.max(1, currentPage + delta), numPages);
        if (newPage !== currentPage) {
            setCurrentPage(newPage);
            generatePreview(pdfDocProxy, newPage);
            setSelectedId(null); // Deselect when changing pages
        }
    };

    // --- Element Creation ---

    const addText = () => {
        const newElement: EditorElement = {
            id: Date.now().toString(),
            type: 'text',
            content: 'Double click to edit',
            x: 40,
            y: 40,
            fontSize: 24,
            fontFamily: 'Helvetica',
            color: '#000000',
            opacity: 1,
            rotation: 0,
            page: currentPage
        };
        setElements([...elements, newElement]);
        setSelectedId(newElement.id);
    };

    const addImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const newElement: EditorElement = {
                id: Date.now().toString(),
                type: 'image',
                content: e.target.files[0],
                x: 40,
                y: 40,
                width: 20,
                height: 20,
                opacity: 1,
                rotation: 0,
                page: currentPage
            };
            setElements([...elements, newElement]);
            setSelectedId(newElement.id);
        }
    };

    const addShape = (type: 'rectangle' | 'circle' | 'line') => {
        const newElement: EditorElement = {
            id: Date.now().toString(),
            type,
            x: 40,
            y: 40,
            width: 15,
            height: 15,
            color: '#3b82f6',
            borderColor: '#1d4ed8',
            borderWidth: 2,
            opacity: 1,
            rotation: 0,
            page: currentPage
        };
        if (type === 'line') {
            newElement.height = 0.5;
            newElement.width = 20;
        }
        setElements([...elements, newElement]);
        setSelectedId(newElement.id);
    };

    // --- State Updates ---

    const updateElement = (id: string, updates: Partial<EditorElement>) => {
        setElements(elements.map(el => el.id === id ? { ...el, ...updates } : el));
    };

    const deleteElement = (id: string) => {
        setElements(elements.filter(el => el.id !== id));
        if (selectedId === id) setSelectedId(null);
    };

    // --- Drag and Drop Logic ---

    const handleMouseDown = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setSelectedId(id);
        isDragging.current = true;
        dragStart.current = { x: e.clientX, y: e.clientY };

        const el = elements.find(e => e.id === id);
        if (el) {
            elementStart.current = { x: el.x, y: el.y };
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current || !selectedId || !dragStart.current || !elementStart.current || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const deltaX = ((e.clientX - dragStart.current.x) / rect.width) * 100;
        const deltaY = ((e.clientY - dragStart.current.y) / rect.height) * 100;

        updateElement(selectedId, {
            x: Math.max(0, Math.min(100, elementStart.current.x + deltaX)),
            y: Math.max(0, Math.min(100, elementStart.current.y + deltaY))
        });
    };

    const handleMouseUp = () => {
        isDragging.current = false;
        dragStart.current = null;
        elementStart.current = null;
    };

    // --- PDF Generation ---

    const handleApply = async () => {
        if (!file) return;
        setIsProcessing(true);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

            // Iterate through all pages
            const pages = pdfDoc.getPages();

            for (let i = 0; i < pages.length; i++) {
                const page = pages[i];
                const { width, height } = page.getSize();
                const pageElements = elements.filter(el => el.page === i + 1);

                for (const el of pageElements) {
                    const x = (el.x / 100) * width;
                    const y = height - ((el.y / 100) * height);

                    const commonOptions = {
                        opacity: el.opacity,
                    };

                    if (el.type === 'text') {
                        const r = parseInt((el.color || '#000000').slice(1, 3), 16) / 255;
                        const g = parseInt((el.color || '#000000').slice(3, 5), 16) / 255;
                        const b = parseInt((el.color || '#000000').slice(5, 7), 16) / 255;

                        page.drawText(el.content as string, {
                            x,
                            y: y - (el.fontSize || 12),
                            size: el.fontSize,
                            font,
                            color: rgb(r, g, b),
                            ...commonOptions
                        });
                    } else if (el.type === 'image') {
                        const imageFile = el.content as File;
                        const imageBytes = await imageFile.arrayBuffer();
                        let pdfImage;
                        try {
                            if (imageFile.type === 'image/png') {
                                pdfImage = await pdfDoc.embedPng(imageBytes);
                            } else {
                                pdfImage = await pdfDoc.embedJpg(imageBytes);
                            }
                        } catch (e) {
                            console.error("Image embed failed", e);
                            continue;
                        }

                        const imgWidth = (el.width! / 100) * width;
                        const imgHeight = (el.height! / 100) * height;

                        page.drawImage(pdfImage, {
                            x,
                            y: y - imgHeight,
                            width: imgWidth,
                            height: imgHeight,
                            ...commonOptions
                        });
                    } else if (el.type === 'rectangle') {
                        const r = parseInt((el.color || '#000000').slice(1, 3), 16) / 255;
                        const g = parseInt((el.color || '#000000').slice(3, 5), 16) / 255;
                        const b = parseInt((el.color || '#000000').slice(5, 7), 16) / 255;

                        const br = parseInt((el.borderColor || '#000000').slice(1, 3), 16) / 255;
                        const bg = parseInt((el.borderColor || '#000000').slice(3, 5), 16) / 255;
                        const bb = parseInt((el.borderColor || '#000000').slice(5, 7), 16) / 255;

                        const rectWidth = (el.width! / 100) * width;
                        const rectHeight = (el.height! / 100) * height;

                        page.drawRectangle({
                            x,
                            y: y - rectHeight,
                            width: rectWidth,
                            height: rectHeight,
                            color: rgb(r, g, b),
                            borderColor: rgb(br, bg, bb),
                            borderWidth: el.borderWidth,
                            ...commonOptions
                        });
                    } else if (el.type === 'circle') {
                        const r = parseInt((el.color || '#000000').slice(1, 3), 16) / 255;
                        const g = parseInt((el.color || '#000000').slice(3, 5), 16) / 255;
                        const b = parseInt((el.color || '#000000').slice(5, 7), 16) / 255;

                        const br = parseInt((el.borderColor || '#000000').slice(1, 3), 16) / 255;
                        const bg = parseInt((el.borderColor || '#000000').slice(3, 5), 16) / 255;
                        const bb = parseInt((el.borderColor || '#000000').slice(5, 7), 16) / 255;

                        const circleSize = (el.width! / 100) * width;

                        page.drawCircle({
                            x: x + (circleSize / 2),
                            y: y - (circleSize / 2),
                            size: circleSize / 2,
                            color: rgb(r, g, b),
                            borderColor: rgb(br, bg, bb),
                            borderWidth: el.borderWidth,
                            ...commonOptions
                        });
                    } else if (el.type === 'line') {
                        const r = parseInt((el.color || '#000000').slice(1, 3), 16) / 255;
                        const g = parseInt((el.color || '#000000').slice(3, 5), 16) / 255;
                        const b = parseInt((el.color || '#000000').slice(5, 7), 16) / 255;

                        const lineWidth = (el.width! / 100) * width;

                        page.drawLine({
                            start: { x, y },
                            end: { x: x + lineWidth, y },
                            thickness: el.height! * 10,
                            color: rgb(r, g, b),
                            ...commonOptions
                        });
                    }
                }
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
            setResultBlob(blob);
            toast.success("PDF Edited Successfully!");

        } catch (err: any) {
            console.error("Edit failed:", err);
            setError("Failed to edit PDF.");
            toast.error("Edit Failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (resultBlob && file) {
            const url = URL.createObjectURL(resultBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${file.name.replace(/\.pdf$/i, '')}_edit.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };

    const HOW_IT_WORKS = [
        "Upload a PDF file",
        "Navigate to the page you want to edit",
        "Add Text, Images, or Shapes",
        "Drag to position elements",
        "Click 'Apply Changes' to save"
    ];

    const selectedElement = elements.find(el => el.id === selectedId);

    return (
        <UniversalToolLayout
            title="Edit PDF"
            description="Add text, images, and shapes to your PDF with advanced controls."
            steps={HOW_IT_WORKS}
            isProcessing={isProcessing}
            error={error}
            onResetError={() => setError(null)}
            about={
                <>
                    <p>
                        A comprehensive PDF editor that lets you add text, images, and shapes to your documents.
                        Whether you need to fill out a form, annotate a report, or insert a signature, this tool provides the essential editing features directly in your browser.
                    </p>
                </>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-12 h-full min-h-[700px] gap-6" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
                {/* Left: Canvas */}
                <div className="lg:col-span-9 bg-[#050505] rounded-xl border border-white/10 p-8 flex flex-col items-center relative overflow-hidden select-none"
                    onMouseMove={handleMouseMove}>
                    {!file ? (
                        <div className="flex-1 flex items-center justify-center w-full">
                            <IngestionZone
                                onDrop={handleFileSelect}
                                accept={{ 'application/pdf': ['.pdf'] }}
                                multiple={false}
                                files={[]}
                                className="w-full max-w-xl h-64"
                            />
                        </div>
                    ) : (
                        <>
                            {/* Pagination Controls */}
                            <div className="flex items-center gap-4 mb-4 bg-[#111] px-4 py-2 rounded-full border border-white/10 z-20">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => changePage(-1)}
                                    disabled={currentPage <= 1}
                                    className="h-8 w-8 rounded-full hover:bg-white/10"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <span className="text-sm font-medium text-white">
                                    Page {currentPage} of {numPages}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => changePage(1)}
                                    disabled={currentPage >= numPages}
                                    className="h-8 w-8 rounded-full hover:bg-white/10"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="relative w-full max-w-3xl shadow-2xl transition-transform duration-200" ref={containerRef}>
                                {previewUrl && (
                                    <div className="relative group">
                                        <img src={previewUrl} alt={`Page ${currentPage}`} className="w-full h-auto pointer-events-none rounded-sm" />

                                        {/* Elements Overlay - Filtered by Current Page */}
                                        <div className="absolute inset-0 overflow-hidden rounded-sm">
                                            {elements.filter(el => el.page === currentPage).map(el => (
                                                <div
                                                    key={el.id}
                                                    className={cn(
                                                        "absolute cursor-move hover:ring-2 hover:ring-blue-400/50 transition-shadow",
                                                        selectedId === el.id ? 'ring-2 ring-blue-500 z-10' : 'z-0'
                                                    )}
                                                    style={{
                                                        left: `${el.x}%`,
                                                        top: `${el.y}%`,
                                                        width: el.type === 'text' ? 'auto' : `${el.width}%`,
                                                        height: el.type === 'text' ? 'auto' : `${el.height}%`,
                                                        opacity: el.opacity,
                                                        transform: `rotate(${el.rotation || 0}deg)`
                                                    }}
                                                    onMouseDown={(e) => handleMouseDown(e, el.id)}
                                                >
                                                    {el.type === 'text' && (
                                                        <div style={{
                                                            fontSize: `${el.fontSize}px`,
                                                            color: el.color,
                                                            fontFamily: el.fontFamily,
                                                            whiteSpace: 'nowrap',
                                                            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                                        }}>
                                                            {el.content as string}
                                                        </div>
                                                    )}
                                                    {el.type === 'image' && (
                                                        <img
                                                            src={URL.createObjectURL(el.content as File)}
                                                            alt="Element"
                                                            className="w-full h-full object-contain"
                                                        />
                                                    )}
                                                    {el.type === 'rectangle' && (
                                                        <div style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            backgroundColor: el.color,
                                                            border: `${el.borderWidth}px solid ${el.borderColor}`
                                                        }} />
                                                    )}
                                                    {el.type === 'circle' && (
                                                        <div style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            borderRadius: '50%',
                                                            backgroundColor: el.color,
                                                            border: `${el.borderWidth}px solid ${el.borderColor}`
                                                        }} />
                                                    )}
                                                    {el.type === 'line' && (
                                                        <div style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            backgroundColor: el.color,
                                                        }} />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Right: Controls */}
                <div className="lg:col-span-3 bg-[#0A0A0A] rounded-xl border border-white/10 p-6 flex flex-col h-full">
                    <div className="flex-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar">

                        {/* 1. Add Elements */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider flex items-center gap-2">
                                <MousePointer2 className="w-4 h-4" /> Add Elements
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <Button variant="outline" onClick={addText} disabled={!file} className="bg-white/5 border-white/10 hover:bg-white/10 hover:text-white justify-start">
                                    <Type className="w-4 h-4 mr-2 text-blue-400" /> Text
                                </Button>
                                <div className="relative">
                                    <Button variant="outline" className="w-full bg-white/5 border-white/10 hover:bg-white/10 hover:text-white justify-start" disabled={!file}>
                                        <ImageIcon className="w-4 h-4 mr-2 text-green-400" /> Image
                                    </Button>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={addImage}
                                        disabled={!file}
                                    />
                                </div>
                                <Button variant="outline" onClick={() => addShape('rectangle')} disabled={!file} className="bg-white/5 border-white/10 hover:bg-white/10 hover:text-white justify-start">
                                    <Square className="w-4 h-4 mr-2 text-orange-400" /> Rect
                                </Button>
                                <Button variant="outline" onClick={() => addShape('circle')} disabled={!file} className="bg-white/5 border-white/10 hover:bg-white/10 hover:text-white justify-start">
                                    <Circle className="w-4 h-4 mr-2 text-purple-400" /> Circle
                                </Button>
                                <Button variant="outline" onClick={() => addShape('line')} disabled={!file} className="bg-white/5 border-white/10 hover:bg-white/10 hover:text-white justify-start col-span-2">
                                    <Minus className="w-4 h-4 mr-2 text-pink-400" /> Line
                                </Button>
                            </div>
                        </div>

                        {/* 2. Element Settings */}
                        {selectedElement ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="h-px bg-white/10" />
                                <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider flex items-center gap-2">
                                    <Settings2 className="w-4 h-4" /> Settings
                                </h3>

                                {/* Content (Text Only) */}
                                {selectedElement.type === 'text' && (
                                    <div className="space-y-3">
                                        <Label>Content</Label>
                                        <Input
                                            value={selectedElement.content as string}
                                            onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                                            className="bg-black/20 border-white/10"
                                        />
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <Label className="text-xs">Font Size</Label>
                                                <Input
                                                    type="number"
                                                    value={selectedElement.fontSize}
                                                    onChange={(e) => updateElement(selectedElement.id, { fontSize: parseInt(e.target.value) })}
                                                    className="bg-black/20 border-white/10 mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs">Color</Label>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Input
                                                        type="color"
                                                        value={selectedElement.color}
                                                        onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                                                        className="w-full h-9 p-1 bg-black/20 border-white/10 cursor-pointer"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Shape Colors */}
                                {(selectedElement.type === 'rectangle' || selectedElement.type === 'circle' || selectedElement.type === 'line') && (
                                    <div className="space-y-3">
                                        <Label>Appearance</Label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <Label className="text-xs text-muted-foreground">Fill</Label>
                                                <Input
                                                    type="color"
                                                    value={selectedElement.color}
                                                    onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                                                    className="w-full h-9 p-1 bg-black/20 border-white/10 cursor-pointer mt-1"
                                                />
                                            </div>
                                            {selectedElement.type !== 'line' && (
                                                <div>
                                                    <Label className="text-xs text-muted-foreground">Border</Label>
                                                    <Input
                                                        type="color"
                                                        value={selectedElement.borderColor}
                                                        onChange={(e) => updateElement(selectedElement.id, { borderColor: e.target.value })}
                                                        className="w-full h-9 p-1 bg-black/20 border-white/10 cursor-pointer mt-1"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Dimensions & Position */}
                                <div className="space-y-3">
                                    <Label className="flex items-center gap-2"><Layout className="w-3 h-3" /> Position & Size</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <Label className="text-xs text-muted-foreground">X (%)</Label>
                                            <Input
                                                type="number"
                                                value={Math.round(selectedElement.x)}
                                                onChange={(e) => updateElement(selectedElement.id, { x: parseFloat(e.target.value) })}
                                                className="bg-black/20 border-white/10 h-8 text-xs"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Y (%)</Label>
                                            <Input
                                                type="number"
                                                value={Math.round(selectedElement.y)}
                                                onChange={(e) => updateElement(selectedElement.id, { y: parseFloat(e.target.value) })}
                                                className="bg-black/20 border-white/10 h-8 text-xs"
                                            />
                                        </div>
                                        {selectedElement.type !== 'text' && (
                                            <>
                                                <div>
                                                    <Label className="text-xs text-muted-foreground">W (%)</Label>
                                                    <Input
                                                        type="number"
                                                        value={Math.round(selectedElement.width!)}
                                                        onChange={(e) => updateElement(selectedElement.id, { width: parseFloat(e.target.value) })}
                                                        className="bg-black/20 border-white/10 h-8 text-xs"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs text-muted-foreground">H (%)</Label>
                                                    <Input
                                                        type="number"
                                                        value={Math.round(selectedElement.height!)}
                                                        onChange={(e) => updateElement(selectedElement.id, { height: parseFloat(e.target.value) })}
                                                        className="bg-black/20 border-white/10 h-8 text-xs"
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Opacity */}
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <Label>Opacity</Label>
                                        <span className="text-xs text-muted-foreground">{Math.round((selectedElement.opacity || 1) * 100)}%</span>
                                    </div>
                                    <Slider
                                        value={[(selectedElement.opacity || 1) * 100]}
                                        max={100}
                                        step={1}
                                        onValueChange={(vals) => updateElement(selectedElement.id, { opacity: vals[0] / 100 })}
                                        className="py-2"
                                    />
                                </div>

                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => deleteElement(selectedElement.id)}
                                    className="w-full mt-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete Element
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm border-2 border-dashed border-white/5 rounded-lg">
                                <MousePointer2 className="w-8 h-8 mb-2 opacity-50" />
                                Select an element to edit
                            </div>
                        )}
                    </div>

                    <div className="pt-6 mt-4 border-t border-white/5">
                        {!resultBlob ? (
                            <Button
                                onClick={handleApply}
                                disabled={!file || isProcessing}
                                className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20"
                            >
                                {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin mr-2" /> : <Edit3 className="w-5 h-5 mr-2" />}
                                {isProcessing ? 'Processing...' : 'Apply Changes'}
                            </Button>
                        ) : (
                            <div className="space-y-3">
                                <Button
                                    onClick={handleDownload}
                                    className="w-full h-12 text-lg bg-green-600 hover:bg-green-500 text-white animate-pulse shadow-lg shadow-green-900/20"
                                >
                                    <Download className="w-5 h-5 mr-2" />
                                    Download PDF
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => setResultBlob(null)}
                                    className="w-full text-muted-foreground hover:text-white"
                                >
                                    Edit Again
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </UniversalToolLayout>
    );
};

export default EditPDF;
