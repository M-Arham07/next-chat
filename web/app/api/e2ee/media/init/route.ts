import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/supabase/server";
import { getProfileServer } from "@/supabase/getProfileServer";

const mediaInitSchema = z.object({
    senderDeviceId: z.string().uuid(),
    keyVersion: z.number().int().positive(),
    mimeType: z.string().min(1),
    originalFilename: z.string().nullable().optional(),
    sizeBytes: z.number().int().nonnegative(),
    encryptionMode: z.enum(["single", "chunked"]),
    chunkSizeBytes: z.number().int().positive().nullable().optional(),
    chunkCount: z.number().int().positive().nullable().optional(),
    chunkIvSeed: z.string(),
    wrappedFileKey: z.string(),
    fileKeyIv: z.string(),
    previewCiphertext: z.string().nullable().optional(),
    previewIv: z.string().nullable().optional(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const profile = await getProfileServer();

        if (!profile) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = mediaInitSchema.parse(await request.json());
        const mediaId = crypto.randomUUID();
        const storagePath = `thread-media/${mediaId}`;
        const supabase = await createClient();

        const { error } = await supabase
            .from("media_objects")
            .insert({
                media_id: mediaId,
                msg_id: null,
                sender_device_id: body.senderDeviceId,
                storage_path: storagePath,
                mime_type: body.mimeType,
                original_filename: body.originalFilename ?? null,
                size_bytes: body.sizeBytes,
                encryption_mode: body.encryptionMode,
                chunk_size_bytes: body.chunkSizeBytes ?? null,
                chunk_count: body.chunkCount ?? null,
                chunk_iv_seed: body.chunkIvSeed,
                preview_ciphertext: body.previewCiphertext ?? null,
                preview_iv: body.previewIv ?? null,
                wrapped_file_key: body.wrappedFileKey,
                file_key_iv: body.fileKeyIv,
                key_version: body.keyVersion,
            });

        if (error) {
            throw new Error(error.message);
        }

        return NextResponse.json({
            mediaId,
            storagePath,
            bucket: "chat-media",
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to initialize encrypted media" },
            { status: 500 },
        );
    }
}
