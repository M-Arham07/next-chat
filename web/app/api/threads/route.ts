import { NextRequest, NextResponse } from "next/server";
import { CreateThreadSchemaBody, CreateThreadResponseType } from "@chat/shared/schema";
import { createClient } from "@/supabase/server";
import { getProfileServer } from "@/supabase/getProfileServer";
import type { Thread } from "@chat/shared";

export async function POST(
    request: NextRequest
): Promise<NextResponse<CreateThreadResponseType>> {
    try {

        // ── 1. Authenticate ────────────────────────────────────────────────
        const profile = await getProfileServer();

        if (!profile) {
            return NextResponse.json(
                { success: false, error: "No session found!" },
                { status: 401 }
            );
        }

        // ── 2. Parse & validate body ───────────────────────────────────────
        const body = await request.json();
        const parsed = CreateThreadSchemaBody.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: "Invalid request data" },
                { status: 400 }
            );
        }

        const { type, otherParticipantUsernames, groupName, groupImage } = parsed.data;

        // Always include the calling user; remove duplicates
        const participants = [
            ...new Set([...otherParticipantUsernames, profile.username]),
        ];


        // DO NOT ALLOW TO CREATE if type is private and particpant length is less than 2

        if (type === "direct" && participants.length < 2) {
            return NextResponse.json(
                { success: false, error: "For Direct chat, participant length must be greater than 1!" },
                { status: 400 }
            );
        }




        if (type === "group") {
            if (!groupName || !groupImage) {

                // DO NOT ALLOW TO CREATE if type is group and groupName or groupImage is missing
                return NextResponse.json(
                    { success: false, error: "Group image or Group name is missing!" },
                    { status: 400 }
                );
            }
            if (participants.length < 3) {

                // DO NOT ALLOW TO CREATE if type is group and particpant length is less than 3
                return NextResponse.json(
                    { success: false, error: "For Group chat, participant length must be greater than 2!" },
                    { status: 400 }
                );
            }
        }

        const supabase = await createClient();

    
        // prevent ghost users (like usernames that dont even exist) to join a thread! 
        
        const { data: usersToAdd, error: usersError } = await supabase
            .from("profiles")
            .select("username, image")
            .in("username", participants);

        if (usersError) throw new Error(usersError.message);

        if (!usersToAdd || usersToAdd.length !== participants.length) {
            return NextResponse.json(
                { success: false, error: "Ghost user was tried to be added!" },
                { status: 400 }
            );
        }

        // ── 5. For direct: return existing thread if one already exists ────
        if (type === "direct") {
            const { data: userThreads, error: checkErr } = await supabase
                .from("participants")
                .select("thread_id")
                .eq("username", profile.username);

            if (checkErr) throw new Error(checkErr.message);

            let existingThread: Thread | null = null;

            if (userThreads && userThreads.length > 0) {
                const threadIds = userThreads.map((t: any) => t.thread_id);

                // Fetch all participants for those threads
                const { data: threadParticipants, error: tcErr } = await supabase
                    .from("participants")
                    .select("thread_id, username")
                    .in("thread_id", threadIds);

                if (tcErr) throw new Error(tcErr.message);

                // Group by thread_id
                const threadsMap = new Map<string, string[]>();
                for (const pt of threadParticipants || []) {
                    if (!threadsMap.has(pt.thread_id)) {
                        threadsMap.set(pt.thread_id, []);
                    }
                    threadsMap.get(pt.thread_id)!.push(pt.username);
                }

                // Find a thread with the exact same set of participants
                for (const [tId, tUsers] of threadsMap.entries()) {
                    if (
                        tUsers.length === participants.length &&
                        participants.every((u) => tUsers.includes(u))
                    ) {
                        // Fetch the full thread row to return it
                        const { data: existingRow, error: fetchErr } = await supabase
                            .from("threads")
                            .select("*")
                            .eq("id", tId)
                            .single();

                        if (fetchErr) throw new Error(fetchErr.message);

                        existingThread = {
                            threadId: existingRow.id,
                            type: existingRow.type,
                            createdAt: new Date(existingRow.created_at),
                            createdBy: existingRow.created_by ?? undefined,
                            groupName: existingRow.group_name ?? undefined,
                            groupImage: existingRow.group_image ?? undefined,
                            participants: usersToAdd.map((u) => ({
                                username: u.username,
                                image: u.image,
                                role: "member" as const,
                                joinedAt: null,
                                leftAt: null,
                            })),
                        };
                        break;
                    }
                }
            }

            if (existingThread) {
                return NextResponse.json({ success: true, data: existingThread }, { status: 200 });
            }
        }

        // ── 6. Create the new thread row ──────────────────────────────────
        const { data: insertedThread, error: threadError } = await supabase
            .from("threads")
            .insert({
                type,
                created_by: type === "group" ? profile.username : null,
                group_name: groupName ?? null,
                group_image: groupImage ?? null,
            })
            .select("id, type, created_at, created_by, group_name, group_image")
            .single();

        if (threadError) throw new Error(threadError.message);

        const newThreadId = insertedThread.id;

        // ── 7. Insert participants ─────────────────────────────────────────
        const now = new Date().toISOString();

        const participantsToInsert = participants.map((username) => ({
            thread_id: newThreadId,
            username,
            role: type === "group" && username === profile.username ? "admin" : "member",
            joined_at: type === "group" ? now : null,
            left_at: null,
        }));

        const { error: partError } = await supabase
            .from("participants")
            .insert(participantsToInsert);

        if (partError) throw new Error(partError.message);

        // ── 8. Build and return the full Thread-shaped response ───────────
        const newThread: Thread = {
            threadId: newThreadId,
            type: insertedThread.type,
            createdAt: new Date(insertedThread.created_at),
            createdBy: insertedThread.created_by ?? undefined,
            groupName: insertedThread.group_name ?? undefined,
            groupImage: insertedThread.group_image ?? undefined,
            participants: participantsToInsert.map((p) => ({
                username: p.username,
                image: usersToAdd.find((u) => u.username === p.username)?.image ?? "",
                role: p.role as "admin" | "member",
                joinedAt: p.joined_at ? new Date(p.joined_at) : null,
                leftAt: null,
            })),
        };

        return NextResponse.json({ success: true, data: newThread }, { status: 201 });

    } catch (err) {
        console.error(
            "[API:create-thread] Failed to create thread >> ",
            err instanceof Error ? err.message : String(err)
        );
        return NextResponse.json(
            { success: false, error: "Failed to create thread!" },
            { status: 500 }
        );
    }
}
