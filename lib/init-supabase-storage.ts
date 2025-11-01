import { createServerSupabaseClient } from "@/lib/supabase"

export async function initializeSupabaseStorage() {
  try {
    const supabase = createServerSupabaseClient()

    if (!supabase) {
      throw new Error("Failed to create Supabase client")
    }

    // Check if the projects bucket exists
    const { data: bucketData, error: bucketError } = await supabase.storage.getBucket("projects")

    if (bucketError && bucketError.message.includes("not found")) {
      // Create the bucket if it doesn't exist
      const { error: createError } = await supabase.storage.createBucket("projects", {
        public: true,
      })

      if (createError) {
        throw createError
      }

      console.log("Created 'projects' storage bucket")
    }

    // Check if the media bucket exists
    const { data: mediaBucketData, error: mediaBucketError } = await supabase.storage.getBucket("media")

    if (mediaBucketError && mediaBucketError.message.includes("not found")) {
      // Create the media bucket if it doesn't exist
      const { error: createMediaError } = await supabase.storage.createBucket("media", {
        public: true,
      })

      if (createMediaError) {
        console.error("Error creating media bucket:", createMediaError)
      } else {
        console.log("Created 'media' storage bucket")
      }
    }

    return { success: true, message: "Storage initialized successfully" }
  } catch (error) {
    console.error("Error initializing storage:", error)
    return { success: false, message: "Failed to initialize storage", error }
  }
}
