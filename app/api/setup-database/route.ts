import { NextResponse } from "next/server"
import { createExecSqlFunction } from "@/lib/create-exec-sql-function"
import { initializeSupabaseStorage } from "@/lib/init-supabase-storage"
import { initialImageMappings } from "@/lib/image-mapping"
import { createClient } from "@supabase/supabase-js"

export async function POST() {
  try {
    console.log("Starting database setup...")

    // Create the exec_sql function
    const sqlResult = await createExecSqlFunction()

    if (!sqlResult.success) {
      console.error("Failed to create exec_sql function:", sqlResult.message)
      return NextResponse.json(
        {
          error: sqlResult.message,
          details: sqlResult.error,
        },
        { status: 500 },
      )
    }

    // Initialize storage buckets
    console.log("Initializing storage buckets...")
    const storageResult = await initializeSupabaseStorage()

    if (!storageResult.success) {
      console.error("Failed to initialize storage:", storageResult.message)
      return NextResponse.json(
        {
          warning: "Database function created successfully, but storage initialization failed",
          error: storageResult.message,
          details: storageResult.error,
        },
        { status: 207 },
      ) // 207 Multi-Status
    }

    // Initialize image mappings in the database
    console.log("Initializing image mappings...")
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase credentials")
      return NextResponse.json({ error: "Missing Supabase credentials" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Insert initial image mappings directly - no need to check if they exist since we're recreating the table
    console.log("Inserting initial image mappings...")

    // Insert mappings one by one to better identify any issues
    for (const mapping of initialImageMappings) {
      const { error: insertError } = await supabase.from("image_mappings").insert({
        id: mapping.id,
        name: mapping.name,
        description: mapping.description,
        location: mapping.location,
        image_path: mapping.image_path,
        image_url: mapping.image_url,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (insertError) {
        console.error(`Error inserting mapping ${mapping.id}:`, insertError)
        return NextResponse.json(
          {
            warning: `Database and storage setup completed, but failed to insert image mapping ${mapping.id}`,
            error: insertError.message,
            details: insertError,
          },
          { status: 207 },
        )
      }
    }

    console.log("Database setup completed successfully")
    return NextResponse.json({
      success: true,
      message: "Database setup completed successfully",
    })
  } catch (error: any) {
    console.error("Error in setup-database API route:", error)
    return NextResponse.json(
      {
        error: "Internal server error: " + (error.message || "Unknown error"),
        details: error,
      },
      { status: 500 },
    )
  }
}
