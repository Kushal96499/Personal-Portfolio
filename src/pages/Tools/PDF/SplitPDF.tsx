import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Scissors, Download, RefreshCw, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from 'sonner';
import UniversalToolLayout from '@/components/UniversalToolLayout';
import IngestionZone from '@/components/tools/IngestionZone';
import PDFPreview from '@/components/tools/PDFPreview';
import JSZip from 'jszip';
import { initPDFWorker } from '@/utils/pdfWorker';

// Initialize PDF.js worker
initPDFWorker();

const SplitPDF = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultBlob, setResultBlob] = useState<Blob | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [splitMode, setSplitMode] = useState<'range' | 'custom' | 'all'>('range');
    const [selectedPages, setSelectedPages] = useState<number[]>([]);
    const [customRange, setCustomRange] = useState(''); // e.g., "1-5, 8, 10-12"
    const [totalPages, setTotalPages] = useState(0);

    const handleFileSelect = (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0]);
            setResultBlob(null);
            setError(null);
            setSelectedPages([]);
        }
    };

    // Parse custom range input like "1-5, 8, 10-12" into array of page indices
    const parseCustomRange = (rangeStr: string, maxPages: number): number[] => {
        const pages: Set<number> = new Set();
        const parts = rangeStr.split(',').map(s => s.trim()).filter(Boolean);

        for (const part of parts) {
            if (part.includes('-')) {
                const [start, end] = part.split('-').map(s => parseInt(s.trim(), 10));
                if (!isNaN(start) && !isNaN(end)) {
                    for (let i = Math.max(1, start); i <= Math.min(maxPages, end); i++) {
                        pages.add(i - 1); // Convert to 0-indexed
                    }
                }
            } else {
                const pageNum = parseInt(part, 10);
                if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= maxPages) {
                    pages.add(pageNum - 1); // Convert to 0-indexed
                }
            }
        }
        return Array.from(pages).sort((a, b) => a - b);
    };

    const handleSplit = async () => {
        if (!file) return;

        setIsProcessing(true);
        setError(null);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const pdfTotalPages = pdfDoc.getPageCount();

            if (splitMode === 'all') {
                // Split every page into separate PDF
                const zip = new JSZip();

                for (let i = 0; i < pdfTotalPages; i++) {
                    const newPdf = await PDFDocument.create();
                    const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
                    newPdf.addPage(copiedPage);
                    const pdfBytes = await newPdf.save();
                    zip.file(`page_${i + 1}.pdf`, pdfBytes);
                }

                const content = await zip.generateAsync({ type: "blob" });
                setResultBlob(content);
                toast.success(`Split into ${pdfTotalPages} files successfully!`);

            } else {
                // Split by selected pages (from click selection or custom range)
                let pagesToExtract = selectedPages;

                if (splitMode === 'custom' && customRange) {
                    pagesToExtract = parseCustomRange(customRange, pdfTotalPages);
                }

                if (pagesToExtract.length === 0) {
                    throw new Error("Please select at least one page to extract.");
                }

                const newPdf = await PDFDocument.create();
                const copiedPages = await newPdf.copyPages(pdfDoc, pagesToExtract);
                copiedPages.forEach(page => newPdf.addPage(page));

                const pdfBytes = await newPdf.save();
                const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
                setResultBlob(blob);
                toast.success(`${pagesToExtract.length} pages extracted successfully!`);
            }

        } catch (err: any) {
            console.error("Split failed:", err);
            setError(err.message || "Failed to split PDF.");
            toast.error("Split Failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (resultBlob && file) {
            const url = URL.createObjectURL(resultBlob);
            const link = document.createElement('a');
            link.href = url;
            // Get filename without extension
            const baseName = file.name.replace(/\.pdf$/i, '');
            link.download = splitMode === 'all' ? `${baseName}_split.zip` : `${baseName}_split.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };

    const HOW_IT_WORKS = [
        "Upload a PDF file",
        "Choose 'Extract Pages' or 'Split All'",
        "Select specific pages by clicking on them",
        "Download the result"
    ];

    return (
        <UniversalToolLayout
            title="Split PDF"
            description="Separate one page or a whole set for easy conversion into independent PDF files."
            steps={HOW_IT_WORKS}
            isProcessing={isProcessing}
            error={error}
            onResetError={() => setError(null)}
            about={
                <>
                    <p>
                        Break a large PDF into smaller, more manageable files.
                        Extract specific pages or split the entire document into individual pages with a single click.
                    </p>
                </>
            }
        >
            <div className="flex flex-col lg:grid lg:grid-cols-12 h-full min-h-[400px] lg:min-h-[600px] gap-4 lg:gap-6">
                {/* Left: Preview / Input - Shows second on mobile, first on desktop */}
                <div className="order-2 lg:order-1 lg:col-span-8 bg-[#050505] rounded-xl border border-white/10 p-4 lg:p-6 flex flex-col relative overflow-hidden min-h-[300px] lg:min-h-0">
                    {!file ? (
                        <div className="flex-1 flex items-center justify-center">
                            <IngestionZone
                                onDrop={handleFileSelect}
                                accept={{ 'application/pdf': ['.pdf'] }}
                                multiple={false}
                                files={[]}
                                className="w-full max-w-xl h-48 lg:h-64"
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col h-full">
                            <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center border border-red-500/20">
                                        <FileText className="w-5 h-5 text-red-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-white truncate max-w-[150px] lg:max-w-[200px]">{file.name}</h3>
                                        <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setFile(null)} className="text-gray-400 hover:text-white text-xs lg:text-sm">
                                    Change File
                                </Button>
                            </div>

                            <div className="flex-1 overflow-hidden min-h-[250px]">
                                <PDFPreview
                                    file={file}
                                    selectable={splitMode === 'range'}
                                    selectedPages={selectedPages}
                                    onSelectionChange={setSelectedPages}
                                    className="h-full"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Settings - Shows first on mobile */}
                <div className="order-1 lg:order-2 lg:col-span-4 bg-[#0A0A0A] rounded-xl border border-white/10 p-4 lg:p-6 flex flex-col">
                    <div className="flex-1 space-y-4 lg:space-y-8">
                        <div>
                            <h3 className="text-base lg:text-lg font-semibold text-white mb-3 lg:mb-4 flex items-center gap-2">
                                <Scissors className="w-4 h-4 lg:w-5 lg:h-5 text-red-400" /> Split Options
                            </h3>

                            <RadioGroup value={splitMode} onValueChange={(v: any) => setSplitMode(v)} className="space-y-3 lg:space-y-4">
                                <div className={`flex items-start space-x-3 p-3 lg:p-4 rounded-lg border transition-all ${splitMode === 'range' ? 'bg-red-500/10 border-red-500/30' : 'bg-black/20 border-white/5 hover:bg-white/5'}`}>
                                    <RadioGroupItem value="range" id="range" className="mt-1" />
                                    <div className="flex-1">
                                        <Label htmlFor="range" className="text-white font-medium cursor-pointer text-sm lg:text-base">Extract Pages</Label>
                                        <p className="text-xs text-gray-400 mt-1">Click on pages in the preview to select them.</p>

                                        {splitMode === 'range' && (
                                            <div className="mt-2 lg:mt-3 text-xs text-red-400 font-medium">
                                                {selectedPages.length > 0
                                                    ? `${selectedPages.length} pages selected`
                                                    : "Click pages on the left to select"}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className={`flex items-start space-x-3 p-3 lg:p-4 rounded-lg border transition-all ${splitMode === 'custom' ? 'bg-red-500/10 border-red-500/30' : 'bg-black/20 border-white/5 hover:bg-white/5'}`}>
                                    <RadioGroupItem value="custom" id="custom" className="mt-1" />
                                    <div className="flex-1">
                                        <Label htmlFor="custom" className="text-white font-medium cursor-pointer text-sm lg:text-base">Custom Range</Label>
                                        <p className="text-xs text-gray-400 mt-1">Enter page numbers or ranges (e.g., 1-5, 8, 10-12)</p>

                                        {splitMode === 'custom' && (
                                            <div className="mt-3">
                                                <Input
                                                    type="text"
                                                    placeholder="e.g., 1-5, 8, 10-12"
                                                    value={customRange}
                                                    onChange={(e) => setCustomRange(e.target.value)}
                                                    className="bg-black/50 border-white/10 text-white placeholder:text-gray-500 text-sm h-9"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className={`flex items-start space-x-3 p-3 lg:p-4 rounded-lg border transition-all ${splitMode === 'all' ? 'bg-red-500/10 border-red-500/30' : 'bg-black/20 border-white/5 hover:bg-white/5'}`}>
                                    <RadioGroupItem value="all" id="all" className="mt-1" />
                                    <div className="flex-1">
                                        <Label htmlFor="all" className="text-white font-medium cursor-pointer text-sm lg:text-base">Split All Pages</Label>
                                        <p className="text-xs text-gray-400 mt-1">Save every page as a separate PDF file (ZIP download).</p>
                                    </div>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>

                    <div className="pt-4 lg:pt-6 border-t border-white/5 mt-4 lg:mt-0">
                        {!resultBlob ? (
                            <Button
                                onClick={handleSplit}
                                disabled={!file || isProcessing || (splitMode === 'range' && selectedPages.length === 0) || (splitMode === 'custom' && !customRange.trim())}
                                className="w-full h-10 lg:h-12 text-sm lg:text-lg bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/20"
                            >
                                {isProcessing ? <RefreshCw className="w-4 h-4 lg:w-5 lg:h-5 animate-spin mr-2" /> : <Scissors className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />}
                                {isProcessing ? 'Splitting...' : 'Split PDF'}
                            </Button>
                        ) : (
                            <div className="space-y-3">
                                <Button
                                    onClick={handleDownload}
                                    className="w-full h-10 lg:h-12 text-sm lg:text-lg bg-green-600 hover:bg-green-500 text-white animate-pulse shadow-lg shadow-green-900/20"
                                >
                                    <Download className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                                    Download {splitMode === 'all' ? 'ZIP' : 'PDF'}
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => setResultBlob(null)}
                                    className="w-full text-muted-foreground hover:text-white text-sm"
                                >
                                    Split Another
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </UniversalToolLayout>
    );
};

export default SplitPDF;
