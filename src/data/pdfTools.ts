import {
    FileText,
    Merge,
    Split,
    Trash2,
    Move,
    Scan,
    Images,
    Minimize2,
    Wrench,
    FileImage,
    FileType,
    FileCode,
    Lock,
    Unlock,
    Shield,
    EyeOff,
    Search,

    RefreshCw,
    RotateCw,
    Stamp,
    Crop,
    PenTool,
    Eraser,
    Signature,
    Highlighter,
    ArrowRightLeft
} from "lucide-react";

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

export interface ToolCategory {
    id: string;
    name: string;
    description: string;
    icon: any;
    path: string;
    tools: Tool[];
}

export const pdfToolCategories: ToolCategory[] = [
    {
        id: "organize",
        name: "Organize PDF",
        description: "Merge, split, remove, or rearrange pages.",
        icon: FileText,
        path: "/tools/pdf/organize",
        tools: [
            { id: "merge-pdf", name: "Merge PDF", description: "Combine multiple PDFs into one.", icon: Merge, path: "/tools/pdf/merge", category: "organize", isPopular: true },
            { id: "split-pdf", name: "Split PDF", description: "Separate one PDF into multiple files.", icon: Split, path: "/tools/pdf/split", category: "organize" },
            { id: "remove-pages", name: "Remove Pages", description: "Delete specific pages from your PDF.", icon: Trash2, path: "/tools/pdf/remove-pages", category: "organize" },
            { id: "extract-pages", name: "Extract Pages", description: "Get specific pages from a PDF.", icon: FileText, path: "/tools/pdf/extract-pages", category: "organize" },
            { id: "organize-pdf", name: "Organize PDF", description: "Sort, add and delete PDF pages.", icon: Move, path: "/tools/pdf/organize", category: "organize" },
            { id: "scan-pdf", name: "Scan to PDF", description: "Capture document from mobile.", icon: Scan, path: "/tools/pdf/scan-pdf", category: "organize" },
        ]
    },
    {
        id: "optimize",
        name: "Optimize PDF",
        description: "Compress, repair, and OCR your PDFs.",
        icon: Minimize2,
        path: "/tools/pdf/optimize",
        tools: [
            { id: "compress-pdf", name: "Compress PDF", description: "Reduce file size while optimizing quality.", icon: Minimize2, path: "/tools/pdf/compress", category: "optimize", isPopular: true },
            { id: "repair-pdf", name: "Repair PDF", description: "Recover data from a corrupted PDF.", icon: Wrench, path: "/tools/pdf/repair", category: "optimize" },
            { id: "ocr-pdf", name: "OCR PDF", description: "Make scanned PDFs searchable.", icon: Search, path: "/tools/pdf/ocr", category: "optimize" },
        ]
    },
    {
        id: "convert-to",
        name: "Convert to PDF",
        description: "Convert images, documents, and web pages to PDF.",
        icon: FileType,
        path: "/tools/pdf/convert-to",
        tools: [
            { id: "jpg-to-pdf", name: "JPG to PDF", description: "Convert JPG images to PDF.", icon: FileImage, path: "/tools/pdf/jpg-to-pdf", category: "convert-to", isPopular: true },
            { id: "word-to-pdf", name: "Word to PDF", description: "Convert Word documents to PDF.", icon: FileType, path: "/tools/pdf/word-to-pdf", category: "convert-to" },
            { id: "powerpoint-to-pdf", name: "PowerPoint to PDF", description: "Convert PowerPoint to PDF.", icon: FileType, path: "/tools/pdf/ppt-to-pdf", category: "convert-to" },
            { id: "excel-to-pdf", name: "Excel to PDF", description: "Convert Excel spreadsheets to PDF.", icon: FileType, path: "/tools/pdf/excel-to-pdf", category: "convert-to" },
            { id: "html-to-pdf", name: "HTML to PDF", description: "Convert web pages to PDF.", icon: FileCode, path: "/tools/pdf/html-to-pdf", category: "convert-to" },
        ]
    },
    {
        id: "convert-from",
        name: "Convert from PDF",
        description: "Convert PDFs to editable documents and images.",
        icon: RefreshCw,
        path: "/tools/pdf/convert-from",
        tools: [
            { id: "pdf-to-jpg", name: "PDF to JPG", description: "Convert PDF pages to JPG.", icon: FileImage, path: "/tools/pdf/pdf-to-jpg", category: "convert-from", isPopular: true },
            { id: "pdf-to-word", name: "PDF to Word", description: "Convert PDF to editable Word doc.", icon: FileType, path: "/tools/pdf/pdf-to-word", category: "convert-from" },
            { id: "pdf-to-powerpoint", name: "PDF to PowerPoint", description: "Convert PDF to PowerPoint slides.", icon: FileType, path: "/tools/pdf/pdf-to-pptx", category: "convert-from" },
            { id: "pdf-to-excel", name: "PDF to Excel", description: "Convert PDF to Excel spreadsheets.", icon: FileType, path: "/tools/pdf/pdf-to-excel", category: "convert-from" },
            { id: "pdf-to-pdfa", name: "PDF to PDF/A", description: "Convert to ISO-standardized PDF/A.", icon: FileText, path: "/tools/pdf/pdf-to-pdfa", category: "convert-from" },
        ]
    },
    {
        id: "edit",
        name: "Edit PDF",
        description: "Rotate, crop, add page numbers, and more.",
        icon: PenTool,
        path: "/tools/pdf/rotate",
        tools: [
            { id: "rotate-pdf", name: "Rotate PDF", description: "Rotate PDF pages.", icon: RotateCw, path: "/tools/pdf/rotate", category: "edit" },
            { id: "add-page-numbers", name: "Page Numbers", description: "Add page numbers to PDF.", icon: FileText, path: "/tools/pdf/page-numbers", category: "edit" },
            { id: "add-watermark", name: "Add Watermark", description: "Stamp text or image over PDF.", icon: Stamp, path: "/tools/pdf/watermark", category: "edit" },
            { id: "crop-pdf", name: "Crop PDF", description: "Crop PDF pages.", icon: Crop, path: "/tools/pdf/crop", category: "edit" },
            { id: "compare-pdf", name: "Compare PDF", description: "Visually compare two PDFs.", icon: ArrowRightLeft, path: "/tools/pdf/compare", category: "edit" },
        ]
    },
    {
        id: "security",
        name: "PDF Security",
        description: "Protect and unlock your PDFs.",
        icon: Shield,
        path: "/tools/pdf/security",
        tools: [
            { id: "unlock-pdf", name: "Unlock PDF", description: "Remove PDF password security.", icon: Unlock, path: "/tools/pdf/unlock", category: "security" },
            { id: "protect-pdf", name: "Protect PDF", description: "Encrypt PDF with a password.", icon: Lock, path: "/tools/pdf/protect", category: "security" },
            { id: "redact-pdf", name: "Redact PDF", description: "Permanently remove sensitive info.", icon: EyeOff, path: "/tools/pdf/redact", category: "security" },
            { id: "metadata-pdf", name: "Metadata Editor", description: "View and edit PDF metadata.", icon: FileCode, path: "/tools/pdf/metadata", category: "security" },
        ]
    },

];

export const allPdfTools = pdfToolCategories.flatMap(category => category.tools);
