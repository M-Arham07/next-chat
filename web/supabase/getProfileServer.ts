import { Profile } from "@chat/shared/schema/profiles/profile";
import { createClient } from "./server";

export async function getProfileServer() : Promise<Profile | null> {
    const supabase = await createClient();

    // 1. Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        return null;
    }

    // 2. Fetch profile using user.id
    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

    if (profileError) {
        return null;
    }

    return profile; // null if not found
}