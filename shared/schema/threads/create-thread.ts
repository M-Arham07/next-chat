import { z } from "zod";
import { Thread } from "../../types/threads";

export const CreateThreadSchemaBody = z.object({
    type: z.enum(["direct", "group"]),
    otherParticipantUsernames: z.array(z.string()),
    groupName: z.string().optional(),
    groupImage: z.string().optional()
});

export type CreateThreadBodyType = z.infer<typeof CreateThreadSchemaBody>;

export type CreateThreadResponseType = {
    success: boolean;
    data?: Thread;
    error?: string;
};
