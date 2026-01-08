import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

const BACKEND_URL = 'http://localhost:3001';

interface ProcessOptions {
    endpoint: string;
    file: File;
    settings?: any;
}

interface ProcessResult {
    downloadUrl: string;
    fileName: string;
}

export const usePDFProcess = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusStep, setStatusStep] = useState('');
    const [result, setResult] = useState<ProcessResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const socketRef = useRef<Socket | null>(null);

    // Initialize Socket
    useEffect(() => {
        socketRef.current = io(BACKEND_URL);

        socketRef.current.on('connect', () => {
            console.log('Connected to backend:', socketRef.current?.id);
        });

        socketRef.current.on('progress', (data: { step: string, progress: number }) => {
            setStatusStep(data.step);
            setProgress(data.progress);
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, []);

    const processFile = useCallback(async ({ endpoint, file, settings }: ProcessOptions) => {
        setIsProcessing(true);
        setProgress(0);
        setStatusStep('Uploading file...');
        setError(null);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('socketId', socketRef.current?.id || '');
            if (settings) {
                formData.append('settings', JSON.stringify(settings));
            }

            const response = await fetch(`${BACKEND_URL}${endpoint}`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.details || 'Processing failed');
            }

            const data = await response.json();

            setResult({
                downloadUrl: data.downloadUrl,
                fileName: data.fileName
            });

            setStatusStep('Complete');
            setProgress(100);
            toast.success('Conversion Successful!');

        } catch (err: any) {
            console.error(err);
            setError(err.message);
            toast.error(`Error: ${err.message}`);
        } finally {
            setIsProcessing(false);
        }
    }, []);

    const reset = useCallback(() => {
        setIsProcessing(false);
        setProgress(0);
        setStatusStep('');
        setResult(null);
        setError(null);
    }, []);

    return {
        processFile,
        isProcessing,
        progress,
        statusStep,
        result,
        error,
        reset
    };
};
