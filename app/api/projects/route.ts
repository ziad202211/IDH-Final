import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, description, category, featured, images, location, area, completed } = body

    // Validate required fields
    if (!title || !description || !category) {
      return NextResponse.json({ error: "Title, description, and category are required" }, { status: 400 })
    }

    // Create a new Supabase client for this request
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase credentials")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseKey)

    // Ensure we have at least one image
    const projectImages = images && images.length > 0 ? images : ["/placeholder.svg?height=490&width=1176"]

    // Insert into Supabase
    const { data, error } = await supabase
      .from("projects")
      .insert([
        {
          title,
          description,
          category,
          featured: featured || false,
          location: location || null,
          area: area || null,
          completed: completed || null,
          images: projectImages,
        },
      ])
      .select()

    if (error) {
      console.error("Error inserting project:", error)
      return NextResponse.json({ error: "Failed to add project: " + error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("Error in projects API route:", error)
    return NextResponse.json({ error: "Internal server error: " + (error.message || "Unknown error") }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    // Create a new Supabase client for this request
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase credentials")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseKey)

    // Get projects from Supabase
    const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false })

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("Error in projects API route:", error)
    return NextResponse.json({ error: "Internal server error: " + (error.message || "Unknown error") }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 })
    }

    const body = await request.json()
    const { title, description, category, featured, images, location, area, completed } = body

    // Validate required fields
    if (!title || !description || !category) {
      return NextResponse.json({ error: "Title, description, and category are required" }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase credentials")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseKey)

    const projectImages = images && images.length > 0 ? images : ["/placeholder.svg?height=490&width=1176"]

    const { data, error } = await supabase
      .from("projects")
      .update({
        title,
        description,
        category,
        featured: featured || false,
        location: location || null,
        area: area || null,
        completed: completed || null,
        images: projectImages,
      })
      .eq("id", id)
      .select()

    if (error) {
      console.error("Error updating project:", error)
      return NextResponse.json({ error: "Failed to update project: " + error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("Error in projects API route (PUT):", error)
    return NextResponse.json({ error: "Internal server error: " + (error.message || "Unknown error") }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase credentials")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseKey)

    const { error } = await supabase.from("projects").delete().eq("id", id)

    if (error) {
      console.error("Error deleting project:", error)
      return NextResponse.json({ error: "Failed to delete project: " + error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error in projects API route (DELETE):", error)
    return NextResponse.json({ error: "Internal server error: " + (error.message || "Unknown error") }, { status: 500 })
  }
}
