import { createClient } from "../client";

export async function signInWithOAuth(provider: "google" | "github") {
  const supabase = createClient();

  console.log("BASE URL IS", window.location.origin);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback`,
    },
  });

  if (error) {
    console.error("OAuth sign-in error:", error);
    return null;
  }

  return data;
}