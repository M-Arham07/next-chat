import { arrayBufferToBase64, base64ToUint8Array, toArrayBuffer, uint8ArrayToUtf8, utf8ToUint8Array } from "./base64";
import { workerDecryptBackup, workerEncryptBackup } from "./crypto-worker-client";
import { logE2eeStep, measureAsync, previewCiphertext, previewIv } from "./debug";
import { ensureRegisteredDevice } from "./device-registration";
import { exportThreadKey, importThreadKey } from "./messages";
import {
    clearE2eeStateForUser,
    deleteBackupUnlockRecord,
    loadAllThreadKeys,
    loadBackupUnlockRecord,
    storeBackupUnlockRecord,
    storeThreadKey,
} from "./storage";
import type { BackupUnlockRecord, EncryptedKeyBackupPayload, RecoveryBundle } from "./types";

const BACKUP_VERSION = 1;
const PBKDF2_ITERATIONS = 250_000;
const PBKDF2_HASH = "SHA-256";
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const BACKUP_SESSION_KEY = "chat-app:e2ee:backup-unlocked-user";
const LOCAL_UNLOCK_KEY_ALGORITHM = {
    name: "AES-GCM",
    length: 256,
} satisfies AesKeyGenParams;

let unlockedUserId: string | null = typeof window !== "undefined"
    ? window.sessionStorage.getItem(BACKUP_SESSION_KEY)
    : null;
let unlockedPassphrase: string | null = null;

const createRandomBytes = (length: number): Uint8Array => crypto.getRandomValues(new Uint8Array(length));

const persistDeviceLocalPassphrase = async (userId: string, passphrase: string): Promise<void> => {
    const key = await measureAsync("crypto.backup.local-unlock.generate-key", async () => await crypto.subtle.generateKey(LOCAL_UNLOCK_KEY_ALGORITHM, false, ["encrypt", "decrypt"]));
    const iv = createRandomBytes(IV_LENGTH);
    const ciphertext = await measureAsync("crypto.backup.local-unlock.encrypt", async () => await crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: toArrayBuffer(iv),
        },
        key,
        toArrayBuffer(utf8ToUint8Array(passphrase)),
    ));

    await storeBackupUnlockRecord<BackupUnlockRecord>(userId, {
        key,
        iv: arrayBufferToBase64(iv),
        ciphertext: arrayBufferToBase64(ciphertext),
    });
};

const loadDeviceLocalPassphrase = async (userId: string): Promise<string | null> => {
    const storedRecord = await loadBackupUnlockRecord<BackupUnlockRecord>(userId);

    if (!storedRecord) {
        return null;
    }

    try {
        const decryptedBuffer = await measureAsync("crypto.backup.local-unlock.decrypt", async () => await crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: toArrayBuffer(base64ToUint8Array(storedRecord.iv)),
            },
            storedRecord.key,
            toArrayBuffer(base64ToUint8Array(storedRecord.ciphertext)),
        ));

        return uint8ArrayToUtf8(new Uint8Array(decryptedBuffer));
    } catch {
        await deleteBackupUnlockRecord(userId);
        return null;
    }
};

const deriveBackupKey = async (
    passphrase: string,
    salt: Uint8Array,
    iterations = PBKDF2_ITERATIONS,
): Promise<CryptoKey> => {
    const keyMaterial = await measureAsync("crypto.backup.pbkdf2.import-key", async () => await crypto.subtle.importKey(
        "raw",
        toArrayBuffer(utf8ToUint8Array(passphrase)),
        "PBKDF2",
        false,
        ["deriveKey"],
    ));

    return await measureAsync("crypto.backup.pbkdf2.derive-key", async () => await crypto.subtle.deriveKey(
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
    ), {
        iterations,
    });
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
    const { encryptedBlob, salt, iv } = await workerEncryptBackup(
        passphrase,
        JSON.stringify(bundle),
        PBKDF2_ITERATIONS,
    );

    return {
        encryptedBlob,
        salt,
        iv,
        kdfAlgorithm: "PBKDF2-SHA256",
        kdfIterations: PBKDF2_ITERATIONS,
        backupVersion: BACKUP_VERSION,
    };
};

const decryptRecoveryBundle = async (
    passphrase: string,
    payload: EncryptedKeyBackupPayload,
): Promise<RecoveryBundle> => {
    const { bundleJson } = await workerDecryptBackup(
        passphrase,
        payload.encryptedBlob,
        payload.salt,
        payload.iv,
        payload.kdfIterations,
    );

    return JSON.parse(bundleJson) as RecoveryBundle;
};

const uploadEncryptedBackup = async (payload: EncryptedKeyBackupPayload): Promise<void> => {
    const response = await measureAsync("network.backup.upload", async () => await fetch("/api/e2ee/backup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    }));

    if (!response.ok) {
        throw new Error("Failed to save encrypted key backup");
    }
};

const deleteEncryptedBackup = async (): Promise<void> => {
    const response = await measureAsync("network.backup.delete", async () => await fetch("/api/e2ee/backup", {
        method: "DELETE",
    }));

    if (!response.ok) {
        throw new Error("Failed to delete encrypted key backup");
    }
};

export const loadEncryptedBackupStatus = async (): Promise<{
    exists: boolean;
    backup?: EncryptedKeyBackupPayload;
}> => {
    const response = await measureAsync("network.backup.load", async () => await fetch("/api/e2ee/backup", {
        method: "GET",
        cache: "no-store",
    }));

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

export const rehydrateUnlockedPassphraseForUser = async (userId: string): Promise<boolean> => {
    if (hasUnlockedPassphraseForUser(userId)) {
        return true;
    }

    const passphrase = await loadDeviceLocalPassphrase(userId);

    if (!passphrase) {
        return false;
    }

    rememberUnlockedPassphrase(userId, passphrase);
    return true;
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
    await persistDeviceLocalPassphrase(userId, passphrase);

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
    await persistDeviceLocalPassphrase(userId, passphrase);

    logE2eeStep("Encrypted backup restored", {
        restoredThreadKeyCount: bundle.threadKeys.length,
    });

    return bundle;
};

export const restoreEncryptedBackupIfUnlocked = async (
    userId: string,
    payload: EncryptedKeyBackupPayload,
): Promise<RecoveryBundle | null> => {
    if (!hasUnlockedPassphraseForUser(userId) || !unlockedPassphrase) {
        return null;
    }

    return await restoreEncryptedBackup(userId, unlockedPassphrase, payload);
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
    await deleteBackupUnlockRecord(userId);
    clearUnlockedPassphrase();
};
