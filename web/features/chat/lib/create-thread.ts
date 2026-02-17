"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ConnectDB, Thread, ThreadType, Threads, User, UserInterface } from "@chat/shared";
import { getServerSession } from "next-auth";

type createNewThreadFn = (params: {
    type: ThreadType
    otherParticpantUsernames: string[],
    groupName?: string,
    groupImage?: string
}) => Promise<Thread | null>



export const createNewThread: createNewThreadFn = async ({ type, otherParticpantUsernames, groupName, groupImage }) => {

    try {



        const session = await getServerSession(authOptions);

        if (!session) throw new Error("No session found! ");

        otherParticpantUsernames = [...otherParticpantUsernames, session.user.username!];

        // Remove duplicates (hence if session.username is two times, dont include ! )

        otherParticpantUsernames = [...new Set<string>(otherParticpantUsernames)];


        



        // DO NOT ALLOW TO CREATE if type is private and particpant length is less than 2

        if (type === "direct" && otherParticpantUsernames.length < 2) {
            throw new Error("For Direct chat, particpant length must be greater than 2 ! ");
        }




        if (type === "group") {


            // DO NOT ALLOW IF GROUP NAME OR GROUP IMAGE NOT EXIST
            if (!groupName || !groupImage) {
                throw new Error("Group image or Group name is missing! ");
            }


            // DO NOT ALLOW TO CREATE if type is group and total particpant length is less than 3
            if (otherParticpantUsernames.length < 3) {
                throw new Error("For Group chat, particpant length must be greater than 3 ! ");
            }


        }





        await ConnectDB();



        // prevent ghost users (like usernames that dont even exist) to join a thread! 

        // equivalent sql : SELECT * FROM USERS WHERE USERNAME IN ('M-Arham07','friend1','friend2)


        const usersToAdd: UserInterface[] = await User.find({
            username: { $in: otherParticpantUsernames }
        });


        if (usersToAdd.length !== otherParticpantUsernames.length) throw new Error("Ghost user was tried to be added!");



        // Check if thread b/w the same users already exists! 

        const existing: Thread = await Threads.findOne({
            $and: [
                { "particpants.username": { $all: otherParticpantUsernames } },
                { particpants: { $size: otherParticpantUsernames.length } }
            ]
        }).lean();

   
        if (existing) return JSON.parse(JSON.stringify(existing));

        // otherwise create a new thread !



        // TODO: Prevent same named groups ?? 







        // In case of Group Chat the creator (admin) of this thread will be session.user.username, as he sent the request !


        const newThread: Thread = {
            threadId: process.env.NODE_ENV === "production" ? crypto.randomUUID() : (Math.random() * Date.now() + 1).toString(),
            type: otherParticpantUsernames.length > 2 ? "group" : "direct",

            particpants: usersToAdd.map(user => ({
                username: user.username,
                image: user.image,
                role: type === "group" && user.username === session.user.username ? "admin" : "member",
                joinedAt: type === "group" ? new Date() : null,
                leftAt: undefined,
            })),


            createdAt: new Date(),

            // These fields required if type === "group"
            createdBy: type === "group" ? session.user.username! : undefined,



            // will automatically be undefined if type isnt group! 
            groupName: groupName,
            groupImage: groupImage,



        }


        // TODO : ZOD VALIDATE? 





        await Threads.create(newThread);


        // finally, return the newly created thread's id! , so user is instantly routed to /chat/${threadId}


        return newThread;

    }

    catch (err) {

        console.error("[createNewThread] Failed to create thread >> ", err instanceof Error ? err.message : "");

        return null;

    }
}

