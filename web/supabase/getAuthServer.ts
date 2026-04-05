import { createClient } from './server'


export async function getAuthServer() {

    const supabase = await createClient();


    const {
        data: { user },
        error,
    } = await supabase.auth.getUser()

    if (error) {
        console.error("[get-auth-user] Failed to get auth >> ", error);

        return null;
    }

    return user
}