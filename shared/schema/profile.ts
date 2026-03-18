

import { z } from "zod";


export const CreateProfileSchemaBody = z.object({
    username: z.string().min(3, "Username must be at least 3 characters long"),
    image: z.string().url("Invalid image URL"),
})


export type CreateProfileSchemaType = z.infer<typeof CreateProfileSchemaBody>;


export const CreateProfileSchemaResponse = z.object({
    success: z.boolean(),
    data: z.string(),
})


export type CreateProfileSchemaResponseType = z.infer<typeof CreateProfileSchemaResponse>;
