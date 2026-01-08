import React, { useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { FileText, Download, RefreshCw, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import UniversalToolLayout from '@/components/UniversalToolLayout';
import IngestionZone from '@/components/tools/IngestionZone';

const MetadataPDF = () => {
    const [file, setFile] = useState<File | null>(null);
    const [resultBlob, setResultBlob] = useState<Blob | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [metadata, setMetadata] = useState({
        title: '',
        author: '',
        subject: '',
        keywords: '',
        creator: '',
        producer: ''
    });

    const handleFileSelect = async (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0]);
            setResultBlob(null);
            setError(null);
            setIsProcessing(true);

            try {
                const arrayBuffer = await files[0].arrayBuffer();
                const pdfDoc = await PDFDocument.load(arrayBuffer);

                setMetadata({
                    title: pdfDoc.getTitle() || '',
                    author: pdfDoc.getAuthor() || '',
                    subject: pdfDoc.getSubject() || '',
                    keywords: pdfDoc.getKeywords() || '',
                    creator: pdfDoc.getCreator() || '',
                    producer: pdfDoc.getProducer() || ''
                });
            } catch (err) {
                console.error("Error reading metadata:", err);
                toast.error("Failed to read metadata");
            } finally {
                setIsProcessing(false);
            }
        }
    };

    const handleSaveMetadata = async () => {
        if (!file) return;
        setIsProcessing(true);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);

            pdfDoc.setTitle(metadata.title);
            pdfDoc.setAuthor(metadata.author);
            pdfDoc.setSubject(metadata.subject);
            pdfDoc.setKeywords(metadata.keywords.split(',').map(k => k.trim()));
            pdfDoc.setCreator(metadata.creator);
            pdfDoc.setProducer(metadata.producer);

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
            setResultBlob(blob);
            toast.success("Metadata Updated Successfully!");

        } catch (err: any) {
            console.error("Save failed:", err);
            setError("Failed to update metadata.");
            toast.error("Update Failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (resultBlob && file) {
            const url = URL.createObjectURL(resultBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${file.name.replace(/\.pdf$/i, '')}_metadata.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };

    const HOW_IT_WORKS = [
        "Upload a PDF file",
        "View and edit the document properties",
        "Click 'Save Metadata'",
        "Download the updated PDF"
    ];

    return (
        <UniversalToolLayout
            title="Edit Metadata"
            description="View and modify PDF document properties like Title, Author, and Keywords."
            steps={HOW_IT_WORKS}
            isProcessing={isProcessing}
            error={error}
            onResetError={() => setError(null)}
            about={
                <>
                    <p>
                        View and edit the hidden properties of your PDF files, such as Title, Author, Subject, and Keywords.
                        Properly managing metadata helps improving searchability and document organization.
                    </p>
                </>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-12 h-full min-h-[600px]">
                {/* Left: Input */}
                <div className="lg:col-span-6 bg-[#0A0A0A] border-r border-white/5 p-8 flex flex-col items-center justify-center relative">
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
                            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 border border-blue-500/20">
                                <FileText className="w-8 h-8 text-blue-500" />
                            </div>
                            <h3 className="text-lg font-medium text-white mb-1 truncate w-full">{file.name}</h3>
                            <p className="text-sm text-gray-500 mb-6">{(file.size / 1024 / 1024).toFixed(2)} MB</p>

                            <Button variant="outline" size="sm" onClick={() => setFile(null)} className="border-white/10 hover:bg-white/5">
                                Change File
                            </Button>
                        </div>
                    )}
                </div>

                {/* Right: Metadata Form */}
                <div className="lg:col-span-6 bg-[#111] p-8 flex flex-col overflow-y-auto">
                    <div className="flex-1 space-y-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-400" /> Document Properties
                        </h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input
                                    value={metadata.title}
                                    onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                                    className="bg-black/20 border-white/10"
                                    disabled={!file}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Author</Label>
                                <Input
                                    value={metadata.author}
                                    onChange={(e) => setMetadata({ ...metadata, author: e.target.value })}
                                    className="bg-black/20 border-white/10"
                                    disabled={!file}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Subject</Label>
                                <Input
                                    value={metadata.subject}
                                    onChange={(e) => setMetadata({ ...metadata, subject: e.target.value })}
                                    className="bg-black/20 border-white/10"
                                    disabled={!file}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Keywords (comma separated)</Label>
                                <Textarea
                                    value={metadata.keywords}
                                    onChange={(e) => setMetadata({ ...metadata, keywords: e.target.value })}
                                    className="bg-black/20 border-white/10 h-20"
                                    disabled={!file}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Creator</Label>
                                    <Input
                                        value={metadata.creator}
                                        onChange={(e) => setMetadata({ ...metadata, creator: e.target.value })}
                                        className="bg-black/20 border-white/10"
                                        disabled={!file}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Producer</Label>
                                    <Input
                                        value={metadata.producer}
                                        onChange={(e) => setMetadata({ ...metadata, producer: e.target.value })}
                                        className="bg-black/20 border-white/10"
                                        disabled={!file}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 mt-6">
                        {!resultBlob ? (
                            <Button
                                onClick={handleSaveMetadata}
                                disabled={!file || isProcessing}
                                className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-500 text-white"
                            >
                                {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                                {isProcessing ? 'Saving...' : 'Save Metadata'}
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

export default MetadataPDF;
