import MessagesViewClient from "./_components/message-view-client";

export default async function MessagesView({ params }: { params: Promise<{ threadId: string }> }){

    const {threadId} = await params;


    return <MessagesViewClient threadId={threadId} />
}