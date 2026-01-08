import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { CheckCircle2, Loader2, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { initPDFWorker } from '@/utils/pdfWorker';

// Initialize PDF.js worker
initPDFWorker();

interface PDFPreviewProps {
    file: File;
    selectable?: boolean;
    selectedPages?: number[];
    onSelectionChange?: (pages: number[]) => void;
    className?: string;
}

const PDFPreview: React.FC<PDFPreviewProps> = ({
    file,
    selectable = false,
    selectedPages = [],
    onSelectionChange,
    className
}) => {
    const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
    const [pages, setPages] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [scale, setScale] = useState(0.2); // Thumbnail scale
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadPDF = async () => {
            try {
                setLoading(true);
                const arrayBuffer = await file.arrayBuffer();
                const loadedPdf = await pdfjsLib.getDocument(arrayBuffer).promise;
                setPdfDoc(loadedPdf);
                setPages(Array.from({ length: loadedPdf.numPages }, (_, i) => i + 1));
            } catch (error) {
                console.error("Error loading PDF:", error);
                toast.error("Failed to load PDF preview");
            } finally {
                setLoading(false);
            }
        };

        if (file) {
            loadPDF();
        }
    }, [file]);

    const togglePageSelection = (pageIndex: number) => {
        if (!selectable || !onSelectionChange) return;

        const newSelection = selectedPages.includes(pageIndex)
            ? selectedPages.filter(p => p !== pageIndex)
            : [...selectedPages, pageIndex].sort((a, b) => a - b);

        onSelectionChange(newSelection);
    };

    const handleSelectAll = () => {
        if (!onSelectionChange || !pdfDoc) return;
        const allPages = Array.from({ length: pdfDoc.numPages }, (_, i) => i);
        onSelectionChange(allPages);
    };

    const handleDeselectAll = () => {
        if (!onSelectionChange) return;
        onSelectionChange([]);
    };

    return (
        <div className={cn("flex flex-col h-full", className)}>
            {/* Controls */}
            {selectable && (
                <div className="flex justify-between items-center mb-4 px-2">
                    <div className="text-sm text-gray-400">
                        {selectedPages.length} pages selected
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={handleSelectAll} className="text-xs h-8">
                            Select All
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleDeselectAll} className="text-xs h-8">
                            Deselect All
                        </Button>
                    </div>
                </div>
            )}

            {/* Grid */}
            <div
                ref={containerRef}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-2 flex-1 bg-black/20 rounded-xl border border-white/5"
                style={{
                    overflowY: 'scroll',
                    WebkitOverflowScrolling: 'touch'
                }}
            >
                {loading ? (
                    <div className="col-span-full flex flex-col items-center justify-center h-64 text-gray-500">
                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                        <p>Loading PDF...</p>
                    </div>
                ) : (
                    pages.map((pageNum, index) => (
                        <PDFPageThumbnail
                            key={pageNum}
                            pdfDoc={pdfDoc}
                            pageNumber={pageNum}
                            index={index}
                            isSelected={selectedPages.includes(index)}
                            selectable={selectable}
                            onToggle={() => togglePageSelection(index)}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

interface PDFPageThumbnailProps {
    pdfDoc: pdfjsLib.PDFDocumentProxy | null;
    pageNumber: number;
    index: number;
    isSelected: boolean;
    selectable: boolean;
    onToggle: () => void;
}

const PDFPageThumbnail: React.FC<PDFPageThumbnailProps> = ({
    pdfDoc,
    pageNumber,
    index,
    isSelected,
    selectable,
    onToggle
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [rendered, setRendered] = useState(false);

    useEffect(() => {
        const renderPage = async () => {
            if (!pdfDoc || !canvasRef.current || rendered) return;

            try {
                const page = await pdfDoc.getPage(pageNumber);
                const viewport = page.getViewport({ scale: 0.6 }); // Higher quality thumbnails
                const canvas = canvasRef.current;
                const context = canvas.getContext('2d');

                if (context) {
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    await page.render({
                        canvasContext: context,
                        viewport: viewport
                    }).promise;
                    setRendered(true);
                }
            } catch (error) {
                console.error(`Error rendering page ${pageNumber}:`, error);
            }
        };

        renderPage();
    }, [pdfDoc, pageNumber, rendered]);

    return (
        <div
            onClick={onToggle}
            className={cn(
                "relative group cursor-pointer transition-all duration-200",
                selectable && "hover:scale-[1.02]"
            )}
        >
            <div className={cn(
                "relative rounded-lg overflow-hidden bg-white border-2 transition-colors",
                isSelected ? "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" : "border-transparent group-hover:border-white/20"
            )}>
                <canvas ref={canvasRef} className="w-full h-auto block" />

                <div className={cn(
                    "absolute inset-0 bg-blue-500/20 transition-opacity flex items-center justify-center",
                    isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}>
                    {isSelected && (
                        <CheckCircle2 className="w-8 h-8 text-blue-500 fill-white drop-shadow-lg" />
                    )}
                </div>
            </div>

            <div className="mt-2 text-center text-xs text-gray-400 font-medium">
                Page {pageNumber}
            </div>
        </div>
    );
};

export default PDFPreview;
