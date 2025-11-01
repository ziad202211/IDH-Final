import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { v4 as uuidv4 } from "uuid"

// Helper to get image file details
function getImageDetails(path: string) {
  const parts = path.split("/")
  const filename = parts[parts.length - 1]
  const folder = parts.slice(0, parts.length - 1).join("/")
  return { filename, folder }
}

export async function GET(request: Request) {
  try {
    // Create a new Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get folder from query param
    const { searchParams } = new URL(request.url)
    const folder = searchParams.get("folder") || "website"

    // List files from the media bucket
    const { data, error } = await supabase.storage.from("media").list(folder)

    if (error) {
      console.error("Error listing media files:", error)
      return NextResponse.json({ error: "Failed to list media files" }, { status: 500 })
    }

    // Get public URLs for each file
    const filesWithUrls = await Promise.all(
      data.map(async (file) => {
        const filePath = folder ? `${folder}/${file.name}` : file.name
        const { data: urlData } = supabase.storage.from("media").getPublicUrl(filePath)
        return {
          ...file,
          url: urlData.publicUrl,
          path: filePath,
        }
      }),
    )

    return NextResponse.json({ success: true, data: filesWithUrls })
  } catch (error: any) {
    console.error("Error in media API route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const path = (formData.get("path") as string) || ""
    const folder = (formData.get("folder") as string) || "website"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Create a new Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Check if the bucket exists, create it if it doesn't
    const { data: bucketData, error: bucketError } = await supabase.storage.getBucket("media")

    if (bucketError && bucketError.message.includes("not found")) {
      // Create the bucket if it doesn't exist
      await supabase.storage.createBucket("media", {
        public: true,
      })
    }

    // If replacing an existing file, use its path, otherwise create a new filename
    let filePath: string

    if (path) {
      filePath = path
      // Delete the existing file first to ensure a clean replacement
      await supabase.storage.from("media").remove([path])
    } else {
      // Create a unique file name
      const fileExt = file.name.split(".").pop()
      const fileName = `${uuidv4()}.${fileExt}`
      filePath = folder ? `${folder}/${fileName}` : fileName
    }

    // Upload the file
    const { error: uploadError } = await supabase.storage.from("media").upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    })

    if (uploadError) {
      console.error("Error uploading file:", uploadError)
      return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
    }

    // Get the public URL
    const { data } = supabase.storage.from("media").getPublicUrl(filePath)

    return NextResponse.json({
      success: true,
      url: data.publicUrl,
      path: filePath,
    })
  } catch (error: any) {
    console.error("Error in media upload API route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get("path")

    if (!path) {
      return NextResponse.json({ error: "File path is required" }, { status: 400 })
    }

    // Create a new Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Delete the file
    const { error } = await supabase.storage.from("media").remove([path])

    if (error) {
      console.error("Error deleting file:", error)
      return NextResponse.json({ error: "Failed to delete file" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error in media delete API route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
