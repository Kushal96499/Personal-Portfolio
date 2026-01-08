import React, { useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Reorder } from 'framer-motion';
import { FilePlus, Download, RefreshCw, Trash2, GripVertical, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import UniversalToolLayout from '@/components/UniversalToolLayout';
import IngestionZone from '@/components/tools/IngestionZone';

interface PDFFile {
    id: string;
    file: File;
    name: string;
    size: number;
    preview?: string; // Optional: Thumbnail URL
}

const MergePDF = () => {
    const [files, setFiles] = useState<PDFFile[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultBlob, setResultBlob] = useState<Blob | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Handle File Upload
    const handleFileSelect = async (uploadedFiles: File[]) => {
        const newFiles = uploadedFiles.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            file,
            name: file.name,
            size: file.size
        }));
        setFiles(prev => [...prev, ...newFiles]);
        setResultBlob(null); // Reset result on change
    };

    // Remove File
    const removeFile = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id));
        setResultBlob(null);
    };

    // Merge Logic
    const handleMerge = async () => {
        if (files.length < 2) {
            toast.error("Please select at least 2 PDF files to merge.");
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            const mergedPdf = await PDFDocument.create();

            for (const pdfFile of files) {
                const arrayBuffer = await pdfFile.file.arrayBuffer();
                const pdf = await PDFDocument.load(arrayBuffer);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            }

            const pdfBytes = await mergedPdf.save();
            const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
            setResultBlob(blob);
            toast.success("PDFs Merged Successfully!");

        } catch (err: any) {
            console.error("Merge failed:", err);
            setError("Failed to merge PDFs. One or more files might be corrupted or password protected.");
            toast.error("Merge Failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (resultBlob) {
            const url = URL.createObjectURL(resultBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${files[0].name.replace(/\.pdf$/i, '')}_merge.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };

    const HOW_IT_WORKS = [
        "Upload multiple PDF files",
        "Drag and drop to reorder them",
        "Click 'Merge PDF' to combine",
        "Download the single PDF file"
    ];

    return (
        <UniversalToolLayout
            title="Merge PDF"
            description="Combine multiple PDFs into one unified document. Drag and drop to reorder pages."
            steps={HOW_IT_WORKS}
            isProcessing={isProcessing}
            error={error}
            onResetError={() => setError(null)}
            about={
                <>
                    <p>
                        Combine multiple PDF documents into a single, unified file.
                        Drag and drop to reorder your files, ensuring the final document flows exactly how you want it.
                    </p>
                </>
            }
        >
            <div className="flex flex-col h-full min-h-[600px] bg-[#0A0A0A]">
                {/* Top Bar: Actions */}
                <div className="h-16 border-b border-white/5 bg-[#111] flex items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-400">
                            {files.length} file{files.length !== 1 && 's'} selected
                        </span>
                        {files.length > 0 && (
                            <Button variant="ghost" size="sm" onClick={() => setFiles([])} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 text-xs">
                                Clear All
                            </Button>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {!resultBlob ? (
                            <Button
                                onClick={handleMerge}
                                disabled={files.length < 2 || isProcessing}
                                className="bg-red-600 hover:bg-red-500 text-white gap-2 min-w-[140px]"
                            >
                                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FilePlus className="w-4 h-4" />}
                                {isProcessing ? 'Merging...' : 'Merge PDF'}
                            </Button>
                        ) : (
                            <Button
                                onClick={handleDownload}
                                className="bg-green-600 hover:bg-green-500 text-white gap-2 animate-pulse min-w-[140px]"
                            >
                                <Download className="w-4 h-4" />
                                Download
                            </Button>
                        )}
                    </div>
                </div>

                {/* Main Content: File Grid */}
                <div className="flex-1 p-8 overflow-y-auto">
                    {files.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center">
                            <IngestionZone
                                onDrop={handleFileSelect}
                                accept={{ 'application/pdf': ['.pdf'] }}
                                multiple={true}
                                files={[]}
                                className="w-full max-w-2xl h-80"
                            />
                        </div>
                    ) : (
                        <div className="max-w-5xl mx-auto">
                            <Reorder.Group axis="y" values={files} onReorder={setFiles} className="space-y-3">
                                {files.map((file) => (
                                    <Reorder.Item key={file.id} value={file}>
                                        <div className="bg-[#161616] border border-white/5 rounded-lg p-4 flex items-center gap-4 group hover:border-white/10 transition-colors cursor-grab active:cursor-grabbing">
                                            <GripVertical className="w-5 h-5 text-gray-600" />
                                            <div className="w-10 h-12 bg-red-500/10 rounded flex items-center justify-center border border-red-500/20">
                                                <FileText className="w-6 h-6 text-red-500" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-white truncate">{file.name}</p>
                                                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeFile(file.id)}
                                                className="text-gray-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </Reorder.Item>
                                ))}
                            </Reorder.Group>

                            {/* Add More Button */}
                            <div className="mt-6 flex justify-center">
                                <IngestionZone
                                    onDrop={handleFileSelect}
                                    accept={{ 'application/pdf': ['.pdf'] }}
                                    multiple={true}
                                    files={[]}
                                    className="w-full max-w-xl h-24 border-dashed border-2 border-white/10 bg-transparent hover:bg-white/5"
                                    variant="compact"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </UniversalToolLayout>
    );
};

export default MergePDF;
