import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Wrench, Download, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import UniversalToolLayout from '@/components/UniversalToolLayout';
import IngestionZone from '@/components/tools/IngestionZone';

const RepairPDF = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultBlob, setResultBlob] = useState<Blob | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileSelect = async (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0]);
            setResultBlob(null);
            setError(null);
        }
    };

    const handleRepair = async () => {
        if (!file) return;
        setIsProcessing(true);

        try {
            const arrayBuffer = await file.arrayBuffer();

            // Attempt to load with ignoreEncryption to bypass some corruption
            const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

            // Saving the document essentially "rewrites" it, fixing structure issues
            const pdfBytes = await pdfDoc.save();

            const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
            setResultBlob(blob);
            toast.success("PDF Repaired Successfully!");

        } catch (err: any) {
            console.error("Repair failed:", err);
            setError("Failed to repair PDF. The file might be too severely damaged.");
            toast.error("Repair Failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (resultBlob && file) {
            const url = URL.createObjectURL(resultBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${file.name.replace(/\.pdf$/i, '')}_repair.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };

    const HOW_IT_WORKS = [
        "Upload a corrupted PDF file",
        "Click 'Repair PDF'",
        "The tool will attempt to reconstruct the file structure",
        "Download the repaired document"
    ];

    return (
        <UniversalToolLayout
            title="Repair PDF"
            description="Fix corrupted or damaged PDF files by reconstructing their internal structure."
            steps={HOW_IT_WORKS}
            isProcessing={isProcessing}
            error={error}
            onResetError={() => setError(null)}
            about={
                <>
                    <p>
                        Recover data from corrupted or damaged PDF files.
                        This tool attempts to reconstruct the internal structure of broken PDFs to make them readable again.
                    </p>
                </>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-12 h-full min-h-[600px]">
                {/* Left: Input */}
                <div className="lg:col-span-8 bg-[#0A0A0A] border-r border-white/5 p-8 flex flex-col items-center justify-center">
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
                            <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mb-4 border border-orange-500/20">
                                <Wrench className="w-8 h-8 text-orange-500" />
                            </div>
                            <h3 className="text-lg font-medium text-white mb-1 truncate w-full">{file.name}</h3>
                            <p className="text-sm text-gray-500 mb-6">{(file.size / 1024 / 1024).toFixed(2)} MB</p>

                            <Button variant="outline" size="sm" onClick={() => setFile(null)} className="border-white/10 hover:bg-white/5">
                                Change File
                            </Button>
                        </div>
                    )}
                </div>

                {/* Right: Controls */}
                <div className="lg:col-span-4 bg-[#111] p-6 flex flex-col">
                    <div className="flex-1 space-y-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Wrench className="w-5 h-5 text-orange-400" /> Repair Tools
                        </h3>

                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 text-sm text-orange-200/80 flex gap-2">
                            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                            <p>This tool rebuilds the PDF structure. It may not be able to recover data from severely corrupted files.</p>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/5">
                        {!resultBlob ? (
                            <Button
                                onClick={handleRepair}
                                disabled={!file || isProcessing}
                                className="w-full h-12 text-lg bg-orange-600 hover:bg-orange-500 text-white"
                            >
                                {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin mr-2" /> : <Wrench className="w-5 h-5 mr-2" />}
                                {isProcessing ? 'Repairing...' : 'Repair PDF'}
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

export default RepairPDF;
