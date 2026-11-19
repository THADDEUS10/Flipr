import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** null when env vars are missing, which puts the app in demo mode */
export const supabase: SupabaseClient | null = url && key ? createClient(url, key) : null;
export const isDemoMode = supabase === null;

/** Google button only shows when you set VITE_ENABLE_GOOGLE=true (after enabling Google in Supabase) */
export const googleEnabled = import.meta.env.VITE_ENABLE_GOOGLE === "true";
