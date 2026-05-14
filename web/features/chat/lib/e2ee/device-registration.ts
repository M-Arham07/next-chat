import type { DeviceIdentity } from "@chat/shared";
import { deviceIdentitySchema } from "@chat/shared/schema";
import { measureAsync } from "./debug";
import { getOrCreateIdentity } from "./identity";
import { loadRegisteredDevice, storeRegisteredDevice } from "./storage";

const DEFAULT_DEVICE_LABEL = "Web Browser";
const deviceRuntimeCache = new Map<string, DeviceIdentity>();

export const ensureRegisteredDevice = async (userId: string): Promise<DeviceIdentity> => {
    const cached = deviceRuntimeCache.get(userId);
    if (cached) {
        return cached;
    }

    const existingDevice = await loadRegisteredDevice(userId);

    if (existingDevice) {
        const hydrated = {
            deviceId: existingDevice.deviceId,
            userId: existingDevice.userId,
            deviceLabel: existingDevice.deviceLabel,
            publicKey: existingDevice.publicKey,
            keyAlgorithm: existingDevice.keyAlgorithm,
            revokedAt: null,
        };
        deviceRuntimeCache.set(userId, hydrated);
        return hydrated;
    }

    const identity = await getOrCreateIdentity(userId);
    const response = await measureAsync("network.device.register", async () => await fetch("/api/e2ee/device/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            deviceLabel: DEFAULT_DEVICE_LABEL,
            publicKey: identity.publicKeyJwk,
            keyAlgorithm: "ECDH-P256",
        }),
    }));

    if (!response.ok) {
        throw new Error("Failed to register encrypted device");
    }

    const json = deviceIdentitySchema.parse(await response.json());

    await storeRegisteredDevice(userId, {
        deviceId: json.deviceId,
        userId: json.userId,
        deviceLabel: json.deviceLabel,
        publicKey: json.publicKey as JsonWebKey,
        keyAlgorithm: json.keyAlgorithm,
    });

    const created = {
        ...json,
        publicKey: json.publicKey as JsonWebKey,
    };
    deviceRuntimeCache.set(userId, created);
    return created;
};
