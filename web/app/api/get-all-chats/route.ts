
import { ConnectDB, Messages, Threads, type Thread, type Message } from "@chat/shared";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";



// eg: await fetch("/api/get-all-chats)

// WILL RETURN ALL THREADS FOR THE GIVEN USERNAME , AND LAST 10 MESSAGES OF EACH THREAD !

export type GetAllChatsResponse = {
    threads: Thread[],
    messages: Message[]

} | null
export async function GET(request: NextApiRequest): Promise<NextResponse<GetAllChatsResponse>> {
    console.log("REQ", request.url);




    try {


        const session = await getServerSession(authOptions);


        if (!session?.user?.username) throw new Error("INVALID_AUTH");

        await ConnectDB();


        const messagesLimitPerThread = 10;






        const [data]: GetAllChatsResponse[] = await Threads.aggregate(
            [
                // 1) match threads where user is a participant
                {
                    $match: {
                        "particpants.username": session.user.username
                    }
                },

                // 2) collect all threads + ids
                {
                    $group: {
                        _id: null,
                        threads: { $push: "$$ROOT" },
                        threadIds: { $push: "$threadId" }
                    }
                },

                // 3) fetch last 10 messages per thread
                {
                    $lookup: {
                        from: "messages",
                        let: { tids: "$threadIds" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $in: ["$threadId", "$$tids"] }
                                }
                            },
                            {
                                $setWindowFields: {
                                    partitionBy: "$threadId",
                                    sortBy: { timestamp: -1 },
                                    output: {
                                        rn: { $documentNumber: {} }
                                    }
                                }
                            },
                            { $match: { rn: { $lte: messagesLimitPerThread } } },

                            { $sort: { threadId: 1, timestamp: 1 } },
                            {
                                $project: {
                                    _id: 0,
                                    msgId: { $toString: "$_id" },
                                    threadId: { $toString: "$threadId" },
                                    sender: 1,
                                    type: 1,
                                    content: 1,
                                    replyToMsgId: 1,
                                    readBy: 1,
                                    status: 1,
                                    timestamp: 1
                                }
                            }
                        ],
                        as: "messages"
                    }
                },

                // 4) final shape
                {
                    $project: {
                        _id: 0,
                        threads: 1,
                        messages: 1
                    }
                }
            ],
            { allowDiskUse: true }
        );


        // DATA WILL contain an object with {threads:[..], messages: [...]}
        // BOTH ARE EMPTY ARRAYS IN CASE OF NEW (or lonely) USERS!




        // VALIDATE VIA ZOD HERE (IF NEEDED)!   




        return NextResponse.json((data ?? { threads: [], messages: [] }), { status: 200 });




    }
    catch (err) {

        if (err instanceof Error) {
            console.error("[API:get-all-chats] Failed to retrieve messages and threads >> ", err.message);
        }

        return NextResponse.json(null, { status: 500 });

    }





}