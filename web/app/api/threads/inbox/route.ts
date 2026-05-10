
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import { getProfileServer } from "@/supabase/getProfileServer";
import { GetInboxResponse } from "@chat/shared/schema";
import { Message } from "@chat/shared";



export async function GET(
    request: NextRequest
): Promise<NextResponse<GetInboxResponse | null>> {
   

    try {

        const profile = await getProfileServer();

        if (!profile) {
            throw new Error("INVALID_AUTH");
        }
   

        const supabase = await createClient();

        const { data, error } = await supabase.rpc("get_inbox", {
            p_profile_id: profile.id,
            p_messages_limit: 10
        });
  
      
        if (error) throw new Error(error.message)

        const rawData = (data ?? { threads: [], messages: [] }) as NonNullable<GetInboxResponse>;
        const messageIds = rawData.messages.map((message) => message.msgId);
        let envelopes: any[] = [];
        let mediaObjects: any[] = [];

        if (messageIds.length > 0) {
            const [{ data: fetchedEnvelopes, error: envelopesError }, { data: fetchedMedia, error: mediaError }] = await Promise.all([
                supabase.from("message_envelopes").select("*").in("msg_id", messageIds),
                supabase.from("media_objects").select("*").in("msg_id", messageIds),
            ]);

            if (envelopesError) throw new Error(envelopesError.message);
            if (mediaError) throw new Error(mediaError.message);

            envelopes = fetchedEnvelopes ?? [];
            mediaObjects = fetchedMedia ?? [];
        }

        const envelopeByMessageId = new Map(envelopes.map((item) => [item.msg_id, item]));
        const mediaByMessageId = new Map(mediaObjects.map((item) => [item.msg_id, item]));
        const mergedMessages: Message[] = rawData.messages.map((message) => {
            const envelope = envelopeByMessageId.get(message.msgId);
            const media = mediaByMessageId.get(message.msgId);

            return {
                ...message,
                senderUserId: message.sender,
                senderDeviceId: envelope?.sender_device_id ?? undefined,
                contentFormat: envelope ? "e2ee_text" : (media ? "e2ee_media" : (message.contentFormat ?? "legacy_plaintext")),
                encryptedPayload: envelope ? {
                    algorithm: envelope.algorithm,
                    ciphertext: envelope.ciphertext,
                    iv: envelope.iv,
                    aad: envelope.aad ?? undefined,
                } : undefined,
                media: media ? {
                    mediaId: media.media_id,
                    storagePath: media.storage_path,
                    mimeType: media.mime_type,
                    originalFilename: media.original_filename,
                    sizeBytes: media.size_bytes,
                    encryptionMode: media.encryption_mode,
                    chunkSizeBytes: media.chunk_size_bytes,
                    chunkCount: media.chunk_count,
                    chunkIvSeed: media.chunk_iv_seed,
                    wrappedFileKey: media.wrapped_file_key,
                    fileKeyIv: media.file_key_iv,
                    previewCiphertext: media.preview_ciphertext,
                    previewIv: media.preview_iv,
                } : undefined,
                keyVersion: envelope?.key_version ?? media?.key_version ?? message.keyVersion,
            };
        });

        return NextResponse.json(
            { threads: rawData.threads, messages: mergedMessages },
            { status: 200 }
        );
    } catch (err) {
        if (err instanceof Error) {
            console.error(
                "[API:get-all-chats] Failed to retrieve messages and threads >> ",
                err.message
            );
        }

        return NextResponse.json(null, { status: 500 });
    }
}
