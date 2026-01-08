import { PDFDocument, degrees, rgb } from 'pdf-lib';

/**
 * Helper to process items in chunks to avoid blocking the main thread.
 * @param items Array of items to process
 * @param processFn Function to process a single item or a chunk of items
 * @param chunkSize Number of items to process in one go
 * @param onProgress Callback for progress updates (0-100)
 */
export const processInChunks = async <T>(
    items: T[],
    processFn: (item: T, index: number) => Promise<void>,
    chunkSize: number = 5,
    onProgress?: (progress: number) => void
) => {
    for (let i = 0; i < items.length; i += chunkSize) {
        const chunk = items.slice(i, i + chunkSize);
        await Promise.all(chunk.map((item, idx) => processFn(item, i + idx)));

        // Yield to main thread
        await new Promise(resolve => setTimeout(resolve, 0));

        if (onProgress) {
            onProgress(Math.min(100, Math.round(((i + chunk.length) / items.length) * 100)));
        }
    }
};

/**
 * Merges multiple PDF ArrayBuffers into a single PDFDocument.
 * Uses chunking to prevent UI freezing.
 */
export const mergePDFs = async (
    pdfBuffers: ArrayBuffer[],
    onProgress?: (progress: number) => void,
    options?: {
        preserveMetadata?: boolean;
        title?: string;
        author?: string;
    }
): Promise<Uint8Array> => {
    const mergedPdf = await PDFDocument.create();

    let processedCount = 0;
    const total = pdfBuffers.length;

    // Copy metadata from first PDF if preserveMetadata is true
    if (options?.preserveMetadata && pdfBuffers.length > 0) {
        try {
            const firstPdf = await PDFDocument.load(pdfBuffers[0]);
            const title = options.title || firstPdf.getTitle();
            const author = options.author || firstPdf.getAuthor();

            if (title) mergedPdf.setTitle(title);
            if (author) mergedPdf.setAuthor(author);
        } catch (err) {
            console.warn('Failed to copy metadata:', err);
        }
    }

    // Process PDFs
    for (const buffer of pdfBuffers) {
        // Clone buffer to prevent detachment
        const pdf = await PDFDocument.load(buffer.slice(0));
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));

        processedCount++;
        if (onProgress) onProgress(Math.round((processedCount / total) * 100));

        await new Promise(resolve => setTimeout(resolve, 0));
    }

    return await mergedPdf.save();
};

/**
 * Extract specific pages from a PDF
 */
export const extractPages = async (
    pdfBuffer: ArrayBuffer,
    pageIndices: number[],
    onProgress?: (progress: number) => void
): Promise<Uint8Array> => {
    // Clone buffer
    const sourcePdf = await PDFDocument.load(pdfBuffer.slice(0));
    const newPdf = await PDFDocument.create();

    for (let i = 0; i < pageIndices.length; i++) {
        const pageIndex = pageIndices[i];
        const [copiedPage] = await newPdf.copyPages(sourcePdf, [pageIndex]);
        newPdf.addPage(copiedPage);

        if (onProgress) {
            onProgress(Math.round(((i + 1) / pageIndices.length) * 100));
        }
    }

    return await newPdf.save();
};

/**
 * Remove specific pages from a PDF
 */
export const removePages = async (
    pdfBuffer: ArrayBuffer,
    pageIndicesToRemove: number[],
    onProgress?: (progress: number) => void
): Promise<Uint8Array> => {
    // Clone buffer
    const sourcePdf = await PDFDocument.load(pdfBuffer.slice(0));
    const totalPages = sourcePdf.getPageCount();

    const pagesToKeep = Array.from({ length: totalPages }, (_, i) => i)
        .filter(i => !pageIndicesToRemove.includes(i));

    return extractPages(pdfBuffer, pagesToKeep, onProgress);
};

/**
 * Rotate pages in a PDF
 */
export const rotatePages = async (
    pdfBuffer: ArrayBuffer,
    rotations: Array<{ pageIndex: number; degrees: number }>,
    onProgress?: (progress: number) => void
): Promise<Uint8Array> => {
    // Clone buffer
    const pdfDoc = await PDFDocument.load(pdfBuffer.slice(0));

    rotations.forEach(({ pageIndex, degrees: deg }, idx) => {
        if (pageIndex >= 0 && pageIndex < pdfDoc.getPageCount()) {
            const page = pdfDoc.getPage(pageIndex);
            const currentRotation = page.getRotation().angle;
            page.setRotation(degrees(currentRotation + deg));
        }

        if (onProgress) {
            onProgress(Math.round(((idx + 1) / rotations.length) * 100));
        }
    });

    return await pdfDoc.save();
};

/**
 * Rotate all pages in a PDF
 */
export const rotateAllPages = async (
    pdfBuffer: ArrayBuffer,
    rotationDegrees: number,
    onProgress?: (progress: number) => void
): Promise<Uint8Array> => {
    // Clone buffer
    const pdfDoc = await PDFDocument.load(pdfBuffer.slice(0));
    const pageCount = pdfDoc.getPageCount();

    const rotations = Array.from({ length: pageCount }, (_, i) => ({
        pageIndex: i,
        degrees: rotationDegrees
    }));

    return rotatePages(pdfBuffer, rotations, onProgress);
};

/**
 * Add page numbers to PDF
 */
export const addPageNumbers = async (
    pdfBuffer: ArrayBuffer,
    options: {
        position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
        fontSize?: number;
        color?: { r: number; g: number; b: number };
        startPage?: number;
        format?: (pageNum: number, totalPages: number) => string;
        margin?: number;
    },
    onProgress?: (progress: number) => void
): Promise<Uint8Array> => {
    // Clone buffer
    const pdfDoc = await PDFDocument.load(pdfBuffer.slice(0));
    const pages = pdfDoc.getPages();
    const totalPages = pages.length;

    const {
        position = 'bottom-center',
        fontSize = 12,
        color = { r: 0, g: 0, b: 0 },
        startPage = 0,
        format = (num, total) => `${num} / ${total}`,
        margin = 20
    } = options;

    for (let i = startPage; i < pages.length; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();
        const pageNumber = i + 1;
        const text = format(pageNumber, totalPages);

        let x = margin;
        let y = margin;

        switch (position) {
            case 'top-left':
                x = margin;
                y = height - margin;
                break;
            case 'top-center':
                x = width / 2;
                y = height - margin;
                break;
            case 'top-right':
                x = width - margin;
                y = height - margin;
                break;
            case 'bottom-left':
                x = margin;
                y = margin;
                break;
            case 'bottom-center':
                x = width / 2;
                y = margin;
                break;
            case 'bottom-right':
                x = width - margin;
                y = margin;
                break;
        }

        page.drawText(text, {
            x,
            y,
            size: fontSize,
            color: rgb(color.r, color.g, color.b),
        });

        if (onProgress) {
            onProgress(Math.round(((i - startPage + 1) / (pages.length - startPage)) * 100));
        }
    }

    return await pdfDoc.save();
};

/**
 * Get PDF metadata
 */
export const getPDFMetadata = async (pdfBuffer: ArrayBuffer) => {
    // Clone buffer
    const pdfDoc = await PDFDocument.load(pdfBuffer.slice(0));

    return {
        pageCount: pdfDoc.getPageCount(),
        title: pdfDoc.getTitle(),
        author: pdfDoc.getAuthor(),
        subject: pdfDoc.getSubject(),
        keywords: pdfDoc.getKeywords(),
        creator: pdfDoc.getCreator(),
        producer: pdfDoc.getProducer(),
        creationDate: pdfDoc.getCreationDate(),
        modificationDate: pdfDoc.getModificationDate(),
    };
};

/**
 * Attempt to repair a corrupted PDF
 */
export const repairPDF = async (
    pdfBuffer: ArrayBuffer,
    onProgress?: (progress: number) => void
): Promise<{ success: boolean; pdfBytes?: Uint8Array; error?: string }> => {
    try {
        if (onProgress) onProgress(25);

        // Clone buffer
        const pdfDoc = await PDFDocument.load(pdfBuffer.slice(0), {
            ignoreEncryption: true,
            updateMetadata: false,
        });

        if (onProgress) onProgress(50);

        const repairedBytes = await pdfDoc.save({
            useObjectStreams: true,
        });

        if (onProgress) onProgress(100);

        return { success: true, pdfBytes: repairedBytes };
    } catch (err: any) {
        return {
            success: false,
            error: err.message || 'Failed to repair PDF'
        };
    }
};
