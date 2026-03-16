import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/supabase/supabase-admin";
import { buildStoredFilename, sanitizeFilename } from "@/features/chat/lib/file-utils";

export type UploadUrlResponse = {
    signedUrl: string;
    path: string;
    token: string;
} | null;

const ALLOWED_FILE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "video/mp4",
    "video/webm",
    "video/ogg",
    "video/quicktime",
    "video/x-msvideo",
    "audio/mpeg",
    "audio/wav",
    "audio/ogg",
    "audio/webm",
    "audio/aac",
    "audio/mp4",
    "audio/webm;codecs=opus",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain"
];

export async function POST(request: NextRequest) {
    const correlationId = crypto.randomUUID();

    try {
        const { filename, fileType } = await request.json();

        if (!filename || !fileType) {
            return NextResponse.json({ error: "Filename and fileType are required" }, { status: 400 });
        }

        if (!ALLOWED_FILE_TYPES.includes(fileType)) {
            console.warn(`[upload-url (API)][${correlationId}] Validation Failed: Unsupported Media Type (${fileType}).`);
            return NextResponse.json({ error: "Unsupported media type" }, { status: 415 });
        }

        const storedName = buildStoredFilename(filename);
        const filePath = `uploads/${storedName}`;

        const { data, error } = await supabaseAdmin.storage
            .from("media")
            .createSignedUploadUrl(filePath);

        if (error) {
            console.error(`[upload-url (API)][${correlationId}] Supabase Error:`, error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ 
            signedUrl: data.signedUrl, 
            path: filePath,
            token: data.token 
        });

    } catch (err) {
        console.error(`[upload-url (API)][${correlationId}] Unexpected error:`, err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
