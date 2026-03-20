import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import { CreateThreadResponseType, CreateThreadSchemaBody } from "@chat/shared/schema";
import { getProfileServer } from "@/supabase/getProfileServer";
import { uploadAvatarAndGetLink } from "@/features/upload-avatar/get-avatar-link";




// API ROUTE TO CREATE THREAD
// all types of validation checks are managed by POSTGRES !

export async function POST(request: NextRequest): Promise<NextResponse<CreateThreadResponseType>> {
    try {


        const profile = await getProfileServer();

        if (!profile) throw new Error("No profile found! ");

        const formData = await request.formData();


        const rawData = Object.fromEntries(formData.entries());


        // extract formData
        const { type, otherParticipantUserIds, groupName, groupImage } = CreateThreadSchemaBody.parse({
            ...rawData,

            otherParticipantUserIds: JSON.parse(
                rawData.otherParticipantUserIds as string
            ),

            groupImage: rawData.groupImage instanceof File && rawData.groupImage.size > 0
                ? rawData.groupImage
                : null,
        });



        const supabase = await createClient();

        // First upload the group image (if its a group)!


        let uploadedGroupImageUrl : string | null = null;

        if (type === "group") {

            if(!groupImage) throw new Error("No group image! ");

            uploadedGroupImageUrl = await uploadAvatarAndGetLink(groupImage);


        }




        const { data, error } = await supabase.rpc("create_thread", {
            p_type: type,
            p_other_particpant_user_ids: otherParticipantUserIds,
            p_group_name: groupName ?? null,
            p_group_image: uploadedGroupImageUrl
        });



        if (error) throw new Error(error.message)



        return NextResponse.json({ success: true, createdThreadId: data }, { status: 200 });

    } catch (err) {
        console.error("[create-thread] Failed to create thread >> ", err instanceof Error ? err.message : "No logs");
        return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
    }
}