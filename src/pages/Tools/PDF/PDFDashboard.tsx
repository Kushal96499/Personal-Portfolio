import React from 'react';
import ToolsDashboardLayout from '@/components/tools/ToolsDashboardLayout';
import {
    FileText, FilePlus, Scissors, Minimize2, Image, FileCode,
    FileSpreadsheet, Presentation, Lock, Unlock, RotateCw,
    Crop, Type, Eraser, PenTool, Search, Shield, Layers,
    Wrench, ScanText, FileOutput, Camera, GitCompare, File,
    Trash2, Hash, Code, ShieldCheck, Zap
} from 'lucide-react';

const PDFDashboard = () => {
    const categories = [
        {
            id: "organize",
            name: "Organize PDF",
            icon: Layers,
            tools: [
                { id: "merge-pdf", name: "Merge PDF", description: "Combine multiple PDFs into one.", icon: FilePlus, path: "/tools/pdf/merge" },
                { id: "split-pdf", name: "Split PDF", description: "Split a PDF into separate files.", icon: Scissors, path: "/tools/pdf/split" },
                { id: "remove-pages", name: "Remove Pages", description: "Delete specific pages from a PDF.", icon: Trash2, path: "/tools/pdf/remove-pages" },
                { id: "extract-pages", name: "Extract Pages", description: "Get specific pages from a PDF.", icon: FileOutput, path: "/tools/pdf/extract-pages" },
                { id: "organize-pdf", name: "Organize PDF", description: "Reorder, move, and delete pages.", icon: Layers, path: "/tools/pdf/organize" },
                { id: "scan-pdf", name: "Scan to PDF", description: "Capture documents from camera.", icon: Camera, path: "/tools/pdf/scan-pdf" },
            ]
        },


        {
            id: "edit",
            name: "Edit PDF",
            icon: PenTool,
            tools: [
                { id: "rotate-pdf", name: "Rotate PDF", description: "Rotate PDF pages.", icon: RotateCw, path: "/tools/pdf/rotate" },
                { id: "crop-pdf", name: "Crop PDF", description: "Crop PDF pages.", icon: Crop, path: "/tools/pdf/crop" },
                { id: "add-watermark", name: "Watermark", description: "Add watermark to PDF.", icon: Type, path: "/tools/pdf/watermark" },
                { id: "add-page-numbers", name: "Page Numbers", description: "Add page numbers to PDF.", icon: Hash, path: "/tools/pdf/page-numbers" },
                { id: "edit-pdf", name: "Edit PDF", description: "Add text, images, and shapes.", icon: PenTool, path: "/tools/pdf/edit" },
            ]
        },
        {
            id: "security",
            name: "Security & Sign",
            icon: ShieldCheck,
            tools: [
                { id: "protect-pdf", name: "Protect PDF", description: "Encrypt PDF with password.", icon: Lock, path: "/tools/pdf/protect" },
                { id: "unlock-pdf", name: "Unlock PDF", description: "Remove PDF password security.", icon: Unlock, path: "/tools/pdf/unlock" },
                { id: "sign-pdf", name: "Sign PDF", description: "Add digital signature to PDF.", icon: PenTool, path: "/tools/pdf/sign" },
                { id: "redact-pdf", name: "Redact PDF", description: "Permanently hide sensitive info.", icon: Eraser, path: "/tools/pdf/redact" },
                { id: "metadata-pdf", name: "Metadata", description: "Edit PDF metadata properties.", icon: FileText, path: "/tools/pdf/metadata" },
                { id: "compare-pdf", name: "Compare", description: "Compare two PDF files.", icon: GitCompare, path: "/tools/pdf/compare" },
            ]
        },
        {
            id: "optimize",
            name: "Optimize PDF",
            icon: Zap,
            tools: [
                { id: "compress-pdf", name: "Compress PDF", description: "Reduce PDF file size.", icon: Minimize2, path: "/tools/pdf/compress" },
                { id: "repair-pdf", name: "Repair PDF", description: "Fix corrupted PDF files.", icon: Wrench, path: "/tools/pdf/repair" },
                { id: "ocr-pdf", name: "OCR PDF", description: "Make scanned PDFs searchable.", icon: ScanText, path: "/tools/pdf/ocr" },
            ]
        }
    ];

    return (
        <ToolsDashboardLayout
            title="PDF Tools"
            description="A complete suite of tools to manage your PDF documents. 100% Client-side & Secure."
            categories={categories}
            basePath="/tools/pdf"
        />
    );
};

export default PDFDashboard;

