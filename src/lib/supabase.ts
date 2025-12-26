import { createClient } from "@supabase/supabase-js";

// Supabase Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key";

// Create Supabase client without strict types to avoid build errors
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase = createClient(supabaseUrl, supabaseAnonKey) as any;

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => {
    return supabaseUrl !== "https://your-project.supabase.co" && supabaseAnonKey !== "your-anon-key";
};
