import { z } from "zod";

export const CreateThreadSchemaBody = z.object({
    type: z.enum(["direct", "group"]),
    otherParticipantUserIds: z.array(z.string()),
    groupName: z.string().optional(),
    groupImage: z.instanceof(File).optional().nullable()
});


export const CreateThreadSchemaResponse = z.object({
    createdThreadId: z.string().optional(),
    success: z.boolean(),
    error: z.string().optional()
})


export type CreateThreadBodyType = z.infer<typeof CreateThreadSchemaBody>;
export type CreateThreadResponseType = z.infer<typeof CreateThreadSchemaResponse>;
