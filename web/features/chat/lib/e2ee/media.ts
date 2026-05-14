import { arrayBufferToBase64, base64ToUint8Array, toArrayBuffer } from "./base64";
import { workerDecryptChunkedMedia, workerDecryptSingleMedia, workerEncryptMedia } from "./crypto-worker-client";
import { logE2eeStep, measureAsync, previewCiphertext, previewIv, recordPerf } from "./debug";
import { decryptMessage, encryptMessage } from "./messages";

const FILE_KEY_ALGORITHM = {
    name: "AES-GCM",
    length: 256,
} satisfies AesKeyGenParams;

const CHUNK_SIZE_BYTES = 2 * 1024 * 1024;
const IMAGE_SINGLE_PASS_THRESHOLD = 16 * 1024 * 1024;
const IV_LENGTH = 12;

export interface EncryptedMediaChunk {
    index: number;
    ciphertext: Blob;
}

export interface EncryptedMediaResult {
    fileKey: CryptoKey;
    mode: "single" | "chunked";
    mimeType: string;
    sizeBytes: number;
    chunkSizeBytes?: number;
    chunkCount?: number;
    chunkIvSeed: string;
    encryptedBlob?: Blob;
    chunks?: EncryptedMediaChunk[];
}

const createIvSeed = (): Uint8Array => crypto.getRandomValues(new Uint8Array(IV_LENGTH));

const deriveChunkIv = (seed: Uint8Array, chunkIndex: number): Uint8Array => {
    const iv = new Uint8Array(seed);
    const view = new DataView(iv.buffer);
    view.setUint32(iv.byteLength - 4, chunkIndex, false);
    return iv;
};

export const deriveChunkIvFromSeed = (encodedSeed: string, chunkIndex: number): Uint8Array => {
    return deriveChunkIv(base64ToUint8Array(encodedSeed), chunkIndex);
};

export const generateFileKey = async (): Promise<CryptoKey> => {
    return await measureAsync("crypto.media.generate-file-key", async () => await crypto.subtle.generateKey(FILE_KEY_ALGORITHM, true, ["encrypt", "decrypt"]));
};

export const exportFileKey = async (fileKey: CryptoKey): Promise<string> => {
    const rawKey = await measureAsync("crypto.media.export-file-key", async () => await crypto.subtle.exportKey("raw", fileKey));
    return arrayBufferToBase64(rawKey);
};

export const importFileKey = async (encodedKey: string): Promise<CryptoKey> => {
    return await measureAsync("crypto.media.import-file-key", async () => await crypto.subtle.importKey(
        "raw",
        toArrayBuffer(base64ToUint8Array(encodedKey)),
        FILE_KEY_ALGORITHM,
        true,
        ["encrypt", "decrypt"],
    ));
};

export const wrapFileKeyWithThreadKey = async (
    fileKey: CryptoKey,
    threadKey: CryptoKey,
): Promise<{ wrappedFileKey: string; fileKeyIv: string }> => {
    logE2eeStep("Wrapping per-file media key");

    const exportedFileKey = await exportFileKey(fileKey);
    const encryptedPayload = await encryptMessage(exportedFileKey, threadKey);

    const wrapped = {
        wrappedFileKey: encryptedPayload.ciphertext,
        fileKeyIv: encryptedPayload.iv,
    };

    logE2eeStep("Per-file media key wrapped", {
        wrappedFileKeyPreview: previewCiphertext(wrapped.wrappedFileKey),
        fileKeyIvPreview: previewIv(wrapped.fileKeyIv),
    });

    return wrapped;
};

export const unwrapFileKeyWithThreadKey = async (
    wrappedFileKey: string,
    fileKeyIv: string,
    threadKey: CryptoKey,
): Promise<CryptoKey> => {
    const exportedFileKey = await decryptMessage({
        algorithm: "AES-GCM",
        ciphertext: wrappedFileKey,
        iv: fileKeyIv,
    }, threadKey);

    return await importFileKey(exportedFileKey);
};

const encryptBuffer = async (buffer: ArrayBuffer, key: CryptoKey, iv: Uint8Array): Promise<ArrayBuffer> => {
    return await measureAsync("crypto.media.encrypt-buffer", async () => await crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: toArrayBuffer(iv),
        },
        key,
        buffer,
    ), {
        byteLength: buffer.byteLength,
    });
};

export const encryptMediaFile = async (file: File): Promise<EncryptedMediaResult> => {
    const startedAt = performance.now();
    logE2eeStep("Encrypting media file", {
        filename: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
    });
    const fileBuffer = await measureAsync("media.file.read-array-buffer", async () => await file.arrayBuffer(), {
        fileSize: file.size,
    });
    const encrypted = await workerEncryptMedia(fileBuffer, file.type, file.size);
    const fileKey = await importFileKey(arrayBufferToBase64(encrypted.rawFileKey));

    if (encrypted.mode === "single") {
        const result: EncryptedMediaResult = {
            fileKey,
            mode: "single",
            mimeType: encrypted.mimeType,
            sizeBytes: encrypted.sizeBytes,
            chunkIvSeed: encrypted.chunkIvSeed,
            encryptedBlob: new Blob([encrypted.encryptedBuffer], { type: "application/octet-stream" }),
            chunks: [{
                index: 0,
                ciphertext: new Blob([encrypted.encryptedBuffer], { type: "application/octet-stream" }),
            }],
        };
        recordPerf("media.encrypt-file.single", performance.now() - startedAt, {
            fileSize: file.size,
        });
        return result;
    }

    const chunks: EncryptedMediaChunk[] = encrypted.encryptedBuffers.map((buffer, index) => ({
        index,
        ciphertext: new Blob([buffer], { type: "application/octet-stream" }),
    }));

    const result: EncryptedMediaResult = {
        fileKey,
        mode: "chunked",
        mimeType: encrypted.mimeType,
        sizeBytes: encrypted.sizeBytes,
        chunkSizeBytes: encrypted.chunkSizeBytes,
        chunkCount: encrypted.chunkCount,
        chunkIvSeed: encrypted.chunkIvSeed,
        chunks,
    };
    recordPerf("media.encrypt-file.chunked", performance.now() - startedAt, {
        fileSize: file.size,
        chunkCount: chunks.length,
    });
    return result;
};

export const decryptEncryptedMediaBlob = async (
    encryptedBlob: Blob,
    fileKey: CryptoKey,
    ivSeed: string,
    chunkIndex: number,
    mimeType: string,
): Promise<Blob> => {
    logE2eeStep("Decrypting media blob", {
        chunkIndex,
        mimeType,
        encryptedBytes: encryptedBlob.size,
    });

    const encryptedBuffer = await encryptedBlob.arrayBuffer();
    const rawFileKey = await crypto.subtle.exportKey("raw", fileKey);
    const { decryptedBuffer } = await workerDecryptSingleMedia(
        encryptedBuffer,
        rawFileKey,
        ivSeed,
        chunkIndex,
    );

    return new Blob([decryptedBuffer], { type: mimeType });
};

export const decryptChunkedMedia = async (
    encryptedChunks: Blob[],
    fileKey: CryptoKey,
    ivSeed: string,
    mimeType: string,
): Promise<Blob> => {
    logE2eeStep("Decrypting chunked media", {
        chunkCount: encryptedChunks.length,
        mimeType,
    });

    const rawFileKey = await crypto.subtle.exportKey("raw", fileKey);
    const encryptedBuffers = await Promise.all(encryptedChunks.map(async (chunk) => await chunk.arrayBuffer()));
    const { decryptedBuffers } = await workerDecryptChunkedMedia(encryptedBuffers, rawFileKey, ivSeed);
    return new Blob(decryptedBuffers, { type: mimeType });
};
