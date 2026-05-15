import { createClient } from "@/supabase/client";
import type { EncryptedMediaMetadata } from "@chat/shared";
import { logE2eeStep, measureAsync, recordPerf } from "./debug";
import { CHUNK_SIZE_BYTES, IMAGE_SINGLE_PASS_THRESHOLD, createEncodedChunkIvSeed, encryptMediaFile, wrapFileKeyWithThreadKey } from "./media";
import type { SupabaseClient } from "@supabase/supabase-js";
import { workerEncryptMediaChunk } from "./crypto-worker-client";

interface UploadEncryptedMediaParams {
    file: File;
    senderDeviceId: string;
    keyVersion: number;
    threadKey: CryptoKey;
    onProgress?: (progress: number) => void;
}

interface MediaInitResponse {
    mediaId: string;
    storagePath: string;
    bucket: string;
}

interface MediaInitPayload extends Omit<EncryptedMediaMetadata, "mediaId" | "storagePath"> {
    senderDeviceId: string;
    keyVersion: number;
}

const initializeMedia = async (
    metadata: MediaInitPayload,
): Promise<MediaInitResponse> => {
    const response = await measureAsync("network.media.init", async () => await fetch("/api/e2ee/media/init", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(metadata),
    }));

    if (!response.ok) {
        throw new Error("Failed to initialize encrypted media");
    }

    return await response.json() as MediaInitResponse;
};

const uploadBlob = async (
    supabase: SupabaseClient,
    path: string,
    blob: Blob,
    contentType = "application/octet-stream",
): Promise<void> => {
    const { error } = await measureAsync("network.media.upload-blob", async () => await supabase.storage.from("chat-media").upload(path, blob, {
        upsert: false,
        contentType,
    }), {
        path,
        bytes: blob.size,
    });

    if (error) {
        throw new Error(error.message);
    }
};

export const finalizeMediaReservation = async (mediaId: string, msgId: string): Promise<void> => {
    const response = await measureAsync("network.media.finalize", async () => await fetch("/api/e2ee/media/finalize", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ mediaId, msgId }),
    }));

    if (!response.ok) {
        throw new Error("Failed to finalize encrypted media");
    }
};

export const uploadEncryptedMedia = async ({
    file,
    senderDeviceId,
    keyVersion,
    threadKey,
    onProgress,
}: UploadEncryptedMediaParams): Promise<EncryptedMediaMetadata> => {
    const startedAt = performance.now();
    logE2eeStep("Starting encrypted media upload", {
        filename: file.name,
        sizeBytes: file.size,
        senderDeviceId,
        keyVersion,
    });

    const shouldUseSinglePass = file.type.startsWith("image/") && file.size <= IMAGE_SINGLE_PASS_THRESHOLD;
    const supabase = createClient();

    let metadata: EncryptedMediaMetadata;

    if (shouldUseSinglePass) {
        const encryptedMedia = await measureAsync("media.encrypt-file.total", async () => await encryptMediaFile(file), {
            fileSize: file.size,
            mimeType: file.type,
        });
        const { wrappedFileKey, fileKeyIv } = await measureAsync("media.wrap-file-key", async () => await wrapFileKeyWithThreadKey(encryptedMedia.fileKey, threadKey));
        const init = await initializeMedia({
            senderDeviceId,
            keyVersion,
            mimeType: encryptedMedia.mimeType,
            originalFilename: file.name,
            sizeBytes: encryptedMedia.sizeBytes,
            encryptionMode: encryptedMedia.mode,
            chunkSizeBytes: encryptedMedia.chunkSizeBytes ?? null,
            chunkCount: encryptedMedia.chunkCount ?? null,
            chunkIvSeed: encryptedMedia.chunkIvSeed,
            wrappedFileKey,
            fileKeyIv,
            previewCiphertext: null,
            previewIv: null,
        });

        logE2eeStep("Reserved encrypted media storage", {
            mediaId: init.mediaId,
            storagePath: init.storagePath,
            bucket: init.bucket,
            mode: encryptedMedia.mode,
        });

        await uploadBlob(supabase, `${init.storagePath}/original.bin`, encryptedMedia.encryptedBlob!, "application/octet-stream");
        onProgress?.(100);
        logE2eeStep("Uploaded single encrypted media blob", {
            mediaId: init.mediaId,
            bytesUploaded: encryptedMedia.encryptedBlob?.size ?? 0,
        });

        metadata = {
            mediaId: init.mediaId,
            storagePath: init.storagePath,
            mimeType: encryptedMedia.mimeType,
            originalFilename: file.name,
            sizeBytes: encryptedMedia.sizeBytes,
            encryptionMode: encryptedMedia.mode,
            chunkSizeBytes: encryptedMedia.chunkSizeBytes ?? null,
            chunkCount: encryptedMedia.chunkCount ?? null,
            chunkIvSeed: encryptedMedia.chunkIvSeed,
            wrappedFileKey,
            fileKeyIv,
            previewCiphertext: null,
            previewIv: null,
        };
    } else {
        const startedEncryptionAt = performance.now();
        const fileKey = await crypto.subtle.generateKey(
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"],
        );
        const rawFileKey = await crypto.subtle.exportKey("raw", fileKey);
        const chunkIvSeed = createEncodedChunkIvSeed();
        const chunkCount = Math.ceil(file.size / CHUNK_SIZE_BYTES);
        const { wrappedFileKey, fileKeyIv } = await measureAsync("media.wrap-file-key", async () => await wrapFileKeyWithThreadKey(fileKey, threadKey));
        const init = await initializeMedia({
            senderDeviceId,
            keyVersion,
            mimeType: file.type,
            originalFilename: file.name,
            sizeBytes: file.size,
            encryptionMode: "chunked",
            chunkSizeBytes: CHUNK_SIZE_BYTES,
            chunkCount,
            chunkIvSeed,
            wrappedFileKey,
            fileKeyIv,
            previewCiphertext: null,
            previewIv: null,
        });

        logE2eeStep("Reserved encrypted media storage", {
            mediaId: init.mediaId,
            storagePath: init.storagePath,
            bucket: init.bucket,
            mode: "chunked",
            chunkCount,
        });

        for (let chunkIndex = 0; chunkIndex < chunkCount; chunkIndex += 1) {
            const offset = chunkIndex * CHUNK_SIZE_BYTES;
            const chunkBlob = file.slice(offset, Math.min(offset + CHUNK_SIZE_BYTES, file.size));
            const chunkBuffer = await measureAsync("media.chunk.read-array-buffer", async () => await chunkBlob.arrayBuffer(), {
                chunkIndex,
                bytes: chunkBlob.size,
            });
            const { encryptedBuffer } = await measureAsync("media.chunk.encrypt-upload", async () => await workerEncryptMediaChunk(
                chunkBuffer,
                rawFileKey.slice(0),
                chunkIvSeed,
                chunkIndex,
            ), {
                chunkIndex,
                bytes: chunkBlob.size,
            });
            const encryptedBlob = new Blob([encryptedBuffer], { type: "application/octet-stream" });
            await uploadBlob(supabase, `${init.storagePath}/chunks/${chunkIndex}.bin`, encryptedBlob, "application/octet-stream");

            const progress = Math.round(((chunkIndex + 1) / chunkCount) * 100);
            onProgress?.(progress);
            logE2eeStep("Uploaded encrypted media chunk", {
                mediaId: init.mediaId,
                chunkIndex,
                progress,
                totalChunks: chunkCount,
            });
        }

        recordPerf("media.encrypt-file.chunked.stream", performance.now() - startedEncryptionAt, {
            fileSize: file.size,
            chunkCount,
        });

        metadata = {
            mediaId: init.mediaId,
            storagePath: init.storagePath,
            mimeType: file.type,
            originalFilename: file.name,
            sizeBytes: file.size,
            encryptionMode: "chunked",
            chunkSizeBytes: CHUNK_SIZE_BYTES,
            chunkCount,
            chunkIvSeed,
            wrappedFileKey,
            fileKeyIv,
            previewCiphertext: null,
            previewIv: null,
        };
    }

    logE2eeStep("Encrypted media upload completed", {
        mediaId: metadata.mediaId,
        storagePath: metadata.storagePath,
        mode: metadata.encryptionMode,
        chunkCount: metadata.chunkCount,
    });
    recordPerf("media.total", performance.now() - startedAt, {
        fileSize: file.size,
        mode: metadata.encryptionMode,
    });

    return metadata;
};
