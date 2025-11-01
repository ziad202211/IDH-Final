import { createClient } from "@supabase/supabase-js"

// Create a single supabase client for the entire application
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Create a singleton client to prevent multiple instances
let supabaseInstance: ReturnType<typeof createClient> | null = null

export const getSupabaseClient = () => {
  if (typeof window === "undefined") {
    // We're on the server, don't create a client
    return null
  }

  if (!supabaseInstance) {
    console.log("Creating new Supabase client instance")
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: "sb-auth-token",
      },
    })
  }
  return supabaseInstance
}

// Helper function to check authentication status
export const checkAuth = async () => {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error("Error checking auth:", error)
    return null
  }
}

// Helper function to sign in
export const signIn = async (email: string, password: string) => {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error("Supabase client not available")

  return await supabase.auth.signInWithPassword({ email, password })
}

// Helper function to sign out
export const signOut = async () => {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error("Supabase client not available")

  return await supabase.auth.signOut()
}
