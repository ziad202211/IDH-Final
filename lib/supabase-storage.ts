import { supabase } from "./supabaseClient"
import { v4 as uuidv4 } from "uuid"

// Define storage buckets
export const STORAGE_BUCKETS = {
  PROJECTS: "projects",
  PROFILES: "profiles",
}

// Initialize storage buckets
export const initializeStorage = async () => {
  try {
    // Check if buckets exist, create them if they don't
    for (const bucket of Object.values(STORAGE_BUCKETS)) {
      const { data, error } = await supabase.storage.getBucket(bucket)

      if (error && error.message.includes("The resource was not found")) {
        const { error: createError } = await supabase.storage.createBucket(bucket, {
          public: false,
          fileSizeLimit: 10485760, // 10MB
        })

        if (createError) {
          console.error(`Error creating bucket ${bucket}:`, createError)
        } else {
          console.log(`Created bucket: ${bucket}`)

          // Set bucket policies
          await supabase.storage.from(bucket).setPublic()
        }
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Error initializing storage:", error)
    return { success: false, error }
  }
}

// Upload a file to storage
export const uploadFile = async (
  bucket: string,
  file: File,
  folder = "",
): Promise<{ path: string; url: string } | null> => {
  try {
    // Create a unique file name
    const fileExt = file.name.split(".").pop()
    const fileName = `${uuidv4()}.${fileExt}`
    const filePath = folder ? `${folder}/${fileName}` : fileName

    // Upload the file
    const { error } = await supabase.storage.from(bucket).upload(filePath, file)

    if (error) {
      throw error
    }

    // Get the public URL
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)

    return {
      path: filePath,
      url: data.publicUrl,
    }
  } catch (error) {
    console.error("Error uploading file:", error)
    return null
  }
}

// Delete a file from storage
export const deleteFile = async (bucket: string, filePath: string): Promise<boolean> => {
  try {
    const { error } = await supabase.storage.from(bucket).remove([filePath])

    if (error) {
      throw error
    }

    return true
  } catch (error) {
    console.error("Error deleting file:", error)
    return false
  }
}

// Get a signed URL for temporary access to a file
export const getSignedUrl = async (bucket: string, filePath: string, expiresIn = 60): Promise<string | null> => {
  try {
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(filePath, expiresIn)

    if (error) {
      throw error
    }

    return data.signedUrl
  } catch (error) {
    console.error("Error getting signed URL:", error)
    return null
  }
}
