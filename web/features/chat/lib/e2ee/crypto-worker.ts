/// <reference lib="webworker" />

type EncryptMediaRequest = {
    type: "encrypt-media";
    requestId: string;
    fileBuffer: ArrayBuffer;
    mimeType: string;
    sizeBytes: number;
};

type EncryptMediaChunkRequest = {
    type: "encrypt-media-chunk";
    requestId: string;
    chunkBuffer: ArrayBuffer;
    rawFileKey: ArrayBuffer;
    ivSeedBase64: string;
    chunkIndex: number;
};

type DecryptSingleMediaRequest = {
    type: "decrypt-single-media";
    requestId: string;
    encryptedBuffer: ArrayBuffer;
    rawFileKey: ArrayBuffer;
    ivSeedBase64: string;
    chunkIndex: number;
};

type DecryptChunkedMediaRequest = {
    type: "decrypt-chunked-media";
    requestId: string;
    encryptedBuffers: ArrayBuffer[];
    rawFileKey: ArrayBuffer;
    ivSeedBase64: string;
};

type EncryptBackupRequest = {
    type: "encrypt-backup";
    requestId: string;
    passphrase: string;
    bundleJson: string;
    iterations: number;
};

type DecryptBackupRequest = {
    type: "decrypt-backup";
    requestId: string;
    passphrase: string;
    encryptedBlob: string;
    salt: string;
    iv: string;
    iterations: number;
};

type WorkerRequest =
    | EncryptMediaRequest
    | EncryptMediaChunkRequest
    | DecryptSingleMediaRequest
    | DecryptChunkedMediaRequest
    | EncryptBackupRequest
    | DecryptBackupRequest;

type WorkerSuccess =
    | {
        requestId: string;
        ok: true;
        type: "encrypt-media";
        result:
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
    }
    | {
        requestId: string;
        ok: true;
        type: "encrypt-media-chunk";
        result: { encryptedBuffer: ArrayBuffer };
    }
    | {
        requestId: string;
        ok: true;
        type: "decrypt-single-media";
        result: { decryptedBuffer: ArrayBuffer };
    }
    | {
        requestId: string;
        ok: true;
        type: "decrypt-chunked-media";
        result: { decryptedBuffers: ArrayBuffer[] };
    }
    | {
        requestId: string;
        ok: true;
        type: "encrypt-backup";
        result: {
            encryptedBlob: string;
            salt: string;
            iv: string;
        };
    }
    | {
        requestId: string;
        ok: true;
        type: "decrypt-backup";
        result: { bundleJson: string };
    };

type WorkerFailure = {
    requestId: string;
    ok: false;
    error: string;
};

const FILE_KEY_ALGORITHM = {
    name: "AES-GCM",
    length: 256,
} satisfies AesKeyGenParams;

const PBKDF2_HASH = "SHA-256";
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const CHUNK_SIZE_BYTES = 2 * 1024 * 1024;
const IMAGE_SINGLE_PASS_THRESHOLD = 16 * 1024 * 1024;

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000;
    const chunks: string[] = [];

    for (let index = 0; index < bytes.length; index += chunkSize) {
        chunks.push(String.fromCharCode(...bytes.subarray(index, index + chunkSize)));
    }

    return btoa(chunks.join(""));
};

const toArrayBuffer = (value: ArrayBuffer | ArrayBufferLike | Uint8Array): ArrayBuffer => {
    if (value instanceof Uint8Array) {
        return value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength) as ArrayBuffer;
    }

    if (value instanceof ArrayBuffer) {
        return value;
    }

    return new Uint8Array(value).slice().buffer;
};

const base64ToUint8Array = (value: string): Uint8Array => {
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
    }

    return bytes;
};

const createRandomBytes = (length: number): Uint8Array => crypto.getRandomValues(new Uint8Array(length));

const createIvSeed = (): Uint8Array => createRandomBytes(IV_LENGTH);

const deriveChunkIv = (seed: Uint8Array, chunkIndex: number): Uint8Array => {
    const iv = new Uint8Array(seed);
    const view = new DataView(iv.buffer);
    view.setUint32(iv.byteLength - 4, chunkIndex, false);
    return iv;
};

const importRawAesKey = async (rawKey: ArrayBuffer): Promise<CryptoKey> => {
    return await crypto.subtle.importKey("raw", toArrayBuffer(rawKey), FILE_KEY_ALGORITHM, false, ["encrypt", "decrypt"]);
};

const deriveBackupKey = async (
    passphrase: string,
    salt: Uint8Array,
    iterations: number,
): Promise<CryptoKey> => {
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(passphrase),
        "PBKDF2",
        false,
        ["deriveKey"],
    );

    return await crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: toArrayBuffer(salt),
            iterations,
            hash: PBKDF2_HASH,
        },
        keyMaterial,
        FILE_KEY_ALGORITHM,
        false,
        ["encrypt", "decrypt"],
    );
};

const encryptMedia = async (request: EncryptMediaRequest): Promise<WorkerSuccess> => {
    const fileKey = await crypto.subtle.generateKey(FILE_KEY_ALGORITHM, true, ["encrypt", "decrypt"]);
    const rawFileKey = await crypto.subtle.exportKey("raw", fileKey);
    const chunkIvSeed = createIvSeed();
    const chunkIvSeedBase64 = arrayBufferToBase64(toArrayBuffer(chunkIvSeed));

    if (request.mimeType.startsWith("image/") && request.sizeBytes <= IMAGE_SINGLE_PASS_THRESHOLD) {
        const encryptedBuffer = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv: toArrayBuffer(deriveChunkIv(chunkIvSeed, 0)) },
            fileKey,
            toArrayBuffer(request.fileBuffer),
        );

        return {
            requestId: request.requestId,
            ok: true,
            type: "encrypt-media",
            result: {
                mode: "single",
                mimeType: request.mimeType,
                sizeBytes: request.sizeBytes,
                chunkIvSeed: chunkIvSeedBase64,
                rawFileKey,
                encryptedBuffer,
            },
        };
    }

    const encryptedBuffers: ArrayBuffer[] = [];
    for (let offset = 0, chunkIndex = 0; offset < request.sizeBytes; offset += CHUNK_SIZE_BYTES, chunkIndex += 1) {
        const chunk = request.fileBuffer.slice(offset, Math.min(offset + CHUNK_SIZE_BYTES, request.sizeBytes));
        const encryptedBuffer = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv: toArrayBuffer(deriveChunkIv(chunkIvSeed, chunkIndex)) },
            fileKey,
            toArrayBuffer(chunk),
        );

        encryptedBuffers.push(encryptedBuffer);
    }

    return {
        requestId: request.requestId,
        ok: true,
        type: "encrypt-media",
        result: {
            mode: "chunked",
            mimeType: request.mimeType,
            sizeBytes: request.sizeBytes,
            chunkSizeBytes: CHUNK_SIZE_BYTES,
            chunkCount: encryptedBuffers.length,
            chunkIvSeed: chunkIvSeedBase64,
            rawFileKey,
            encryptedBuffers,
        },
    };
};

const decryptSingleMedia = async (request: DecryptSingleMediaRequest): Promise<WorkerSuccess> => {
    const fileKey = await importRawAesKey(request.rawFileKey);
    const seed = base64ToUint8Array(request.ivSeedBase64);
    const decryptedBuffer = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: toArrayBuffer(deriveChunkIv(seed, request.chunkIndex)) },
        fileKey,
        toArrayBuffer(request.encryptedBuffer),
    );

    return {
        requestId: request.requestId,
        ok: true,
        type: "decrypt-single-media",
        result: { decryptedBuffer },
    };
};

const encryptMediaChunk = async (request: EncryptMediaChunkRequest): Promise<WorkerSuccess> => {
    const fileKey = await importRawAesKey(request.rawFileKey);
    const seed = base64ToUint8Array(request.ivSeedBase64);
    const encryptedBuffer = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: toArrayBuffer(deriveChunkIv(seed, request.chunkIndex)) },
        fileKey,
        toArrayBuffer(request.chunkBuffer),
    );

    return {
        requestId: request.requestId,
        ok: true,
        type: "encrypt-media-chunk",
        result: { encryptedBuffer },
    };
};

const decryptChunkedMedia = async (request: DecryptChunkedMediaRequest): Promise<WorkerSuccess> => {
    const fileKey = await importRawAesKey(request.rawFileKey);
    const seed = base64ToUint8Array(request.ivSeedBase64);
    const decryptedBuffers: ArrayBuffer[] = [];

    for (const [index, encryptedBuffer] of request.encryptedBuffers.entries()) {
        const decryptedBuffer = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv: toArrayBuffer(deriveChunkIv(seed, index)) },
            fileKey,
            toArrayBuffer(encryptedBuffer),
        );
        decryptedBuffers.push(decryptedBuffer);
    }

    return {
        requestId: request.requestId,
        ok: true,
        type: "decrypt-chunked-media",
        result: { decryptedBuffers },
    };
};

const encryptBackup = async (request: EncryptBackupRequest): Promise<WorkerSuccess> => {
    const salt = createRandomBytes(SALT_LENGTH);
    const iv = createRandomBytes(IV_LENGTH);
    const backupKey = await deriveBackupKey(request.passphrase, salt, request.iterations);
    const encryptedBuffer = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: toArrayBuffer(iv) },
        backupKey,
        toArrayBuffer(new TextEncoder().encode(request.bundleJson)),
    );

    return {
        requestId: request.requestId,
        ok: true,
        type: "encrypt-backup",
        result: {
            encryptedBlob: arrayBufferToBase64(toArrayBuffer(encryptedBuffer)),
            salt: arrayBufferToBase64(toArrayBuffer(salt)),
            iv: arrayBufferToBase64(toArrayBuffer(iv)),
        },
    };
};

const decryptBackup = async (request: DecryptBackupRequest): Promise<WorkerSuccess> => {
    const backupKey = await deriveBackupKey(
        request.passphrase,
        base64ToUint8Array(request.salt),
        request.iterations,
    );

    const decryptedBuffer = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: toArrayBuffer(base64ToUint8Array(request.iv)) },
        backupKey,
        toArrayBuffer(base64ToUint8Array(request.encryptedBlob)),
    );

    return {
        requestId: request.requestId,
        ok: true,
        type: "decrypt-backup",
        result: {
            bundleJson: new TextDecoder().decode(decryptedBuffer),
        },
    };
};

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
    const request = event.data;

    try {
        let response: WorkerSuccess;

        switch (request.type) {
            case "encrypt-media":
                response = await encryptMedia(request);
                break;
            case "decrypt-single-media":
                response = await decryptSingleMedia(request);
                break;
            case "encrypt-media-chunk":
                response = await encryptMediaChunk(request);
                break;
            case "decrypt-chunked-media":
                response = await decryptChunkedMedia(request);
                break;
            case "encrypt-backup":
                response = await encryptBackup(request);
                break;
            case "decrypt-backup":
                response = await decryptBackup(request);
                break;
            default:
                throw new Error("UNKNOWN_WORKER_REQUEST");
        }

        const transferables: Transferable[] = [];
        if (response.type === "encrypt-media") {
            transferables.push(response.result.rawFileKey);
            if (response.result.mode === "single") {
                transferables.push(response.result.encryptedBuffer);
            } else {
                transferables.push(...response.result.encryptedBuffers);
            }
        } else if (response.type === "encrypt-media-chunk") {
            transferables.push(response.result.encryptedBuffer);
        } else if (response.type === "decrypt-single-media") {
            transferables.push(response.result.decryptedBuffer);
        } else if (response.type === "decrypt-chunked-media") {
            transferables.push(...response.result.decryptedBuffers);
        }

        self.postMessage(response, transferables);
    } catch (error) {
        const failure: WorkerFailure = {
            requestId: request.requestId,
            ok: false,
            error: error instanceof Error ? error.message : "CRYPTO_WORKER_ERROR",
        };
        self.postMessage(failure);
    }
};

export {};
