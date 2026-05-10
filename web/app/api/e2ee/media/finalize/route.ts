import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/supabase/server";
import { getProfileServer } from "@/supabase/getProfileServer";

const mediaFinalizeSchema = z.object({
    mediaId: z.string().uuid(),
    msgId: z.string(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const profile = await getProfileServer();

        if (!profile) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = mediaFinalizeSchema.parse(await request.json());
        const supabase = await createClient();

        const { error } = await supabase
            .from("media_objects")
            .update({ msg_id: body.msgId })
            .eq("media_id", body.mediaId)
            .is("msg_id", null);

        if (error) {
            throw new Error(error.message);
        }

        return NextResponse.json({ ok: true }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to finalize encrypted media" },
            { status: 500 },
        );
    }
}
