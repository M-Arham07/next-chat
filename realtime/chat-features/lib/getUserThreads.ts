import { logger } from "../../lib/logger.ts";
import { supabase } from "../../supabase/supabase.ts";

export async function getUserThreads(userId: string): Promise<string[]> {

    if(!userId) throw new Error("No user id provided");

    try {
        const {data,error} = await supabase.rpc("get_user_thread_ids", {
            p_user_id: userId,
        });


        if(error) throw new Error(error.message);


        const threadIds = (data ?? []) as string[];



        if (!threadIds || threadIds.length === 0) {
            throw new Error("No thread found, aborting... ");
        }



        return threadIds;



    }
    catch (err) {

        if(err instanceof Error){
        logger.error("[getUserThreads] Failed to get user threads! Logs: ", err?.message);
        }
        
        return [];


    }



}
