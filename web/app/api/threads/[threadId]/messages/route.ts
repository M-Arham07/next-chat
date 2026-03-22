import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import { getProfileServer } from "@/supabase/getProfileServer";
import { Message } from "@chat/shared";


export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ threadId: string }> }
): Promise<NextResponse<{ messages: Message[] } | { error: string }>> {

    
    try {
        // ── Auth ──────────────────────────────────────────────────────────
        const profile = await getProfileServer();
        if (!profile) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // ── Path param ────────────────────────────────────────────────────
        const { threadId } = await params;
        if (!threadId) {
            return NextResponse.json({ error: "Missing threadId" }, { status: 400 });
        }

        // ── Query params ──────────────────────────────────────────────────
        const { searchParams } = new URL(request.url);

        const limit = Math.min(
            parseInt(searchParams.get("limit") ?? "20", 10),
            50
        );

        // Parse compound cursor ─ format: "{timestamp}_{msgId}"
        // We split on the FIRST underscore only so that UUIDs containing
        // underscores (if any) stay intact. ISO timestamps never contain '_'.
        const beforeRaw = searchParams.get("before");
        let beforeTimestamp: string | null = null;
        let beforeMsgId: string | null = null;

        if (beforeRaw) {
            const separatorIdx = beforeRaw.indexOf("_");
            if (separatorIdx !== -1) {
                beforeTimestamp = beforeRaw.slice(0, separatorIdx);
                beforeMsgId = beforeRaw.slice(separatorIdx + 1);
            }
            // If the cursor is malformed (no underscore), ignore it and
            // return the latest messages – a safe fallback.
        }

        // ── Supabase query ────────────────────────────────────────────────
        const supabase = await createClient();

        // Verify the requesting user is actually a participant of this thread
        // to prevent unauthorised reads.

        // (WILL USE SUPABASE POLICY INSTEAD! )



        // const { data: membership, error: membershipError } = await supabase
        //     .from("thread_participants")
        //     .select("thread_id")
        //     .eq("thread_id", threadId)
        //     .eq("", profile.id)
        //     .maybeSingle();

        // if (membershipError) {
        //     throw new Error(membershipError.message);
        // }

        // if (!membership) {
        //     return NextResponse.json(
        //         { error: "Forbidden: you are not a participant of this thread" },
        //         { status: 403 }
        //     );
        // }

        // Build the message query
        let query = supabase
            .from("messages")
            .select()
            .eq("thread_id", threadId)
            .order("timestamp", { ascending: false })   // newest first from DB
            .order("msg_id",    { ascending: false })   // tie-break by id
            .limit(limit);

        if (beforeTimestamp && beforeMsgId) {
            // Fetch rows that are strictly OLDER than the cursor.
            // Primary sort key: timestamp < beforeTimestamp
            // Tie-break: same timestamp but msg_id < beforeMsgId (lexicographic)
            //
            // Supabase/PostgREST exposes this via the `or` filter:
            //   (timestamp < T) OR (timestamp = T AND msg_id < id)
            query = query.or(
                `timestamp.lt.${beforeTimestamp},and(timestamp.eq.${beforeTimestamp},msg_id.lt.${beforeMsgId})`
            );
        }

        const { data, error } = await query;

        if (error) {
            throw new Error(error.message);
        }

        // Map snake_case DB columns → camelCase Message type
        // Also flip the array so the client receives oldest → newest.
        const messages: Message[] = (data ?? [])
            .reverse()
            .map((row) => ({
                msgId:        row.msg_id,
                threadId:     row.thread_id,
                sender:       row.sender,
                type:         row.type,
                content:      row.content,
                replyToMsgId: row.reply_to_msg_id ?? undefined,
                readBy:       row.read_by ?? undefined,
                status:       row.status,
                timestamp:    row.timestamp,
            }));

        return NextResponse.json({ messages }, { status: 200 });

    } catch (err) {
        console.error("[API:thread-messages] Error:", err instanceof Error ? err.message : err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
