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
    const correlationId = crypto.randomUUID();

    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file || !(file instanceof File)) {
            console.warn(`[get-file-url (API)][${correlationId}] Validation Failed: No file provided.`);
            return NextResponse.json(null, { status: 400, statusText: "NO_FILE_PROVIDED" });
        }

        // Validate File Size
        if (file.size > MAX_FILE_SIZE) {
            console.warn(`[get-file-url (API)][${correlationId}] Validation Failed: File too large (${file.size} bytes). Max: ${MAX_FILE_SIZE}`);
            return NextResponse.json(null, { status: 413, statusText: "FILE_TOO_LARGE" });
        }

        // Validate File Type
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            console.warn(`[get-file-url (API)][${correlationId}] Validation Failed: Unsupported Media Type (${file.type}).`);
            return NextResponse.json(null, { status: 415, statusText: "UNSUPPORTED_MEDIA_TYPE" });
        }

        const storedName = buildStoredFilename(file.name);
        const filePath = `uploads/${storedName}`;

        const { error: uploadError } = await supabaseAdmin.storage
            .from("media")
            .upload(filePath, file, {
                cacheControl: "3600",
                upsert: false,
                contentType: (file.type) as string,
            });

        if (uploadError) {
            console.error(`[get-file-url (API)][${correlationId}] Supabase Upload Error:`, {
                message: uploadError.message,
                name: uploadError.name,
                path: filePath
            });
            throw uploadError;
        }

        const { data } = supabaseAdmin.storage.from("media").getPublicUrl(filePath);

        return NextResponse.json({ url: data.publicUrl, path: filePath }, { status: 200 });

    } catch (err) {
        console.error(`[get-file-url (API)][${correlationId}] Unexpected error during file processing:`, err);
        
        return NextResponse.json(null, { 
            status: 500,
            statusText: err instanceof Error ? err.message : "INTERNAL_SERVER_ERROR"
        });
    }
}










