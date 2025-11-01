import { createClient } from "@supabase/supabase-js"

// Define the Project type
export type Project = {
  id: string
  title: string
  category: string
  description: string
  featured: boolean
  images: string[]
  created_at: string
}

// Define the ContactMessage type
export type ContactMessage = {
  id: string
  name: string
  email: string
  phone: string | null
  message: string
  read: boolean
  created_at: string
}

// Create a single Supabase client for client-side usage


let browserClient: ReturnType<typeof createClient> | null = null

// Client-side Supabase
export function getSupabaseClient() {
  if (typeof window !== "undefined") {
    if (!browserClient) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!url || !anonKey) {
        throw new Error("Missing Supabase environment variables in client")
      }

      browserClient = createClient(url, anonKey)
    }
    return browserClient
  }

  // Return server client if called accidentally in server
  return createServerSupabaseClient()
}

// Server-side Supabase (for API routes, Next.js server actions)
export function createServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error("Missing Supabase environment variables in server")
  }

  return createClient(url, key)
}

// Default export (safe universal client)
export const supabase =
  typeof window === "undefined" ? createServerSupabaseClient() : getSupabaseClient()
