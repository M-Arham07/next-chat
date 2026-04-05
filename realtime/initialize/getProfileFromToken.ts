
import { supabase } from "../supabase/supabase.ts";
import type { Profile } from "@chat/shared/schema/profiles/profile.ts"
import { logger } from "../lib/logger.ts";

export const getProfileFromToken = async (sessionToken: string): Promise<Profile> => {


    if (!sessionToken) throw new Error("Please provide a session token! ");



    const { data, error } = await supabase.auth.getClaims(sessionToken);


    if (error) throw new Error(error.message);

    if (!data?.claims?.sub) throw new Error("NOT_AUTHENTICATED");




    const userId = data.claims.sub;



    // 2. Fetch profile using user.id

    logger.info(`USER ID: ${userId}`);
    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

    if (profileError) throw new Error("ONBOARDING_INCOMPLETE");



    return profile; 
}