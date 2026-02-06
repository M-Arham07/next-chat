import { NextRequest, NextResponse } from "next/server";
import { MessageContentType } from "@chat/shared";
import { supabase } from "@/supabase/supabase-client";


export type GetFileUrlResponse = {

    url: string,
    path: string

} | null





export async function POST(request: NextRequest): Promise<NextResponse<GetFileUrlResponse>> {


    // this API endpoint will upload a file to supabase, and return its url !




    try {

        const formData = await request.formData();

        const file = formData.get("file") as File;


        if (!file || !(file instanceof File)) throw new Error("NO_FILE_PROVIDED");

        const ext = file.name.split(".").pop();



        const filePath = `public/${Date.now()}-${crypto.randomUUID()}.${ext}`;

        const { error } = await supabase.storage
            .from("image")
            .upload(filePath, file, {
                cacheControl: "3600",
                upsert: false,
                contentType: (file.type) as string, // if file type specified then use it!
            });

        if (error) throw error;

        const { data } = supabase.storage.from("image").getPublicUrl(filePath);


        return NextResponse.json({ url: data.publicUrl, path: filePath }, { status: 200 });


    }

    catch (err) {

        if (err instanceof Error) {

            console.error("[get-file-url (API)] Uploading file failed >> ", err?.message);

        }

        return NextResponse.json(null, { status: 500 });



    }


}










