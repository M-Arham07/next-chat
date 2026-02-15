"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ConnectDB, Thread, Threads } from "@chat/shared";
import { getServerSession } from "next-auth";

type createNewThreadFn = (params: {
    type: "private" | "thread",
    particpantUsernames: Set<string>
}) => Promise<string | null>



const ErrorMap = {
    "ALREADY_EXIST": "The user"
}

export const createNewThread: createNewThreadFn = async ({ type, particpantUsernames }) => {

    try {



        const session = await getServerSession(authOptions);

        if (!session) throw new Error("No session found! ");


        // THE partcipantUsernames ARRAY MUST INCLUDE THE SESSION.USER.USERNAME WHEN SENT FROM FRONTEND! 


        // Remove duplicates here also

        particpantUsernames = new Set<string>(particpantUsernames);


        if (!particpantUsernames.has(session.user.username!)) {
            throw new Error("Unknown person tried to create thread ! ");
        }




        await ConnectDB();



        // Check if thread b/w the same users already exists! 

        const [existing]: string[] = await Threads.distinct("threadId", {
            $and: [
                { "particpantUsernames.username": { $all: particpantUsernames } },
                { particpantUsernames: { $size: particpantUsernames.size } }
            ]
        }).lean();

        if (existing) return existing;



        // otherwise create a new thread !



        const newThread: Thread = {
            threadId: process.env.NODE_ENV === "production" ? crypto.randomUUID() : (Math.random() * Date.now() + 1).toString(),
            type: particpantUsernames.size > 2 ? "group" : "direct",
            particpants
           

        }










    }

    catch (err) {

    }
}

