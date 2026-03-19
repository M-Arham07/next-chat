
import { NextRequest, NextResponse } from "next/server";
import { User } from "@chat/shared";
import { getProfileServer } from "@/supabase/getProfileServer";
import { createClient } from "@/supabase/server";

export async function GET(request: NextRequest): Promise<NextResponse> {

    try {

        const profile = await getProfileServer();
    

        if (!profile) throw new Error("NO_PROFILE");


        const supabase = await createClient();


        const params = request.nextUrl.searchParams;

        const username = params?.get("username")?.trim()?.toLowerCase();

        if (!username) throw new Error("No username search query");

        const { data : foundUsers, error } = await supabase.rpc("search_users", {
            p_query: username,
            p_limit: 20,
        });
        
        if(error) throw error;

        return NextResponse.json(foundUsers, { status: 200 });

    }
    catch (err) {

        console.error("[search/users (API)] failed to search for users! >> ", err instanceof Error ? err.message : "");

        return NextResponse.json([], { status: 401 });
    }

}