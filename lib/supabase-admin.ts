import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Create a single supabase client for server-side operations with admin privileges
let supabaseAdmin: ReturnType<typeof createClient<Database>> | null = null

export const getSupabaseAdmin = () => {
  if (supabaseAdmin) return supabaseAdmin

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase admin credentials")
    return null
  }

  supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return supabaseAdmin
}

// Function to check if a user exists by email
export async function checkUserExists(email: string): Promise<boolean> {
  try {
    const admin = getSupabaseAdmin()
    if (!admin) {
      throw new Error("Supabase admin client not available")
    }

    // Use the auth.admin API to list users
    const { data, error } = await admin.auth.admin.listUsers()

    if (error) {
      throw error
    }

    // Find the user with the matching email
    const user = data.users.find((user) => user.email === email)
    return !!user
  } catch (error) {
    console.error("Error checking if user exists:", error)
    return false
  }
}

// Function to get a user by email
export async function getUserByEmail(email: string) {
  try {
    const admin = getSupabaseAdmin()
    if (!admin) {
      throw new Error("Supabase admin client not available")
    }

    // Use the auth.admin API to list users
    const { data, error } = await admin.auth.admin.listUsers()

    if (error) {
      throw error
    }

    // Find the user with the matching email
    return data.users.find((user) => user.email === email) || null
  } catch (error) {
    console.error("Error getting user by email:", error)
    return null
  }
}

// Function to get a user by ID
export async function getUserById(id: string) {
  try {
    const admin = getSupabaseAdmin()
    if (!admin) {
      throw new Error("Supabase admin client not available")
    }

    const { data, error } = await admin.auth.admin.getUserById(id)

    if (error) {
      throw error
    }

    return data.user
  } catch (error) {
    console.error("Error getting user by ID:", error)
    return null
  }
}
