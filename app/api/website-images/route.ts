import { NextResponse } from "next/server"
import { getImageMappings } from "@/lib/image-mapping"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    const images = await getImageMappings()

    return NextResponse.json({
      success: true,
      data: images,
    })
  } catch (error: any) {
    console.error("Error in website-images API route:", error)

    // Check if the error is related to the table not existing
    if (error.message && error.message.includes("relation") && error.message.includes("does not exist")) {
      return NextResponse.json(
        {
          success: false,
          error: "The image_mappings table does not exist. Please run the database setup first.",
        },
        { status: 404 },
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch website images: " + (error.message || "Unknown error"),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, url, path } = body

    if (!id || !url) {
      return NextResponse.json(
        {
          success: false,
          error: "Image ID and URL are required",
        },
        { status: 400 },
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 },
      )
    }

    const supabase = createClient(supabaseUrl, serviceKey)

    const { error } = await supabase
      .from("image_mappings")
      .update({
        image_url: url,
        image_path: path || "",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      console.error("Failed to update image mapping:", error)
      return NextResponse.json(
        { success: false, error: "Failed to update image mapping" },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true, message: `Image ${id} updated to ${url}` })
  } catch (error: any) {
    console.error("Error updating website image:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
