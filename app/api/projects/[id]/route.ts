import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params // ✅ await the params!

    if (!id) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase credentials")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseKey)

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching project:", error)
      return NextResponse.json({ error: "Failed to fetch project: " + error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("Error in projects API route:", error)
    return NextResponse.json(
      { error: "Internal server error: " + (error.message || "Unknown error") },
      { status: 500 }
    )
  }
}
