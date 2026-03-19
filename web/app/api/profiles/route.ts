// API ROUTE TO CREATE PROFILE
import { NextRequest, NextResponse } from "next/server";
import { CreateProfileSchemaBody, CreateProfileSchemaResponseType } from "@chat/shared/schema";
import { createClient } from "@/supabase/server";
import { getAuthServer } from "@/supabase/getAuthServer";

export async function POST(request: NextRequest): Promise<NextResponse<CreateProfileSchemaResponseType>> {
    try {
        const formData = await request.formData();
        const usernameInput = formData.get("username");
        const imageInput = formData.get("image");

        const { username, image } = CreateProfileSchemaBody.parse({
            username: usernameInput,
            image: imageInput,
        });

        const supabase = await createClient();
        const user = await getAuthServer();

        if (!user) {
            return NextResponse.json(
                { success: false, data: "User not authenticated" },
                { status: 401 }
            );
        }

        // 1. Upload the image to public bucket named "media"
        const fileExt = image.name.split('.').pop() || 'jpg';
        const fileName = `avatars/${user.id}-${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from("media")
            .upload(fileName, image, {
                cacheControl: "3600",
                upsert: true,
                contentType: image.type,
            });

        if (uploadError) {
            throw new Error(`Storage upload failed: ${uploadError.message}`);
        }

        // 2. Retrieve the public URL for the uploaded image
        const { data: { publicUrl } } = supabase.storage
            .from("media")
            .getPublicUrl(fileName);





        // 3. Insert the user record with the public URL
        // (if already exists, just return the existing user ! )
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .upsert(
                {
                    id: user.id,
                    username,
                    email: user.email,
                    image: publicUrl,
                },
                {
                    onConflict: 'id',
                    ignoreDuplicates: true
                })
            .select()
            .maybeSingle();

        if (profileError) {
            throw new Error(`Database insert failed: ${profileError.message}`);
        }

        return NextResponse.json({ success: true, data: "Profile created successfully" });

    } catch (err) {
        console.error("[create-profile] Failed to create profile >> ", err instanceof Error ? err.message : String(err));

        // A generic message will be sent to client, takay agle ko pata na lagy masla aya kiu
        return NextResponse.json(
            { success: false, data: "Failed to create profile" },
            { status: 500 }
        );
    }
}
