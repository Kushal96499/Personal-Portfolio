/**
 * PDF Error Handler
 * Standardized error types, messages, and handling for PDF operations
 */

export enum PDFErrorType {
    CORRUPT_FILE = 'CORRUPT_FILE',
    PASSWORD_PROTECTED = 'PASSWORD_PROTECTED',
    INVALID_FORMAT = 'INVALID_FORMAT',
    FILE_TOO_LARGE = 'FILE_TOO_LARGE',
    PROCESSING_FAILED = 'PROCESSING_FAILED',
    EXPORT_FAILED = 'EXPORT_FAILED',
    MEMORY_ERROR = 'MEMORY_ERROR',
    NETWORK_ERROR = 'NETWORK_ERROR',
    UNSUPPORTED_FEATURE = 'UNSUPPORTED_FEATURE',
    PERMISSION_DENIED = 'PERMISSION_DENIED',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface PDFError {
    type: PDFErrorType;
    message: string;
    userMessage: string;
    technicalDetails?: string;
    recovery?: string[];
    originalError?: any;
}

/**
 * Create a standardized PDF error object
 */
export function createPDFError(
    type: PDFErrorType,
    message: string,
    technicalDetails?: string,
    originalError?: any
): PDFError {
    const errorDefinitions: Record<PDFErrorType, { userMessage: string; recovery: string[] }> = {
        [PDFErrorType.CORRUPT_FILE]: {
            userMessage: 'This PDF file appears to be corrupted or damaged.',
            recovery: [
                'Try opening the file in another PDF reader to verify',
                'Use the "Repair PDF" tool to attempt recovery',
                'Request a fresh copy of the file if possible'
            ]
        },
        [PDFErrorType.PASSWORD_PROTECTED]: {
            userMessage: 'This PDF is password-protected and cannot be processed.',
            recovery: [
                'Use the "Unlock PDF" tool with the correct password',
                'Contact the document owner for the password',
                'Request an unlocked version of the file'
            ]
        },
        [PDFErrorType.INVALID_FORMAT]: {
            userMessage: 'This file is not a valid PDF or is in an unsupported format.',
            recovery: [
                'Verify the file has a .pdf extension',
                'Try opening the file to ensure it\'s a valid PDF',
                'Convert the file to PDF format if needed'
            ]
        },
        [PDFErrorType.FILE_TOO_LARGE]: {
            userMessage: 'This file is too large to process in your browser.',
            recovery: [
                'Try splitting the PDF into smaller files first',
                'Use the "Compress PDF" tool to reduce file size',
                'Consider processing on a device with more memory'
            ]
        },
        [PDFErrorType.PROCESSING_FAILED]: {
            userMessage: 'An error occurred while processing your PDF.',
            recovery: [
                'Try again - temporary issues sometimes resolve',
                'Check if the PDF has any unusual features',
                'Try with a different PDF to verify functionality'
            ]
        },
        [PDFErrorType.EXPORT_FAILED]: {
            userMessage: 'Failed to export or save the processed PDF.',
            recovery: [
                'Ensure you have enough disk space',
                'Check browser permissions for file downloads',
                'Try processing the file again'
            ]
        },
        [PDFErrorType.MEMORY_ERROR]: {
            userMessage: 'Insufficient memory to complete this operation.',
            recovery: [
                'Close other browser tabs to free up memory',
                'Try with a smaller PDF file',
                'Restart your browser and try again'
            ]
        },
        [PDFErrorType.NETWORK_ERROR]: {
            userMessage: 'A network error occurred.',
            recovery: [
                'Check your internet connection',
                'Try again in a moment',
                'Ensure you\'re not using a VPN that blocks resources'
            ]
        },
        [PDFErrorType.UNSUPPORTED_FEATURE]: {
            userMessage: 'This PDF contains features that are not yet supported.',
            recovery: [
                'Try converting to a standard PDF format',
                'Contact support with details about the PDF',
                'Try a different tool for this operation'
            ]
        },
        [PDFErrorType.PERMISSION_DENIED]: {
            userMessage: 'Permission denied to access this feature.',
            recovery: [
                'Check browser permissions',
                'Ensure you have rights to modify this PDF',
                'Try unlocking the PDF first if it\'s protected'
            ]
        },
        [PDFErrorType.UNKNOWN_ERROR]: {
            userMessage: 'An unexpected error occurred.',
            recovery: [
                'Try refreshing the page',
                'Check the browser console for details',
                'Try with a different file to isolate the issue'
            ]
        }
    };

    const definition = errorDefinitions[type];

    return {
        type,
        message,
        userMessage: definition.userMessage,
        technicalDetails,
        recovery: definition.recovery,
        originalError
    };
}

/**
 * Detect PDF error type from error object or message
 */
export function detectPDFErrorType(error: any): PDFErrorType {
    const errorMessage = error?.message?.toLowerCase() || String(error).toLowerCase();

    if (errorMessage.includes('password') || errorMessage.includes('encrypted')) {
        return PDFErrorType.PASSWORD_PROTECTED;
    }
    if (errorMessage.includes('corrupt') || errorMessage.includes('invalid pdf')) {
        return PDFErrorType.CORRUPT_FILE;
    }
    if (errorMessage.includes('memory') || errorMessage.includes('heap')) {
        return PDFErrorType.MEMORY_ERROR;
    }
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        return PDFErrorType.NETWORK_ERROR;
    }
    if (errorMessage.includes('too large') || errorMessage.includes('size limit')) {
        return PDFErrorType.FILE_TOO_LARGE;
    }
    if (errorMessage.includes('permission') || errorMessage.includes('denied')) {
        return PDFErrorType.PERMISSION_DENIED;
    }
    if (errorMessage.includes('unsupported') || errorMessage.includes('not implemented')) {
        return PDFErrorType.UNSUPPORTED_FEATURE;
    }

    return PDFErrorType.UNKNOWN_ERROR;
}

/**
 * Handle PDF error and return standardized error object
 */
export function handlePDFError(error: any, context?: string): PDFError {
    console.error(`PDF Error${context ? ` in ${context}` : ''}:`, error);

    const type = detectPDFErrorType(error);
    const message = error?.message || String(error);
    const technicalDetails = context
        ? `${context}: ${message}${error?.stack ? `\n${error.stack}` : ''}`
        : message;

    return createPDFError(type, message, technicalDetails, error);
}

/**
 * Validate PDF file before processing
 */
export async function validatePDFFile(file: File): Promise<{ valid: boolean; error?: PDFError }> {
    // Check file type
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        return {
            valid: false,
            error: createPDFError(
                PDFErrorType.INVALID_FORMAT,
                'File is not a PDF',
                `File type: ${file.type}, name: ${file.name}`
            )
        };
    }

    // Check file size (100MB limit for browser processing)
    const MAX_SIZE = 100 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
        return {
            valid: false,
            error: createPDFError(
                PDFErrorType.FILE_TOO_LARGE,
                'File exceeds size limit',
                `File size: ${(file.size / 1024 / 1024).toFixed(2)} MB (max: 100 MB)`
            )
        };
    }

    // Check file header for PDF signature
    try {
        const headerBuffer = await file.slice(0, 5).arrayBuffer();
        const headerBytes = new Uint8Array(headerBuffer);
        const pdfSignature = '%PDF-';
        const headerString = String.fromCharCode(...headerBytes);

        if (!headerString.startsWith(pdfSignature)) {
            return {
                valid: false,
                error: createPDFError(
                    PDFErrorType.INVALID_FORMAT,
                    'File does not have valid PDF signature',
                    `Header: ${headerString}`
                )
            };
        }
    } catch (err) {
        return {
            valid: false,
            error: createPDFError(
                PDFErrorType.PROCESSING_FAILED,
                'Failed to validate file',
                String(err),
                err
            )
        };
    }

    return { valid: true };
}

/**
 * Format error for user display
 */
export function formatErrorForDisplay(error: PDFError): {
    title: string;
    message: string;
    details?: string;
    actions: string[];
} {
    return {
        title: getErrorTitle(error.type),
        message: error.userMessage,
        details: error.technicalDetails,
        actions: error.recovery || []
    };
}

/**
 * Get user-friendly error title
 */
function getErrorTitle(type: PDFErrorType): string {
    const titles: Record<PDFErrorType, string> = {
        [PDFErrorType.CORRUPT_FILE]: 'Corrupted File',
        [PDFErrorType.PASSWORD_PROTECTED]: 'Password Protected',
        [PDFErrorType.INVALID_FORMAT]: 'Invalid File Format',
        [PDFErrorType.FILE_TOO_LARGE]: 'File Too Large',
        [PDFErrorType.PROCESSING_FAILED]: 'Processing Failed',
        [PDFErrorType.EXPORT_FAILED]: 'Export Failed',
        [PDFErrorType.MEMORY_ERROR]: 'Memory Error',
        [PDFErrorType.NETWORK_ERROR]: 'Network Error',
        [PDFErrorType.UNSUPPORTED_FEATURE]: 'Unsupported Feature',
        [PDFErrorType.PERMISSION_DENIED]: 'Permission Denied',
        [PDFErrorType.UNKNOWN_ERROR]: 'Unexpected Error'
    };
    return titles[type];
}

/**
 * Log error to console with context
 */
export function logPDFError(error: PDFError, context?: string): void {
    const prefix = context ? `[${context}]` : '[PDF Error]';
    console.group(`${prefix} ${error.type}`);
    console.error('User Message:', error.userMessage);
    console.error('Technical Details:', error.technicalDetails);
    if (error.originalError) {
        console.error('Original Error:', error.originalError);
    }
    if (error.recovery) {
        console.info('Recovery Options:', error.recovery);
    }
    console.groupEnd();
}

export default {
    createPDFError,
    detectPDFErrorType,
    handlePDFError,
    validatePDFFile,
    formatErrorForDisplay,
    logPDFError,
    PDFErrorType
};
