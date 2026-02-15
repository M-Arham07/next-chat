import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import { Threads } from "@chat/shared";

export async function GET(request: NextRequest): Promise<NextResponse> {

    try {

        const session = await getServerSession(authOptions);

        if (!session) throw new Error("No session found");


        const params = request.nextUrl.searchParams;

        const groupName = params?.get("group_name")?.trim()?.toLowerCase();

        if (!groupName) throw new Error("No group name search query");


        // WILL LIMIT (WHEN IT SCALES) IF NEEDED? 


        // idk how this regex work lol
        const escaped = groupName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        const foundThreads = await Threads.find({ groupName: { $regex: escaped, $options: "i" } }).lean();



        return NextResponse.json(foundThreads, { status: 200 });

    }
    catch (err) {

        console.error("[search/groups (API)] failed to search for threads! >> ", err instanceof Error ? err.message : "");

        return NextResponse.json([], { status: 401 });
    }

}