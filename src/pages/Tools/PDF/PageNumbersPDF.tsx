import React, { useState, useEffect, useRef } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Hash, Download, RefreshCw, Settings2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import UniversalToolLayout from '@/components/UniversalToolLayout';
import IngestionZone from '@/components/tools/IngestionZone';
import * as pdfjsLib from 'pdfjs-dist';
import { initPDFWorker } from '@/utils/pdfWorker';

// Initialize PDF.js worker
initPDFWorker();

const PageNumbersPDF = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultBlob, setResultBlob] = useState<Blob | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Preview state
    const [currentPreviewPage, setCurrentPreviewPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Settings
    const [position, setPosition] = useState('bottom-center');
    const [format, setFormat] = useState('Page {n}');
    const [startFrom, setStartFrom] = useState(1);
    const [fontSize, setFontSize] = useState(12);
    const [margin, setMargin] = useState(20);

    const handleFileSelect = (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0]);
            setResultBlob(null);
            setError(null);
            setCurrentPreviewPage(1);
        }
    };

    // Render preview with page number overlay
    useEffect(() => {
        if (!file || !canvasRef.current) return;

        const renderPreview = async () => {
            try {
                const arrayBuffer = await file.arrayBuffer();
                const loadedPdf = await pdfjsLib.getDocument(arrayBuffer).promise;
                setTotalPages(loadedPdf.numPages);

                const page = await loadedPdf.getPage(currentPreviewPage);
                const viewport = page.getViewport({ scale: 1.5 });

                const canvas = canvasRef.current;
                if (!canvas) return;

                const context = canvas.getContext('2d');
                if (!context) return;

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                // Render PDF page
                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;

                // Calculate page number position
                const pageNum = startFrom + currentPreviewPage - 1;
                const text = format.replace('{n}', pageNum.toString()).replace('{total}', loadedPdf.numPages.toString());

                context.font = `${fontSize * 1.5}px Helvetica`;
                const textWidth = context.measureText(text).width;

                let x = 0;
                let y = 0;

                switch (position) {
                    case 'bottom-center':
                        x = viewport.width / 2 - textWidth / 2;
                        y = viewport.height - margin * 1.5;
                        break;
                    case 'bottom-right':
                        x = viewport.width - textWidth - margin * 1.5;
                        y = viewport.height - margin * 1.5;
                        break;
                    case 'bottom-left':
                        x = margin * 1.5;
                        y = viewport.height - margin * 1.5;
                        break;
                    case 'top-center':
                        x = viewport.width / 2 - textWidth / 2;
                        y = margin * 1.5 + fontSize * 1.5;
                        break;
                    case 'top-right':
                        x = viewport.width - textWidth - margin * 1.5;
                        y = margin * 1.5 + fontSize * 1.5;
                        break;
                    case 'top-left':
                        x = margin * 1.5;
                        y = margin * 1.5 + fontSize * 1.5;
                        break;
                }

                // Draw page number with background for visibility
                context.fillStyle = 'rgba(0, 0, 0, 0.5)';
                context.fillRect(x - 5, y - fontSize * 1.5 - 2, textWidth + 10, fontSize * 1.5 + 8);

                context.fillStyle = 'rgb(255, 255, 255)';
                context.fillText(text, x, y);

            } catch (err) {
                console.error('Preview rendering failed:', err);
            }
        };

        renderPreview();
    }, [file, currentPreviewPage, position, format, startFrom, fontSize, margin]);

    const handleApply = async () => {
        if (!file) return;
        setIsProcessing(true);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const pages = pdfDoc.getPages();
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const totalPages = pages.length;

            pages.forEach((page, index) => {
                const pageNum = startFrom + index;
                const text = format.replace('{n}', pageNum.toString()).replace('{total}', totalPages.toString());
                const textWidth = font.widthOfTextAtSize(text, fontSize);
                const { width, height } = page.getSize();

                let x = 0;
                let y = 0;

                switch (position) {
                    case 'bottom-center':
                        x = width / 2 - textWidth / 2;
                        y = margin;
                        break;
                    case 'bottom-right':
                        x = width - textWidth - margin;
                        y = margin;
                        break;
                    case 'bottom-left':
                        x = margin;
                        y = margin;
                        break;
                    case 'top-center':
                        x = width / 2 - textWidth / 2;
                        y = height - margin - fontSize;
                        break;
                    case 'top-right':
                        x = width - textWidth - margin;
                        y = height - margin - fontSize;
                        break;
                    case 'top-left':
                        x = margin;
                        y = height - margin - fontSize;
                        break;
                }

                page.drawText(text, {
                    x,
                    y,
                    size: fontSize,
                    font,
                    color: rgb(0, 0, 0),
                });
            });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
            setResultBlob(blob);
            toast.success("Page Numbers Added Successfully!");

        } catch (err: any) {
            console.error("Failed to add page numbers:", err);
            setError("Failed to add page numbers.");
            toast.error("Process Failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (resultBlob && file) {
            const url = URL.createObjectURL(resultBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${file.name.replace(/\.pdf$/i, '')}_page_numbers.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };

    const HOW_IT_WORKS = [
        "Upload a PDF file",
        "Preview shows exactly where page numbers will appear",
        "Adjust position, format, and size in real-time",
        "Click 'Add Page Numbers'",
        "Download the updated PDF"
    ];

    return (
        <UniversalToolLayout
            title="Add Page Numbers"
            description="Insert page numbers into your PDF documents with custom formatting."
            steps={HOW_IT_WORKS}
            isProcessing={isProcessing}
            error={error}
            onResetError={() => setError(null)}
            about={
                <>
                    <p>
                        Professionalize your documents by adding customizable page numbers.
                        Choose position, format, and style to ensure your PDF is properly indexed and organized.
                    </p>
                </>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-12 h-full min-h-[600px]">
                {/* Left: Preview */}
                <div className="lg:col-span-7 bg-[#0A0A0A] border-r border-white/5 p-8 flex flex-col items-center justify-center relative">
                    {!file ? (
                        <IngestionZone
                            onDrop={handleFileSelect}
                            accept={{ 'application/pdf': ['.pdf'] }}
                            multiple={false}
                            files={[]}
                            className="w-full max-w-xl h-64"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium text-white truncate">{file.name}</h3>
                                    <p className="text-sm text-gray-500">Live Preview with Settings</p>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => { setFile(null); setResultBlob(null); }} className="border-white/10 hover:bg-white/5">
                                    Change File
                                </Button>
                            </div>

                            {/* Canvas Preview */}
                            <div className="flex-1 min-h-0 flex flex-col items-center justify-center bg-gray-900/50 rounded-lg p-4 overflow-auto">
                                <canvas
                                    ref={canvasRef}
                                    className="max-w-full h-auto shadow-2xl"
                                />
                            </div>

                            {/* Page Navigator */}
                            {totalPages > 1 && (
                                <div className="mt-4 flex items-center justify-center gap-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPreviewPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPreviewPage === 1}
                                        className="border-white/10"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    <span className="text-white text-sm">
                                        Page {currentPreviewPage} of {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPreviewPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPreviewPage === totalPages}
                                        className="border-white/10"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right: Settings */}
                <div className="lg:col-span-5 bg-[#111] p-8 flex flex-col">
                    <div className="flex-1 space-y-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Settings2 className="w-5 h-5 text-purple-400" /> Settings
                        </h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Position</Label>
                                <Select value={position} onValueChange={setPosition}>
                                    <SelectTrigger className="bg-black/20 border-white/10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="bottom-center">Bottom Center</SelectItem>
                                        <SelectItem value="bottom-right">Bottom Right</SelectItem>
                                        <SelectItem value="bottom-left">Bottom Left</SelectItem>
                                        <SelectItem value="top-center">Top Center</SelectItem>
                                        <SelectItem value="top-right">Top Right</SelectItem>
                                        <SelectItem value="top-left">Top Left</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Format</Label>
                                <Select value={format} onValueChange={setFormat}>
                                    <SelectTrigger className="bg-black/20 border-white/10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="{n}">1</SelectItem>
                                        <SelectItem value="Page {n}">Page 1</SelectItem>
                                        <SelectItem value="{n} of {total}">1 of 10</SelectItem>
                                        <SelectItem value="Page {n} of {total}">Page 1 of 10</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Start From</Label>
                                    <Input
                                        type="number"
                                        value={startFrom}
                                        onChange={(e) => setStartFrom(parseInt(e.target.value) || 1)}
                                        className="bg-black/20 border-white/10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Font Size</Label>
                                    <Input
                                        type="number"
                                        value={fontSize}
                                        onChange={(e) => setFontSize(parseInt(e.target.value) || 12)}
                                        className="bg-black/20 border-white/10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Margin (px)</Label>
                                <Input
                                    type="number"
                                    value={margin}
                                    onChange={(e) => setMargin(parseInt(e.target.value) || 20)}
                                    className="bg-black/20 border-white/10"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/5">
                        {!resultBlob ? (
                            <Button
                                onClick={handleApply}
                                disabled={!file || isProcessing}
                                className="w-full h-12 text-lg bg-purple-600 hover:bg-purple-500 text-white"
                            >
                                {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin mr-2" /> : <Hash className="w-5 h-5 mr-2" />}
                                {isProcessing ? 'Processing...' : 'Add Page Numbers'}
                            </Button>
                        ) : (
                            <Button
                                onClick={handleDownload}
                                className="w-full h-12 text-lg bg-green-600 hover:bg-green-500 text-white animate-pulse"
                            >
                                <Download className="w-5 h-5 mr-2" />
                                Download PDF
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </UniversalToolLayout>
    );
};

export default PageNumbersPDF;
