import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/supabase/server";
import { getProfileServer } from "@/supabase/getProfileServer";
import { deviceIdentitySchema } from "@chat/shared/schema";

const registerDeviceSchema = z.object({
    deviceLabel: z.string().min(1),
    publicKey: z.record(z.string(), z.unknown()),
    keyAlgorithm: z.string().default("ECDH-P256"),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const profile = await getProfileServer();

        if (!profile) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = registerDeviceSchema.parse(await request.json());
        const supabase = await createClient();

        const { data, error } = await supabase.rpc("register_device", {
            p_device_label: body.deviceLabel,
            p_public_key: body.publicKey,
            p_key_algorithm: body.keyAlgorithm,
        });

        if (error) {
            throw new Error(error.message);
        }

        const parsed = deviceIdentitySchema.parse({
            deviceId: data.device_id,
            userId: data.user_id,
            deviceLabel: data.device_label,
            publicKey: data.public_key,
            keyAlgorithm: data.key_algorithm,
            revokedAt: data.revoked_at,
        });

        return NextResponse.json(parsed, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to register device" },
            { status: 500 },
        );
    }
}
