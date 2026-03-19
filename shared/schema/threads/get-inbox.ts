import { z } from "zod";
import { threadSchema } from "../threads/threads";
import { messageSchema } from "../message";

export const GetInboxResponseSchema = z.object({
    threads: z.array(threadSchema),
    messages: z.array(messageSchema),
}).nullable();

export type GetInboxResponse = z.infer<typeof GetInboxResponseSchema>;