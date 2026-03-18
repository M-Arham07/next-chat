import { createClient } from "../client";

export async function signInWithOAuth(provider: "google" | "github") {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/api/auth/callback`,
    },
  });

  if (error) {
    console.error("OAuth sign-in error:", error);
    return null;
  }

  return data;
}