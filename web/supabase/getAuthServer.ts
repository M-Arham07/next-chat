import { createClient } from './server'


export async function getAuthServer() {

    const supabase = await createClient();

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser()

    if (error) throw error

    return user
}