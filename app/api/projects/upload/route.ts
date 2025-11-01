import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Create a new Supabase client for this request
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase credentials")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Check if the bucket exists, create it if it doesn't
    const { data: bucketData, error: bucketError } = await supabase.storage.getBucket("projects")

    if (bucketError && bucketError.message.includes("not found")) {
      // Create the bucket if it doesn't exist
      await supabase.storage.createBucket("projects", {
        public: true,
      })
    }

    // Create a unique file name
    const fileExt = file.name.split(".").pop()
    const fileName = `${uuidv4()}.${fileExt}`
    const filePath = `images/${fileName}`

    // Upload the file
    const { error: uploadError } = await supabase.storage.from("projects").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (uploadError) {
      console.error("Error uploading file:", uploadError)
      return NextResponse.json({ error: "Failed to upload file: " + uploadError.message }, { status: 500 })
    }

    // Get the public URL
    const { data } = supabase.storage.from("projects").getPublicUrl(filePath)

    return NextResponse.json({
      success: true,
      url: data.publicUrl,
      path: filePath,
    })
  } catch (error: any) {
    console.error("Error in upload API route:", error)
    return NextResponse.json({ error: "Internal server error: " + (error.message || "Unknown error") }, { status: 500 })
  }
}
