import { arrayBufferToBase64, base64ToUint8Array, toArrayBuffer, uint8ArrayToUtf8, utf8ToUint8Array } from "./base64";
import { logE2eeStep, previewCiphertext, previewIv } from "./debug";
import { ensureRegisteredDevice } from "./device-registration";
import { exportThreadKey, importThreadKey } from "./messages";
import { clearE2eeStateForUser, loadAllThreadKeys, storeThreadKey } from "./storage";
import type { EncryptedKeyBackupPayload, RecoveryBundle } from "./types";

const BACKUP_VERSION = 1;
const PBKDF2_ITERATIONS = 250_000;
const PBKDF2_HASH = "SHA-256";
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const BACKUP_SESSION_KEY = "chat-app:e2ee:backup-unlocked-user";

let unlockedUserId: string | null = typeof window !== "undefined"
    ? window.sessionStorage.getItem(BACKUP_SESSION_KEY)
    : null;
let unlockedPassphrase: string | null = null;

const createRandomBytes = (length: number): Uint8Array => crypto.getRandomValues(new Uint8Array(length));

const deriveBackupKey = async (
    passphrase: string,
    salt: Uint8Array,
    iterations = PBKDF2_ITERATIONS,
): Promise<CryptoKey> => {
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        toArrayBuffer(utf8ToUint8Array(passphrase)),
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
        {
            name: "AES-GCM",
            length: 256,
        },
        false,
        ["encrypt", "decrypt"],
    );
};

const buildRecoveryBundle = async (userId: string): Promise<RecoveryBundle> => {
    const storedThreadKeys = await loadAllThreadKeys(userId);
    const serializedThreadKeys = await Promise.all(storedThreadKeys.map(async (record) => ({
        threadId: record.threadId,
        keyVersion: record.keyVersion,
        encodedKey: await exportThreadKey(record.key),
    })));

    return {
        version: BACKUP_VERSION,
        exportedAt: new Date().toISOString(),
        threadKeys: serializedThreadKeys,
    };
};

const encryptRecoveryBundle = async (
    bundle: RecoveryBundle,
    passphrase: string,
): Promise<EncryptedKeyBackupPayload> => {
    const salt = createRandomBytes(SALT_LENGTH);
    const iv = createRandomBytes(IV_LENGTH);
    const backupKey = await deriveBackupKey(passphrase, salt, PBKDF2_ITERATIONS);
    const encodedBundle = utf8ToUint8Array(JSON.stringify(bundle));
    const encryptedBuffer = await crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: toArrayBuffer(iv),
        },
        backupKey,
        toArrayBuffer(encodedBundle),
    );

    return {
        encryptedBlob: arrayBufferToBase64(encryptedBuffer),
        salt: arrayBufferToBase64(salt),
        iv: arrayBufferToBase64(iv),
        kdfAlgorithm: "PBKDF2-SHA256",
        kdfIterations: PBKDF2_ITERATIONS,
        backupVersion: BACKUP_VERSION,
    };
};

const decryptRecoveryBundle = async (
    passphrase: string,
    payload: EncryptedKeyBackupPayload,
): Promise<RecoveryBundle> => {
    const backupKey = await deriveBackupKey(
        passphrase,
        base64ToUint8Array(payload.salt),
        payload.kdfIterations,
    );

    const decryptedBuffer = await crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: toArrayBuffer(base64ToUint8Array(payload.iv)),
        },
        backupKey,
        toArrayBuffer(base64ToUint8Array(payload.encryptedBlob)),
    );

    return JSON.parse(uint8ArrayToUtf8(new Uint8Array(decryptedBuffer))) as RecoveryBundle;
};

const uploadEncryptedBackup = async (payload: EncryptedKeyBackupPayload): Promise<void> => {
    const response = await fetch("/api/e2ee/backup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error("Failed to save encrypted key backup");
    }
};

const deleteEncryptedBackup = async (): Promise<void> => {
    const response = await fetch("/api/e2ee/backup", {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error("Failed to delete encrypted key backup");
    }
};

export const loadEncryptedBackupStatus = async (): Promise<{
    exists: boolean;
    backup?: EncryptedKeyBackupPayload;
}> => {
    const response = await fetch("/api/e2ee/backup", {
        method: "GET",
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error("Failed to load encrypted key backup");
    }

    return await response.json() as {
        exists: boolean;
        backup?: EncryptedKeyBackupPayload;
    };
};

export const rememberUnlockedPassphrase = (userId: string, passphrase: string): void => {
    unlockedUserId = userId;
    unlockedPassphrase = passphrase;

    if (typeof window !== "undefined") {
        window.sessionStorage.setItem(BACKUP_SESSION_KEY, userId);
    }
};

export const clearUnlockedPassphrase = (): void => {
    unlockedUserId = null;
    unlockedPassphrase = null;

    if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(BACKUP_SESSION_KEY);
    }
};

export const hasUnlockedPassphraseForUser = (userId: string): boolean => {
    return unlockedUserId === userId && !!unlockedPassphrase;
};

export const createOrReplaceEncryptedBackup = async (
    userId: string,
    passphrase: string,
): Promise<EncryptedKeyBackupPayload> => {
    logE2eeStep("Creating encrypted thread-key backup", {
        userId,
    });

    await ensureRegisteredDevice(userId);
    const bundle = await buildRecoveryBundle(userId);
    const encryptedBackup = await encryptRecoveryBundle(bundle, passphrase);
    await uploadEncryptedBackup(encryptedBackup);
    rememberUnlockedPassphrase(userId, passphrase);

    logE2eeStep("Encrypted backup stored", {
        threadKeyCount: bundle.threadKeys.length,
        ciphertextPreview: previewCiphertext(encryptedBackup.encryptedBlob),
        ivPreview: previewIv(encryptedBackup.iv),
    });

    return encryptedBackup;
};

export const restoreEncryptedBackup = async (
    userId: string,
    passphrase: string,
    payload: EncryptedKeyBackupPayload,
): Promise<RecoveryBundle> => {
    logE2eeStep("Restoring encrypted thread-key backup", {
        userId,
        ciphertextPreview: previewCiphertext(payload.encryptedBlob),
        ivPreview: previewIv(payload.iv),
    });

    await ensureRegisteredDevice(userId);
    const bundle = await decryptRecoveryBundle(passphrase, payload);

    await Promise.all(bundle.threadKeys.map(async (threadKey) => {
        const importedKey = await importThreadKey(threadKey.encodedKey);
        await storeThreadKey(userId, threadKey.threadId, threadKey.keyVersion, importedKey);
    }));

    rememberUnlockedPassphrase(userId, passphrase);

    logE2eeStep("Encrypted backup restored", {
        restoredThreadKeyCount: bundle.threadKeys.length,
    });

    return bundle;
};

export const verifyBackupPassphrase = async (
    passphrase: string,
    payload: EncryptedKeyBackupPayload,
): Promise<boolean> => {
    try {
        await decryptRecoveryBundle(passphrase, payload);
        return true;
    } catch {
        return false;
    }
};

export const syncEncryptedBackupIfUnlocked = async (userId: string): Promise<boolean> => {
    if (!hasUnlockedPassphraseForUser(userId) || !unlockedPassphrase) {
        return false;
    }

    await createOrReplaceEncryptedBackup(userId, unlockedPassphrase);
    return true;
};

export const forgetEncryptedBackup = async (userId: string): Promise<void> => {
    logE2eeStep("Destroying encrypted backup and local E2EE state", {
        userId,
    });

    await deleteEncryptedBackup();
    await clearE2eeStateForUser(userId);
    clearUnlockedPassphrase();
};
