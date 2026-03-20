import { createClient } from "@/supabase/server";



const MAX_AVATAR_MB = 0.5 * 1024 * 1024;


export const uploadAvatarAndGetLink = async (avatar: File) : Promise<string> => {


    if (avatar.size > MAX_AVATAR_MB) throw new Error("Avatar size must be less than 500KB");


    const supabase = await createClient();
    // 1. Upload the image to public bucket named "media"
    const fileExt = avatar.name.split('.').pop() || 'jpg';
    const fileName = `avatars/${Date.now()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
        .from("media")
        .upload(fileName, avatar, {
            cacheControl: "3600",
            upsert: true,
            contentType: avatar.type,
        });

    if (uploadError) {
        throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    // 2. Retrieve the public URL for the uploaded image
    const { data: { publicUrl } } = supabase.storage
        .from("media")
        .getPublicUrl(fileName);

    return publicUrl;
}