import type { RegisteredDeviceRecord, StoredIdentityRecord, StoredThreadKeyRecord } from "./types";

const DB_NAME = "chat-app-e2ee";
const DB_VERSION = 2;
const IDENTITY_STORE = "identity";
const THREAD_KEY_STORE = "thread-keys";
const DEVICE_STORE = "devices";

const openDatabase = async (): Promise<IDBDatabase> => {
    return await new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);

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
        };

        request.onsuccess = () => resolve(request.result);
    });
};

const runTransaction = async <T>(
    storeName: string,
    mode: IDBTransactionMode,
    executor: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> => {
    const database = await openDatabase();

    return await new Promise((resolve, reject) => {
        const transaction = database.transaction(storeName, mode);
        const store = transaction.objectStore(storeName);
        const request = executor(store);

        request.onerror = () => {
            database.close();
            reject(request.error);
        };

        request.onsuccess = () => resolve(request.result);

        transaction.oncomplete = () => database.close();
        transaction.onerror = () => {
            database.close();
            reject(transaction.error);
        };
    });
};

const runCursorTransaction = async <T>(
    storeName: string,
    mode: IDBTransactionMode,
    collector: (store: IDBObjectStore, resolve: (value: T) => void, reject: (reason?: unknown) => void, database: IDBDatabase) => void,
): Promise<T> => {
    const database = await openDatabase();

    return await new Promise((resolve, reject) => {
        const transaction = database.transaction(storeName, mode);
        const store = transaction.objectStore(storeName);

        collector(
            store,
            (value) => resolve(value),
            (reason) => reject(reason),
            database,
        );

        transaction.oncomplete = () => database.close();
        transaction.onerror = () => {
            database.close();
            reject(transaction.error);
        };
    });
};

const identityStorageKey = (userId: string): string => `identity:${userId}`;
const deviceStorageKey = (userId: string): string => `device:${userId}`;
const threadKeyStorageKey = (userId: string, threadId: string, keyVersion: number): string =>
    `thread-key:${userId}:${threadId}:${keyVersion}`;

export const storeIdentityKeyPair = async (
    userId: string,
    record: StoredIdentityRecord,
): Promise<void> => {
    await runTransaction(IDENTITY_STORE, "readwrite", (store) => store.put(record, identityStorageKey(userId)));
};

export const loadIdentityKeyPair = async (
    userId: string,
): Promise<StoredIdentityRecord | null> => {
    const record = await runTransaction<StoredIdentityRecord | undefined>(
        IDENTITY_STORE,
        "readonly",
        (store) => store.get(identityStorageKey(userId)),
    );

    return record ?? null;
};

export const storeRegisteredDevice = async (
    userId: string,
    record: RegisteredDeviceRecord,
): Promise<void> => {
    await runTransaction(DEVICE_STORE, "readwrite", (store) => store.put(record, deviceStorageKey(userId)));
};

export const loadRegisteredDevice = async (userId: string): Promise<RegisteredDeviceRecord | null> => {
    const record = await runTransaction<RegisteredDeviceRecord | undefined>(
        DEVICE_STORE,
        "readonly",
        (store) => store.get(deviceStorageKey(userId)),
    );

    return record ?? null;
};

export const storeThreadKey = async (
    userId: string,
    threadId: string,
    keyVersion: number,
    key: CryptoKey,
): Promise<void> => {
    await runTransaction(
        THREAD_KEY_STORE,
        "readwrite",
        (store) => store.put(key, threadKeyStorageKey(userId, threadId, keyVersion)),
    );
};

export const loadThreadKey = async (
    userId: string,
    threadId: string,
    keyVersion: number,
): Promise<CryptoKey | null> => {
    const key = await runTransaction<CryptoKey | undefined>(
        THREAD_KEY_STORE,
        "readonly",
        (store) => store.get(threadKeyStorageKey(userId, threadId, keyVersion)),
    );

    return key ?? null;
};

export const loadAllThreadKeys = async (userId: string): Promise<StoredThreadKeyRecord[]> => {
    return await runCursorTransaction(THREAD_KEY_STORE, "readonly", (store, resolve, reject, database) => {
        const records: StoredThreadKeyRecord[] = [];
        const prefix = `thread-key:${userId}:`;
        const request = store.openCursor();

        request.onerror = () => {
            database.close();
            reject(request.error);
        };

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
                    records.push({
                        userId,
                        threadId,
                        keyVersion,
                        key: cursor.value as CryptoKey,
                    });
                }
            }

            cursor.continue();
        };
    });
};

export const clearE2eeStateForUser = async (userId: string): Promise<void> => {
    const database = await openDatabase();

    await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction(
            [IDENTITY_STORE, THREAD_KEY_STORE, DEVICE_STORE],
            "readwrite",
        );

        const identityStore = transaction.objectStore(IDENTITY_STORE);
        const threadKeyStore = transaction.objectStore(THREAD_KEY_STORE);
        const deviceStore = transaction.objectStore(DEVICE_STORE);

        identityStore.delete(identityStorageKey(userId));
        deviceStore.delete(deviceStorageKey(userId));

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

        transaction.oncomplete = () => {
            database.close();
            resolve();
        };

        transaction.onerror = () => {
            database.close();
            reject(transaction.error);
        };
    });
};
