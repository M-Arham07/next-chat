"use client";

import { useEffect, useState } from "react";
import type { EncryptedMediaMetadata } from "@chat/shared";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ensureThreadBootstrap, unwrapFileKeyWithThreadKey, decryptEncryptedMediaBlob, decryptChunkedMedia } from "@/features/chat/lib/e2ee";

interface UseDecryptedMediaResult {
    objectUrl: string | null;
    loading: boolean;
    error: string | null;
}

const fetchSignedBlob = async (path: string): Promise<Blob> => {
    const signResponse = await fetch(`/api/e2ee/media/sign?path=${encodeURIComponent(path)}`, {
        method: "GET",
        cache: "no-store",
    });

    if (!signResponse.ok) {
        throw new Error("Failed to sign encrypted media request");
    }

    const { signedUrl } = await signResponse.json() as { signedUrl: string };
    const mediaResponse = await fetch(signedUrl);

    if (!mediaResponse.ok) {
        throw new Error("Failed to fetch encrypted media blob");
    }

    return await mediaResponse.blob();
};

export const useDecryptedMedia = (
    threadId: string,
    keyVersion: number | null | undefined,
    media: EncryptedMediaMetadata | null | undefined,
    localFallbackUrl?: string,
): UseDecryptedMediaResult => {
    const { profile } = useAuth();
    const [objectUrl, setObjectUrl] = useState<string | null>(localFallbackUrl ?? null);
    const [loading, setLoading] = useState<boolean>(Boolean(media && !localFallbackUrl));
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!media || !keyVersion || !profile?.id) {
            setObjectUrl(localFallbackUrl ?? null);
            setLoading(false);
            return;
        }

        if (localFallbackUrl?.startsWith("blob:")) {
            setObjectUrl(localFallbackUrl);
            setLoading(false);
            return;
        }

        let cancelled = false;
        let generatedObjectUrl: string | null = null;

        const resolveMedia = async () => {
            try {
                setLoading(true);
                setError(null);

                const bootstrap = await ensureThreadBootstrap(profile.id, threadId);
                const fileKey = await unwrapFileKeyWithThreadKey(
                    media.wrappedFileKey,
                    media.fileKeyIv,
                    bootstrap.threadKey,
                );

                const decryptedBlob = media.encryptionMode === "single"
                    ? await decryptEncryptedMediaBlob(
                        await fetchSignedBlob(`${media.storagePath}/original.bin`),
                        fileKey,
                        media.chunkIvSeed ?? "",
                        0,
                        media.mimeType,
                    )
                    : await decryptChunkedMedia(
                        await Promise.all(
                            Array.from({ length: media.chunkCount ?? 0 }, (_, index) =>
                                fetchSignedBlob(`${media.storagePath}/chunks/${index}.bin`),
                            ),
                        ),
                        fileKey,
                        media.chunkIvSeed ?? "",
                        media.mimeType,
                    );

                if (cancelled) {
                    return;
                }

                generatedObjectUrl = URL.createObjectURL(decryptedBlob);
                setObjectUrl(generatedObjectUrl);
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Failed to decrypt media");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void resolveMedia();

        return () => {
            cancelled = true;

            if (generatedObjectUrl) {
                URL.revokeObjectURL(generatedObjectUrl);
            }
        };
    }, [media, keyVersion, localFallbackUrl, profile?.id, threadId]);

    return { objectUrl, loading, error };
};
