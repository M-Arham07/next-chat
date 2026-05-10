import { z } from "zod";

export const messageSchema = z.object({
    msgId: z.string(),
    threadId: z.string(),
    sender: z.string(),
    senderUserId: z.string().optional(),
    senderDeviceId: z.string().optional(),
    type: z.enum(["text", "image", "video", "voice", "document", "deleted"]),
    content: z.string(),
    contentFormat: z.enum(["legacy_plaintext", "e2ee_text", "e2ee_media", "deleted"]).optional(),
    encryptedPayload: z.object({
        algorithm: z.literal("AES-GCM"),
        ciphertext: z.string(),
        iv: z.string(),
        aad: z.record(z.string(), z.unknown()).nullable().optional(),
    }).nullable().optional(),
    media: z.object({
        mediaId: z.string(),
        storagePath: z.string(),
        mimeType: z.string(),
        originalFilename: z.string().nullable().optional(),
        sizeBytes: z.number(),
        encryptionMode: z.enum(["single", "chunked"]),
        chunkSizeBytes: z.number().nullable().optional(),
        chunkCount: z.number().nullable().optional(),
        chunkIvSeed: z.string().nullable().optional(),
        wrappedFileKey: z.string(),
        fileKeyIv: z.string(),
        previewCiphertext: z.string().nullable().optional(),
        previewIv: z.string().nullable().optional(),
    }).nullable().optional(),
    replyToMsgId: z.string().optional(),
    readBy: z.string().optional(),
    status: z.enum(["sending", "sent", "failed"]),
    keyVersion: z.number().nullable().optional(),
    timestamp: z.string()
});

export const deviceIdentitySchema = z.object({
    deviceId: z.string(),
    userId: z.string(),
    deviceLabel: z.string(),
    publicKey: z.record(z.string(), z.unknown()),
    keyAlgorithm: z.string(),
    revokedAt: z.string().nullable().optional(),
});

export const wrappedThreadKeySchema = z.object({
    algorithm: z.literal("ECDH-P256/AES-GCM"),
    wrappedKey: z.string(),
    iv: z.string(),
    senderPublicKey: z.record(z.string(), z.unknown()),
});

export const threadBootstrapSchema = z.object({
    threadId: z.string(),
    activeKeyVersion: z.number().nullable(),
    participantDevices: z.array(deviceIdentitySchema),
    wrappedThreadKey: wrappedThreadKeySchema.nullable().optional(),
});
