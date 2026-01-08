import {
    Shield,
    Lock,
    Hash,
    Globe,
    Activity,
    Terminal,
    Wifi,
    QrCode,
    FileCode,
    Palette,
    Image,
    Clock,
    Code2,
    Type,
    Wrench,
    FileText
} from "lucide-react";
import { allPdfTools } from "./pdfTools";

export interface Tool {
    id: string;
    name: string;
    description: string;
    icon: any;
    path: string;
    category: string;
    isNew?: boolean;
    isPopular?: boolean;
    isAi?: boolean;
}

const cyberTools: Tool[] = [
    { id: "password-strength", name: "Password Strength", description: "Test how strong your passwords are.", icon: Lock, path: "/tools/password-strength", category: "Security" },
    { id: "hash-generator", name: "Hash Generator", description: "Generate secure hashes (MD5, SHA-256).", icon: Hash, path: "/tools/hash", category: "Cryptography" },
    { id: "url-safety", name: "URL Safety Checker", description: "Check if a URL is safe or malicious.", icon: Globe, path: "/tools/url-safety", category: "Security" },
    { id: "ip-address", name: "My IP Address", description: "View your public IP and location info.", icon: Globe, path: "/tools/ip-address", category: "Network" },
    { id: "ping-tester", name: "Ping Tester", description: "Check latency to websites/IPs.", icon: Activity, path: "/tools/ping", category: "Network" },
    { id: "cyber-tips", name: "Cybersecurity Tips", description: "Get random security tips and best practices.", icon: Shield, path: "/tools/tips", category: "Education" },
];

const otherTools: Tool[] = [
    { id: "mini-tools", name: "Mini Tools", description: "Base64, URL, Case Converter, Text Utils.", icon: Wrench, path: "/tools/other", category: "Utility" },
    { id: "regex", name: "Regex Tester", description: "Test and debug regular expressions.", icon: Code2, path: "/tools/regex-tester", category: "Development" },
    { id: "markdown", name: "Markdown Converter", description: "Convert Markdown to HTML.", icon: FileText, path: "/tools/markdown-converter", category: "Development" },
    { id: "image-compressor", name: "Image Compressor", description: "Compress images locally.", icon: Image, path: "/tools/image-compressor", category: "Media" },
    { id: "qr", name: "QR Code Generator", description: "Create QR codes for links and text.", icon: QrCode, path: "/tools/qr", category: "Utility" },
    { id: "color", name: "Color Tools", description: "Picker, Converter, Palette Generator.", icon: Palette, path: "/tools/color-tools", category: "Design" },
    { id: "time", name: "Time & Date", description: "Converters, Timers, World Clock.", icon: Clock, path: "/tools/time-date", category: "Utility" },
];

// Combine all tools into a single list
export const allTools: Tool[] = [
    ...cyberTools,
    ...otherTools,
    ...allPdfTools
];
