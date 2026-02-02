
export type MessageContentType = "text" | "image" | "voice" | "document" | "deleted";
export type MessageStatusType = "sending" | "sent" | "failed"

export interface Message {
    msgId: string,
    threadId: string, // associated thread ! 
    sender: string, // sender username
    type: MessageContentType,
    content: string, // link to the content!,
    replyToMsgId?: string, // if this msg is a reply to another message
    readBy?: string, // string of usernames
    status: MessageStatusType
    timestamp: string
}