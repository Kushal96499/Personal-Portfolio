import * as pdfjsLib from 'pdfjs-dist';

// Initialize PDF.js worker
// Using jsdelivr CDN which is allowed by the Content Security Policy
export const initPDFWorker = (force = false) => {
    if (force || !pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
    }
};
