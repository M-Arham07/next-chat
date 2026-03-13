import { createClient } from "@supabase/supabase-js";

// Use Supabase Admin Client to bypass RLS for administrative tasks
export const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);
