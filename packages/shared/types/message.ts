
type MessageContentType = "text" | "image" | "voice" | "document";


interface Message {
    msgId: string,
    threadId: string, // associated thread ! 
    sender: string, // sender username
    type: MessageContentType,
    content: string, // link to the content!,
    // TODO : ADD REACTIONS ETC!
    reactions?:string,
    readBy?:string,
    timestamp:Date
}