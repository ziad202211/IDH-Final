import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, featured } = body

    if (!id) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 })
    }

    // Create a new Supabase client for this request
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase credentials")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseKey)

    // Update project featured status
    const { error } = await supabase
      .from("projects")
      .update({ featured: featured === undefined ? true : featured })
      .eq("id", id)

    if (error) {
      console.error("Error updating project:", error)
      return NextResponse.json({ error: "Failed to update project: " + error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error in projects API route:", error)
    return NextResponse.json({ error: "Internal server error: " + (error.message || "Unknown error") }, { status: 500 })
  }
}
