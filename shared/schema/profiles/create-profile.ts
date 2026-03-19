

import { z } from "zod";


export const CreateProfileSchemaBody = z.object({
    username: z.string().min(3, "Username must be at least 3 characters long"),
    image: z.file().max(0.5 * 1024 * 1024, "Image size must be less than 0.5MB"),
})


export type CreateProfileSchemaType = z.infer<typeof CreateProfileSchemaBody>;


export const CreateProfileSchemaResponse = z.object({
    success: z.boolean(),
    data: z.string(),
})


export type CreateProfileSchemaResponseType = z.infer<typeof CreateProfileSchemaResponse>;
