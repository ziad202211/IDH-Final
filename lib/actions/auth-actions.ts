"use server"

import { cookies } from "next/headers"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { checkUserExists } from "../supabase-admin"

export async function checkAdminAccess(email: string) {
  try {
    // First check if the user exists
    const userExists = await checkUserExists(email)

    if (!userExists) {
      return { success: false, message: "User not found" }
    }

    // Then check if the user has admin role in your database
    const supabase = createServerActionClient({ cookies })

    const { data, error } = await supabase.from("users").select("role").eq("email", email).single()

    if (error) {
      throw error
    }

    const isAdmin = data?.role === "admin"

    return {
      success: true,
      isAdmin,
      message: isAdmin ? "User has admin access" : "User does not have admin access",
    }
  } catch (error) {
    console.error("Error checking admin access:", error)
    return { success: false, message: "Error checking admin access" }
  }
}

export async function getCurrentUser() {
  try {
    const supabase = createServerActionClient({ cookies })

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error || !session) {
      return null
    }

    return session.user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}
