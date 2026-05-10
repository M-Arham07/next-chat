import { createClient } from "./server";

export async function hasEncryptedBackupServer(userId?: string): Promise<boolean> {
    if (!userId) {
        return false;
    }

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("user_key_backups")
        .select("user_id")
        .eq("user_id", userId)
        .maybeSingle();

    if (error) {
        return false;
    }

    return !!data;
}
