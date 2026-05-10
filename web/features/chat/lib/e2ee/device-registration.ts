import type { DeviceIdentity } from "@chat/shared";
import { deviceIdentitySchema } from "@chat/shared/schema";
import { getOrCreateIdentity } from "./identity";
import { loadRegisteredDevice, storeRegisteredDevice } from "./storage";

const DEFAULT_DEVICE_LABEL = "Web Browser";

export const ensureRegisteredDevice = async (userId: string): Promise<DeviceIdentity> => {
    const existingDevice = await loadRegisteredDevice(userId);

    if (existingDevice) {
        return {
            deviceId: existingDevice.deviceId,
            userId: existingDevice.userId,
            deviceLabel: existingDevice.deviceLabel,
            publicKey: existingDevice.publicKey,
            keyAlgorithm: existingDevice.keyAlgorithm,
            revokedAt: null,
        };
    }

    const identity = await getOrCreateIdentity(userId);
    const response = await fetch("/api/e2ee/device/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            deviceLabel: DEFAULT_DEVICE_LABEL,
            publicKey: identity.publicKeyJwk,
            keyAlgorithm: "ECDH-P256",
        }),
    });

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

    return {
        ...json,
        publicKey: json.publicKey as JsonWebKey,
    };
};
