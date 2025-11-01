"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase-auth"
import type { User } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  logout: () => Promise<void>
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  logout: async () => {},
  login: async () => ({ success: false }),
})

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext)

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Debug logging
  useEffect(() => {
    console.log("Auth context mounted, pathname:", pathname)
  }, [pathname])

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Checking auth status...")
        const supabase = getSupabaseClient()
        if (!supabase) {
          console.log("No Supabase client available")
          setLoading(false)
          return
        }

        // Get the current session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("Session error:", sessionError)
          setError(sessionError.message)
          setLoading(false)
          return
        }

        console.log("Session check result:", session ? "Logged in" : "Not logged in")

        // Set the user if we have a session
        if (session?.user) {
          console.log("Setting user from session")
          setUser(session.user)
        } else {
          console.log("No user in session")
          setUser(null)

          // Only redirect if on an admin page (not login or setup)
          if (pathname?.startsWith("/admin") && pathname !== "/admin/login" && pathname !== "/admin/setup") {
            console.log("Redirecting to login from protected page")
            router.push(`/admin/login?redirect=${encodeURIComponent(pathname)}`)
          }
        }
      } catch (error) {
        console.error("Auth check error:", error)
        setError("Failed to authenticate")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Set up auth state listener
    const supabase = getSupabaseClient()
    if (supabase) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        console.log("Auth state change event:", event)

        if (session?.user) {
          console.log("User from auth state change:", session.user.email)
          setUser(session.user)
        } else {
          console.log("No user from auth state change")
          setUser(null)
        }
      })

      // Cleanup subscription
      return () => {
        console.log("Cleaning up auth subscription")
        subscription.unsubscribe()
      }
    }
  }, [pathname, router])

  // Login function
  const login = async (email: string, password: string) => {
    try {
      console.log("Attempting login for:", email)
      const supabase = getSupabaseClient()
      if (!supabase) {
        throw new Error("Supabase client not available")
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Login error:", error)
        return { success: false, error: error.message }
      }

      if (data.session) {
        console.log("Login successful, session established")
        setUser(data.user)
        return { success: true }
      }

      return { success: false, error: "No session created" }
    } catch (error: any) {
      console.error("Login exception:", error)
      return { success: false, error: error.message }
    }
  }

  // Logout function
  const logout = async () => {
    try {
      console.log("Attempting logout")
      const supabase = getSupabaseClient()
      if (!supabase) {
        throw new Error("Supabase client not available")
      }

      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Logout error:", error)
        throw error
      }

      console.log("Logout successful")
      setUser(null)
      router.push("/admin/login")
    } catch (error: any) {
      console.error("Logout exception:", error)
      setError("Failed to logout")
    }
  }

  return <AuthContext.Provider value={{ user, loading, error, logout, login }}>{children}</AuthContext.Provider>
}
