import { createClient } from "@/supabase/client";
import type { EncryptedMediaMetadata } from "@chat/shared";
import { logE2eeStep, measureAsync, recordPerf } from "./debug";
import { encryptMediaFile, wrapFileKeyWithThreadKey } from "./media";
import type { SupabaseClient } from "@supabase/supabase-js";

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

    const encryptedMedia = await measureAsync("media.encrypt-file.total", async () => await encryptMediaFile(file), {
        fileSize: file.size,
        mimeType: file.type,
    });
    const { wrappedFileKey, fileKeyIv } = await measureAsync("media.wrap-file-key", async () => await wrapFileKeyWithThreadKey(encryptedMedia.fileKey, threadKey));
    const supabase = createClient();

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

    if (encryptedMedia.mode === "single") {
        await uploadBlob(supabase, `${init.storagePath}/original.bin`, encryptedMedia.encryptedBlob!, "application/octet-stream");
        onProgress?.(100);
        logE2eeStep("Uploaded single encrypted media blob", {
            mediaId: init.mediaId,
            bytesUploaded: encryptedMedia.encryptedBlob?.size ?? 0,
        });
    } else {
        const total = encryptedMedia.chunks?.length ?? 0;

        for (const [index, chunk] of (encryptedMedia.chunks ?? []).entries()) {
            await uploadBlob(supabase, `${init.storagePath}/chunks/${chunk.index}.bin`, chunk.ciphertext, "application/octet-stream");
            const progress = Math.round(((index + 1) / total) * 100);
            onProgress?.(progress);
            logE2eeStep("Uploaded encrypted media chunk", {
                mediaId: init.mediaId,
                chunkIndex: chunk.index,
                progress,
                totalChunks: total,
            });
        }
    }

    const metadata = {
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
