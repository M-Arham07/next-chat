import { NextRequest, NextResponse } from "next/server";
import { Threads } from "@chat/shared";
import { getProfileServer } from "@/supabase/getProfileServer";
import { createClient } from "@/supabase/server";

export async function GET(request: NextRequest): Promise<NextResponse> {

    try {


        const profile = await getProfileServer();

        if(!profile) throw new Error("NO_PROFILE");

        const supabase = await createClient();


        const params = request.nextUrl.searchParams;

        const groupName = params?.get("group_name")?.trim()?.toLowerCase();

        if (!groupName) throw new Error("No group name search query");


        const { data : foundThreads, error } = await supabase.rpc("search_threads", {
            p_query: groupName,
            p_limit: 20,
        });


        if(error) throw error;

        return NextResponse.json(foundThreads, { status: 200 });

    }
    catch (err) {

        console.error("[search/groups (API)] failed to search for threads! >> ", err instanceof Error ? err.message : "");

        return NextResponse.json([], { status: 401 });
    }

}