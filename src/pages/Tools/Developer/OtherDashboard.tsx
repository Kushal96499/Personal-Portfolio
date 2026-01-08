import React from 'react';
import ToolsDashboardLayout from '@/components/tools/ToolsDashboardLayout';
import { QrCode, FileCode, Palette, Image, Clock, Code2, Type, Wrench, FileText } from 'lucide-react';

const OtherDashboard = () => {
    const categories = [
        {
            id: "text",
            name: "Text & Code",
            icon: FileCode,
            tools: [
                { id: "mini-tools", name: "Mini Tools", description: "Base64, URL, Case Converter, Text Utils.", icon: Wrench, path: "/tools/mini" },
                { id: "regex", name: "Regex Tester", description: "Test and debug regular expressions.", icon: Code2, path: "/tools/regex-tester" },
                { id: "markdown", name: "Markdown Converter", description: "Convert Markdown to HTML.", icon: FileText, path: "/tools/markdown-converter" },
            ]
        },
        {
            id: "media",
            name: "Media Tools",
            icon: Image,
            tools: [
                { id: "image-compressor", name: "Image Compressor", description: "Compress images locally.", icon: Image, path: "/tools/image-compressor" },
                { id: "qr", name: "QR Code Generator", description: "Create QR codes for links and text.", icon: QrCode, path: "/tools/qr" },
            ]
        },
        {
            id: "utility",
            name: "Utilities",
            icon: Clock,
            tools: [
                { id: "color", name: "Color Tools", description: "Picker, Converter, Palette Generator.", icon: Palette, path: "/tools/color-tools" },
                { id: "time", name: "Time & Date", description: "Converters, Timers, World Clock.", icon: Clock, path: "/tools/time-date" },
            ]
        }
    ];

    return (
        <ToolsDashboardLayout
            title="Developer Tools"
            description="A collection of useful utilities for developers and designers."
            categories={categories}
            basePath="/tools/other"
        />
    );
};

export default OtherDashboard;
