import { arrayBufferToBase64, base64ToUint8Array, toArrayBuffer } from "./base64";
import { logE2eeStep, previewCiphertext, previewIv } from "./debug";
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
    return await crypto.subtle.generateKey(FILE_KEY_ALGORITHM, true, ["encrypt", "decrypt"]);
};

export const exportFileKey = async (fileKey: CryptoKey): Promise<string> => {
    const rawKey = await crypto.subtle.exportKey("raw", fileKey);
    return arrayBufferToBase64(rawKey);
};

export const importFileKey = async (encodedKey: string): Promise<CryptoKey> => {
    return await crypto.subtle.importKey(
        "raw",
        toArrayBuffer(base64ToUint8Array(encodedKey)),
        FILE_KEY_ALGORITHM,
        true,
        ["encrypt", "decrypt"],
    );
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
    return await crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: toArrayBuffer(iv),
        },
        key,
        buffer,
    );
};

export const encryptMediaFile = async (file: File): Promise<EncryptedMediaResult> => {
    logE2eeStep("Encrypting media file", {
        filename: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
    });

    const fileKey = await generateFileKey();
    const chunkIvSeed = createIvSeed();
    const encodedSeed = arrayBufferToBase64(chunkIvSeed);

    if (file.type.startsWith("image/") && file.size <= IMAGE_SINGLE_PASS_THRESHOLD) {
        logE2eeStep("Using single-pass media encryption", {
            filename: file.name,
            thresholdBytes: IMAGE_SINGLE_PASS_THRESHOLD,
        });

        const iv = deriveChunkIv(chunkIvSeed, 0);
        const buffer = await file.arrayBuffer();
        const encryptedBuffer = await encryptBuffer(buffer, fileKey, iv);

        return {
            fileKey,
            mode: "single",
            mimeType: file.type,
            sizeBytes: file.size,
            chunkIvSeed: encodedSeed,
            encryptedBlob: new Blob([encryptedBuffer], { type: "application/octet-stream" }),
            chunks: [{
                index: 0,
                ciphertext: new Blob([encryptedBuffer], { type: "application/octet-stream" }),
            }],
        };
    }

    const chunks: EncryptedMediaChunk[] = [];
    let index = 0;

    for (let offset = 0; offset < file.size; offset += CHUNK_SIZE_BYTES) {
        const slice = file.slice(offset, offset + CHUNK_SIZE_BYTES);
        const buffer = await slice.arrayBuffer();
        const encryptedBuffer = await encryptBuffer(buffer, fileKey, deriveChunkIv(chunkIvSeed, index));

        logE2eeStep("Encrypted media chunk", {
            filename: file.name,
            chunkIndex: index,
            chunkBytes: slice.size,
            chunkCountSoFar: index + 1,
        });

        chunks.push({
            index,
            ciphertext: new Blob([encryptedBuffer], { type: "application/octet-stream" }),
        });

        index += 1;
    }

    return {
        fileKey,
        mode: "chunked",
        mimeType: file.type,
        sizeBytes: file.size,
        chunkSizeBytes: CHUNK_SIZE_BYTES,
        chunkCount: chunks.length,
        chunkIvSeed: encodedSeed,
        chunks,
    };
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
    const decryptedBuffer = await crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: toArrayBuffer(deriveChunkIvFromSeed(ivSeed, chunkIndex)),
        },
        fileKey,
        encryptedBuffer,
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

    const decryptedChunks: Blob[] = [];

    for (const [index, encryptedChunk] of encryptedChunks.entries()) {
        decryptedChunks.push(await decryptEncryptedMediaBlob(
            encryptedChunk,
            fileKey,
            ivSeed,
            index,
            mimeType,
        ));
    }

    return new Blob(decryptedChunks, { type: mimeType });
};
