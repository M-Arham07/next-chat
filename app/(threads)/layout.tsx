import { MessagesProvider } from "@/features/chat/hooks/use-messages";

export default function ThreadLayout({ children }: { children: React.ReactNode }) {


    return <MessagesProvider> {children} </MessagesProvider>

}

