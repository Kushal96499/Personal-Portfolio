import React, { useState, useEffect } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { Layers, Download, RefreshCw, GripVertical, RotateCw, RotateCcw, Trash2, Copy, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import UniversalToolLayout from '@/components/UniversalToolLayout';
import IngestionZone from '@/components/tools/IngestionZone';
import { ReactSortable } from "react-sortablejs";
import { cn } from '@/lib/utils';
import { initPDFWorker } from '@/utils/pdfWorker';

interface PageItem {
    id: string;
    originalIndex: number;
    imageUrl: string;
    rotation: number; // 0, 90, 180, or 270
    deleted: boolean;
}

const OrganizePDF = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultBlob, setResultBlob] = useState<Blob | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [pages, setPages] = useState<PageItem[]>([]);
    const [history, setHistory] = useState<PageItem[][]>([]);

    useEffect(() => {
        initPDFWorker();
    }, []);

    const handleFileSelect = async (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0]);
            setResultBlob(null);
            setError(null);
            setPages([]);
            setHistory([]);
            generateThumbnails(files[0]);
        }
    };

    const generateThumbnails = async (pdfFile: File) => {
        setIsProcessing(true);
        try {
            const arrayBuffer = await pdfFile.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            const numPages = pdf.numPages;
            const newPages: PageItem[] = [];

            for (let i = 1; i <= numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 0.6 });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({ canvasContext: context!, viewport }).promise;
                newPages.push({
                    id: `page-${i}-${Date.now()}`,
                    originalIndex: i - 1,
                    imageUrl: canvas.toDataURL(),
                    rotation: 0,
                    deleted: false
                });
            }
            setPages(newPages);
        } catch (err) {
            console.error("Thumbnail generation failed:", err);
            setError("Failed to load PDF pages.");
        } finally {
            setIsProcessing(false);
        }
    };

    // Save current state to history for undo
    const saveToHistory = () => {
        setHistory(prev => [...prev, JSON.parse(JSON.stringify(pages))]);
    };

    // Undo last action
    const handleUndo = () => {
        if (history.length > 0) {
            const lastState = history[history.length - 1];
            setPages(lastState);
            setHistory(prev => prev.slice(0, -1));
            toast.success("Action undone");
        }
    };

    // Rotate page
    const rotatePage = (pageId: string, direction: 'cw' | 'ccw') => {
        saveToHistory();
        setPages(prev => prev.map(p => {
            if (p.id === pageId) {
                const delta = direction === 'cw' ? 90 : -90;
                let newRotation = (p.rotation + delta) % 360;
                if (newRotation < 0) newRotation += 360;
                return { ...p, rotation: newRotation };
            }
            return p;
        }));
    };

    // Delete page (soft delete - mark as deleted)
    const deletePage = (pageId: string) => {
        saveToHistory();
        setPages(prev => prev.map(p =>
            p.id === pageId ? { ...p, deleted: true } : p
        ));
        toast.success("Page marked for deletion");
    };

    // Restore deleted page
    const restorePage = (pageId: string) => {
        saveToHistory();
        setPages(prev => prev.map(p =>
            p.id === pageId ? { ...p, deleted: false } : p
        ));
        toast.success("Page restored");
    };

    // Duplicate page
    const duplicatePage = (pageId: string) => {
        saveToHistory();
        const pageIndex = pages.findIndex(p => p.id === pageId);
        if (pageIndex !== -1) {
            const original = pages[pageIndex];
            const duplicate: PageItem = {
                ...original,
                id: `page-dup-${Date.now()}`
            };
            const newPages = [...pages];
            newPages.splice(pageIndex + 1, 0, duplicate);
            setPages(newPages);
            toast.success("Page duplicated");
        }
    };

    const handleSaveOrder = async () => {
        const activePages = pages.filter(p => !p.deleted);
        if (!file || activePages.length === 0) {
            toast.error("No pages to save");
            return;
        }
        setIsProcessing(true);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const newPdf = await PDFDocument.create();

            // Get indices in new order (only non-deleted pages)
            const indices = activePages.map(p => p.originalIndex);

            // Copy pages in the new order
            const copiedPages = await newPdf.copyPages(pdfDoc, indices);

            // Add them with rotation
            copiedPages.forEach((page, i) => {
                const rotation = activePages[i].rotation;
                if (rotation !== 0) {
                    page.setRotation(degrees(rotation));
                }
                newPdf.addPage(page);
            });

            const pdfBytes = await newPdf.save();
            const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
            setResultBlob(blob);

            const deletedCount = pages.filter(p => p.deleted).length;
            const rotatedCount = activePages.filter(p => p.rotation !== 0).length;

            let message = "PDF Organized Successfully!";
            if (deletedCount > 0 || rotatedCount > 0) {
                const parts = [];
                if (deletedCount > 0) parts.push(`${deletedCount} page(s) removed`);
                if (rotatedCount > 0) parts.push(`${rotatedCount} page(s) rotated`);
                message = `${parts.join(', ')}`;
            }
            toast.success(message);

        } catch (err: any) {
            console.error("Organize failed:", err);
            setError("Failed to organize pages.");
            toast.error("Operation Failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (resultBlob && file) {
            const url = URL.createObjectURL(resultBlob);
            const link = document.createElement('a');
            link.href = url;
            const baseName = file.name.replace(/\.pdf$/i, '');
            link.download = `${baseName}_organize.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };

    const activePages = pages.filter(p => !p.deleted);
    const deletedPages = pages.filter(p => p.deleted);

    const HOW_IT_WORKS = [
        "Upload a PDF file",
        "Drag pages to reorder, use buttons to rotate/delete",
        "Click 'Save Changes'",
        "Download the organized PDF"
    ];

    return (
        <UniversalToolLayout
            title="Organize PDF"
            description="Rearrange, rotate, and delete pages in your PDF document."
            steps={HOW_IT_WORKS}
            isProcessing={isProcessing}
            error={error}
            onResetError={() => setError(null)}
            about={
                <>
                    <p>
                        Take full control of your PDF structure. Rearrange, rotate, delete, or duplicate pages with a simple drag-and-drop interface.
                        Perfect for assembling reports or removing unwanted pages.
                    </p>
                </>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-12 h-full min-h-[600px]">
                {/* Left: Page Grid */}
                <div className="lg:col-span-9 bg-[#0A0A0A] border-r border-white/5 p-4 lg:p-8 overflow-y-auto max-h-[800px]">
                    {!file ? (
                        <div className="flex items-center justify-center h-full">
                            <IngestionZone
                                onDrop={handleFileSelect}
                                accept={{ 'application/pdf': ['.pdf'] }}
                                multiple={false}
                                files={[]}
                                className="w-full max-w-xl h-64"
                            />
                        </div>
                    ) : (
                        <ReactSortable
                            list={activePages}
                            setList={(newList) => {
                                // Merge with deleted pages
                                const newPages = [...newList, ...deletedPages];
                                setPages(newPages);
                            }}
                            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                            animation={200}
                            handle=".drag-handle"
                        >
                            {activePages.map((page, index) => (
                                <div
                                    key={page.id}
                                    className="relative group bg-white/5 rounded-lg overflow-hidden border border-white/10 hover:border-indigo-500/50 transition-all"
                                >
                                    {/* Page Image with Rotation */}
                                    <div
                                        className="relative overflow-hidden"
                                        style={{
                                            transform: `rotate(${page.rotation}deg)`,
                                            transformOrigin: 'center center'
                                        }}
                                    >
                                        <img
                                            src={page.imageUrl}
                                            alt={`Page ${index + 1}`}
                                            className="w-full h-auto pointer-events-none"
                                        />
                                    </div>

                                    {/* Page Number Badge */}
                                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded font-medium">
                                        {index + 1}
                                    </div>

                                    {/* Rotation Indicator */}
                                    {page.rotation !== 0 && (
                                        <div className="absolute top-2 right-2 bg-indigo-600/80 text-white text-[10px] px-1.5 py-0.5 rounded">
                                            {page.rotation}°
                                        </div>
                                    )}

                                    {/* Drag Handle */}
                                    <div className="drag-handle absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded p-1 cursor-grab active:cursor-grabbing">
                                        <GripVertical className="w-4 h-4 text-white" />
                                    </div>

                                    {/* Action Buttons - Always visible on mobile, Hover on desktop */}
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity p-2 pt-8">
                                        <div className="flex justify-center gap-1">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); rotatePage(page.id, 'ccw'); }}
                                                className="p-1.5 bg-white/10 hover:bg-white/20 rounded transition-colors"
                                                title="Rotate Left"
                                            >
                                                <RotateCcw className="w-3.5 h-3.5 text-white" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); rotatePage(page.id, 'cw'); }}
                                                className="p-1.5 bg-white/10 hover:bg-white/20 rounded transition-colors"
                                                title="Rotate Right"
                                            >
                                                <RotateCw className="w-3.5 h-3.5 text-white" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); duplicatePage(page.id); }}
                                                className="p-1.5 bg-white/10 hover:bg-blue-500/50 rounded transition-colors"
                                                title="Duplicate Page"
                                            >
                                                <Copy className="w-3.5 h-3.5 text-white" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deletePage(page.id); }}
                                                className="p-1.5 bg-white/10 hover:bg-red-500/50 rounded transition-colors"
                                                title="Delete Page"
                                            >
                                                <Trash2 className="w-3.5 h-3.5 text-white" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </ReactSortable>
                    )}
                </div>

                {/* Right: Controls */}
                <div className="lg:col-span-3 bg-[#111] p-4 lg:p-6 flex flex-col">
                    <div className="flex-1 space-y-4 lg:space-y-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Layers className="w-5 h-5 text-indigo-400" /> Organize Pages
                        </h3>

                        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4 text-sm text-indigo-200/80">
                            <p className="font-medium mb-2">Quick Actions:</p>
                            <ul className="text-xs space-y-1 text-gray-400">
                                <li>• <span className="text-white">Drag</span> - Reorder pages</li>
                                <li>• <RotateCw className="w-3 h-3 inline" /> <RotateCcw className="w-3 h-3 inline" /> - Rotate page</li>
                                <li>• <Copy className="w-3 h-3 inline" /> - Duplicate page</li>
                                <li>• <Trash2 className="w-3 h-3 inline" /> - Delete page</li>
                            </ul>
                        </div>

                        {/* Stats */}
                        {pages.length > 0 && (
                            <div className="grid grid-cols-2 gap-3 text-center">
                                <div className="bg-white/5 rounded-lg p-3">
                                    <span className="text-2xl font-bold text-white">{activePages.length}</span>
                                    <p className="text-xs text-gray-400">Pages</p>
                                </div>
                                <div className="bg-white/5 rounded-lg p-3">
                                    <span className="text-2xl font-bold text-red-400">{deletedPages.length}</span>
                                    <p className="text-xs text-gray-400">Deleted</p>
                                </div>
                            </div>
                        )}

                        {/* Deleted Pages Section */}
                        {deletedPages.length > 0 && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                <p className="text-xs text-red-200/80 mb-2 font-medium">Deleted Pages:</p>
                                <div className="flex flex-wrap gap-1">
                                    {deletedPages.map((page) => (
                                        <button
                                            key={page.id}
                                            onClick={() => restorePage(page.id)}
                                            className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs rounded transition-colors"
                                            title="Click to restore"
                                        >
                                            Page {page.originalIndex + 1} ↩
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Undo Button */}
                        {history.length > 0 && (
                            <Button
                                variant="outline"
                                onClick={handleUndo}
                                className="w-full border-white/10 hover:bg-white/5"
                            >
                                <Undo2 className="w-4 h-4 mr-2" />
                                Undo ({history.length})
                            </Button>
                        )}
                    </div>

                    <div className="pt-4 lg:pt-6 border-t border-white/5">
                        {!resultBlob ? (
                            <Button
                                onClick={handleSaveOrder}
                                disabled={!file || isProcessing || activePages.length === 0}
                                className="w-full h-12 text-lg bg-indigo-600 hover:bg-indigo-500 text-white"
                            >
                                {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin mr-2" /> : <Layers className="w-5 h-5 mr-2" />}
                                {isProcessing ? 'Saving...' : 'Save Changes'}
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
                                    variant="ghost"
                                    onClick={() => setResultBlob(null)}
                                    className="w-full text-sm text-gray-400 hover:text-white"
                                >
                                    Make More Changes
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </UniversalToolLayout>
    );
};

export default OrganizePDF;
