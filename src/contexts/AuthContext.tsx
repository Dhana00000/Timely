"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
    signInWithGoogle: () => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
    isConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const isConfigured = isSupabaseConfigured();

    useEffect(() => {
        const createDemoUser = () => {
            setUser({
                id: "demo-user-id",
                email: "dhana@timely.app",
                user_metadata: { name: "Dhana" },
                app_metadata: {},
                aud: "authenticated",
                created_at: new Date().toISOString(),
            } as unknown as User);
            setLoading(false);
        };

        if (!isConfigured) {
            // Demo mode - create mock user (only when Supabase is NOT configured)
            createDemoUser();
            return;
        }

        // PRODUCTION: Get initial session - require real authentication
        supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
            if (session?.user) {
                setSession(session);
                setUser(session.user);
            }
            // No auto-fallback to demo when configured - user must log in
            setLoading(false);
        });

        // Listen for auth changes in real-time
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
            if (session?.user) {
                setSession(session);
                setUser(session.user);

                // Store provider tokens for Google Calendar sync
                // These are only available immediately after OAuth, so we save them
                if (session.provider_token) {
                    console.log('🔑 Storing Google provider token');
                    localStorage.setItem('google_provider_token', session.provider_token);
                }
                if (session.provider_refresh_token) {
                    console.log('🔑 Storing Google refresh token');
                    localStorage.setItem('google_refresh_token', session.provider_refresh_token);
                }
            } else if (_event === 'SIGNED_OUT') {
                // Clear user on sign out - redirect handled by page components
                setUser(null);
                setSession(null);
                // Clear stored tokens
                localStorage.removeItem('google_provider_token');
                localStorage.removeItem('google_refresh_token');
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [isConfigured]);

    const signIn = async (email: string, password: string) => {
        if (!isConfigured) {
            // Demo mode - simulate successful login
            setUser({
                id: "demo-user-id",
                email: email,
                user_metadata: { name: email.split("@")[0] },
                app_metadata: {},
                aud: "authenticated",
                created_at: new Date().toISOString(),
            } as unknown as User);
            return { error: null };
        }
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error as Error | null };
    };

    const signUp = async (email: string, password: string, name: string) => {
        if (!isConfigured) {
            // Demo mode - simulate successful signup
            setUser({
                id: "demo-user-id",
                email: email,
                user_metadata: { name },
                app_metadata: {},
                aud: "authenticated",
                created_at: new Date().toISOString(),
            } as unknown as User);
            return { error: null };
        }
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name },
            },
        });
        return { error: error as Error | null };
    };

    const signInWithGoogle = async () => {
        if (!isConfigured) {
            // Demo mode - simulate Google login
            setUser({
                id: "demo-user-id",
                email: "demo@gmail.com",
                user_metadata: { name: "Demo User", avatar_url: "" },
                app_metadata: {},
                aud: "authenticated",
                created_at: new Date().toISOString(),
            } as unknown as User);
            return { error: null };
        }

        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/dashboard`,
                scopes: "https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events",
                queryParams: {
                    access_type: "offline",
                    prompt: "select_account consent",
                },
            },
        });
        return { error: error as Error | null };
    };

    const signOut = async () => {
        if (isConfigured) {
            await supabase.auth.signOut();
        }
        setUser(null);
        setSession(null);
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signInWithGoogle, signOut, isConfigured }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

// Hook to get user display name
export function useUserName() {
    const { user } = useAuth();
    return user?.user_metadata?.name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
}

