import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"
import { resetAndCreateTablesQuery } from "@/lib/supabase-schema"

export async function POST() {
  try {
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    // Execute the reset and create tables query
    const { error } = await supabase.rpc("exec_sql", { sql: resetAndCreateTablesQuery })

    if (error) {
      console.error("Error initializing database:", error)
      return NextResponse.json({ error: "Failed to initialize database" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Database initialized successfully" })
  } catch (error) {
    console.error("Error in init-database API route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
