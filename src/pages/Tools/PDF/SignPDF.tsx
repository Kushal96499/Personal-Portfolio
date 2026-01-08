import React, { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import { PenTool, Download, RefreshCw, Type, Image as ImageIcon, Eraser, Move } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import UniversalToolLayout from '@/components/UniversalToolLayout';
import IngestionZone from '@/components/tools/IngestionZone';
import { initPDFWorker } from '@/utils/pdfWorker';
import PDFViewer from '@/components/tools/PDFViewer';

// Initialize PDF.js worker
initPDFWorker();

const SignPDF = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultBlob, setResultBlob] = useState<Blob | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Signature State
    const [signatureType, setSignatureType] = useState<'draw' | 'type' | 'upload'>('draw');
    const [signatureImage, setSignatureImage] = useState<string | null>(null);
    const [typedSignature, setTypedSignature] = useState('');

    // Placement State
    const [currentPage, setCurrentPage] = useState(1);
    const [position, setPosition] = useState({ x: 50, y: 50 }); // Percentage
    const [size, setSize] = useState({ width: 20, height: 10 }); // Percentage
    const [isDragging, setIsDragging] = useState(false);
    const [signaturePage, setSignaturePage] = useState<number | null>(null); // Page where signature is placed

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    const handleFileSelect = (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0]);
            setResultBlob(null);
            setError(null);
            setSignaturePage(null);
            setCurrentPage(1);
        }
    };

    // Drawing Logic
    const startDrawing = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        setIsDrawing(true);
        const rect = canvas.getBoundingClientRect();

        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#000000';

        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    };

    const draw = (e: React.MouseEvent) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setSignatureImage(null);
        setSignaturePage(null);
    };

    const saveDrawing = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        setSignatureImage(canvas.toDataURL());
        // Default to current page when creating new signature
        setSignaturePage(currentPage);
    };

    // Drag Logic for Signature Placement
    const handleMouseDown = () => setIsDragging(true);
    const handleMouseUp = () => setIsDragging(false);
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setPosition({ x, y });
    };

    const handleApplySignature = async () => {
        if (!file || !signatureImage || signaturePage === null) return;
        setIsProcessing(true);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const pages = pdfDoc.getPages();

            // Validate page index
            if (signaturePage < 1 || signaturePage > pages.length) {
                throw new Error("Invalid page number");
            }

            const page = pages[signaturePage - 1]; // 0-indexed
            const { width, height } = page.getSize();

            const imageBytes = await fetch(signatureImage).then(res => res.arrayBuffer());
            const signature = await pdfDoc.embedPng(imageBytes);

            const sigWidth = (size.width / 100) * width;
            const sigHeight = (size.height / 100) * height;
            const sigX = (position.x / 100) * width;
            const sigY = height - ((position.y / 100) * height); // PDF Y is from bottom

            page.drawImage(signature, {
                x: sigX,
                y: sigY - sigHeight,
                width: sigWidth,
                height: sigHeight,
            });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
            setResultBlob(blob);
            toast.success("PDF Signed Successfully!");

        } catch (err: any) {
            console.error("Signing failed:", err);
            setError("Failed to sign PDF.");
            toast.error("Signing Failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (resultBlob && file) {
            const url = URL.createObjectURL(resultBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${file.name.replace(/\.pdf$/i, '')}_sign.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };

    const HOW_IT_WORKS = [
        "Upload a PDF file",
        "Navigate to the page you want to sign",
        "Create your signature (Draw, Type, or Upload)",
        "Drag the signature to the desired position",
        "Click 'Sign PDF'"
    ];

    return (
        <UniversalToolLayout
            title="Sign PDF"
            description="Add your electronic signature to PDF documents."
            steps={HOW_IT_WORKS}
            isProcessing={isProcessing}
            error={error}
            onResetError={() => setError(null)}
            about={
                <>
                    <p>
                        Sign your PDF documents electronically without printing.
                        Draw, type, or upload your signature and place it exactly where needed.
                    </p>
                </>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-12 h-full min-h-[600px] gap-6">
                {/* Left: Preview & Placement */}
                <div className="lg:col-span-8 bg-[#0A0A0A] border rounded-xl border-white/10 p-6 flex flex-col items-center justify-center relative select-none">
                    {!file ? (
                        <div className="flex-1 flex items-center justify-center w-full">
                            <IngestionZone
                                onDrop={handleFileSelect}
                                accept={{ 'application/pdf': ['.pdf'] }}
                                multiple={false}
                                files={[]}
                                className="w-full max-w-xl h-64"
                            />
                        </div>
                    ) : (
                        <div className="w-full flex flex-col items-center">
                            <div className="flex items-center justify-between w-full mb-4">
                                <h3 className="text-sm font-medium text-white">{file.name}</h3>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => { setFile(null); setSignatureImage(null); }}
                                    className="bg-white/5 hover:bg-white/10 text-white border border-white/10"
                                >
                                    Change File
                                </Button>
                            </div>

                            <PDFViewer
                                file={file}
                                onPageChange={(page) => setCurrentPage(page)}
                            >
                                {/* Signature Overlay Container */}
                                <div
                                    ref={containerRef}
                                    className="absolute inset-0 z-30 touch-none"
                                    onMouseMove={handleMouseMove}
                                    onMouseUp={handleMouseUp}
                                    onMouseLeave={handleMouseUp}
                                    onTouchMove={(e) => {
                                        if (!isDragging || !containerRef.current) return;
                                        e.preventDefault(); // Prevent scrolling
                                        const touch = e.touches[0];
                                        const rect = containerRef.current.getBoundingClientRect();
                                        const x = ((touch.clientX - rect.left) / rect.width) * 100;
                                        const y = ((touch.clientY - rect.top) / rect.height) * 100;
                                        setPosition({ x, y });
                                    }}
                                    onTouchEnd={() => setIsDragging(false)}
                                >
                                    {/* Only show signature if it's on the current page OR if it hasn't been placed yet (previewing) */}
                                    {signatureImage && (signaturePage === currentPage || signaturePage === null) && (
                                        <div
                                            className="absolute cursor-move border-2 border-blue-500 bg-white/10 hover:bg-white/20"
                                            style={{
                                                left: `${position.x}%`,
                                                top: `${position.y}%`,
                                                width: `${size.width}%`,
                                                height: `${size.height}%`
                                            }}
                                            onMouseDown={(e) => {
                                                handleMouseDown();
                                                if (signaturePage === null) setSignaturePage(currentPage);
                                            }}
                                            onTouchStart={(e) => {
                                                e.preventDefault();
                                                setIsDragging(true);
                                                if (signaturePage === null) setSignaturePage(currentPage);
                                            }}
                                        >
                                            <img src={signatureImage} alt="Signature" className="w-full h-full object-contain pointer-events-none" />

                                            {/* Page Indicator Tag */}
                                            <div className="absolute -top-6 left-0 bg-blue-600 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                                                Page {signaturePage || currentPage}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </PDFViewer>
                        </div>
                    )}
                </div>

                {/* Right: Signature Creation */}
                <div className="lg:col-span-4 bg-[#0A0A0A] rounded-xl border border-white/10 p-6 flex flex-col h-full">
                    <div className="flex-1 space-y-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <PenTool className="w-5 h-5 text-blue-400" /> Create Signature
                        </h3>

                        <Tabs defaultValue="draw" onValueChange={(v: any) => setSignatureType(v)} className="w-full">
                            <TabsList className="grid w-full grid-cols-3 bg-black/20">
                                <TabsTrigger value="draw"><PenTool className="w-4 h-4 mr-2" /> Draw</TabsTrigger>
                                <TabsTrigger value="type"><Type className="w-4 h-4 mr-2" /> Type</TabsTrigger>
                                <TabsTrigger value="upload"><ImageIcon className="w-4 h-4 mr-2" /> Upload</TabsTrigger>
                            </TabsList>

                            <TabsContent value="draw" className="space-y-4 mt-4">
                                <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                                    <canvas
                                        ref={canvasRef}
                                        width={300}
                                        height={150}
                                        className="w-full h-40 touch-none"
                                        style={{
                                            cursor: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/><path d="M2 22l5.5-1.5"/></svg>') 0 24, auto`
                                        }}
                                        onMouseDown={startDrawing}
                                        onMouseMove={draw}
                                        onMouseUp={stopDrawing}
                                        onMouseLeave={stopDrawing}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={clearCanvas} className="flex-1 border-white/10">
                                        <Eraser className="w-4 h-4 mr-2" /> Clear
                                    </Button>
                                    <Button size="sm" onClick={saveDrawing} className="flex-1 bg-blue-600 hover:bg-blue-500">
                                        Use Drawing
                                    </Button>
                                </div>
                            </TabsContent>

                            <TabsContent value="type" className="space-y-4 mt-4">
                                <Input
                                    value={typedSignature}
                                    onChange={(e) => setTypedSignature(e.target.value)}
                                    placeholder="Type your name"
                                    className="bg-black/20 border-white/10 font-cursive text-xl"
                                    style={{ fontFamily: 'cursive' }}
                                />
                                <Button
                                    onClick={() => {
                                        // Convert text to image (simplified)
                                        const canvas = document.createElement('canvas');
                                        canvas.width = 300;
                                        canvas.height = 100;
                                        const ctx = canvas.getContext('2d');
                                        if (ctx) {
                                            ctx.font = "40px cursive";
                                            ctx.fillText(typedSignature, 10, 60);
                                            setSignatureImage(canvas.toDataURL());
                                            setSignaturePage(currentPage);
                                        }
                                    }}
                                    className="w-full bg-blue-600 hover:bg-blue-500"
                                >
                                    Use Typed
                                </Button>
                            </TabsContent>

                            <TabsContent value="upload" className="space-y-4 mt-4">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            const reader = new FileReader();
                                            reader.onload = (ev) => {
                                                setSignatureImage(ev.target?.result as string);
                                                setSignaturePage(currentPage);
                                            };
                                            reader.readAsDataURL(e.target.files[0]);
                                        }
                                    }}
                                    className="bg-black/20 border-white/10"
                                />
                            </TabsContent>
                        </Tabs>

                        {signatureImage && (
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mt-4">
                                <p className="text-sm text-blue-200 mb-2 font-medium">Signature Ready!</p>
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <Move className="w-4 h-4" />
                                    Drag to position on Page {signaturePage}.
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-6 border-t border-white/5 space-y-4">
                        {!resultBlob ? (
                            <Button
                                onClick={handleApplySignature}
                                disabled={!file || isProcessing || !signatureImage}
                                className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20"
                            >
                                {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin mr-2" /> : <PenTool className="w-5 h-5 mr-2" />}
                                {isProcessing ? 'Signing...' : 'Sign PDF'}
                            </Button>
                        ) : (
                            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                                <Button
                                    onClick={handleDownload}
                                    className="w-full h-12 text-lg bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20 animate-pulse"
                                >
                                    <Download className="w-5 h-5 mr-2" />
                                    Download PDF
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => { setFile(null); setSignatureImage(null); }}
                                    className="w-full text-gray-400 hover:text-white"
                                >
                                    Sign Another
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </UniversalToolLayout>
    );
};

export default SignPDF;
