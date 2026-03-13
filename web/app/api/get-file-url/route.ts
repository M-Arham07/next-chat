import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/supabase/supabase-admin";
import { buildStoredFilename } from "@/features/chat/lib/file-utils";

export type GetFileUrlResponse = {
    url: string,
    path: string
} | null

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ALLOWED_FILE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "video/mp4",
    "video/webm",
    "audio/mpeg",
    "audio/wav",
    "audio/ogg",
    "audio/webm",
    "audio/webm;codecs=opus",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain"
    
];

export async function POST(request: NextRequest): Promise<NextResponse<GetFileUrlResponse>> {

    // this API endpoint will upload a file to supabase via admin client, and return its url !

    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        console.log("file is ",file)

        if (!file || !(file instanceof File)) {
            return NextResponse.json(null, { status: 400, statusText: "NO_FILE_PROVIDED" });
        }

        // Validate File Size
        if (file.size > MAX_FILE_SIZE) {
      
            return NextResponse.json(null, { status: 413, statusText: "FILE_TOO_LARGE" });
        }

        // Validate File Type
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            console.log("File type",file.type);
            return NextResponse.json(null, { status: 415, statusText: "UNSUPPORTED_MEDIA_TYPE" });
        }

        const filePath = `uploads/${buildStoredFilename(file.name)}`;

        const { error } = await supabaseAdmin.storage
            .from("media")
            .upload(filePath, file, {
                cacheControl: "3600",
                upsert: false,
                contentType: (file.type) as string, // if file type specified then use it!
            });

        if (error) throw error;

        // Make sure to fetch the public URL from the same "media" bucket it was uploaded to
        const { data } = supabaseAdmin.storage.from("media").getPublicUrl(filePath);

        return NextResponse.json({ url: data.publicUrl, path: filePath }, { status: 200 });

    } catch (err) {
        if (err instanceof Error) {
            console.error("[get-file-url (API)] Uploading file failed >> ", err?.message);
        }
        return NextResponse.json(null, { status: 500 });
    }
}










