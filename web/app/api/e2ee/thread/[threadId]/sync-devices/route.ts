import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/supabase/server";
import { getProfileServer } from "@/supabase/getProfileServer";

const syncDevicesSchema = z.object({
    creatorDeviceId: z.string().uuid(),
    keyVersion: z.number().int().positive(),
    participantWrappedKeys: z.array(z.object({
        deviceId: z.string().uuid(),
        wrappedKey: z.string(),
        iv: z.string(),
        senderPublicKey: z.record(z.string(), z.unknown()),
        algorithm: z.literal("ECDH-P256/AES-GCM"),
    })),
});

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ threadId: string }> },
): Promise<NextResponse> {
    try {
        const profile = await getProfileServer();

        if (!profile) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { threadId } = await params;
        const body = syncDevicesSchema.parse(await request.json());
        const supabase = await createClient();

        const { data, error } = await supabase.rpc("sync_thread_e2ee_devices", {
            p_thread_id: threadId,
            p_key_version: body.keyVersion,
            p_creator_device_id: body.creatorDeviceId,
            p_participant_wrapped_keys: body.participantWrappedKeys,
        });

        if (error) {
            throw new Error(error.message);
        }

        return NextResponse.json({ keyVersion: data }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to sync thread devices" },
            { status: 500 },
        );
    }
}
