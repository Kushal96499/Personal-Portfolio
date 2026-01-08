import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import UniversalToolLayout from '@/components/UniversalToolLayout';
import IngestionZone from '@/components/tools/IngestionZone';
import { FileOutput, CheckCircle, RefreshCw, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

const ExtractPages = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultBlob, setResultBlob] = useState<Blob | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [pages, setPages] = useState<string[]>([]); // Array of data URLs
    const [selectedPages, setSelectedPages] = useState<number[]>([]); // Indices of pages to extract
    const [selectionMode, setSelectionMode] = useState<'click' | 'custom'>('click');
    const [customRange, setCustomRange] = useState('');
    const [totalPages, setTotalPages] = useState(0);

    const handleFileSelect = async (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0]);
            setResultBlob(null);
            setError(null);
            setPages([]);
            setSelectedPages([]);
            generateThumbnails(files[0]);
        }
    };

    const generateThumbnails = async (pdfFile: File) => {
        setIsProcessing(true);
        try {
            const arrayBuffer = await pdfFile.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            const numPages = pdf.numPages;
            const newPages: string[] = [];

            for (let i = 1; i <= numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 0.6 }); // Higher quality thumbnails
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({ canvasContext: context!, viewport }).promise;
                newPages.push(canvas.toDataURL());
            }
            setPages(newPages);
            setTotalPages(numPages);
        } catch (err) {
            console.error("Thumbnail generation failed:", err);
            setError("Failed to load PDF pages.");
        } finally {
            setIsProcessing(false);
        }
    };

    const togglePageSelection = (index: number) => {
        if (selectionMode !== 'click') return; // Only allow click selection in click mode
        if (selectedPages.includes(index)) {
            setSelectedPages(selectedPages.filter(i => i !== index));
        } else {
            setSelectedPages([...selectedPages, index]);
        }
    };

    // Parse custom range input like "1-5, 8, 10-12" into array of page indices
    const parseCustomRange = (rangeStr: string, maxPages: number): number[] => {
        const pageSet: Set<number> = new Set();
        const parts = rangeStr.split(',').map(s => s.trim()).filter(Boolean);

        for (const part of parts) {
            if (part.includes('-')) {
                const [start, end] = part.split('-').map(s => parseInt(s.trim(), 10));
                if (!isNaN(start) && !isNaN(end)) {
                    for (let i = Math.max(1, start); i <= Math.min(maxPages, end); i++) {
                        pageSet.add(i - 1); // Convert to 0-indexed
                    }
                }
            } else {
                const pageNum = parseInt(part, 10);
                if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= maxPages) {
                    pageSet.add(pageNum - 1); // Convert to 0-indexed
                }
            }
        }
        return Array.from(pageSet).sort((a, b) => a - b);
    };

    const handleExtractPages = async () => {
        let pagesToExtract = selectedPages;

        if (selectionMode === 'custom' && customRange) {
            pagesToExtract = parseCustomRange(customRange, totalPages);
        }

        if (!file || pagesToExtract.length === 0) {
            toast.error("Please select at least one page to extract");
            return;
        }
        setIsProcessing(true);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);

            // Create a new PDF
            const newPdf = await PDFDocument.create();

            // Copy selected pages
            const copiedPages = await newPdf.copyPages(pdfDoc, pagesToExtract);

            // Add them to the new PDF
            copiedPages.forEach(page => newPdf.addPage(page));

            const pdfBytes = await newPdf.save();
            const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
            setResultBlob(blob);
            toast.success(`${pagesToExtract.length} pages extracted successfully!`);

        } catch (err: any) {
            console.error("Extract failed:", err);
            setError("Failed to extract pages.");
            toast.error("Operation Failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (resultBlob && file) {
            const url = URL.createObjectURL(resultBlob);
            const link = document.createElement('a');
            link.href = url;
            const baseName = file.name.replace(/\.pdf$/i, '');
            link.download = `${baseName}_extract.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };

    const HOW_IT_WORKS = [
        "Upload a PDF file",
        "Select the pages you want to extract",
        "Click 'Extract Selected Pages'",
        "Download the new PDF containing only selected pages"
    ];

    return (
        <UniversalToolLayout
            title="Extract Pages"
            description="Create a new PDF containing only specific pages from your document."
            steps={HOW_IT_WORKS}
            isProcessing={isProcessing}
            error={error}
            onResetError={() => setError(null)}
            about={
                <>
                    <p>
                        Create new PDF documents by extracting specific pages from an existing file.
                        Simply select the pages you need via the visual grid or enter a custom range, and generate a lightweight PDF containing only the relevant content.
                    </p>
                </>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-12 h-full min-h-[600px]">
                {/* Left: Page Grid */}
                <div className="lg:col-span-9 bg-[#0A0A0A] border-r border-white/5 p-8 overflow-y-auto max-h-[800px]">
                    {!file ? (
                        <div className="flex items-center justify-center h-full">
                            <IngestionZone
                                onDrop={handleFileSelect}
                                accept={{ 'application/pdf': ['.pdf'] }}
                                multiple={false}
                                files={[]}
                                className="w-full max-w-xl h-64"
                            />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {pages.map((pageUrl, index) => (
                                <div
                                    key={index}
                                    onClick={() => togglePageSelection(index)}
                                    className={cn(
                                        "relative cursor-pointer group rounded-lg overflow-hidden border-2 transition-all",
                                        selectedPages.includes(index)
                                            ? "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                                            : "border-transparent hover:border-white/20"
                                    )}
                                >
                                    <img src={pageUrl} alt={`Page ${index + 1}`} className="w-full h-auto" />
                                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                        Page {index + 1}
                                    </div>
                                    {selectedPages.includes(index) && (
                                        <div className="absolute top-2 left-2 bg-blue-500 rounded-full p-1">
                                            <CheckCircle className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Controls */}
                <div className="lg:col-span-3 bg-[#111] p-6 flex flex-col">
                    <div className="flex-1 space-y-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <FileOutput className="w-5 h-5 text-blue-400" /> Extract Pages
                        </h3>

                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-sm text-blue-200/80">
                            <p>Only the selected pages will be included in the new document.</p>
                        </div>

                        {/* Selection Mode */}
                        <RadioGroup value={selectionMode} onValueChange={(v: any) => setSelectionMode(v)} className="space-y-3">
                            <div className={`flex items-start space-x-3 p-3 rounded-lg border transition-all ${selectionMode === 'click' ? 'bg-blue-500/10 border-blue-500/30' : 'bg-black/20 border-white/5 hover:bg-white/5'}`}>
                                <RadioGroupItem value="click" id="click-extract" className="mt-1" />
                                <div className="flex-1">
                                    <Label htmlFor="click-extract" className="text-white font-medium cursor-pointer text-sm">Click Selection</Label>
                                    <p className="text-xs text-gray-400 mt-1">Click on pages to select them for extraction</p>
                                </div>
                            </div>

                            <div className={`flex items-start space-x-3 p-3 rounded-lg border transition-all ${selectionMode === 'custom' ? 'bg-blue-500/10 border-blue-500/30' : 'bg-black/20 border-white/5 hover:bg-white/5'}`}>
                                <RadioGroupItem value="custom" id="custom-extract" className="mt-1" />
                                <div className="flex-1">
                                    <Label htmlFor="custom-extract" className="text-white font-medium cursor-pointer text-sm">Custom Range</Label>
                                    <p className="text-xs text-gray-400 mt-1">Enter page numbers (e.g., 1-5, 8, 10-12)</p>

                                    {selectionMode === 'custom' && (
                                        <div className="mt-3">
                                            <Input
                                                type="text"
                                                placeholder="e.g., 1-5, 8, 10-12"
                                                value={customRange}
                                                onChange={(e) => setCustomRange(e.target.value)}
                                                className="bg-black/50 border-white/10 text-white placeholder:text-gray-500 text-sm h-9"
                                            />
                                            {totalPages > 0 && (
                                                <p className="text-xs text-gray-500 mt-1">Total pages: {totalPages}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </RadioGroup>

                        {selectionMode === 'click' && (
                            <div className="text-center">
                                <span className="text-3xl font-bold text-white">{selectedPages.length}</span>
                                <p className="text-gray-400 text-sm">Pages Selected</p>
                            </div>
                        )}

                        {(selectionMode === 'click' && selectedPages.length > 0) && (
                            <Button
                                variant="outline"
                                onClick={() => setSelectedPages([])}
                                className="w-full border-white/10 hover:bg-white/5"
                            >
                                Clear Selection
                            </Button>
                        )}
                    </div>

                    <div className="pt-6 border-t border-white/5">
                        {!resultBlob ? (
                            <Button
                                onClick={handleExtractPages}
                                disabled={!file || isProcessing || selectedPages.length === 0}
                                className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-500 text-white"
                            >
                                {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin mr-2" /> : <FileOutput className="w-5 h-5 mr-2" />}
                                {isProcessing ? 'Extracting...' : 'Extract Pages'}
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

export default ExtractPages;
