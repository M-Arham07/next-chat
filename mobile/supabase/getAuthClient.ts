import { supabase } from '@/supabase/supabase-client';
import { Session } from '@supabase/supabase-js';

/**
 * Get the current authenticated user session
 * Returns the session if user is logged in, null otherwise
 * 
 * This is different from useAuth hook which requires a profile in the database
 * This only checks if there's an active Supabase session
 * 
 * @returns Promise<{session, user} | null>
 */
export async function getAuthClient() : Promise<Session | null> {
  try {
    const { data: { session : user}, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Error fetching auth session:', error);
      return null;
    }

    return user;


  } catch (err) {
    console.error('Error in getAuthClient:', err);
    return null;
  }
}
