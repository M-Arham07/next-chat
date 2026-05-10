import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import { getProfileServer } from "@/supabase/getProfileServer";

export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        const profile = await getProfileServer();

        if (!profile) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const path = request.nextUrl.searchParams.get("path");

        if (!path) {
            return NextResponse.json({ error: "Missing path" }, { status: 400 });
        }

        const supabase = await createClient();
        const { data, error } = await supabase.storage.from("chat-media").createSignedUrl(path, 60);

        if (error) {
            throw new Error(error.message);
        }

        return NextResponse.json({ signedUrl: data.signedUrl }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to create signed url" },
            { status: 500 },
        );
    }
}
