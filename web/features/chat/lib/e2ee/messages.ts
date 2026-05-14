import {
    arrayBufferToBase64,
    base64ToUint8Array,
    toArrayBuffer,
    uint8ArrayToUtf8,
    utf8ToUint8Array,
} from "./base64";
import { loadThreadKey, storeThreadKey } from "./storage";
import { logE2eeStep, measureAsync, previewCiphertext, previewIv } from "./debug";
import type { EncryptedPayload, WrappedThreadKey } from "./types";

const MESSAGE_ALGORITHM = {
    name: "AES-GCM",
    length: 256,
} satisfies AesKeyGenParams;

const IV_LENGTH = 12;

const createIv = (): Uint8Array => crypto.getRandomValues(new Uint8Array(IV_LENGTH));

const deriveSharedWrappingKey = async (
    privateKey: CryptoKey,
    publicKey: CryptoKey,
): Promise<CryptoKey> => {
    return await measureAsync("crypto.thread.derive-wrapping-key", async () => await crypto.subtle.deriveKey(
        {
            name: "ECDH",
            public: publicKey,
        },
        privateKey,
        MESSAGE_ALGORITHM,
        false,
        ["encrypt", "decrypt"],
    ));
};

export const generateThreadKey = async (): Promise<CryptoKey> => {
    return await measureAsync("crypto.thread.generate-key", async () => await crypto.subtle.generateKey(MESSAGE_ALGORITHM, true, ["encrypt", "decrypt"]));
};

export const storeImportedThreadKey = async (
    userId: string,
    threadId: string,
    keyVersion: number,
    threadKey: CryptoKey,
): Promise<void> => {
    await storeThreadKey(userId, threadId, keyVersion, threadKey);
};

export const getStoredThreadKey = async (
    userId: string,
    threadId: string,
    keyVersion: number,
): Promise<CryptoKey | null> => {
    return await loadThreadKey(userId, threadId, keyVersion);
};

export const exportThreadKey = async (threadKey: CryptoKey): Promise<string> => {
    const rawThreadKey = await measureAsync("crypto.thread.export-key", async () => await crypto.subtle.exportKey("raw", threadKey));
    return arrayBufferToBase64(rawThreadKey);
};

export const importThreadKey = async (encodedThreadKey: string): Promise<CryptoKey> => {
    return await measureAsync("crypto.thread.import-key", async () => await crypto.subtle.importKey(
        "raw",
        toArrayBuffer(base64ToUint8Array(encodedThreadKey)),
        MESSAGE_ALGORITHM,
        true,
        ["encrypt", "decrypt"],
    ));
};

export const encryptMessage = async (
    plaintext: string,
    threadKey: CryptoKey,
): Promise<EncryptedPayload> => {
    logE2eeStep("Encrypting text message", {
        plaintextLength: plaintext.length,
    });

    const iv = createIv();
    const encodedMessage = utf8ToUint8Array(plaintext);
    const ciphertext = await measureAsync("crypto.message.encrypt", async () => await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: toArrayBuffer(iv) },
        threadKey,
        toArrayBuffer(encodedMessage),
    ), {
        plaintextLength: plaintext.length,
    });

    const payload: EncryptedPayload = {
        algorithm: "AES-GCM",
        ciphertext: arrayBufferToBase64(ciphertext),
        iv: arrayBufferToBase64(iv),
    };

    logE2eeStep("Text message encrypted", {
        algorithm: payload.algorithm,
        ciphertextPreview: previewCiphertext(payload.ciphertext),
        ivPreview: previewIv(payload.iv),
        ciphertextLength: payload.ciphertext.length,
    });

    return payload;
};

export const decryptMessage = async (
    payload: EncryptedPayload,
    threadKey: CryptoKey,
): Promise<string> => {
    logE2eeStep("Decrypting text message", {
        ciphertextPreview: previewCiphertext(payload.ciphertext),
        ivPreview: previewIv(payload.iv),
        algorithm: payload.algorithm,
    });

    const plaintextBuffer = await measureAsync("crypto.message.decrypt", async () => await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: toArrayBuffer(base64ToUint8Array(payload.iv)) },
        threadKey,
        toArrayBuffer(base64ToUint8Array(payload.ciphertext)),
    ), {
        ciphertextLength: payload.ciphertext.length,
    });

    const plaintext = uint8ArrayToUtf8(new Uint8Array(plaintextBuffer));

    logE2eeStep("Text message decrypted", {
        plaintextLength: plaintext.length,
    });

    return plaintext;
};

export const wrapThreadKeyForParticipant = async (
    threadKey: CryptoKey,
    senderPrivateKey: CryptoKey,
    recipientPublicKey: CryptoKey,
    senderPublicKeyJwk: JsonWebKey,
): Promise<WrappedThreadKey> => {
    logE2eeStep("Wrapping thread key for participant");

    const wrappingKey = await deriveSharedWrappingKey(senderPrivateKey, recipientPublicKey);
    const iv = createIv();
    const rawThreadKey = await measureAsync("crypto.thread.export-key.wrap", async () => await crypto.subtle.exportKey("raw", threadKey));
    const wrappedKey = await measureAsync("crypto.thread.wrap", async () => await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: toArrayBuffer(iv) },
        wrappingKey,
        rawThreadKey,
    ));

    const wrappedPayload: WrappedThreadKey = {
        algorithm: "ECDH-P256/AES-GCM",
        wrappedKey: arrayBufferToBase64(wrappedKey),
        iv: arrayBufferToBase64(iv),
        senderPublicKey: senderPublicKeyJwk,
    };

    logE2eeStep("Thread key wrapped", {
        algorithm: wrappedPayload.algorithm,
        wrappedKeyPreview: previewCiphertext(wrappedPayload.wrappedKey),
        ivPreview: previewIv(wrappedPayload.iv),
    });

    return wrappedPayload;
};

export const unwrapThreadKeyFromParticipant = async (
    wrappedThreadKey: WrappedThreadKey,
    recipientPrivateKey: CryptoKey,
    senderPublicKey: CryptoKey,
): Promise<CryptoKey> => {
    logE2eeStep("Unwrapping thread key", {
        wrappedKeyPreview: previewCiphertext(wrappedThreadKey.wrappedKey),
        ivPreview: previewIv(wrappedThreadKey.iv),
    });

    const wrappingKey = await deriveSharedWrappingKey(recipientPrivateKey, senderPublicKey);

    const rawThreadKey = await measureAsync("crypto.thread.unwrap", async () => await crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: toArrayBuffer(base64ToUint8Array(wrappedThreadKey.iv)),
        },
        wrappingKey,
        toArrayBuffer(base64ToUint8Array(wrappedThreadKey.wrappedKey)),
    ));

    const importedKey = await measureAsync("crypto.thread.import-key.unwrapped", async () => await crypto.subtle.importKey(
        "raw",
        rawThreadKey,
        MESSAGE_ALGORITHM,
        true,
        ["encrypt", "decrypt"],
    ));

    logE2eeStep("Thread key unwrapped successfully");

    return importedKey;
};
