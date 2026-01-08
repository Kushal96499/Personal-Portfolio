/**
 * PDF Export & Download Utilities
 * Standardized functions for downloading and exporting PDF files
 */

import { toast } from 'sonner';
import JSZip from 'jszip';

/**
 * Download a file from a blob with proper naming
 */
export function downloadFile(
    blob: Blob,
    filename: string,
    mimeType: string = 'application/pdf'
): void {
    try {
        const url = URL.createObjectURL(new Blob([blob], { type: mimeType }));
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Cleanup after a delay to ensure download started
        setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
        console.error('Download failed:', error);
        toast.error('Failed to download file');
    }
}

/**
 * Download a PDF from URL
 */
export function downloadPDF(url: string, filename: string): void {
    downloadFile(new Blob([]), filename, 'application/pdf');

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

/**
 * Download PDFDocument as file
 */
export async function downloadPDFDocument(
    pdfDoc: any,
    filename: string,
    onProgress?: (progress: number) => void
): Promise<void> {
    try {
        if (onProgress) onProgress(50);

        const pdfBytes = await pdfDoc.save();

        if (onProgress) onProgress(90);

        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        downloadFile(blob, filename);

        if (onProgress) onProgress(100);

        toast.success('PDF downloaded successfully!');
    } catch (error) {
        console.error('PDF download failed:', error);
        toast.error('Failed to download PDF');
        throw error;
    }
}

/**
 * Download multiple files as ZIP
 */
export async function downloadAsZip(
    files: Array<{ name: string; blob: Blob }>,
    zipFilename: string,
    onProgress?: (progress: number) => void
): Promise<void> {
    try {
        const zip = new JSZip();

        // Add files to ZIP
        files.forEach(({ name, blob }) => {
            zip.file(name, blob);
        });

        if (onProgress) onProgress(50);

        // Generate ZIP
        const zipBlob = await zip.generateAsync(
            { type: 'blob' },
            (metadata) => {
                if (onProgress) {
                    onProgress(50 + (metadata.percent / 2));
                }
            }
        );

        if (onProgress) onProgress(100);

        // Download ZIP
        downloadFile(zipBlob, zipFilename, 'application/zip');

        toast.success(`${files.length} files downloaded as ZIP`);
    } catch (error) {
        console.error('ZIP creation failed:', error);
        toast.error('Failed to create ZIP file');
        throw error;
    }
}

/**
 * Download image from canvas
 */
export function downloadImageFromCanvas(
    canvas: HTMLCanvasElement,
    filename: string,
    format: 'png' | 'jpg' | 'webp' = 'png',
    quality: number = 0.92
): void {
    try {
        canvas.toBlob(
            (blob) => {
                if (blob) {
                    downloadFile(blob, filename, `image/${format}`);
                    toast.success('Image downloaded successfully!');
                } else {
                    toast.error('Failed to create image');
                }
            },
            `image/${format}`,
            quality
        );
    } catch (error) {
        console.error('Image download failed:', error);
        toast.error('Failed to download image');
    }
}

/**
 * Download text as file
 */
export function downloadText(
    text: string,
    filename: string,
    mimeType: string = 'text/plain'
): void {
    const blob = new Blob([text], { type: mimeType });
    downloadFile(blob, filename, mimeType);
    toast.success('File downloaded successfully!');
}

/**
 * Download JSON data
 */
export function downloadJSON(
    data: any,
    filename: string,
    pretty: boolean = true
): void {
    const jsonString = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
    downloadText(jsonString, filename, 'application/json');
}

/**
 * Generate safe filename from input
 */
export function sanitizeFilename(filename: string): string {
    // Remove or replace invalid characters
    return filename
        .replace(/[<>:"/\\|?*]/g, '_')
        .replace(/\s+/g, '_')
        .replace(/_{2,}/g, '_')
        .trim();
}

/**
 * Add suffix to filename before extension
 */
export function addFilenameSuffix(filename: string, suffix: string): string {
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex === -1) {
        return `${filename}${suffix}`;
    }
    const name = filename.substring(0, lastDotIndex);
    const ext = filename.substring(lastDotIndex);
    return `${name}${suffix}${ext}`;
}

/**
 * Change file extension
 */
export function changeFileExtension(filename: string, newExtension: string): string {
    const lastDotIndex = filename.lastIndexOf('.');
    const name = lastDotIndex === -1 ? filename : filename.substring(0, lastDotIndex);
    const ext = newExtension.startsWith('.') ? newExtension : `.${newExtension}`;
    return `${name}${ext}`;
}

/**
 * Get filename without extension
 */
export function getFilenameWithoutExtension(filename: string): string {
    const lastDotIndex = filename.lastIndexOf('.');
    return lastDotIndex === -1 ? filename : filename.substring(0, lastDotIndex);
}

/**
 * Estimate download time based on file size
 */
export function estimateDownloadTime(bytes: number, speedMbps: number = 10): string {
    const seconds = (bytes * 8) / (speedMbps * 1000000);

    if (seconds < 1) return 'Less than a second';
    if (seconds < 60) return `${Math.round(seconds)} seconds`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    return `${Math.round(seconds / 3600)} hours`;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Create a managed download URL that auto-cleans up
 */
export function createManagedDownloadUrl(
    blob: Blob,
    autoRevokeMs: number = 60000
): string {
    const url = URL.createObjectURL(blob);

    // Auto-revoke after specified time
    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, autoRevokeMs);

    return url;
}

/**
 * Trigger multiple downloads with delay between each
 */
export async function downloadMultipleFiles(
    files: Array<{ blob: Blob; filename: string; mimeType?: string }>,
    delayMs: number = 500
): Promise<void> {
    for (let i = 0; i < files.length; i++) {
        const { blob, filename, mimeType } = files[i];
        downloadFile(blob, filename, mimeType);

        // Wait between downloads to avoid browser blocking
        if (i < files.length - 1) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }

    toast.success(`${files.length} files downloaded`);
}

/**
 * Check if browser supports download attribute
 */
export function supportsDownloadAttribute(): boolean {
    const a = document.createElement('a');
    return 'download' in a;
}

/**
 * Open PDF in new tab instead of downloading
 */
export function openPDFInNewTab(blob: Blob | string): void {
    const url = typeof blob === 'string' ? blob : URL.createObjectURL(blob);
    window.open(url, '_blank');

    if (typeof blob !== 'string') {
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }
}

export default {
    downloadFile,
    downloadPDF,
    downloadPDFDocument,
    downloadAsZip,
    downloadImageFromCanvas,
    downloadText,
    downloadJSON,
    sanitizeFilename,
    addFilenameSuffix,
    changeFileExtension,
    getFilenameWithoutExtension,
    estimateDownloadTime,
    formatFileSize,
    createManagedDownloadUrl,
    downloadMultipleFiles,
    supportsDownloadAttribute,
    openPDFInNewTab,
};
