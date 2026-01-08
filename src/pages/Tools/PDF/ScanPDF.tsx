import React, { useState, useRef, useCallback, useEffect } from 'react';
import jsPDF from 'jspdf';
import { Camera, Download, Trash2, RefreshCw, ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import UniversalToolLayout from '@/components/UniversalToolLayout';
import { cn } from '@/lib/utils';

const ScanPDF = () => {
    const [images, setImages] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultBlob, setResultBlob] = useState<Blob | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);

    useEffect(() => {
        if (isCameraOpen) {
            startCamera();
        } else {
            stopCamera();
        }
        return () => {
            stopCamera();
        };
    }, [isCameraOpen]);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            toast.error("Could not access camera");
            setIsCameraOpen(false);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const capture = useCallback(() => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(videoRef.current, 0, 0);
                const imageSrc = canvas.toDataURL('image/jpeg');
                setImages(prev => [...prev, imageSrc]);
                toast.success("Page Scanned!");
            }
        }
    }, [videoRef]);

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleGeneratePDF = async () => {
        if (images.length === 0) return;
        setIsProcessing(true);

        try {
            const pdf = new jsPDF();

            for (let i = 0; i < images.length; i++) {
                if (i > 0) pdf.addPage();

                const imgProps = pdf.getImageProperties(images[i]);
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

                pdf.addImage(images[i], 'JPEG', 0, 0, pdfWidth, pdfHeight);
            }

            const blob = pdf.output('blob');
            setResultBlob(blob);
            toast.success("PDF Generated Successfully!");
            setIsCameraOpen(false);

        } catch (err) {
            console.error("PDF generation failed:", err);
            toast.error("Failed to generate PDF");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (resultBlob) {
            const url = URL.createObjectURL(resultBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `document_scan.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };

    const HOW_IT_WORKS = [
        "Enable your camera",
        "Capture pages of your document",
        "Review and delete bad scans",
        "Click 'Generate PDF' to save"
    ];

    return (
        <UniversalToolLayout
            title="Scan to PDF"
            description="Use your camera to scan documents and save them as PDF."
            steps={HOW_IT_WORKS}
            isProcessing={isProcessing}
            error={null}
            onResetError={() => { }}
            about={
                <>
                    <p>
                        Turn physical documents into digital PDF files using your device's camera.
                        Capture, crop, and enhance images to create professional-quality scans instantly.
                    </p>
                </>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-12 h-full min-h-[600px]">
                {/* Left: Camera & Preview */}
                <div className="lg:col-span-8 bg-[#0A0A0A] border-r border-white/5 p-8 flex flex-col items-center">
                    {isCameraOpen ? (
                        <div className="relative w-full max-w-2xl bg-black rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="w-full h-auto"
                            />
                            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                                <Button onClick={capture} className="rounded-full w-16 h-16 bg-white hover:bg-gray-200 text-black p-0 shadow-lg border-4 border-black/50">
                                    <Camera className="w-8 h-8" />
                                </Button>
                                <Button onClick={() => setIsCameraOpen(false)} variant="destructive" className="rounded-full w-12 h-12 p-0 absolute right-4 bottom-2">
                                    X
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full space-y-6">
                            {images.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-3xl">
                                    {images.map((img, idx) => (
                                        <div key={idx} className="relative group rounded-lg overflow-hidden border border-white/10">
                                            <img src={img} alt={`Scan ${idx + 1}`} className="w-full h-auto" />
                                            <button
                                                onClick={() => removeImage(idx)}
                                                className="absolute top-2 right-2 bg-red-500/80 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                            >
                                                <Trash2 className="w-4 h-4 text-white" />
                                            </button>
                                            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                                                Page {idx + 1}
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => setIsCameraOpen(true)}
                                        className="flex flex-col items-center justify-center bg-white/5 border-2 border-dashed border-white/10 rounded-lg hover:bg-white/10 transition-colors min-h-[200px]"
                                    >
                                        <ImagePlus className="w-8 h-8 text-gray-400 mb-2" />
                                        <span className="text-sm text-gray-400">Add Page</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                                        <Camera className="w-10 h-10 text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-2">No Scans Yet</h3>
                                    <p className="text-gray-400 mb-8">Start your camera to begin scanning documents.</p>
                                    <Button onClick={() => setIsCameraOpen(true)} size="lg" className="bg-blue-600 hover:bg-blue-500">
                                        <Camera className="w-5 h-5 mr-2" /> Start Camera
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right: Controls */}
                <div className="lg:col-span-4 bg-[#111] p-6 flex flex-col">
                    <div className="flex-1 space-y-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Camera className="w-5 h-5 text-blue-400" /> Scanner Controls
                        </h3>

                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-sm text-blue-200/80">
                            <p>Ensure good lighting for best results. You can reorder pages after scanning using the "Organize PDF" tool if needed.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/10">
                                <span className="text-gray-300">Total Pages</span>
                                <span className="text-2xl font-bold text-white">{images.length}</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/5">
                        {!resultBlob ? (
                            <Button
                                onClick={handleGeneratePDF}
                                disabled={images.length === 0 || isProcessing}
                                className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-500 text-white"
                            >
                                {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin mr-2" /> : <Download className="w-5 h-5 mr-2" />}
                                {isProcessing ? 'Generating...' : 'Generate PDF'}
                            </Button>
                        ) : (
                            <div className="space-y-3">
                                <Button
                                    onClick={handleDownload}
                                    className="w-full h-12 text-lg bg-green-600 hover:bg-green-500 text-white animate-pulse"
                                >
                                    <Download className="w-5 h-5 mr-2" />
                                    Download PDF
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => { setResultBlob(null); setImages([]); }}
                                    className="w-full border-white/10 hover:bg-white/5"
                                >
                                    Start New Scan
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </UniversalToolLayout>
    );
};

export default ScanPDF;
