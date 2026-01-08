/**
 * PDF Memory Manager
 * Handles memory cleanup, object URL management, and resource disposal
 * for PDF processing operations
 */

class PDFMemoryManager {
    private objectUrls: Set<string> = new Set();
    private canvases: Set<HTMLCanvasElement> = new Set();
    private disposables: Set<{ dispose: () => void }> = new Set();

    /**
     * Register an object URL for tracking and cleanup
     */
    registerObjectUrl(url: string): void {
        this.objectUrls.add(url);
    }

    /**
     * Register a canvas element for tracking and cleanup
     */
    registerCanvas(canvas: HTMLCanvasElement): void {
        this.canvases.add(canvas);
    }

    /**
     * Register a disposable object (e.g., fabric.Canvas)
     */
    registerDisposable(disposable: { dispose: () => void }): void {
        this.disposables.add(disposable);
    }

    /**
     * Revoke a specific object URL
     */
    revokeObjectUrl(url: string): void {
        if (this.objectUrls.has(url)) {
            URL.revokeObjectURL(url);
            this.objectUrls.delete(url);
        }
    }

    /**
     * Clean up a specific canvas
     */
    cleanupCanvas(canvas: HTMLCanvasElement): void {
        if (this.canvases.has(canvas)) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            canvas.width = 0;
            canvas.height = 0;
            this.canvases.delete(canvas);
        }
    }

    /**
     * Dispose a specific disposable object
     */
    disposeObject(disposable: { dispose: () => void }): void {
        if (this.disposables.has(disposable)) {
            try {
                disposable.dispose();
            } catch (err) {
                console.warn('Error disposing object:', err);
            }
            this.disposables.delete(disposable);
        }
    }

    /**
     * Clean up all tracked resources
     */
    cleanup(): void {
        // Revoke all object URLs
        this.objectUrls.forEach(url => {
            try {
                URL.revokeObjectURL(url);
            } catch (err) {
                console.warn('Error revoking object URL:', err);
            }
        });
        this.objectUrls.clear();

        // Clean up all canvases
        this.canvases.forEach(canvas => {
            try {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                }
                canvas.width = 0;
                canvas.height = 0;
            } catch (err) {
                console.warn('Error cleaning up canvas:', err);
            }
        });
        this.canvases.clear();

        // Dispose all disposable objects
        this.disposables.forEach(disposable => {
            try {
                disposable.dispose();
            } catch (err) {
                console.warn('Error disposing object:', err);
            }
        });
        this.disposables.clear();
    }

    /**
     * Get current memory statistics
     */
    getStats() {
        return {
            objectUrls: this.objectUrls.size,
            canvases: this.canvases.size,
            disposables: this.disposables.size
        };
    }
}

/**
 * Utility functions for memory management
 */

/**
 * Create a managed object URL that will be automatically cleaned up
 */
export function createManagedObjectUrl(blob: Blob, manager?: PDFMemoryManager): string {
    const url = URL.createObjectURL(blob);
    if (manager) {
        manager.registerObjectUrl(url);
    }
    return url;
}

/**
 * Cleanup canvas element safely
 */
export function cleanupCanvas(canvas: HTMLCanvasElement | null): void {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    canvas.width = 0;
    canvas.height = 0;
}

/**
 * Check if browser is approaching memory limit
 */
export function isMemoryLimitApproaching(): boolean {
    if ('memory' in performance) {
        const memory = (performance as any).memory;
        if (memory && memory.jsHeapSizeLimit) {
            const usedPercentage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
            return usedPercentage > 80;
        }
    }
    return false;
}

/**
 * Estimate file size from blob
 */
export function estimateFileSize(blob: Blob): string {
    const bytes = blob.size;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

/**
 * Chunk large array buffer for processing
 */
export function* chunkArrayBuffer(buffer: ArrayBuffer, chunkSize: number = 1024 * 1024): Generator<Uint8Array> {
    const uint8Array = new Uint8Array(buffer);
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
        yield uint8Array.slice(i, i + chunkSize);
    }
}

/**
 * Hook for using PDFMemoryManager in React components
 */
export function usePDFMemoryManager() {
    const manager = new PDFMemoryManager();

    // Cleanup on unmount
    if (typeof window !== 'undefined') {
        window.addEventListener('beforeunload', () => manager.cleanup());
    }

    return {
        manager,
        cleanup: () => manager.cleanup(),
        registerObjectUrl: (url: string) => manager.registerObjectUrl(url),
        revokeObjectUrl: (url: string) => manager.revokeObjectUrl(url),
        registerCanvas: (canvas: HTMLCanvasElement) => manager.registerCanvas(canvas),
        cleanupCanvas: (canvas: HTMLCanvasElement) => manager.cleanupCanvas(canvas),
        getStats: () => manager.getStats()
    };
}

export default PDFMemoryManager;
