import { getSupabaseClient } from "./supabase"

// Re-export the client for backward compatibility
export const supabase = getSupabaseClient()
