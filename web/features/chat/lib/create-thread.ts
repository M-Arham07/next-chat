"use server";

import { getProfileServer } from "@/supabase/getProfileServer";
import { ConnectDB, Thread, ThreadType, Threads, User, UserInterface } from "@chat/shared";
import { createClient } from "@/supabase/server";


type createNewThreadFn = (params: {
    type: ThreadType
    otherParticpantUsernames: string[],
    groupName?: string,
    groupImage?: string
}) => Promise<Thread | null>


const createNewThread: createNewThreadFn = async ({ type, otherParticpantUsernames, groupName, groupImage }) => {

    try {



        const profile = await getProfileServer();

        if (!profile) throw new Error("No session found! ");



        // Remove duplicates (hence if session.username is two times, dont include ! )

        otherParticpantUsernames = [...new Set<string>(...otherParticpantUsernames, profile.username)];






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





        const supabase = await createClient();



        // prevent ghost users (like usernames that dont even exist) to join a thread! 

        // equivalent sql : SELECT * FROM USERS WHERE USERNAME IN ('M-Arham07','friend1','friend2)


        const { data: usersToAdd, error: usersError } = await supabase
            .from("profiles")
            .select("id, username, image, email")
            .in("username", otherParticpantUsernames);


        if (usersError) throw usersError;

        if ((usersToAdd ?? []).length !== otherParticpantUsernames.length) throw new Error("Ghost user was tried to be added!");



        // Check if thread b/w the same users already exists! 

        let existing: Thread | null = null;

        if (type === "direct" && otherParticpantUsernames.length === 2) {
            const { data: existingRows, error: existingError } = await supabase.rpc("search_threads", {
                p_query: otherParticpantUsernames.find(username => username !== profile.username)!,
                p_limit: 50,
            });

            if (existingError) throw existingError;

            const candidateThreadIds = (existingRows ?? [])
                .filter((row: any) => row.type === "direct")
                .map((row: any) => row.thread_id);

            if (candidateThreadIds.length > 0) {
                const { data: existingParticipants, error: participantsError } = await supabase
                    .from("thread_participants")
                    .select("thread_id, username, image, role, joined_at, left_at")
                    .in("thread_id", candidateThreadIds);

                if (participantsError) throw participantsError;

                const matchedThreadId = candidateThreadIds.find((threadId: string) => {
                    const usernames = (existingParticipants ?? [])
                        .filter((participant: any) => participant.thread_id === threadId)
                        .map((participant: any) => participant.username)
                        .sort();

                    const target = [...otherParticpantUsernames].sort();

                    return usernames.length === target.length && usernames.every((username: string, index: number) => username === target[index]);
                });

                if (matchedThreadId) {
                    const { data: existingThread, error: threadError } = await supabase
                        .from("threads")
                        .select("thread_id, type, created_by, group_name, group_image, created_at")
                        .eq("thread_id", matchedThreadId)
                        .single();

                    if (threadError) throw threadError;

                    const participants = (existingParticipants ?? [])
                        .filter((participant: any) => participant.thread_id === matchedThreadId)
                        .map((participant: any) => ({
                            username: participant.username,
                            image: participant.image,
                            role: participant.role,
                            joinedAt: participant.joined_at,
                            leftAt: participant.left_at ?? undefined,
                        }));

                    existing = {
                        threadId: existingThread.thread_id,
                        type: existingThread.type,
                        particpants: participants,
                        createdAt: existingThread.created_at,
                        createdBy: existingThread.created_by ?? undefined,
                        groupName: existingThread.group_name ?? undefined,
                        groupImage: existingThread.group_image ?? undefined,
                    } as Thread;
                }
            }
        }


        if (existing) return existing;

        // otherwise create a new thread !



        // TODO: Prevent same named groups ?? 







        // In case of Group Chat the creator (admin) of this thread will be session.user.username, as he sent the request !


        const threadId = process.env.NODE_ENV === "production" ? crypto.randomUUID() : (Math.random() * Date.now() + 1).toString();

        const newThread: Thread = {
            threadId: threadId,
            type: otherParticpantUsernames.length > 2 ? "group" : "direct",

            particpants: (usersToAdd ?? []).map((user: any) => ({
                username: user.username,
                image: user.image,
                role: type === "group" && user.username === session.user.username ? "admin" : "member",
                joinedAt: type === "group" ? new Date().toISOString() : null,
                leftAt: undefined,
            })),


            createdAt: new Date().toISOString(),

            // These fields required if type === "group"
            createdBy: type === "group" ? session.user.username! : undefined,



            // will automatically be undefined if type isnt group! 
            groupName: groupName,
            groupImage: groupImage,



        }


        // TODO : ZOD VALIDATE? 





        const { error: threadInsertError } = await supabase
            .from("threads")
            .insert({
                thread_id: newThread.threadId,
                type: newThread.type,
                created_by: type === "group" ? session.user.id : null,
                group_name: groupName ?? null,
                group_image: groupImage ?? null,
            });

        if (threadInsertError) throw threadInsertError;

        const { error: participantsInsertError } = await supabase
            .from("thread_participants")
            .insert((usersToAdd ?? []).map((user: any) => ({
                thread_id: newThread.threadId,
                user_id: user.id,
                username: user.username,
                image: user.image,
                role: type === "group" && user.username === session.user.username ? "admin" : "member",
                joined_at: type === "group" ? new Date().toISOString() : null,
                left_at: null,
            })));

        if (participantsInsertError) throw participantsInsertError;


        // finally, return the newly created thread's id! , so user is instantly routed to /chat/${threadId}


        return newThread;

    }

    catch (err) {

        console.error("[createNewThread] Failed to create thread >> ", err instanceof Error ? err.message : "");

        return null;

    }
}


