export type JsonWebKeyString = JsonWebKey;

export interface EncryptedPayload {
    algorithm: "AES-GCM";
    ciphertext: string;
    iv: string;
}

export interface WrappedThreadKey {
    algorithm: "ECDH-P256/AES-GCM";
    wrappedKey: string;
    iv: string;
    senderPublicKey: JsonWebKeyString;
}

export interface StoredIdentityRecord {
    publicKey: JsonWebKeyString;
    privateKey: CryptoKey;
}

export interface RegisteredDeviceRecord {
    deviceId: string;
    userId: string;
    deviceLabel: string;
    publicKey: JsonWebKeyString;
    keyAlgorithm: string;
}

export interface BackupUnlockRecord {
    iv: string;
    ciphertext: string;
    key: CryptoKey;
}

export interface ThreadKeyRecord {
    userId: string;
    threadId: string;
    keyVersion: number;
    key: CryptoKey;
}

export interface StoredThreadKeyRecord extends ThreadKeyRecord {}

export interface EncryptedKeyBackupPayload {
    encryptedBlob: string;
    salt: string;
    iv: string;
    kdfAlgorithm: "PBKDF2-SHA256";
    kdfIterations: number;
    backupVersion: number;
    updatedAt?: string;
}

export interface RecoveryBundle {
    version: number;
    exportedAt: string;
    threadKeys: Array<{
        threadId: string;
        keyVersion: number;
        encodedKey: string;
    }>;
}
