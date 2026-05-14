import type { RegisteredDeviceRecord, StoredIdentityRecord, StoredThreadKeyRecord } from "./types";
import { measureAsync } from "./debug";

const DB_NAME = "chat-app-e2ee";
const DB_VERSION = 3;
const IDENTITY_STORE = "identity";
const THREAD_KEY_STORE = "thread-keys";
const DEVICE_STORE = "devices";
const BACKUP_UNLOCK_STORE = "backup-unlocks";

let databasePromise: Promise<IDBDatabase> | null = null;
const identityCache = new Map<string, StoredIdentityRecord>();
const deviceCache = new Map<string, RegisteredDeviceRecord>();
const backupUnlockCache = new Map<string, unknown>();
const threadKeyCache = new Map<string, CryptoKey>();

const openDatabase = async (): Promise<IDBDatabase> => {
    if (!databasePromise) {
        databasePromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                databasePromise = null;
                reject(request.error);
            };

            request.onupgradeneeded = () => {
                const database = request.result;

                if (!database.objectStoreNames.contains(IDENTITY_STORE)) {
                    database.createObjectStore(IDENTITY_STORE);
                }

                if (!database.objectStoreNames.contains(THREAD_KEY_STORE)) {
                    database.createObjectStore(THREAD_KEY_STORE);
                }

                if (!database.objectStoreNames.contains(DEVICE_STORE)) {
                    database.createObjectStore(DEVICE_STORE);
                }

                if (!database.objectStoreNames.contains(BACKUP_UNLOCK_STORE)) {
                    database.createObjectStore(BACKUP_UNLOCK_STORE);
                }
            };

            request.onsuccess = () => resolve(request.result);
        });
    }

    return await measureAsync("idb.open", async () => await databasePromise!);
};

const runTransaction = async <T>(
    storeName: string,
    mode: IDBTransactionMode,
    executor: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> => {
    const database = await openDatabase();

    return await measureAsync(`idb.transaction.${storeName}.${mode}`, async () => await new Promise((resolve, reject) => {
        const transaction = database.transaction(storeName, mode);
        const store = transaction.objectStore(storeName);
        const request = executor(store);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        transaction.onerror = () => reject(transaction.error);
    }));
};

const runCursorTransaction = async <T>(
    storeName: string,
    mode: IDBTransactionMode,
    collector: (
        store: IDBObjectStore,
        resolve: (value: T) => void,
        reject: (reason?: unknown) => void,
    ) => void,
): Promise<T> => {
    const database = await openDatabase();

    return await measureAsync(`idb.cursor.${storeName}.${mode}`, async () => await new Promise((resolve, reject) => {
        const transaction = database.transaction(storeName, mode);
        const store = transaction.objectStore(storeName);

        collector(store, resolve, reject);
        transaction.onerror = () => reject(transaction.error);
    }));
};

const identityStorageKey = (userId: string): string => `identity:${userId}`;
const deviceStorageKey = (userId: string): string => `device:${userId}`;
const backupUnlockStorageKey = (userId: string): string => `backup-unlock:${userId}`;
const threadKeyStorageKey = (userId: string, threadId: string, keyVersion: number): string =>
    `thread-key:${userId}:${threadId}:${keyVersion}`;

export const storeIdentityKeyPair = async (
    userId: string,
    record: StoredIdentityRecord,
): Promise<void> => {
    identityCache.set(userId, record);
    await runTransaction(IDENTITY_STORE, "readwrite", (store) => store.put(record, identityStorageKey(userId)));
};

export const loadIdentityKeyPair = async (userId: string): Promise<StoredIdentityRecord | null> => {
    const cached = identityCache.get(userId);
    if (cached) {
        return cached;
    }

    const record = await runTransaction<StoredIdentityRecord | undefined>(
        IDENTITY_STORE,
        "readonly",
        (store) => store.get(identityStorageKey(userId)),
    );

    if (record) {
        identityCache.set(userId, record);
    }

    return record ?? null;
};

export const storeRegisteredDevice = async (
    userId: string,
    record: RegisteredDeviceRecord,
): Promise<void> => {
    deviceCache.set(userId, record);
    await runTransaction(DEVICE_STORE, "readwrite", (store) => store.put(record, deviceStorageKey(userId)));
};

export const loadRegisteredDevice = async (userId: string): Promise<RegisteredDeviceRecord | null> => {
    const cached = deviceCache.get(userId);
    if (cached) {
        return cached;
    }

    const record = await runTransaction<RegisteredDeviceRecord | undefined>(
        DEVICE_STORE,
        "readonly",
        (store) => store.get(deviceStorageKey(userId)),
    );

    if (record) {
        deviceCache.set(userId, record);
    }

    return record ?? null;
};

export const storeBackupUnlockRecord = async <TRecord>(userId: string, record: TRecord): Promise<void> => {
    backupUnlockCache.set(userId, record);
    await runTransaction(BACKUP_UNLOCK_STORE, "readwrite", (store) => store.put(record, backupUnlockStorageKey(userId)));
};

export const loadBackupUnlockRecord = async <TRecord>(userId: string): Promise<TRecord | null> => {
    const cached = backupUnlockCache.get(userId);
    if (cached) {
        return cached as TRecord;
    }

    const record = await runTransaction<TRecord | undefined>(
        BACKUP_UNLOCK_STORE,
        "readonly",
        (store) => store.get(backupUnlockStorageKey(userId)),
    );

    if (record) {
        backupUnlockCache.set(userId, record);
    }

    return record ?? null;
};

export const deleteBackupUnlockRecord = async (userId: string): Promise<void> => {
    backupUnlockCache.delete(userId);
    await runTransaction(BACKUP_UNLOCK_STORE, "readwrite", (store) => store.delete(backupUnlockStorageKey(userId)));
};

export const storeThreadKey = async (
    userId: string,
    threadId: string,
    keyVersion: number,
    key: CryptoKey,
): Promise<void> => {
    const keyId = threadKeyStorageKey(userId, threadId, keyVersion);
    threadKeyCache.set(keyId, key);
    await runTransaction(THREAD_KEY_STORE, "readwrite", (store) => store.put(key, keyId));
};

export const loadThreadKey = async (
    userId: string,
    threadId: string,
    keyVersion: number,
): Promise<CryptoKey | null> => {
    const keyId = threadKeyStorageKey(userId, threadId, keyVersion);
    const cached = threadKeyCache.get(keyId);

    if (cached) {
        return cached;
    }

    const key = await runTransaction<CryptoKey | undefined>(
        THREAD_KEY_STORE,
        "readonly",
        (store) => store.get(keyId),
    );

    if (key) {
        threadKeyCache.set(keyId, key);
    }

    return key ?? null;
};

export const loadAllThreadKeys = async (userId: string): Promise<StoredThreadKeyRecord[]> => {
    return await runCursorTransaction(THREAD_KEY_STORE, "readonly", (store, resolve, reject) => {
        const records: StoredThreadKeyRecord[] = [];
        const prefix = `thread-key:${userId}:`;
        const request = store.openCursor();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const cursor = request.result;

            if (!cursor) {
                resolve(records);
                return;
            }

            if (typeof cursor.key === "string" && cursor.key.startsWith(prefix)) {
                const segments = cursor.key.split(":");
                const threadId = segments.slice(2, -1).join(":");
                const keyVersion = Number.parseInt(segments.at(-1) ?? "", 10);

                if (threadId && Number.isInteger(keyVersion) && keyVersion > 0) {
                    const key = cursor.value as CryptoKey;
                    threadKeyCache.set(threadKeyStorageKey(userId, threadId, keyVersion), key);
                    records.push({
                        userId,
                        threadId,
                        keyVersion,
                        key,
                    });
                }
            }

            cursor.continue();
        };
    });
};

export const clearE2eeStateForUser = async (userId: string): Promise<void> => {
    identityCache.delete(userId);
    deviceCache.delete(userId);
    backupUnlockCache.delete(userId);

    for (const key of [...threadKeyCache.keys()]) {
        if (key.startsWith(`thread-key:${userId}:`)) {
            threadKeyCache.delete(key);
        }
    }

    const database = await openDatabase();

    await measureAsync("idb.clear-user", async () => await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction(
            [IDENTITY_STORE, THREAD_KEY_STORE, DEVICE_STORE, BACKUP_UNLOCK_STORE],
            "readwrite",
        );

        const identityStore = transaction.objectStore(IDENTITY_STORE);
        const threadKeyStore = transaction.objectStore(THREAD_KEY_STORE);
        const deviceStore = transaction.objectStore(DEVICE_STORE);
        const backupUnlockStore = transaction.objectStore(BACKUP_UNLOCK_STORE);

        identityStore.delete(identityStorageKey(userId));
        deviceStore.delete(deviceStorageKey(userId));
        backupUnlockStore.delete(backupUnlockStorageKey(userId));

        const prefix = `thread-key:${userId}:`;
        const cursorRequest = threadKeyStore.openCursor();

        cursorRequest.onerror = () => reject(cursorRequest.error);
        cursorRequest.onsuccess = () => {
            const cursor = cursorRequest.result;

            if (!cursor) {
                return;
            }

            if (typeof cursor.key === "string" && cursor.key.startsWith(prefix)) {
                cursor.delete();
            }

            cursor.continue();
        };

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    }));
};
