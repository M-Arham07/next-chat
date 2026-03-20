// API ROUTE TO CREATE PROFILE
import { NextRequest, NextResponse } from "next/server";
import { CreateProfileSchemaBody, CreateProfileSchemaResponseType } from "@chat/shared/schema";
import { createClient } from "@/supabase/server";
import { getAuthServer } from "@/supabase/getAuthServer";
import { uploadAvatarAndGetLink } from "@/features/upload-avatar/get-avatar-link";

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


        const publicUrl = await uploadAvatarAndGetLink(image);
 


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
