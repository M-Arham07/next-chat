import MessagesViewClient from "./_components/message-view-client";
import { notFound } from "next/navigation";
import { createClient } from "@/supabase/server";
import { getProfileServer } from "@/supabase/getProfileServer";


export default async function MessagesView({ params }: { params: Promise<{ threadId: string }> }) {


    const { threadId } = await params;

    // will not be null as it has passed middleware! 
    const profile = await getProfileServer()!;

    const supabase = await createClient();



    const foundThreadId = await supabase
        .from("thread_participants")
        .select("threadId")
        .eq("thread_id", threadId)
        .eq("participant_id", profile!.id)
        .maybeSingle();

    if(!foundThreadId) return notFound();
    


    return <MessagesViewClient threadId={threadId} />
}