import React, { createContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import { supabase } from "../../../lib/supabase";
import { Profile } from "@chat/shared/schema/profiles/profile";

export interface AuthContextType {
    user: any | null;
    profile: Profile | null;
    loading: boolean;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signInWithGitHub: () => Promise<void>;
    signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in
        const checkSession = async () => {
            try {
                const {
                    data: { session },
                } = await supabase.auth.getSession();

                if (session?.user) {
                    setUser(session.user);
                    // Fetch user profile
                    const { data: profileData } = await supabase
                        .from("profiles")
                        .select("*")
                        .eq("id", session.user.id)
                        .single();

                    if (profileData) {
                        setProfile(profileData as Profile);
                    }
                }
            } catch (error) {
                console.error("[v0] Error checking session:", error);
            } finally {
                setLoading(false);
            }
        };

        checkSession();

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                setUser(session.user);

                // Fetch user profile
                const { data: profileData } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", session.user.id)
                    .single();

                if (profileData) {
                    setProfile(profileData as Profile);
                }
            } else {
                setUser(null);
                setProfile(null);
            }
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    const signInWithEmail = async (email: string, password: string) => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const signUpWithEmail = async (email: string, password: string) => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) throw error;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const signInWithGoogle = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: "com.chatapp://oauth",
                },
            });

            if (error) throw error;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const signInWithGitHub = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "github",
                options: {
                    redirectTo: "com.chatapp://oauth",
                },
            });

            if (error) throw error;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            setUser(null);
            setProfile(null);
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const value: AuthContextType = {
        user,
        profile,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signInWithGitHub,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
