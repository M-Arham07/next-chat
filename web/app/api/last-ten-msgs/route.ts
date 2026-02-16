import { ConnectDB, Message, Messages, Threads } from "@chat/shared";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";



export type LastTenMsgsResponse = {
    messages: Message[]
}

export async function GET(request: NextRequest): Promise<NextResponse<LastTenMsgsResponse>> {

    try {

       

        const session = await getServerSession(authOptions);

        if (!session?.user?.username) throw new Error("No session found !");


        const threadId = request.nextUrl.searchParams.get("threadId") || "";
        console.log(request.nextUrl.searchParams.get("skip"))
        const skipOffset = parseInt(request.nextUrl.searchParams.get("skip") ?? "");

          

        


        if (!threadId) throw new Error("No threadId provided !");
        if (typeof skipOffset !== "number" || skipOffset < 0) throw new Error("No skip offset provided !");


      


        await ConnectDB();




        const isFound = await Threads.distinct("threadId",{
            threadId: threadId,
            "particpants.username": session.user.username
        });



        if (!isFound) throw new Error(`${session.user.username} is not in thread ${threadId}`);







        // if user exists in this thread, get the messages: 

   


        const msgs: Message[] = await Messages.find({

            threadId: threadId

        }).sort({ timestamp: 1 }).skip(skipOffset).limit(10).lean();




        return NextResponse.json({ messages: msgs }, { status: 200 });


    }

    catch (err) {


        console.error("[last-ten-msgs (API)] Failed to get messages >>", err instanceof Error ? err.message : "");


        return NextResponse.json({ messages: [] }, { status: 500 });


    }




}