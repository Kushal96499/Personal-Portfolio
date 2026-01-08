import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { Download, RefreshCw, Settings, QrCode, AlertCircle, Check, Image as ImageIcon, Palette, Layers, Maximize, Zap, Moon, Sun, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { motion, AnimatePresence } from "framer-motion";

const QRCodeGenerator = () => {
    const [text, setText] = useState("");
    const [size, setSize] = useState("300");
    const [ecc, setEcc] = useState("M");
    const [margin, setMargin] = useState([2]);
    const [bgColor, setBgColor] = useState("#ffffff");
    const [fgColor, setFgColor] = useState("#000000");
    const canvasRef = useRef<HTMLCanvasElement>(null);
    // --- Download ---
    const downloadQR = (format: 'png' | 'jpg') => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const link = document.createElement('a');
        link.download = `qrcode.${format}`;
        link.href = canvas.toDataURL(`image/${format}`);
        link.click();
    };

    // --- Render ---
    useEffect(() => {
        const generateQR = async () => {
            if (!canvasRef.current) return;

            try {
                await QRCode.toCanvas(canvasRef.current, text || "https://example.com", {
                    width: parseInt(size),
                    margin: margin[0],
                    color: {
                        dark: fgColor,
                        light: bgColor
                    },
                    errorCorrectionLevel: ecc as any
                });
            } catch (err) {
                console.error(err);
            }
        };

        const timeout = setTimeout(generateQR, 100);
        return () => clearTimeout(timeout);
    }, [text, size, margin, bgColor, fgColor, ecc]);

    const HOW_IT_WORKS = [
        "Enter the text or URL you want to encode.",
        "Adjust the size, margin, and error correction level.",
        "Customize the foreground and background colors.",
        "Download the generated QR code as PNG or JPG."
    ];

    const DISCLAIMER = "QR Codes are generated locally in your browser. No data is sent to any server.";

    return (
        <ToolPageLayout
            title="QR Code Generator"
            description="Create custom QR codes with colors, logos, and high resolution."
            about={
                <div>
                    <p>
                        Generate high-quality, customizable QR codes instantly. Perfect for sharing URLs, Wi-Fi credentials, or contact info, with options to adjust colors, error correction levels, and resolution.
                    </p>
                    <p className="mt-2">
                        All generation happens client-side, ensuring your data never leaves your device.
                    </p>
                </div>
            }
            parentPath="/tools/other"
            parentName="Developer Tools"
            howItWorks={HOW_IT_WORKS}
            disclaimer={DISCLAIMER}
        >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Controls */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-[#111111] border border-white/10 rounded-xl p-6 space-y-6">
                        <Tabs defaultValue="content">
                            <TabsList className="w-full grid grid-cols-2">
                                <TabsTrigger value="content"><FileText size={16} className="mr-2" /> Content</TabsTrigger>
                                <TabsTrigger value="style"><Palette size={16} className="mr-2" /> Style</TabsTrigger>
                            </TabsList>

                            <TabsContent value="content" className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label>Content (URL or Text)</Label>
                                    <Input
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        placeholder="https://example.com"
                                        className="bg-black/50 border-white/10"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">Error Correction</Label>
                                        <Select value={ecc} onValueChange={setEcc}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="L">Low (7%)</SelectItem>
                                                <SelectItem value="M">Medium (15%)</SelectItem>
                                                <SelectItem value="Q">Quartile (25%)</SelectItem>
                                                <SelectItem value="H">High (30%)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">Resolution (px)</Label>
                                        <Select value={size} onValueChange={setSize}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="256">256px</SelectItem>
                                                <SelectItem value="512">512px</SelectItem>
                                                <SelectItem value="1024">1024px</SelectItem>
                                                <SelectItem value="2048">2048px</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="style" className="space-y-4 pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">Foreground Color</Label>
                                        <div className="flex gap-2">
                                            <Input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-12 h-10 p-1 bg-transparent border-white/10" />
                                            <Input value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="flex-1 bg-black/50 border-white/10 font-mono" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">Background Color</Label>
                                        <div className="flex gap-2">
                                            <Input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-12 h-10 p-1 bg-transparent border-white/10" />
                                            <Input value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="flex-1 bg-black/50 border-white/10 font-mono" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <Label className="text-xs text-muted-foreground">Margin</Label>
                                        <span className="text-xs font-mono">{margin}</span>
                                    </div>
                                    <Slider value={margin} onValueChange={setMargin} min={0} max={10} step={1} />
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>

                {/* Right Column: Preview */}
                < div className="lg:col-span-5 space-y-6" >
                    <div className="sticky top-24">
                        <div className="relative group">
                            <div className="absolute -inset-[2px] bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 rounded-2xl opacity-75 blur-lg group-hover:opacity-100 transition duration-1000 animate-gradient-x"></div>

                            <div className="relative bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-8">
                                <div className="relative bg-white/5 p-4 rounded-xl border border-white/10">
                                    <canvas
                                        ref={canvasRef}
                                        className="max-w-full h-auto rounded-lg shadow-lg"
                                        style={{ maxHeight: '300px' }}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3 w-full">
                                    <Button
                                        onClick={() => downloadQR('png')}
                                        className="bg-cyan-600 hover:bg-cyan-500 text-white"
                                    >
                                        <Download className="mr-2 h-4 w-4" /> PNG
                                    </Button>
                                    <Button
                                        onClick={() => downloadQR('jpg')}
                                        className="bg-purple-600 hover:bg-purple-500 text-white"
                                    >
                                        <Download className="mr-2 h-4 w-4" /> JPG
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <p className="mt-6 text-xs text-center text-muted-foreground opacity-60">
                            Generated locally. High-resolution output supported.
                        </p>
                    </div>
                </div >

            </div >
        </ToolPageLayout >
    );
};

export default QRCodeGenerator;
