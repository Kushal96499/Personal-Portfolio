import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';
import { ScanText, FileText, RefreshCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import UniversalToolLayout from '@/components/UniversalToolLayout';
import IngestionZone from '@/components/tools/IngestionZone';

const OCRPDF = () => {
    const [file, setFile] = useState<File | null>(null);
    const [extractedText, setExtractedText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const handleFileSelect = async (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0]);
            setExtractedText('');
            setError(null);
            setProgress(0);
        }
    };

    const handleOCR = async () => {
        if (!file) return;
        setIsProcessing(true);
        setProgress(0);
        setExtractedText('');

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            const numPages = pdf.numPages;
            let fullText = '';

            for (let i = 1; i <= numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 2.0 }); // High res for better OCR
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({ canvasContext: context!, viewport }).promise;

                const imageData = canvas.toDataURL('image/png');

                const result = await Tesseract.recognize(
                    imageData,
                    'eng',
                    {
                        logger: m => {
                            if (m.status === 'recognizing text') {
                                // Calculate overall progress based on page number and tesseract progress
                                const pageProgress = m.progress / numPages;
                                const currentBase = (i - 1) / numPages;
                                setProgress(Math.round((currentBase + pageProgress) * 100));
                            }
                        }
                    }
                );

                fullText += `--- Page ${i} ---\n\n${result.data.text}\n\n`;
            }

            setExtractedText(fullText);
            toast.success("OCR Completed Successfully!");

        } catch (err: any) {
            console.error("OCR failed:", err);
            setError("Failed to perform OCR.");
            toast.error("OCR Failed");
        } finally {
            setIsProcessing(false);
            setProgress(100);
        }
    };

    const handleDownload = () => {
        if (extractedText) {
            const blob = new Blob([extractedText], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${file?.name.replace(/\.pdf$/i, '')}_ocr.txt`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };

    const HOW_IT_WORKS = [
        "Upload a scanned PDF file",
        "Click 'Start OCR'",
        "Wait for the text recognition to complete",
        "Download the extracted text"
    ];

    return (
        <UniversalToolLayout
            title="OCR PDF"
            description="Extract text from scanned PDF documents using Optical Character Recognition."
            steps={HOW_IT_WORKS}
            isProcessing={isProcessing}
            error={error}
            onResetError={() => setError(null)}
            about={
                <>
                    <p>
                        Convert scanned PDF documents into editable text using Optical Character Recognition (OCR).
                        This tool analyzes the images in your PDF and extracts readable text, making it searchable and copiable.
                    </p>
                </>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-12 h-full min-h-[600px]">
                {/* Left: Input & Preview */}
                <div className="lg:col-span-6 bg-[#0A0A0A] border-r border-white/5 p-8 flex flex-col items-center justify-center">
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
                            <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-4 border border-purple-500/20">
                                <ScanText className="w-8 h-8 text-purple-500" />
                            </div>
                            <h3 className="text-lg font-medium text-white mb-1 truncate w-full">{file.name}</h3>
                            <p className="text-sm text-gray-500 mb-6">{(file.size / 1024 / 1024).toFixed(2)} MB</p>

                            <Button variant="outline" size="sm" onClick={() => setFile(null)} className="border-white/10 hover:bg-white/5">
                                Change File
                            </Button>
                        </div>
                    )}
                </div>

                {/* Right: Output */}
                <div className="lg:col-span-6 bg-[#111] p-8 flex flex-col h-full">
                    <div className="flex-1 flex flex-col">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-purple-400" /> Extracted Text
                        </h3>

                        <div className="flex-1 bg-black/20 border border-white/10 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-y-auto min-h-[300px] whitespace-pre-wrap">
                            {extractedText || (isProcessing ? "Processing..." : "No text extracted yet.")}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 mt-6 space-y-4">
                        {isProcessing && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs text-gray-400">
                                    <span>Recognizing text...</span>
                                    <span>{progress}%</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                            </div>
                        )}

                        {!extractedText ? (
                            <Button
                                onClick={handleOCR}
                                disabled={!file || isProcessing}
                                className="w-full h-12 text-lg bg-purple-600 hover:bg-purple-500 text-white"
                            >
                                {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin mr-2" /> : <ScanText className="w-5 h-5 mr-2" />}
                                {isProcessing ? 'Scanning...' : 'Start OCR'}
                            </Button>
                        ) : (
                            <Button
                                onClick={handleDownload}
                                className="w-full h-12 text-lg bg-green-600 hover:bg-green-500 text-white animate-pulse"
                            >
                                <Download className="w-5 h-5 mr-2" />
                                Download Text
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </UniversalToolLayout>
    );
};

export default OCRPDF;
