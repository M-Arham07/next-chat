import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import { User } from "@chat/shared";

export async function GET(request: NextRequest): Promise<NextResponse> {

    try {

        const session = await getServerSession(authOptions);

        if (!session) throw new Error(" No session found");


        const params = request.nextUrl.searchParams;

        const username = params?.get("username")?.trim()?.toLowerCase();

        if (!username) throw new Error("No username search query");


        // WILL LIMIT (WHEN IT SCALES) IF NEEDED? 


        // idk how this regex work lol
        const escaped = username.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        const foundUsers = await User.find({ username: { $regex: escaped, $options: "i" } }).lean();

        console.log("FOUND USER RES", foundUsers)



        return NextResponse.json(foundUsers, { status: 200 });

    }
    catch (err) {

        console.error("[search/users (API)] failed to search for users! >> ", err instanceof Error ? err.message : "");

        return NextResponse.json([], { status: 401 });
    }

}