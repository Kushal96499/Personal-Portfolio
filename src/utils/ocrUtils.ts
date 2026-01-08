import Tesseract from 'tesseract.js';

let worker: Tesseract.Worker | null = null;
let workerPromise: Promise<Tesseract.Worker> | null = null;

export const initOCRWorker = (language: string = 'eng') => {
    if (worker) return Promise.resolve(worker);
    if (workerPromise) return workerPromise;

    workerPromise = (async () => {
        const w = await Tesseract.createWorker(language, 1, {
            workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@v5.0.0/dist/worker.min.js',
            corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@v5.0.0/tesseract-core.wasm.js',
            logger: m => console.log(m)
        });
        worker = w;
        return w;
    })();

    return workerPromise;
};

export const getOCRWorker = async (language: string = 'eng') => {
    if (!worker) {
        return initOCRWorker(language);
    }
    return worker;
};

export const terminateOCRWorker = async () => {
    if (worker) {
        await worker.terminate();
        worker = null;
        workerPromise = null;
    }
};
