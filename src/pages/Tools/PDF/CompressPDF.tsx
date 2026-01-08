import React, { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { Minimize2, Download, RefreshCw, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import UniversalToolLayout from '@/components/UniversalToolLayout';
import IngestionZone from '@/components/tools/IngestionZone';
import jsPDF from 'jspdf';

const CompressPDF = () => {
    const [file, setFile] = useState<File | null>(null);
    const [resultBlob, setResultBlob] = useState<Blob | null>(null);
    const [resultSize, setResultSize] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [compressionLevel, setCompressionLevel] = useState<'extreme' | 'recommended' | 'less'>('recommended');

    const handleFileSelect = (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0]);
            setResultBlob(null);
            setError(null);
            setProgress(0);
        }
    };

    const handleCompress = async () => {
        if (!file) return;

        setIsProcessing(true);
        setError(null);
        setProgress(10);

        try {
            if (compressionLevel === 'less') {
                // Lossless: Just load and save (removes unused objects/metadata)
                const arrayBuffer = await file.arrayBuffer();
                const pdfDoc = await PDFDocument.load(arrayBuffer);
                const pdfBytes = await pdfDoc.save({ useObjectStreams: false }); // Sometimes false is smaller for simple docs, but true is standard

                const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
                setResultBlob(blob);
                setResultSize(blob.size);
                setProgress(100);
                toast.success("PDF Optimized (Lossless)!");

            } else {
                // Lossy: Render to Canvas -> Image -> New PDF (Visual Compression)
                // This is heavy but effective for scanned docs
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
                const totalPages = pdf.numPages;

                const doc = new jsPDF({
                    orientation: 'p',
                    unit: 'px',
                    format: 'a4',
                    compress: true
                });

                let scale = 1.0;
                let quality = 0.7;

                if (compressionLevel === 'extreme') {
                    scale = 0.8; // Downscale resolution
                    quality = 0.5; // Lower JPEG quality
                } else {
                    scale = 1.0; // Native resolution (approx)
                    quality = 0.8; // Good JPEG quality
                }

                for (let i = 1; i <= totalPages; i++) {
                    setProgress(10 + Math.round((i / totalPages) * 80));

                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: scale * 1.5 }); // 1.5x for sharpness before compression

                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    await page.render({ canvasContext: context!, viewport: viewport }).promise;

                    const imgData = canvas.toDataURL('image/jpeg', quality);

                    // Add to PDF
                    if (i > 1) doc.addPage([viewport.width, viewport.height]);
                    else {
                        // Resize first page to match content
                        doc.deletePage(1);
                        doc.addPage([viewport.width, viewport.height]);
                    }

                    doc.addImage(imgData, 'JPEG', 0, 0, viewport.width, viewport.height);
                }

                const blob = doc.output('blob');
                setResultBlob(blob);
                setResultSize(blob.size);
                setProgress(100);
                toast.success(`Compressed! Saved ${(100 - (blob.size / file.size * 100)).toFixed(1)}%`);
            }

        } catch (err: any) {
            console.error("Compression failed:", err);
            setError(err.message || "Compression failed.");
            toast.error("Compression Failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (resultBlob && file) {
            const url = URL.createObjectURL(resultBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${file.name.replace(/\.pdf$/i, '')}_compress.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };

    const HOW_IT_WORKS = [
        "Upload your PDF file",
        "Select compression level",
        "Click 'Compress PDF'",
        "Download the smaller file"
    ];

    return (
        <UniversalToolLayout
            title="Compress PDF"
            description="Reduce file size while optimizing for maximal PDF quality."
            steps={HOW_IT_WORKS}
            isProcessing={isProcessing}
            error={error}
            onResetError={() => setError(null)}
            about={
                <>
                    <p>
                        Optimize your PDF files for easier sharing and storage without compromising quality.
                        This tool provides multiple compression levels, allowing you to balance file size reduction with visual fidelity, all processed locally on your device.
                    </p>
                </>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-12 h-full min-h-[600px]">
                {/* Left: Preview / Input */}
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
                        <div className="w-full max-w-md bg-[#161616] border border-white/10 rounded-xl p-6 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4 border border-green-500/20">
                                <FileText className="w-8 h-8 text-green-500" />
                            </div>
                            <h3 className="text-lg font-medium text-white mb-1 truncate w-full">{file.name}</h3>
                            <p className="text-sm text-gray-500 mb-6">Original: {(file.size / 1024 / 1024).toFixed(2)} MB</p>

                            {resultBlob && (
                                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg w-full">
                                    <p className="text-green-400 font-bold text-lg">
                                        New Size: {(resultSize / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                    <p className="text-green-200/70 text-sm">
                                        Reduced by {(100 - (resultSize / file.size * 100)).toFixed(1)}%
                                    </p>
                                </div>
                            )}

                            <Button variant="outline" size="sm" onClick={() => setFile(null)} className="border-white/10 hover:bg-white/5">
                                Change File
                            </Button>
                        </div>
                    )}
                </div>

                {/* Right: Settings */}
                <div className="lg:col-span-5 bg-[#111] p-8 flex flex-col">
                    <div className="flex-1 space-y-8">
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Minimize2 className="w-5 h-5 text-green-400" /> Compression Level
                            </h3>

                            <RadioGroup value={compressionLevel} onValueChange={(v: any) => setCompressionLevel(v)} className="space-y-4">
                                <div className={`flex items-start space-x-3 p-4 rounded-lg border transition-all ${compressionLevel === 'extreme' ? 'bg-green-500/10 border-green-500/30' : 'bg-black/20 border-white/5 hover:bg-white/5'}`}>
                                    <RadioGroupItem value="extreme" id="extreme" className="mt-1" />
                                    <div className="flex-1">
                                        <Label htmlFor="extreme" className="text-white font-medium cursor-pointer">Extreme Compression</Label>
                                        <p className="text-xs text-gray-400 mt-1">Less quality, high compression. Good for text documents.</p>
                                    </div>
                                </div>

                                <div className={`flex items-start space-x-3 p-4 rounded-lg border transition-all ${compressionLevel === 'recommended' ? 'bg-green-500/10 border-green-500/30' : 'bg-black/20 border-white/5 hover:bg-white/5'}`}>
                                    <RadioGroupItem value="recommended" id="recommended" className="mt-1" />
                                    <div className="flex-1">
                                        <Label htmlFor="recommended" className="text-white font-medium cursor-pointer">Recommended Compression</Label>
                                        <p className="text-xs text-gray-400 mt-1">Good quality, good compression. Balanced approach.</p>
                                    </div>
                                </div>

                                <div className={`flex items-start space-x-3 p-4 rounded-lg border transition-all ${compressionLevel === 'less' ? 'bg-green-500/10 border-green-500/30' : 'bg-black/20 border-white/5 hover:bg-white/5'}`}>
                                    <RadioGroupItem value="less" id="less" className="mt-1" />
                                    <div className="flex-1">
                                        <Label htmlFor="less" className="text-white font-medium cursor-pointer">Less Compression</Label>
                                        <p className="text-xs text-gray-400 mt-1">High quality, less compression. Removes unused data only.</p>
                                    </div>
                                </div>
                            </RadioGroup>
                        </div>

                        {compressionLevel !== 'less' && (
                            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex gap-3">
                                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                                <p className="text-xs text-yellow-200/80">
                                    Note: Extreme and Recommended modes re-process the PDF pages as images. This may remove selectable text (OCR required to restore). Use "Less Compression" to keep text selectable.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="pt-6 border-t border-white/5">
                        {!resultBlob ? (
                            <Button
                                onClick={handleCompress}
                                disabled={!file || isProcessing}
                                className="w-full h-12 text-lg bg-green-600 hover:bg-green-500 text-white"
                            >
                                {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin mr-2" /> : <Minimize2 className="w-5 h-5 mr-2" />}
                                {isProcessing ? `Compressing ${progress}%...` : 'Compress PDF'}
                            </Button>
                        ) : (
                            <Button
                                onClick={handleDownload}
                                className="w-full h-12 text-lg bg-green-600 hover:bg-green-500 text-white animate-pulse"
                            >
                                <Download className="w-5 h-5 mr-2" />
                                Download Compressed PDF
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </UniversalToolLayout>
    );
};

export default CompressPDF;
