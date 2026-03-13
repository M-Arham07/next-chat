import { createClient } from "@supabase/supabase-js";


// Use Supabase Admin Client to bypass RLS for administrative tasks

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(`Missing environment variables
        
           process.env.NEXT_PUBLIC_SUPABASE_URL!,
           process.env.SUPABASE_SERVICE_ROLE_KEY!
        `);
}

export const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);
