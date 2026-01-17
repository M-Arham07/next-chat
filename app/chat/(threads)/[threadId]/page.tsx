type ChatPageParams = {
    threadId: string
}

export default async function ChatPage({ params }: { params: ChatPageParams }) {

    const awaitedParams = await params;


    return <>

        {/* MOBILE */}
        <div className="md:hidden h-screen">
            CHAT mobile {awaitedParams?.threadId}
        </div>

        {/* DESKTOP */}
        <div className="hidden md:block h-full">
            CHAT PC {awaitedParams?.threadId}
        </div>
    </>
}