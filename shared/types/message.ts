export type MessageContentType = "text" | "image" | "video" | "voice" | "document" | "deleted";
export type MessageStatusType = "sending" | "sent" | "failed";
export type MessageContentFormat = "legacy_plaintext" | "e2ee_text" | "e2ee_media" | "deleted";

export interface EncryptedTextPayload {
    algorithm: "AES-GCM";
    ciphertext: string;
    iv: string;
    aad?: Record<string, unknown> | null;
}

export interface WrappedThreadKey {
    algorithm: "ECDH-P256/AES-GCM";
    wrappedKey: string;
    iv: string;
    senderPublicKey: JsonWebKey;
}

export interface DeviceIdentity {
    deviceId: string;
    userId: string;
    deviceLabel: string;
    publicKey: JsonWebKey;
    keyAlgorithm: string;
    revokedAt?: string | null;
}

export interface EncryptedMediaMetadata {
    mediaId: string;
    storagePath: string;
    mimeType: string;
    originalFilename?: string | null;
    sizeBytes: number;
    encryptionMode: "single" | "chunked";
    chunkSizeBytes?: number | null;
    chunkCount?: number | null;
    chunkIvSeed?: string | null;
    wrappedFileKey: string;
    fileKeyIv: string;
    previewCiphertext?: string | null;
    previewIv?: string | null;
}

export interface ThreadBootstrap {
    threadId: string;
    activeKeyVersion: number | null;
    participantDevices: DeviceIdentity[];
    wrappedThreadKey?: WrappedThreadKey | null;
}

export interface Message {
    msgId: string;
    threadId: string;
    sender: string;
    senderUserId?: string;
    senderDeviceId?: string;
    type: MessageContentType;
    content: string;
    contentFormat?: MessageContentFormat;
    encryptedPayload?: EncryptedTextPayload | null;
    media?: EncryptedMediaMetadata | null;
    replyToMsgId?: string;
    readBy?: string;
    status: MessageStatusType;
    keyVersion?: number | null;
    timestamp: string;
}
