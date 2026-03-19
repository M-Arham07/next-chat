
import { z } from "zod";

export const threadSchema = z.object({
    threadId: z.string(),
    type: z.enum(["direct", "group"]),
    participants: z.array(
        z.object({
            username: z.string(),
            image: z.string(),
            role: z.enum(["admin", "member"]),
            joinedAt: z.date().nullable(),
            leftAt: z.date().nullable(),
        })
    ),
    createdAt: z.date(),
    createdBy: z.string().nullable(),
    groupName: z.string().nullable(),
    groupImage: z.string().nullable(),
});