import React, { useState, useEffect } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { RotateCw, RotateCcw, Download, RefreshCw, FileText, Trash2, Undo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import UniversalToolLayout from '@/components/UniversalToolLayout';
import IngestionZone from '@/components/tools/IngestionZone';
import { initPDFWorker } from '@/utils/pdfWorker';

// Initialize PDF.js worker
initPDFWorker();

interface PageRotation {
    pageIndex: number;
    rotation: number; // 0, 90, 180, 270
    imageUrl: string;
}

const RotatePDF = () => {
    const [file, setFile] = useState<File | null>(null);
    const [pages, setPages] = useState<PageRotation[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultBlob, setResultBlob] = useState<Blob | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileSelect = async (files: File[]) => {
        if (files.length > 0) {
            const selectedFile = files[0];
            setFile(selectedFile);
            setResultBlob(null);
            setError(null);
            setIsProcessing(true);

            try {
                const arrayBuffer = await selectedFile.arrayBuffer();
                const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
                const numPages = pdf.numPages;
                const newPages: PageRotation[] = [];

                for (let i = 1; i <= numPages; i++) {
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 0.5 }); // Thumbnail scale
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    await page.render({ canvasContext: context!, viewport }).promise;
                    newPages.push({
                        pageIndex: i - 1,
                        rotation: 0,
                        imageUrl: canvas.toDataURL()
                    });
                }
                setPages(newPages);
            } catch (err: any) {
                console.error("Error loading PDF:", err);
                setError("Failed to load PDF pages.");
                toast.error("Failed to load PDF");
            } finally {
                setIsProcessing(false);
            }
        }
    };

    const rotatePage = (index: number, direction: 'cw' | 'ccw') => {
        setPages(prev => prev.map((p, i) => {
            if (i === index) {
                let newRotation = p.rotation + (direction === 'cw' ? 90 : -90);
                if (newRotation >= 360) newRotation = 0;
                if (newRotation < 0) newRotation = 270;
                return { ...p, rotation: newRotation };
            }
            return p;
        }));
    };

    const rotateAll = (direction: 'cw' | 'ccw') => {
        setPages(prev => prev.map(p => {
            let newRotation = p.rotation + (direction === 'cw' ? 90 : -90);
            if (newRotation >= 360) newRotation = 0;
            if (newRotation < 0) newRotation = 270;
            return { ...p, rotation: newRotation };
        }));
    };

    const resetRotation = () => {
        setPages(prev => prev.map(p => ({ ...p, rotation: 0 })));
    };

    const handleRotateAndSave = async () => {
        if (!file) return;
        setIsProcessing(true);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const pdfPages = pdfDoc.getPages();

            pages.forEach((p, i) => {
                if (p.rotation !== 0) {
                    const page = pdfPages[i];
                    const currentRotation = page.getRotation().angle;
                    page.setRotation(degrees(currentRotation + p.rotation));
                }
            });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
            setResultBlob(blob);
            toast.success("PDF Rotated Successfully!");
        } catch (err: any) {
            console.error("Rotation failed:", err);
            setError("Failed to rotate PDF.");
            toast.error("Rotation Failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (resultBlob && file) {
            const url = URL.createObjectURL(resultBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${file.name.replace(/\.pdf$/i, '')}_rotate.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };

    const HOW_IT_WORKS = [
        "Upload a PDF file",
        "Rotate individual pages or all pages at once",
        "Click 'Apply Rotation'",
        "Download the rotated PDF"
    ];

    return (
        <UniversalToolLayout
            title="Rotate PDF"
            description="Permanently rotate PDF pages 90, 180, or 270 degrees."
            steps={HOW_IT_WORKS}
            isProcessing={isProcessing}
            error={error}
            onResetError={() => setError(null)}
            about={
                <>
                    <p>
                        Permanently rotate pages within your PDF.
                        Correct the orientation of single pages or the entire document by 90, 180, or 270 degrees.
                    </p>
                </>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-12 h-full min-h-[600px]">
                {/* Left: Preview & Controls */}
                <div className="lg:col-span-8 bg-[#0A0A0A] border-r border-white/5 p-8 flex flex-col relative overflow-y-auto max-h-[800px]">
                    {!file ? (
                        <div className="flex flex-col items-center justify-center h-full w-full">
                            <IngestionZone
                                onDrop={handleFileSelect}
                                accept={{ 'application/pdf': ['.pdf'] }}
                                multiple={false}
                                files={[]}
                                className="w-full max-w-xl h-64"
                            />
                        </div>
                    ) : (
                        <div className="w-full">
                            <div className="flex justify-between items-center mb-6 sticky top-0 bg-[#0A0A0A] z-10 py-4 border-b border-white/5">
                                <h3 className="text-lg font-medium text-white">{file.name}</h3>
                                <Button variant="ghost" size="sm" onClick={() => setFile(null)} className="text-gray-400 hover:text-white">
                                    Change File
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {pages.map((page, index) => (
                                    <div key={index} className="relative group">
                                        <div
                                            className="bg-white rounded-lg overflow-hidden shadow-lg transition-transform duration-300"
                                            style={{ transform: `rotate(${page.rotation}deg)` }}
                                        >
                                            <img src={page.imageUrl} alt={`Page ${index + 1}`} className="w-full h-auto object-contain" />
                                        </div>
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-lg">
                                            <Button
                                                size="icon"
                                                variant="secondary"
                                                className="rounded-full w-8 h-8"
                                                onClick={() => rotatePage(index, 'ccw')}
                                            >
                                                <RotateCcw className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="secondary"
                                                className="rounded-full w-8 h-8"
                                                onClick={() => rotatePage(index, 'cw')}
                                            >
                                                <RotateCw className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                                            {index + 1}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Global Controls */}
                <div className="lg:col-span-4 bg-[#111] p-8 flex flex-col">
                    <div className="flex-1 space-y-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Rotation Controls</h3>

                        <div className="grid grid-cols-2 gap-3">
                            <Button variant="outline" onClick={() => rotateAll('ccw')} disabled={!file} className="border-white/10 hover:bg-white/5">
                                <RotateCcw className="w-4 h-4 mr-2" /> Left All
                            </Button>
                            <Button variant="outline" onClick={() => rotateAll('cw')} disabled={!file} className="border-white/10 hover:bg-white/5">
                                <RotateCw className="w-4 h-4 mr-2" /> Right All
                            </Button>
                        </div>

                        <Button variant="outline" onClick={resetRotation} disabled={!file} className="w-full border-white/10 hover:bg-white/5">
                            <Undo className="w-4 h-4 mr-2" /> Reset All
                        </Button>
                    </div>

                    <div className="pt-6 border-t border-white/5">
                        {!resultBlob ? (
                            <Button
                                onClick={handleRotateAndSave}
                                disabled={!file || isProcessing}
                                className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-500 text-white"
                            >
                                {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin mr-2" /> : <RotateCw className="w-5 h-5 mr-2" />}
                                {isProcessing ? 'Processing...' : 'Apply Rotation'}
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

export default RotatePDF;
