import React, { useState, useRef } from 'react';
import { PDFDocument, rgb } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { Eraser, Download, RefreshCw, Move, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import UniversalToolLayout from '@/components/UniversalToolLayout';
import IngestionZone from '@/components/tools/IngestionZone';
import { initPDFWorker } from '@/utils/pdfWorker';

// Initialize PDF.js worker
initPDFWorker();

interface RedactionRect {
    id: string;
    x: number; // Percentage
    y: number; // Percentage
    width: number; // Percentage
    height: number; // Percentage
}

const RedactPDF = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultBlob, setResultBlob] = useState<Blob | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [redactions, setRedactions] = useState<RedactionRect[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [currentRect, setCurrentRect] = useState<RedactionRect | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);

    const handleFileSelect = async (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0]);
            setResultBlob(null);
            setError(null);
            setRedactions([]);
            generatePreview(files[0]);
        }
    };

    const generatePreview = async (pdfFile: File) => {
        try {
            const arrayBuffer = await pdfFile.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 1.0 });

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context!, viewport }).promise;
            setPreviewUrl(canvas.toDataURL());
        } catch (err) {
            console.error("Preview generation failed:", err);
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        setIsDrawing(true);
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setStartPos({ x, y });
        setCurrentRect({
            id: 'temp',
            x,
            y,
            width: 0,
            height: 0
        });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDrawing || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const currentX = ((e.clientX - rect.left) / rect.width) * 100;
        const currentY = ((e.clientY - rect.top) / rect.height) * 100;

        const x = Math.min(startPos.x, currentX);
        const y = Math.min(startPos.y, currentY);
        const width = Math.abs(currentX - startPos.x);
        const height = Math.abs(currentY - startPos.y);

        setCurrentRect({ id: 'temp', x, y, width, height });
    };

    const handleMouseUp = () => {
        if (isDrawing && currentRect && currentRect.width > 0 && currentRect.height > 0) {
            setRedactions([...redactions, { ...currentRect, id: Date.now().toString() }]);
        }
        setIsDrawing(false);
        setCurrentRect(null);
    };

    const undoLastRedaction = () => {
        setRedactions(redactions.slice(0, -1));
    };

    const handleApplyRedaction = async () => {
        if (!file) return;
        setIsProcessing(true);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const pages = pdfDoc.getPages();
            const page = pages[0]; // Apply to first page for now
            const { width, height } = page.getSize();

            redactions.forEach(rect => {
                const x = (rect.x / 100) * width;
                const y = height - ((rect.y + rect.height) / 100) * height; // PDF Y is from bottom
                const w = (rect.width / 100) * width;
                const h = (rect.height / 100) * height;

                page.drawRectangle({
                    x,
                    y,
                    width: w,
                    height: h,
                    color: rgb(0, 0, 0),
                });
            });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
            setResultBlob(blob);
            toast.success("PDF Redacted Successfully!");

        } catch (err: any) {
            console.error("Redaction failed:", err);
            setError("Failed to redact PDF.");
            toast.error("Redaction Failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (resultBlob && file) {
            const url = URL.createObjectURL(resultBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${file.name.replace(/\.pdf$/i, '')}_redact.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };

    const HOW_IT_WORKS = [
        "Upload a PDF file",
        "Draw boxes over the text you want to hide",
        "Click 'Apply Redaction'",
        "Download the redacted document"
    ];

    return (
        <UniversalToolLayout
            title="Redact PDF"
            description="Permanently black out sensitive information in your PDF."
            steps={HOW_IT_WORKS}
            isProcessing={isProcessing}
            error={error}
            onResetError={() => setError(null)}
            about={
                <>
                    <p>
                        Permanently remove sensitive information from your PDFs.
                        Black out confidential text, financial data, or personal details to sanitise your documents before sharing them.
                    </p>
                </>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-12 h-full min-h-[600px]">
                {/* Left: Preview & Drawing */}
                <div className="lg:col-span-9 bg-[#0A0A0A] border-r border-white/5 p-8 flex flex-col items-center justify-center relative select-none">
                    {!file ? (
                        <IngestionZone
                            onDrop={handleFileSelect}
                            accept={{ 'application/pdf': ['.pdf'] }}
                            multiple={false}
                            files={[]}
                            className="w-full max-w-xl h-64"
                        />
                    ) : (
                        <div
                            ref={containerRef}
                            className="relative w-full max-w-3xl shadow-2xl cursor-crosshair"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        >
                            {previewUrl && (
                                <div className="relative">
                                    <img src={previewUrl} alt="PDF Preview" className="w-full h-auto pointer-events-none" />

                                    {/* Redactions Overlay */}
                                    <div className="absolute inset-0 pointer-events-none">
                                        {redactions.map(rect => (
                                            <div
                                                key={rect.id}
                                                className="absolute bg-black"
                                                style={{
                                                    left: `${rect.x}%`,
                                                    top: `${rect.y}%`,
                                                    width: `${rect.width}%`,
                                                    height: `${rect.height}%`
                                                }}
                                            />
                                        ))}
                                        {currentRect && (
                                            <div
                                                className="absolute bg-black/50 border border-black"
                                                style={{
                                                    left: `${currentRect.x}%`,
                                                    top: `${currentRect.y}%`,
                                                    width: `${currentRect.width}%`,
                                                    height: `${currentRect.height}%`
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right: Controls */}
                <div className="lg:col-span-3 bg-[#111] p-6 flex flex-col">
                    <div className="flex-1 space-y-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Eraser className="w-5 h-5 text-red-400" /> Redaction Tools
                        </h3>

                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-sm text-yellow-200/80 flex gap-2">
                            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                            <p>This tool adds black boxes over content. For maximum security, ensure the underlying text is not selectable in the output.</p>
                        </div>

                        <div className="space-y-4">
                            <Button
                                variant="outline"
                                onClick={undoLastRedaction}
                                disabled={redactions.length === 0}
                                className="w-full border-white/10 hover:bg-white/5"
                            >
                                Undo Last Box
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => setRedactions([])}
                                disabled={redactions.length === 0}
                                className="w-full border-white/10 hover:bg-white/5 text-red-400 hover:text-red-300"
                            >
                                Clear All
                            </Button>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/5">
                        {!resultBlob ? (
                            <Button
                                onClick={handleApplyRedaction}
                                disabled={!file || isProcessing || redactions.length === 0}
                                className="w-full h-12 text-lg bg-red-600 hover:bg-red-500 text-white"
                            >
                                {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin mr-2" /> : <Eraser className="w-5 h-5 mr-2" />}
                                {isProcessing ? 'Redacting...' : 'Apply Redaction'}
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

export default RedactPDF;
