"use client";

import type { Ack, Message } from "@chat/shared";
import { createClient } from "@/supabase/client";
import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import { hydrateMessagesForDisplay } from "@/features/chat/lib/e2ee";
import { measureAsync, recordPerf } from "@/features/chat/lib/e2ee/debug";

type DeletePayload = {
    threadId: string;
    msgId: string;
};

const DEFAULT_TIMEOUT_MS = 10_000;

export class RealtimeChatClient {
    private readonly supabase: SupabaseClient;
    private readonly channels = new Map<string, RealtimeChannel>();
    private readonly hydratedMessagePromises = new Map<string, Promise<Message>>();
    private readonly messageReceivedListeners = new Set<(message: Message) => void>();
    private readonly messageDeletedListeners = new Set<(threadId: string, msgId: string) => void>();
    private readonly typingStartListeners = new Set<(threadId: string, userId: string) => void>();
    private readonly typingStopListeners = new Set<(threadId: string, userId: string) => void>();
    private userId: string | null = null;

    constructor(supabase = createClient()) {
        this.supabase = supabase;
    }

    setCurrentUser(userId: string | null): void {
        this.userId = userId;
    }

    onMessageReceived(handler: (message: Message) => void): void {
        this.messageReceivedListeners.add(handler);
    }

    offMessageReceived(handler: (message: Message) => void): void {
        this.messageReceivedListeners.delete(handler);
    }

    onMessageDeleted(handler: (threadId: string, msgId: string) => void): void {
        this.messageDeletedListeners.add(handler);
    }

    offMessageDeleted(handler: (threadId: string, msgId: string) => void): void {
        this.messageDeletedListeners.delete(handler);
    }

    onTypingStart(handler: (threadId: string, userId: string) => void): void {
        this.typingStartListeners.add(handler);
    }

    offTypingStart(handler: (threadId: string, userId: string) => void): void {
        this.typingStartListeners.delete(handler);
    }

    onTypingStop(handler: (threadId: string, userId: string) => void): void {
        this.typingStopListeners.add(handler);
    }

    offTypingStop(handler: (threadId: string, userId: string) => void): void {
        this.typingStopListeners.delete(handler);
    }

    async setThreadSubscriptions(threadIds: string[]): Promise<void> {
        const nextThreadIds = new Set(threadIds.filter(Boolean));

        await Promise.all(
            [...this.channels.keys()]
                .filter((threadId) => !nextThreadIds.has(threadId))
                .map((threadId) => this.unsubscribeFromThread(threadId)),
        );

        await Promise.all([...nextThreadIds].map((threadId) => this.ensureThreadChannel(threadId)));
    }

    async publishMessage(message: Message): Promise<Ack> {
        try {
            const { error: storeError } = await measureAsync("network.message.store-rpc", async () => await this.supabase.rpc("store_message_from_realtime", {
                p_msg_id: message.msgId,
                p_thread_id: message.threadId,
                p_sender_user_id: message.senderUserId ?? message.sender,
                p_sender_device_id: message.senderDeviceId ?? null,
                p_sender: message.sender,
                p_type: message.type,
                p_content: message.content,
                p_content_format: message.contentFormat ?? "legacy_plaintext",
                p_key_version: message.keyVersion ?? null,
                p_reply_to_msg_id: message.replyToMsgId ?? null,
                p_status: "sent",
                p_timestamp: message.timestamp,
                p_ciphertext: message.encryptedPayload?.ciphertext ?? null,
                p_iv: message.encryptedPayload?.iv ?? null,
                p_algorithm: message.encryptedPayload?.algorithm ?? null,
                p_aad: message.encryptedPayload?.aad ?? null,
            }), {
                threadId: message.threadId,
                contentFormat: message.contentFormat,
            });

            if (storeError) {
                throw new Error(storeError.message);
            }

            if (message.contentFormat === "e2ee_media" && message.media?.mediaId) {
                const media = message.media;
                const { error: bindError } = await measureAsync("network.media.bind-rpc", async () => await this.supabase.rpc("bind_reserved_media_to_message", {
                    p_media_id: media.mediaId,
                    p_msg_id: message.msgId,
                    p_sender_user_id: message.senderUserId ?? message.sender,
                }), {
                    threadId: message.threadId,
                });

                if (bindError) {
                    throw new Error(bindError.message);
                }
            }

            return { ok: true, data: "SENT_OK" };
        } catch (error) {
            console.error("[realtime] Failed to publish message", error);
            return { ok: false, data: "SEND_FAILED" };
        }
    }

    async publishDelete(message: Message): Promise<Ack> {
        try {
            const { error } = await measureAsync("network.message.delete-rpc", async () => await this.supabase.rpc("delete_message_for_user", {
                p_msg_id: message.msgId,
                p_sender_user_id: message.senderUserId ?? message.sender,
            }), {
                threadId: message.threadId,
            });

            if (error) {
                throw new Error(error.message);
            }

            return { ok: true, data: "DELETE_SUCCESS" };
        } catch (error) {
            console.error("[realtime] Failed to publish message deletion", error);
            return { ok: false, data: "DELETE_FAIL" };
        }
    }

    async publishTypingStart(threadId: string, userId: string): Promise<void> {
        const channel = await this.ensureThreadChannel(threadId);

        await channel.send({
            type: "broadcast",
            event: "typing:start",
            payload: { threadId, userId },
        });
    }

    async publishTypingStop(threadId: string, userId: string): Promise<void> {
        const channel = await this.ensureThreadChannel(threadId);

        await channel.send({
            type: "broadcast",
            event: "typing:stop",
            payload: { threadId, userId },
        });
    }

    async dispose(): Promise<void> {
        await Promise.all([...this.channels.keys()].map((threadId) => this.unsubscribeFromThread(threadId)));
    }

    private async ensureThreadChannel(threadId: string): Promise<RealtimeChannel> {
        const existing = this.channels.get(threadId);

        if (existing) {
            return existing;
        }

        const channel = this.supabase
            .channel(`thread:${threadId}`, {
                config: {
                    private: true,
                    broadcast: { self: false },
                },
            })
            .on("postgres_changes", {
                event: "INSERT",
                schema: "public",
                table: "messages",
                filter: `thread_id=eq.${threadId}`,
            }, async ({ new: row }) => {
                const startedAt = performance.now();
                const rowData = row as MessageRow;
                const message = await this.hydrateIncomingMessage(rowData);
                recordPerf("receive.message.total", performance.now() - startedAt, {
                    threadId,
                    contentFormat: message.contentFormat,
                });
                this.messageReceivedListeners.forEach((handler) => handler(message));
            })
            .on("postgres_changes", {
                event: "DELETE",
                schema: "public",
                table: "messages",
                filter: `thread_id=eq.${threadId}`,
            }, ({ old }) => {
                const deleted = old as { thread_id?: string; msg_id?: string };

                if (deleted.thread_id && deleted.msg_id) {
                    this.messageDeletedListeners.forEach((handler) => handler(deleted.thread_id!, deleted.msg_id!));
                }
            })
            .on("broadcast", { event: "typing:start" }, ({ payload }) => {
                const typing = payload as { threadId: string; userId: string };
                this.typingStartListeners.forEach((handler) => handler(typing.threadId, typing.userId));
            })
            .on("broadcast", { event: "typing:stop" }, ({ payload }) => {
                const typing = payload as { threadId: string; userId: string };
                this.typingStopListeners.forEach((handler) => handler(typing.threadId, typing.userId));
            });

        this.channels.set(threadId, channel);

        await new Promise<void>((resolve, reject) => {
            channel.subscribe((status) => {
                if (status === "SUBSCRIBED") {
                    resolve();
                    return;
                }

                if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
                    this.channels.delete(threadId);
                    reject(new Error(`Failed to subscribe to thread channel ${threadId}: ${status}`));
                }
            });
        });

        return channel;
    }

    private async unsubscribeFromThread(threadId: string): Promise<void> {
        const channel = this.channels.get(threadId);

        if (!channel) {
            return;
        }

        this.channels.delete(threadId);
        await this.supabase.removeChannel(channel);
    }

    private async hydrateIncomingMessage(row: MessageRow): Promise<Message> {
        const existing = this.hydratedMessagePromises.get(row.msg_id);

        if (existing) {
            return await existing;
        }

        const hydrationPromise = this.hydrateMessageRow(row);
        this.hydratedMessagePromises.set(row.msg_id, hydrationPromise);

        try {
            return await hydrationPromise;
        } finally {
            this.hydratedMessagePromises.delete(row.msg_id);
        }
    }

    private async hydrateMessageRow(row: MessageRow): Promise<Message> {
        let encryptedPayload: Message["encryptedPayload"] | undefined;
        let media: Message["media"] | undefined;

        if (row.content_format === "e2ee_text") {
            const { data, error } = await measureAsync("network.message-envelope.fetch", async () => await this.supabase
                .from("message_envelopes")
                .select("*")
                .eq("msg_id", row.msg_id)
                .maybeSingle(), {
                    threadId: row.thread_id,
                });

            if (error) {
                throw new Error(error.message);
            }

            if (data) {
                encryptedPayload = {
                    algorithm: data.algorithm,
                    ciphertext: data.ciphertext,
                    iv: data.iv,
                    aad: data.aad ?? undefined,
                };
            }
        }

        if (row.content_format === "e2ee_media") {
            const { data, error } = await measureAsync("network.media-object.fetch", async () => await this.supabase
                .from("media_objects")
                .select("*")
                .eq("msg_id", row.msg_id)
                .maybeSingle(), {
                    threadId: row.thread_id,
                });

            if (error) {
                throw new Error(error.message);
            }

            if (data) {
                media = {
                    mediaId: data.media_id,
                    storagePath: data.storage_path,
                    mimeType: data.mime_type,
                    originalFilename: data.original_filename,
                    sizeBytes: data.size_bytes,
                    encryptionMode: data.encryption_mode,
                    chunkSizeBytes: data.chunk_size_bytes,
                    chunkCount: data.chunk_count,
                    chunkIvSeed: data.chunk_iv_seed,
                    wrappedFileKey: data.wrapped_file_key,
                    fileKeyIv: data.file_key_iv,
                    previewCiphertext: data.preview_ciphertext,
                    previewIv: data.preview_iv,
                };
            }
        }

        const message: Message = {
            msgId: row.msg_id,
            threadId: row.thread_id,
            sender: row.sender,
            senderUserId: row.sender_user_id ?? row.sender,
            senderDeviceId: row.sender_device_id ?? undefined,
            type: row.type,
            content: row.content,
            contentFormat: row.content_format ?? "legacy_plaintext",
            encryptedPayload,
            media,
            replyToMsgId: row.reply_to_msg_id ?? undefined,
            readBy: row.read_by ?? undefined,
            status: row.status,
            keyVersion: row.key_version ?? undefined,
            timestamp: row.timestamp,
        };

        if (!this.userId) {
            return message;
        }

        const userId = this.userId;
        const [hydrated] = await measureAsync("crypto.message.hydrate-display", async () => await hydrateMessagesForDisplay(userId, [message]), {
            threadId: row.thread_id,
        });
        return hydrated;
    }
}

export type SocketClientType = RealtimeChatClient;

export const createRealtimeChatClient = (): RealtimeChatClient => new RealtimeChatClient();

type MessageRow = {
    msg_id: string;
    thread_id: string;
    sender: string;
    sender_user_id?: string | null;
    sender_device_id?: string | null;
    type: Message["type"];
    content: string;
    content_format?: Message["contentFormat"];
    reply_to_msg_id?: string | null;
    read_by?: string | null;
    status: Message["status"];
    key_version?: number | null;
    timestamp: string;
};
