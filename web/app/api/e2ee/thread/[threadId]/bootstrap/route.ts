import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import { getProfileServer } from "@/supabase/getProfileServer";
import { threadBootstrapSchema } from "@chat/shared/schema";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ threadId: string }> },
): Promise<NextResponse> {
    try {
        const profile = await getProfileServer();

        if (!profile) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { threadId } = await params;
        const deviceId = request.nextUrl.searchParams.get("deviceId");
        const keyVersionParam = request.nextUrl.searchParams.get("keyVersion");
        const keyVersion = keyVersionParam ? Number.parseInt(keyVersionParam, 10) : null;

        if (!threadId || !deviceId) {
            return NextResponse.json({ error: "Missing threadId or deviceId" }, { status: 400 });
        }

        if (keyVersionParam && (!Number.isInteger(keyVersion) || (keyVersion as number) <= 0)) {
            return NextResponse.json({ error: "Invalid keyVersion" }, { status: 400 });
        }

        const supabase = await createClient();
        const { data, error } = await supabase.rpc("get_thread_bootstrap_for_version", {
            p_thread_id: threadId,
            p_device_id: deviceId,
            p_key_version: keyVersion,
        });

        if (error) {
            throw new Error(error.message);
        }

        if (!data) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const parsed = threadBootstrapSchema.parse(data);
        return NextResponse.json(parsed, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to load bootstrap" },
            { status: 500 },
        );
    }
}
