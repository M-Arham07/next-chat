import { z } from "zod";

export const messageSchema = z.object({
    msgId: z.string(),
    threadId: z.string(),
    sender: z.string(),
    type: z.enum(["text", "image", "video", "voice", "document", "deleted"]),
    content: z.string(),
    replyToMsgId: z.string().optional(),
    readBy: z.string().optional(),
    status: z.enum(["sending", "sent", "failed"]),
    timestamp: z.string()
})
