import { ChatAppProvider } from "@/features/chat/hooks/use-chat-app";


export default function ThreadsLayout({ children }: { children: React.ReactNode }) {


    return <ChatAppProvider>{children}</ChatAppProvider>




};

