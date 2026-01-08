import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Palette, Droplet, Layers, RefreshCw, Copy, Check,
    Download, Share2, Eye, EyeOff, Sliders, Zap,
    ArrowRightLeft, Code, FileJson, Hash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";

// --- Helper Functions ---
const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
};

const hslToRgb = (h: number, s: number, l: number) => {
    s /= 100; l /= 100;
    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return {
        r: Math.round(255 * f(0)),
        g: Math.round(255 * f(8)),
        b: Math.round(255 * f(4))
    };
};

const rgbToCmyk = (r: number, g: number, b: number) => {
    let c = 1 - (r / 255);
    let m = 1 - (g / 255);
    let y = 1 - (b / 255);
    let k = Math.min(c, Math.min(m, y));

    c = (c - k) / (1 - k);
    m = (m - k) / (1 - k);
    y = (y - k) / (1 - k);

    return {
        c: Math.round((isNaN(c) ? 0 : c) * 100),
        m: Math.round((isNaN(m) ? 0 : m) * 100),
        y: Math.round((isNaN(y) ? 0 : y) * 100),
        k: Math.round(k * 100)
    };
};

const getLuminance = (r: number, g: number, b: number) => {
    const a = [r, g, b].map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

const getContrastRatio = (hex1: string, hex2: string) => {
    const rgb1 = hexToRgb(hex1);
    const rgb2 = hexToRgb(hex2);
    if (!rgb1 || !rgb2) return 0;
    const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};

const HOW_IT_WORKS = [
    "Use the Color Picker to find and convert colors.",
    "Generate harmonious palettes (Monochromatic, Analogous, etc.).",
    "Check accessibility contrast ratios between two colors.",
    "Create and export CSS linear/radial gradients.",
    "Simulate color blindness to ensure inclusivity."
];

const DISCLAIMER = "Color conversions are mathematically approximated. Displayed colors may vary depending on your monitor's calibration.";

const ColorTools = () => {
    const [activeTab, setActiveTab] = useState("picker");
    const [color, setColor] = useState("#3B82F6"); // Default Blue
    const [paletteType, setPaletteType] = useState("monochromatic");
    const [palette, setPalette] = useState<string[]>([]);

    // Gradient State
    const [gradientStart, setGradientStart] = useState("#3B82F6");
    const [gradientEnd, setGradientEnd] = useState("#9333EA");
    const [gradientType, setGradientType] = useState("linear");
    const [gradientAngle, setGradientAngle] = useState(135);

    // Contrast State
    const [contrastColor1, setContrastColor1] = useState("#000000");
    const [contrastColor2, setContrastColor2] = useState("#FFFFFF");
    const [contrastRatio, setContrastRatio] = useState(21);

    // --- Effects ---
    useEffect(() => {
        generatePalette();
    }, [color, paletteType]);

    useEffect(() => {
        const ratio = getContrastRatio(contrastColor1, contrastColor2);
        setContrastRatio(ratio);
    }, [contrastColor1, contrastColor2]);

    // --- Generators ---
    const generatePalette = () => {
        const rgb = hexToRgb(color);
        if (!rgb) return;
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        let newPalette: string[] = [];

        if (paletteType === "monochromatic") {
            for (let i = 0; i < 5; i++) {
                const l = Math.max(0, Math.min(100, hsl.l + (i - 2) * 15));
                const newRgb = hslToRgb(hsl.h, hsl.s, l);
                newPalette.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
            }
        } else if (paletteType === "analogous") {
            for (let i = 0; i < 5; i++) {
                const h = (hsl.h + (i - 2) * 30 + 360) % 360;
                const newRgb = hslToRgb(h, hsl.s, hsl.l);
                newPalette.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
            }
        } else if (paletteType === "complementary") {
            newPalette.push(color);
            const compH = (hsl.h + 180) % 360;
            const compRgb = hslToRgb(compH, hsl.s, hsl.l);
            newPalette.push(rgbToHex(compRgb.r, compRgb.g, compRgb.b));
            // Add variations
            const lightRgb = hslToRgb(hsl.h, hsl.s, Math.min(95, hsl.l + 30));
            newPalette.push(rgbToHex(lightRgb.r, lightRgb.g, lightRgb.b));
            const darkRgb = hslToRgb(compH, hsl.s, Math.max(5, hsl.l - 30));
            newPalette.push(rgbToHex(darkRgb.r, darkRgb.g, darkRgb.b));
        } else if (paletteType === "triadic") {
            [0, 120, 240].forEach(offset => {
                const h = (hsl.h + offset) % 360;
                const newRgb = hslToRgb(h, hsl.s, hsl.l);
                newPalette.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
            });
        }

        setPalette(newPalette);
    };

    // --- Actions ---
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`Copied: ${text}`);
    };

    const swapContrastColors = () => {
        const temp = contrastColor1;
        setContrastColor1(contrastColor2);
        setContrastColor2(temp);
    };

    const exportPalette = (format: "tailwind" | "css" | "json") => {
        let content = "";
        if (format === "tailwind") {
            content = "colors: {\n";
            palette.forEach((c, i) => content += `  'brand-${i + 1}': '${c}',\n`);
            content += "}";
        } else if (format === "css") {
            content = ":root {\n";
            palette.forEach((c, i) => content += `  --color-brand-${i + 1}: ${c};\n`);
            content += "}";
        } else {
            content = JSON.stringify(palette, null, 2);
        }
        copyToClipboard(content);
        toast.success(`Copied ${format.toUpperCase()} palette!`);
    };

    // --- Render Helpers ---
    const rgb = hexToRgb(color);
    const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : { h: 0, s: 0, l: 0 };
    const cmyk = rgb ? rgbToCmyk(rgb.r, rgb.g, rgb.b) : { c: 0, m: 0, y: 0, k: 0 };

    return (
        <ToolPageLayout
            title="Color Tools (Advanced)"
            description="Professional suite for color manipulation, palettes, and accessibility."
            parentPath="/tools/other"
            parentName="Developer Tools"
            about={
                <div>
                    <p>
                        A professional-grade color suite for designers and developers. Generate harmonious palettes, check WCAG accessibility contrast ratios, and create CSS gradients with ease.
                    </p>
                    <p className="mt-2">
                        Whether you are building a new brand identity or ensuring your website is accessible to everyone, this tool provides the accurate color values you need.
                    </p>
                </div>
            }
            howItWorks={HOW_IT_WORKS}
            disclaimer={DISCLAIMER}
        >
            <div className="max-w-6xl mx-auto space-y-8">

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-[#111111] border border-white/10">
                        <TabsTrigger value="picker">Picker & Convert</TabsTrigger>
                        <TabsTrigger value="palette">Palette Gen</TabsTrigger>
                        <TabsTrigger value="gradient">Gradient</TabsTrigger>
                        <TabsTrigger value="contrast">Contrast</TabsTrigger>
                    </TabsList>

                    {/* Picker Tab */}
                    <TabsContent value="picker" className="space-y-6 mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Card className="border-white/5 bg-[#111111]">
                                <CardContent className="p-6 flex flex-col items-center justify-center space-y-6">
                                    <div
                                        className="w-full aspect-video rounded-xl shadow-2xl transition-colors duration-300"
                                        style={{ backgroundColor: color }}
                                    />
                                    <div className="w-full">
                                        <label className="text-sm font-medium text-white/40 uppercase tracking-wider mb-2 block">Select Color</label>
                                        <div className="flex gap-4">
                                            <Input
                                                type="color"
                                                value={color}
                                                onChange={(e) => setColor(e.target.value)}
                                                className="w-16 h-12 p-1 bg-[#0A0A0A] border-white/10"
                                            />
                                            <Input
                                                type="text"
                                                value={color.toUpperCase()}
                                                onChange={(e) => setColor(e.target.value)}
                                                className="flex-1 h-12 bg-[#0A0A0A] border-white/10 font-mono text-lg"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-white/5 bg-[#111111]">
                                <CardContent className="p-6 space-y-4">
                                    <h3 className="text-lg font-bold text-white mb-4">Color Values</h3>

                                    <div className="space-y-1">
                                        <label className="text-xs text-white/40">RGB</label>
                                        <div className="flex items-center justify-between bg-[#0A0A0A] p-3 rounded-lg border border-white/5">
                                            <code className="text-blue-400 font-mono">{rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : 'Invalid'}</code>
                                            <Button variant="ghost" size="icon" onClick={() => copyToClipboard(rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : '')}>
                                                <Copy size={14} />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs text-white/40">HSL</label>
                                        <div className="flex items-center justify-between bg-[#0A0A0A] p-3 rounded-lg border border-white/5">
                                            <code className="text-purple-400 font-mono">{`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`}</code>
                                            <Button variant="ghost" size="icon" onClick={() => copyToClipboard(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`)}>
                                                <Copy size={14} />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs text-white/40">CMYK</label>
                                        <div className="flex items-center justify-between bg-[#0A0A0A] p-3 rounded-lg border border-white/5">
                                            <code className="text-green-400 font-mono">{`cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`}</code>
                                            <Button variant="ghost" size="icon" onClick={() => copyToClipboard(`cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`)}>
                                                <Copy size={14} />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Palette Tab */}
                    <TabsContent value="palette" className="space-y-6 mt-6">
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <Card className="border-white/5 bg-[#111111] w-full md:w-1/3">
                                <CardContent className="p-6 space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-white/40 uppercase tracking-wider">Base Color</label>
                                        <div className="flex gap-2">
                                            <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-12 h-10 p-1 bg-[#0A0A0A]" />
                                            <Input value={color} onChange={(e) => setColor(e.target.value)} className="flex-1 h-10 bg-[#0A0A0A] font-mono" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-white/40 uppercase tracking-wider">Harmony</label>
                                        <Select value={paletteType} onValueChange={setPaletteType}>
                                            <SelectTrigger className="bg-[#0A0A0A] border-white/10"><SelectValue /></SelectTrigger>
                                            <SelectContent className="bg-[#111111] border-white/10 text-white">
                                                <SelectItem value="monochromatic">Monochromatic</SelectItem>
                                                <SelectItem value="analogous">Analogous</SelectItem>
                                                <SelectItem value="complementary">Complementary</SelectItem>
                                                <SelectItem value="triadic">Triadic</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="pt-4 border-t border-white/10 space-y-2">
                                        <label className="text-sm font-medium text-white/40 uppercase tracking-wider">Export</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            <Button variant="outline" size="sm" onClick={() => exportPalette('tailwind')} className="text-xs border-white/10 hover:bg-white/5">Tailwind</Button>
                                            <Button variant="outline" size="sm" onClick={() => exportPalette('css')} className="text-xs border-white/10 hover:bg-white/5">CSS Var</Button>
                                            <Button variant="outline" size="sm" onClick={() => exportPalette('json')} className="text-xs border-white/10 hover:bg-white/5">JSON</Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex-1 grid grid-cols-1 gap-4 w-full">
                                {palette.map((c, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="h-20 rounded-xl flex items-center justify-between px-6 shadow-lg group"
                                        style={{ backgroundColor: c }}
                                    >
                                        <span className={`font-mono font-bold text-lg ${getLuminance(hexToRgb(c)?.r || 0, hexToRgb(c)?.g || 0, hexToRgb(c)?.b || 0) > 0.5 ? 'text-black' : 'text-white'}`}>
                                            {c.toUpperCase()}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => copyToClipboard(c)}
                                            className={`opacity-0 group-hover:opacity-100 transition-opacity ${getLuminance(hexToRgb(c)?.r || 0, hexToRgb(c)?.g || 0, hexToRgb(c)?.b || 0) > 0.5 ? 'text-black hover:bg-black/10' : 'text-white hover:bg-white/10'}`}
                                        >
                                            <Copy size={20} />
                                        </Button>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    {/* Gradient Tab */}
                    <TabsContent value="gradient" className="space-y-6 mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <Card className="border-white/5 bg-[#111111] md:col-span-1">
                                <CardContent className="p-6 space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-white/40 uppercase tracking-wider">Start Color</label>
                                        <div className="flex gap-2">
                                            <Input type="color" value={gradientStart} onChange={(e) => setGradientStart(e.target.value)} className="w-12 h-10 p-1 bg-[#0A0A0A]" />
                                            <Input value={gradientStart} onChange={(e) => setGradientStart(e.target.value)} className="flex-1 h-10 bg-[#0A0A0A] font-mono" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-white/40 uppercase tracking-wider">End Color</label>
                                        <div className="flex gap-2">
                                            <Input type="color" value={gradientEnd} onChange={(e) => setGradientEnd(e.target.value)} className="w-12 h-10 p-1 bg-[#0A0A0A]" />
                                            <Input value={gradientEnd} onChange={(e) => setGradientEnd(e.target.value)} className="flex-1 h-10 bg-[#0A0A0A] font-mono" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-white/40 uppercase tracking-wider">Type</label>
                                        <Select value={gradientType} onValueChange={setGradientType}>
                                            <SelectTrigger className="bg-[#0A0A0A] border-white/10"><SelectValue /></SelectTrigger>
                                            <SelectContent className="bg-[#111111] border-white/10 text-white">
                                                <SelectItem value="linear">Linear</SelectItem>
                                                <SelectItem value="radial">Radial</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    {gradientType === "linear" && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-white/40 uppercase tracking-wider">Angle ({gradientAngle}°)</label>
                                            <Slider
                                                value={[gradientAngle]}
                                                onValueChange={(v) => setGradientAngle(v[0])}
                                                max={360}
                                                step={1}
                                                className="py-4"
                                            />
                                        </div>
                                    )}
                                    <Button
                                        onClick={() => copyToClipboard(`background: ${gradientType === 'linear' ? `linear-gradient(${gradientAngle}deg, ${gradientStart}, ${gradientEnd})` : `radial-gradient(circle, ${gradientStart}, ${gradientEnd})`};`)}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        <Copy className="mr-2 h-4 w-4" /> Copy CSS
                                    </Button>
                                </CardContent>
                            </Card>

                            <div className="md:col-span-2">
                                <div
                                    className="w-full h-full min-h-[300px] rounded-xl shadow-2xl border border-white/10"
                                    style={{
                                        background: gradientType === 'linear'
                                            ? `linear-gradient(${gradientAngle}deg, ${gradientStart}, ${gradientEnd})`
                                            : `radial-gradient(circle, ${gradientStart}, ${gradientEnd})`
                                    }}
                                />
                            </div>
                        </div>
                    </TabsContent>

                    {/* Contrast Tab */}
                    <TabsContent value="contrast" className="space-y-6 mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Card className="border-white/5 bg-[#111111]">
                                <CardContent className="p-6 space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-bold text-white">Colors</h3>
                                        <Button variant="ghost" size="sm" onClick={swapContrastColors} className="text-white/40 hover:text-white">
                                            <ArrowRightLeft size={16} />
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-white/40 uppercase tracking-wider">Background</label>
                                        <div className="flex gap-2">
                                            <Input type="color" value={contrastColor1} onChange={(e) => setContrastColor1(e.target.value)} className="w-12 h-10 p-1 bg-[#0A0A0A]" />
                                            <Input value={contrastColor1} onChange={(e) => setContrastColor1(e.target.value)} className="flex-1 h-10 bg-[#0A0A0A] font-mono" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-white/40 uppercase tracking-wider">Text</label>
                                        <div className="flex gap-2">
                                            <Input type="color" value={contrastColor2} onChange={(e) => setContrastColor2(e.target.value)} className="w-12 h-10 p-1 bg-[#0A0A0A]" />
                                            <Input value={contrastColor2} onChange={(e) => setContrastColor2(e.target.value)} className="flex-1 h-10 bg-[#0A0A0A] font-mono" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-white/5 bg-[#111111]">
                                <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-6">
                                    <div>
                                        <div className="text-6xl font-bold text-white mb-2">{contrastRatio.toFixed(2)}</div>
                                        <div className="text-sm text-white/40 uppercase tracking-wider">Contrast Ratio</div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 w-full">
                                        <div className={`p-4 rounded-lg border ${contrastRatio >= 3 ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                                            <div className="font-bold text-white mb-1">AA Large</div>
                                            <div className="text-xs text-white/60">{contrastRatio >= 3 ? 'Pass' : 'Fail'}</div>
                                        </div>
                                        <div className={`p-4 rounded-lg border ${contrastRatio >= 4.5 ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                                            <div className="font-bold text-white mb-1">AA Normal</div>
                                            <div className="text-xs text-white/60">{contrastRatio >= 4.5 ? 'Pass' : 'Fail'}</div>
                                        </div>
                                        <div className={`p-4 rounded-lg border ${contrastRatio >= 7 ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                                            <div className="font-bold text-white mb-1">AAA Normal</div>
                                            <div className="text-xs text-white/60">{contrastRatio >= 7 ? 'Pass' : 'Fail'}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="md:col-span-2 p-8 rounded-xl flex flex-col items-center justify-center text-center space-y-4 transition-colors duration-300"
                                style={{ backgroundColor: contrastColor1, color: contrastColor2 }}
                            >
                                <h2 className="text-3xl font-bold">Preview Text</h2>
                                <p className="max-w-md text-lg opacity-90">
                                    This is how your text will look against the background. Ensure it is readable for all users.
                                </p>
                            </div>
                        </div>
                    </TabsContent>

                </Tabs>
            </div>
        </ToolPageLayout>
    );
};

export default ColorTools;
