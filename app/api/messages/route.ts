import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

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

    // Get messages from Supabase
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching messages:", error)
      return NextResponse.json({ error: "Failed to fetch messages: " + error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("Error in messages API route:", error)
    return NextResponse.json({ error: "Internal server error: " + (error.message || "Unknown error") }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, read } = body

    if (!id) {
      return NextResponse.json({ error: "Message ID is required" }, { status: 400 })
    }

    // Create a new Supabase client for this request
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase credentials")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseKey)

    // Update message read status
    const { error } = await supabase
      .from("contact_messages")
      .update({ read: read === undefined ? true : read })
      .eq("id", id)

    if (error) {
      console.error("Error updating message:", error)
      return NextResponse.json({ error: "Failed to update message: " + error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error in messages API route:", error)
    return NextResponse.json({ error: "Internal server error: " + (error.message || "Unknown error") }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Message ID is required" }, { status: 400 })
    }

    // Create a new Supabase client for this request
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase credentials")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseKey)

    // Delete message
    const { error } = await supabase.from("contact_messages").delete().eq("id", id)

    if (error) {
      console.error("Error deleting message:", error)
      return NextResponse.json({ error: "Failed to delete message: " + error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error in messages API route:", error)
    return NextResponse.json({ error: "Internal server error: " + (error.message || "Unknown error") }, { status: 500 })
  }
}
