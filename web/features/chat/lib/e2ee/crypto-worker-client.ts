"use client";

import { measureAsync } from "./debug";

type EncryptMediaResponse =
    | {
        mode: "single";
        mimeType: string;
        sizeBytes: number;
        chunkIvSeed: string;
        rawFileKey: ArrayBuffer;
        encryptedBuffer: ArrayBuffer;
    }
    | {
        mode: "chunked";
        mimeType: string;
        sizeBytes: number;
        chunkSizeBytes: number;
        chunkCount: number;
        chunkIvSeed: string;
        rawFileKey: ArrayBuffer;
        encryptedBuffers: ArrayBuffer[];
    };

type DecryptSingleMediaResponse = { decryptedBuffer: ArrayBuffer };
type DecryptChunkedMediaResponse = { decryptedBuffers: ArrayBuffer[] };
type EncryptBackupResponse = { encryptedBlob: string; salt: string; iv: string };
type DecryptBackupResponse = { bundleJson: string };
type EncryptMediaChunkResponse = { encryptedBuffer: ArrayBuffer };

type WorkerResponseMap = {
    "encrypt-media": EncryptMediaResponse;
    "encrypt-media-chunk": EncryptMediaChunkResponse;
    "decrypt-single-media": DecryptSingleMediaResponse;
    "decrypt-chunked-media": DecryptChunkedMediaResponse;
    "encrypt-backup": EncryptBackupResponse;
    "decrypt-backup": DecryptBackupResponse;
};

type WorkerRequestMap = {
    "encrypt-media": {
        fileBuffer: ArrayBuffer;
        mimeType: string;
        sizeBytes: number;
    };
    "encrypt-media-chunk": {
        chunkBuffer: ArrayBuffer;
        rawFileKey: ArrayBuffer;
        ivSeedBase64: string;
        chunkIndex: number;
    };
    "decrypt-single-media": {
        encryptedBuffer: ArrayBuffer;
        rawFileKey: ArrayBuffer;
        ivSeedBase64: string;
        chunkIndex: number;
    };
    "decrypt-chunked-media": {
        encryptedBuffers: ArrayBuffer[];
        rawFileKey: ArrayBuffer;
        ivSeedBase64: string;
    };
    "encrypt-backup": {
        passphrase: string;
        bundleJson: string;
        iterations: number;
    };
    "decrypt-backup": {
        passphrase: string;
        encryptedBlob: string;
        salt: string;
        iv: string;
        iterations: number;
    };
};

type WorkerSuccess<TKey extends keyof WorkerResponseMap> = {
    requestId: string;
    ok: true;
    type: TKey;
    result: WorkerResponseMap[TKey];
};

type WorkerFailure = {
    requestId: string;
    ok: false;
    error: string;
};

let workerInstance: Worker | null = null;

const getWorker = (): Worker => {
    if (!workerInstance) {
        workerInstance = new Worker(new URL("./crypto-worker.ts", import.meta.url), { type: "module" });
    }

    return workerInstance;
};

const makeRequestId = (): string => {
    return typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;
};

const getTransferables = (payload: object): Transferable[] => {
    const transferables: Transferable[] = [];

    for (const value of Object.values(payload)) {
        if (value instanceof ArrayBuffer) {
            transferables.push(value);
            continue;
        }

        if (Array.isArray(value)) {
            for (const entry of value) {
                if (entry instanceof ArrayBuffer) {
                    transferables.push(entry);
                }
            }
        }
    }

    return transferables;
};

const callWorker = async <TKey extends keyof WorkerResponseMap>(
    type: TKey,
    payload: WorkerRequestMap[TKey],
): Promise<WorkerResponseMap[TKey]> => {
    const worker = getWorker();
    const requestId = makeRequestId();

    return await measureAsync(`worker.${type}.roundtrip`, async () => await new Promise((resolve, reject) => {
        const handleMessage = (event: MessageEvent<WorkerSuccess<TKey> | WorkerFailure>) => {
            const response = event.data;

            if (response.requestId !== requestId) {
                return;
            }

            worker.removeEventListener("message", handleMessage);
            worker.removeEventListener("error", handleError);

            if (!response.ok) {
                reject(new Error(response.error));
                return;
            }

            resolve(response.result);
        };

        const handleError = (error: ErrorEvent) => {
            worker.removeEventListener("message", handleMessage);
            worker.removeEventListener("error", handleError);
            reject(error.error ?? new Error(error.message));
        };

        worker.addEventListener("message", handleMessage);
        worker.addEventListener("error", handleError);

        worker.postMessage(
            {
                type,
                requestId,
                ...payload,
            },
            getTransferables(payload),
        );
    }));
};

export const workerEncryptMedia = async (fileBuffer: ArrayBuffer, mimeType: string, sizeBytes: number): Promise<EncryptMediaResponse> => {
    return await callWorker("encrypt-media", {
        fileBuffer,
        mimeType,
        sizeBytes,
    });
};

export const workerDecryptSingleMedia = async (
    encryptedBuffer: ArrayBuffer,
    rawFileKey: ArrayBuffer,
    ivSeedBase64: string,
    chunkIndex: number,
): Promise<DecryptSingleMediaResponse> => {
    return await callWorker("decrypt-single-media", {
        encryptedBuffer,
        rawFileKey,
        ivSeedBase64,
        chunkIndex,
    });
};

export const workerEncryptMediaChunk = async (
    chunkBuffer: ArrayBuffer,
    rawFileKey: ArrayBuffer,
    ivSeedBase64: string,
    chunkIndex: number,
): Promise<EncryptMediaChunkResponse> => {
    return await callWorker("encrypt-media-chunk", {
        chunkBuffer,
        rawFileKey,
        ivSeedBase64,
        chunkIndex,
    });
};

export const workerDecryptChunkedMedia = async (
    encryptedBuffers: ArrayBuffer[],
    rawFileKey: ArrayBuffer,
    ivSeedBase64: string,
): Promise<DecryptChunkedMediaResponse> => {
    return await callWorker("decrypt-chunked-media", {
        encryptedBuffers,
        rawFileKey,
        ivSeedBase64,
    });
};

export const workerEncryptBackup = async (
    passphrase: string,
    bundleJson: string,
    iterations: number,
): Promise<EncryptBackupResponse> => {
    return await callWorker("encrypt-backup", {
        passphrase,
        bundleJson,
        iterations,
    });
};

export const workerDecryptBackup = async (
    passphrase: string,
    encryptedBlob: string,
    salt: string,
    iv: string,
    iterations: number,
): Promise<DecryptBackupResponse> => {
    return await callWorker("decrypt-backup", {
        passphrase,
        encryptedBlob,
        salt,
        iv,
        iterations,
    });
};
