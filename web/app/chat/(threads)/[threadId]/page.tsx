import MessagesViewClient from "./_components/MESSAGE_CLIENT";




export default async function MessagesView({
    params,
}: {
    params: Promise<{ threadId: string }>
}) {

    const { threadId } = await params;



    return <MessagesViewClient threadId={threadId} />
}