export default function ChatPage({ params  }) {



    return <>

        {/* MOBILE */}
        <div className="md:hidden h-screen">
            CHAT mobile {params.id}
        </div>

        {/* DESKTOP */}
        <div className="hidden md:block h-full">
            CHAT PC {params.id}
        </div>
    </>
}