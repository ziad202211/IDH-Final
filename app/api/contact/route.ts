import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, message } = body

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 })
    }

    // Get Supabase client
    const supabase = createServerSupabaseClient()
    if (!supabase) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from("contact_messages")
      .insert([{ name, email, phone, message, read: false }])
      .select()

    if (error) {
      console.error("Error inserting contact message:", error)
      return NextResponse.json({ error: "Failed to submit message: " + error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("Error in contact API route:", error)
    return NextResponse.json({ error: "Internal server error: " + (error.message || "Unknown error") }, { status: 500 })
  }
}
