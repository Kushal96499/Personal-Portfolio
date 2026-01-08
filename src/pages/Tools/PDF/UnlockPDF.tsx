import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Unlock, Download, RefreshCw, Key, FileText, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import UniversalToolLayout from '@/components/UniversalToolLayout';
import IngestionZone from '@/components/tools/IngestionZone';

const UnlockPDF = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultBlob, setResultBlob] = useState<Blob | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [password, setPassword] = useState('');
    const [isEncrypted, setIsEncrypted] = useState(false);

    const handleFileSelect = async (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0]);
            setResultBlob(null);
            setError(null);
            setPassword('');
            setIsEncrypted(false);

            // Check if encrypted
            try {
                const arrayBuffer = await files[0].arrayBuffer();
                try {
                    await PDFDocument.load(arrayBuffer);
                    setIsEncrypted(false);
                } catch (e) {
                    setIsEncrypted(true);
                }
            } catch (err) {
                console.error("Error checking PDF:", err);
                toast.error("Invalid PDF file");
            }
        }
    };

    const processUnlock = async () => {
        if (!file) return;
        setIsProcessing(true);

        try {
            const arrayBuffer = await file.arrayBuffer();
            let pdfDoc;

            try {
                // @ts-ignore
                pdfDoc = await PDFDocument.load(arrayBuffer, { password, ignoreEncryption: true });
            } catch (e) {
                toast.error("Incorrect Password");
                setIsProcessing(false);
                return;
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            setResultBlob(blob);
            toast.success("PDF Unlocked Successfully!");

        } catch (err: any) {
            console.error("Unlock failed:", err);
            setError("Failed to unlock PDF.");
            toast.error("Unlock Failed");
        } finally {
            setIsProcessing(false);
        }
    };



    const handleDownload = () => {
        if (resultBlob && file) {
            const url = URL.createObjectURL(resultBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${file.name.replace(/\.pdf$/i, '')}_unlock.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };

    return (
        <UniversalToolLayout
            title="Unlock PDF"
            description="Securely decrypt and access your PDF documents."
            steps={["Upload PDF", "Safety Check", "Unlock & Download"]}
            isProcessing={isProcessing}
            error={error}
            onResetError={() => setError(null)}
        >


            <div className="flex flex-col h-full min-h-[600px] relative">
                {!file ? (
                    <div className="flex-1 flex items-center justify-center p-8">
                        <IngestionZone
                            onDrop={handleFileSelect}
                            accept={{ 'application/pdf': ['.pdf'] }}
                            multiple={false}
                            files={[]}
                            className="w-full max-w-xl h-64"
                        />
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center p-6">
                        <div className="w-full max-w-md bg-[#222] rounded-2xl border border-[#3b3b3b] shadow-2xl relative overflow-hidden flex flex-col p-6 animate-in slide-in-from-bottom-5 fade-in duration-500">

                            {/* Header */}
                            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/5">
                                <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                                    <Unlock className="w-6 h-6 text-orange-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-semibold text-white truncate">{file.name}</h3>
                                    <p className="text-sm text-gray-400">
                                        {isEncrypted ? 'Encrypted Document' : 'Ready to Process'}
                                    </p>
                                </div>
                                <button onClick={() => setFile(null)} className="text-gray-500 hover:text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="space-y-6">
                                {/* Success State */}
                                {resultBlob ? (
                                    <div className="space-y-4">
                                        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3">
                                            <div className="bg-green-500 rounded-full p-1">
                                                <Check className="w-4 h-4 text-black" />
                                            </div>
                                            <span className="text-sm font-medium text-green-200">Document Unlocked Successfully</span>
                                        </div>
                                        <Button
                                            onClick={handleDownload}
                                            className="w-full h-12 bg-white text-black hover:bg-gray-200 font-bold"
                                        >
                                            <Download className="mr-2 w-4 h-4" /> Download Unlocked PDF
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            onClick={() => { setResultBlob(null); setFile(null); }}
                                            className="w-full"
                                        >
                                            Process Another File
                                        </Button>
                                    </div>
                                ) : (
                                    // Unlock Form
                                    <div className="space-y-4">
                                        {isEncrypted ? (
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label>Document Password</Label>
                                                    <div className="relative">
                                                        <Input
                                                            type="password"
                                                            value={password}
                                                            onChange={(e) => setPassword(e.target.value)}
                                                            className="pl-10 h-11 bg-black/50 border-white/10"
                                                            placeholder="Enter password to unlock"
                                                            autoFocus
                                                        />
                                                        <Key className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                                                    </div>
                                                </div>
                                                <Button
                                                    onClick={processUnlock}
                                                    disabled={!password || isProcessing}
                                                    className="w-full h-12 bg-orange-600 hover:bg-orange-500 text-white font-bold"
                                                >
                                                    {isProcessing ? <RefreshCw className="mr-2 animate-spin" /> : <Unlock className="mr-2" />}
                                                    Unlock Document
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-sm text-blue-200">
                                                    This document does not appear to be encrypted, but you can still process it to ensure it's fully unlocked and editable.
                                                </div>
                                                <Button
                                                    onClick={processUnlock}
                                                    disabled={isProcessing}
                                                    className="w-full h-12 bg-white text-black hover:bg-gray-200 font-bold"
                                                >
                                                    {isProcessing ? <RefreshCw className="mr-2 animate-spin" /> : <Unlock className="mr-2" />}
                                                    Process Document
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </UniversalToolLayout>
    );
};

export default UnlockPDF;
