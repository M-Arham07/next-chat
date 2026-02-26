import { ConnectDB, Threads, type Thread } from "@chat/shared";
import MessagesViewClient from "./_components/message-view-client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { notFound } from "next/navigation";


export default async function MessagesView({ params }: { params: Promise<{ threadId: string }> }) {

    const session = await getServerSession(authOptions);

    const { threadId } = await params;
    const foundThread: Thread = await Threads.findOne({ threadId: threadId }).lean();

    if(!foundThread || !foundThread?.particpants?.find(p=> p.username === session!.user.username!)){

        return notFound();

    }

    
    return <MessagesViewClient threadId={threadId} />
}