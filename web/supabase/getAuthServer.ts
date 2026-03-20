import { createClient } from './server'


export async function getAuthServer() {

    const supabase = await createClient();
    

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser()


    console.error("[get-auth-server] Failed to get auth >> ",error);
    if (error) return null;

    return user
}