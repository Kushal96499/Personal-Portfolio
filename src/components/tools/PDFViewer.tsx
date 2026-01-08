import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PDFViewerProps {
    file: File;
    onPageChange?: (pageNumber: number) => void;
    onPageLoad?: (details: { width: number; height: number; pageNumber: number }) => void;
    children?: React.ReactNode;
    className?: string;
    initialPage?: number;
    currentPage?: number;
    hideControls?: boolean;
    onDocumentLoad?: (details: { numPages: number }) => void;
    scale?: number;
    onScaleChange?: (scale: number) => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
    file,
    onPageChange,
    onPageLoad,
    children,
    className,
    initialPage = 1,
    currentPage: externalPage, // Optional prop to control page from parent
    hideControls = false
}) => {
    const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
    const [internalPage, setInternalPage] = useState(initialPage);

    // Use external page if provided, otherwise internal
    const currentPage = externalPage ?? internalPage;

    const [numPages, setNumPages] = useState(0);
    const [scale, setScale] = useState(1.0);
    const [rotation, setRotation] = useState(0);
    const [loading, setLoading] = useState(true);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Load PDF
    useEffect(() => {
        const loadPDF = async () => {
            try {
                setLoading(true);
                const arrayBuffer = await file.arrayBuffer();
                const loadedPdf = await pdfjsLib.getDocument(arrayBuffer).promise;
                setPdfDoc(loadedPdf);
                setNumPages(loadedPdf.numPages);
                // Only reset if no external page control
                if (externalPage === undefined) {
                    setInternalPage(initialPage);
                }
            } catch (error) {
                console.error("Error loading PDF:", error);
                toast.error("Failed to load PDF");
            } finally {
                setLoading(false);
            }
        };

        if (file) {
            loadPDF();
        }
    }, [file, initialPage]); // Removed externalPage from dep array to avoid reloading PDF on page change

    // Render Page
    const renderPage = useCallback(async () => {
        if (!pdfDoc || !canvasRef.current) return;

        try {
            const page = await pdfDoc.getPage(currentPage);
            // Get unscaled viewport to know original dimensions
            const originalViewport = page.getViewport({ scale: 1.0, rotation: 0 });

            if (onPageLoad) {
                onPageLoad({
                    width: originalViewport.width,
                    height: originalViewport.height,
                    pageNumber: currentPage
                });
            }

            // High DPI support for crisp rendering
            // We'll render at a slightly higher scale for better quality, or stick to 1.0/scale
            // Ideally we want the canvas to be high res but styled down.
            // For now, let's just use the user requested scale.

            // To auto-fit, we might want to check container dimensions, 
            // but the user wants "full page view". If we rely on CSS max-height/width,
            // we should render comfortably large (e.g. scale 1.5 or 2) and let CSS downscale.
            // But this might affect performance. Let's stick to current scale logic for now, 
            // or maybe boost it if it looks blurry.

            const viewport = page.getViewport({ scale: scale, rotation: rotation });
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            if (context) {
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;
            }
        } catch (error) {
            console.error("Error rendering page:", error);
        }
    }, [pdfDoc, currentPage, scale, rotation, onPageLoad]);

    useEffect(() => {
        renderPage();
    }, [renderPage]);

    // Notify parent of page change
    useEffect(() => {
        if (onPageChange) {
            onPageChange(currentPage);
        }
    }, [currentPage, onPageChange]);

    // Navigation Handlers
    const changePage = (offset: number) => {
        const newPage = currentPage + offset;
        if (newPage >= 1 && newPage <= numPages) {
            if (onPageChange) {
                onPageChange(newPage);
            }
            if (externalPage === undefined) {
                setInternalPage(newPage);
            }
        }
    };

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') changePage(-1);
            if (e.key === 'ArrowRight') changePage(1);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentPage, numPages]);

    return (
        <div className={cn("flex flex-col items-center w-full h-full", className)}>
            {/* Toolbar */}
            {!hideControls && (
                <div className="flex items-center justify-between w-full max-w-2xl mb-4 bg-[#111] p-2 rounded-lg border border-white/10 shadow-lg shrink-0">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => changePage(-1)}
                            disabled={currentPage <= 1 || loading}
                            className="h-8 w-8 text-gray-400 hover:text-white"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm font-medium text-white min-w-[80px] text-center">
                            {loading ? '...' : `Page ${currentPage} of ${numPages}`}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => changePage(1)}
                            disabled={currentPage >= numPages || loading}
                            className="h-8 w-8 text-gray-400 hover:text-white"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
                            className="h-8 w-8 text-gray-400 hover:text-white"
                        >
                            <ZoomOut className="w-4 h-4" />
                        </Button>
                        <span className="text-xs text-gray-500 w-12 text-center">{Math.round(scale * 100)}%</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setScale(s => Math.min(3.0, s + 0.1))}
                            className="h-8 w-8 text-gray-400 hover:text-white"
                        >
                            <ZoomIn className="w-4 h-4" />
                        </Button>
                        <div className="w-px h-4 bg-white/10 mx-1" />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setRotation(r => (r + 90) % 360)}
                            className="h-8 w-8 text-gray-400 hover:text-white"
                        >
                            <RotateCw className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Canvas Container - Allow overflow for scrolling */}
            <div className="relative w-full flex-1 min-h-0 bg-[#222] rounded-sm overflow-auto flex border border-white/5" ref={containerRef}>
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 bg-[#222]">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {/* Canvas Wrapper - content determines size */}
                <div className="relative m-auto p-8">
                    <canvas
                        ref={canvasRef}
                        className="block shadow-2xl"
                    />
                    {/* Overlays (Crop box, Signature, etc.) */}
                    {!loading && children && (
                        <div className="absolute inset-0 z-20 m-8">
                            {children}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PDFViewer;
