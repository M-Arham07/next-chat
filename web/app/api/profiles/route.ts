// API ROUTE TO CREATE PROFILE
import { NextRequest, NextResponse } from "next/server";
import { CreateProfileSchemaBody, CreateProfileSchemaResponseType } from "@chat/shared";
import { createClient } from "@/supabase/server";
import { getAuthServer } from "@/supabase/getAuthServer";

export async function POST(request: NextRequest): Promise<NextResponse<CreateProfileSchemaResponseType>> {
    try {
        const body = await request.json();
        const { username, image } = CreateProfileSchemaBody.parse(body);

        const supabase = await createClient();
        const user = await getAuthServer();

        if (!user) {
            return NextResponse.json(
                { success: false, data: "User not authenticated" },
                { status: 401 }
            );
        }

        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .insert({
                id: user.id,
                username,
                email: user.email,
                image,
            })
            .select()
            .single();

        if (profileError) throw profileError;

        return NextResponse.json({ success: true, data: "Profile created successfully" });

    } catch (err) {
        console.error("[create-profile] Failed to create profile >> ", err instanceof Error ? err.message : String(err));

        return NextResponse.json(
            { success: false, data: "Failed to create profile" },
            { status: 500 }
        );
    }
}