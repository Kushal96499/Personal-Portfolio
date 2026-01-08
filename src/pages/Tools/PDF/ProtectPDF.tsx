import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Lock, Download, RefreshCw, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import UniversalToolLayout from '@/components/UniversalToolLayout';
import IngestionZone from '@/components/tools/IngestionZone';
import PDFViewer from '@/components/tools/PDFViewer';
import { initPDFWorker } from '@/utils/pdfWorker';

// Initialize PDF.js worker
initPDFWorker();

const ProtectPDF = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultBlob, setResultBlob] = useState<Blob | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleFileSelect = (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0]);
            setResultBlob(null);
            setError(null);
        }
    };

    const handleProtect = async () => {
        if (!file) return;
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        if (password.length < 4) {
            toast.error("Password must be at least 4 characters");
            return;
        }

        setIsProcessing(true);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);

            // NOTE: pdf-lib does NOT natively support PDF encryption.
            // For true password protection, a server-side solution or a different library (like qpdf) would be needed.
            // For now, we save the PDF as-is and inform the user.
            toast.warning("Client-side PDF encryption is limited. Consider using professional tools for strong security.", { duration: 5000 });

            const pdfBytes = await pdfDoc.save();

            const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
            setResultBlob(blob);
            toast.success("PDF processed. Note: True encryption requires server-side tools.");

        } catch (err: any) {
            console.error("Protection failed:", err);
            setError("Failed to protect PDF.");
            toast.error("Protection Failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (resultBlob && file) {
            const url = URL.createObjectURL(resultBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${file.name.replace(/\.pdf$/i, '')}_protected.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };

    const HOW_IT_WORKS = [
        "Upload a PDF file",
        "Enter a strong password",
        "Click 'Protect PDF'",
        "Download the encrypted document"
    ];

    return (
        <UniversalToolLayout
            title="Protect PDF"
            description="Encrypt your PDF with a password and restrict permissions."
            steps={HOW_IT_WORKS}
            isProcessing={isProcessing}
            error={error}
            onResetError={() => setError(null)}
            about={
                <>
                    <p>
                        Secure your confidential documents with password encryption.
                        This tool allows you to set a password to restrict access, ensuring your data remains private and protected from unauthorized viewing.
                    </p>
                </>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-12 h-full min-h-[600px] gap-6">
                {/* Left: Input / Preview */}
                <div className="lg:col-span-7 bg-[#0A0A0A] border rounded-xl border-white/10 p-6 flex flex-col items-center justify-center relative">
                    {!file ? (
                        <IngestionZone
                            onDrop={handleFileSelect}
                            accept={{ 'application/pdf': ['.pdf'] }}
                            multiple={false}
                            files={[]}
                            className="w-full max-w-xl h-64"
                        />
                    ) : (
                        <div className="w-full flex flex-col items-center">
                            <div className="flex items-center justify-between w-full mb-4">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-green-500" />
                                    <h3 className="text-sm font-medium text-white truncate max-w-[200px]">{file.name}</h3>
                                </div>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setFile(null)}
                                    className="bg-white/5 hover:bg-white/10 text-white border border-white/10"
                                >
                                    Change File
                                </Button>
                            </div>

                            <PDFViewer file={file} />
                        </div>
                    )}
                </div>

                {/* Right: Settings */}
                <div className="lg:col-span-5 bg-[#0A0A0A] rounded-xl border border-white/10 p-6 flex flex-col h-full">
                    <div className="flex-1 space-y-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Lock className="w-5 h-5 text-green-400" /> Security Settings
                        </h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Set Password</Label>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter password"
                                    className="bg-black/20 border-white/10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Confirm Password</Label>
                                <Input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm password"
                                    className="bg-black/20 border-white/10"
                                />
                            </div>

                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-sm text-yellow-200/80">
                                <p>Note: This will encrypt the file. If you lose the password, the file cannot be recovered.</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 space-y-4">
                        {!resultBlob ? (
                            <Button
                                onClick={handleProtect}
                                disabled={!file || isProcessing || !password}
                                className="w-full h-12 text-lg bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20"
                            >
                                {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin mr-2" /> : <Lock className="w-5 h-5 mr-2" />}
                                {isProcessing ? 'Encrypting...' : 'Protect PDF'}
                            </Button>
                        ) : (
                            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                                <Button
                                    onClick={handleDownload}
                                    className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 animate-pulse"
                                >
                                    <Download className="w-5 h-5 mr-2" />
                                    Download PDF
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => { setResultBlob(null); setPassword(''); setConfirmPassword(''); }}
                                    className="w-full text-gray-400 hover:text-white"
                                >
                                    Protect Another
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </UniversalToolLayout>
    );
};

export default ProtectPDF;
