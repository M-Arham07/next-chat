
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import { getProfileServer } from "@/supabase/getProfileServer";
import { GetInboxResponse } from "@chat/shared/schema";



export async function GET(
    request: NextRequest
): Promise<NextResponse<GetInboxResponse | null>> {
   

    try {

        const profile = await getProfileServer();

        if (!profile) {
            throw new Error("INVALID_AUTH");
        }
   

        const supabase = await createClient();

        const { data, error } = await supabase.rpc("get_inbox", {
            p_profile_id: profile.id,
            p_messages_limit: 10
        });
  
      
        if (error) throw new Error(error.message)

        return NextResponse.json(
            (data ?? { threads: [], messages: [] }) as NonNullable<GetInboxResponse>,
            { status: 200 }
        );
    } catch (err) {
        if (err instanceof Error) {
            console.error(
                "[API:get-all-chats] Failed to retrieve messages and threads >> ",
                err.message
            );
        }

        return NextResponse.json(null, { status: 500 });
    }
}