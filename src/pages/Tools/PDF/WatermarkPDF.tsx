import React, { useState } from 'react';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { Stamp, Download, RefreshCw, Type, Image as ImageIcon, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import UniversalToolLayout from '@/components/UniversalToolLayout';
import IngestionZone from '@/components/tools/IngestionZone';
import { initPDFWorker } from '@/utils/pdfWorker';

// Initialize PDF.js worker
initPDFWorker();

const WatermarkPDF = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultBlob, setResultBlob] = useState<Blob | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Watermark Settings
    const [type, setType] = useState<'text' | 'image'>('text');
    const [text, setText] = useState('CONFIDENTIAL');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [opacity, setOpacity] = useState(0.5);
    const [size, setSize] = useState(50); // Font size or Image scale %
    const [rotation, setRotation] = useState(45);
    const [color, setColor] = useState('#FF0000');

    const handleFileSelect = async (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0]);
            setResultBlob(null);
            setError(null);
            generatePreview(files[0]);
        }
    };

    const generatePreview = async (pdfFile: File) => {
        try {
            const arrayBuffer = await pdfFile.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 1.0 });

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context!, viewport }).promise;
            setPreviewUrl(canvas.toDataURL());
        } catch (err) {
            console.error("Preview generation failed:", err);
        }
    };

    const handleApplyWatermark = async () => {
        if (!file) return;
        setIsProcessing(true);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const pages = pdfDoc.getPages();
            const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

            let watermarkImage;
            if (type === 'image' && imageFile) {
                const imageBytes = await imageFile.arrayBuffer();
                if (imageFile.type === 'image/png') {
                    watermarkImage = await pdfDoc.embedPng(imageBytes);
                } else {
                    watermarkImage = await pdfDoc.embedJpg(imageBytes);
                }
            }

            // Parse hex color
            const r = parseInt(color.slice(1, 3), 16) / 255;
            const g = parseInt(color.slice(3, 5), 16) / 255;
            const b = parseInt(color.slice(5, 7), 16) / 255;

            pages.forEach(page => {
                const { width, height } = page.getSize();

                if (type === 'text') {
                    const textWidth = font.widthOfTextAtSize(text, size);
                    const textHeight = font.heightAtSize(size);

                    page.drawText(text, {
                        x: width / 2 - textWidth / 2,
                        y: height / 2 - textHeight / 2,
                        size: size,
                        font: font,
                        color: rgb(r, g, b),
                        opacity: opacity,
                        rotate: degrees(rotation),
                    });
                } else if (type === 'image' && watermarkImage) {
                    const imgDims = watermarkImage.scale(size / 100);

                    page.drawImage(watermarkImage, {
                        x: width / 2 - imgDims.width / 2,
                        y: height / 2 - imgDims.height / 2,
                        width: imgDims.width,
                        height: imgDims.height,
                        opacity: opacity,
                        rotate: degrees(rotation),
                    });
                }
            });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
            setResultBlob(blob);
            toast.success("Watermark Applied Successfully!");

        } catch (err: any) {
            console.error("Watermark failed:", err);
            setError("Failed to apply watermark.");
            toast.error("Watermark Failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (resultBlob && file) {
            const url = URL.createObjectURL(resultBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${file.name.replace(/\.pdf$/i, '')}_watermark.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };

    const HOW_IT_WORKS = [
        "Upload a PDF file",
        "Choose Text or Image watermark",
        "Customize text, color, opacity, and rotation",
        "Click 'Apply Watermark' to process"
    ];

    return (
        <UniversalToolLayout
            title="Add Watermark"
            description="Add text or image watermarks to your PDF documents."
            steps={HOW_IT_WORKS}
            isProcessing={isProcessing}
            error={error}
            onResetError={() => setError(null)}
            about={
                <>
                    <p>
                        Protect your intellectual property by adding custom watermarks.
                        Apply text or image overlays to your PDF pages to indicate ownership or confidentiality.
                    </p>
                </>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-12 h-full min-h-[600px]">
                {/* Left: Preview */}
                <div className="lg:col-span-7 bg-[#0A0A0A] border-r border-white/5 p-8 flex flex-col items-center justify-center relative overflow-hidden">
                    {!file ? (
                        <IngestionZone
                            onDrop={handleFileSelect}
                            accept={{ 'application/pdf': ['.pdf'] }}
                            multiple={false}
                            files={[]}
                            className="w-full max-w-xl h-64"
                        />
                    ) : (
                        <div className="relative w-full max-w-md shadow-2xl">
                            {previewUrl && (
                                <div className="relative">
                                    <img src={previewUrl} alt="PDF Preview" className="w-full h-auto rounded-lg" />
                                    {/* CSS Overlay for Preview Visualization */}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                                        <div
                                            style={{
                                                opacity: opacity,
                                                transform: `rotate(${rotation}deg)`,
                                                color: color,
                                                fontSize: type === 'text' ? `${size / 2}px` : undefined, // Approximate scale for preview
                                                fontWeight: 'bold',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            {type === 'text' ? text : (
                                                imageFile && <img
                                                    src={URL.createObjectURL(imageFile)}
                                                    alt="Watermark"
                                                    style={{ width: `${size * 2}px` }} // Approximate scale
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => { setFile(null); setPreviewUrl(null); setResultBlob(null); }}
                                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
                            >
                                Change File
                            </Button>
                        </div>
                    )}
                </div>

                {/* Right: Settings */}
                <div className="lg:col-span-5 bg-[#111] p-8 flex flex-col">
                    <div className="flex-1 space-y-6">
                        <Tabs defaultValue="text" onValueChange={(v: any) => setType(v)} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-black/20">
                                <TabsTrigger value="text">Text Watermark</TabsTrigger>
                                <TabsTrigger value="image">Image Watermark</TabsTrigger>
                            </TabsList>

                            <TabsContent value="text" className="space-y-4 mt-4">
                                <div className="space-y-2">
                                    <Label>Watermark Text</Label>
                                    <Input
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        className="bg-black/20 border-white/10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Text Color</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="color"
                                            value={color}
                                            onChange={(e) => setColor(e.target.value)}
                                            className="w-12 h-10 p-1 bg-transparent border-white/10"
                                        />
                                        <Input
                                            value={color}
                                            onChange={(e) => setColor(e.target.value)}
                                            className="flex-1 bg-black/20 border-white/10"
                                        />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="image" className="space-y-4 mt-4">
                                <div className="space-y-2">
                                    <Label>Upload Image</Label>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => e.target.files && setImageFile(e.target.files[0])}
                                        className="bg-black/20 border-white/10"
                                    />
                                </div>
                            </TabsContent>
                        </Tabs>

                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Label>Opacity</Label>
                                    <span className="text-xs text-gray-400">{Math.round(opacity * 100)}%</span>
                                </div>
                                <Slider
                                    value={[opacity]}
                                    onValueChange={([v]) => setOpacity(v)}
                                    min={0.1}
                                    max={1}
                                    step={0.1}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Label>{type === 'text' ? 'Font Size' : 'Scale'}</Label>
                                    <span className="text-xs text-gray-400">{size}</span>
                                </div>
                                <Slider
                                    value={[size]}
                                    onValueChange={([v]) => setSize(v)}
                                    min={10}
                                    max={200}
                                    step={5}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Label>Rotation</Label>
                                    <span className="text-xs text-gray-400">{rotation}°</span>
                                </div>
                                <Slider
                                    value={[rotation]}
                                    onValueChange={([v]) => setRotation(v)}
                                    min={0}
                                    max={360}
                                    step={15}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/5">
                        {!resultBlob ? (
                            <Button
                                onClick={handleApplyWatermark}
                                disabled={!file || isProcessing}
                                className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-500 text-white"
                            >
                                {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin mr-2" /> : <Stamp className="w-5 h-5 mr-2" />}
                                {isProcessing ? 'Applying...' : 'Apply Watermark'}
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

export default WatermarkPDF;
