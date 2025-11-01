import { supabase } from "./supabaseClient"
import { STORAGE_BUCKETS, uploadFile } from "./supabase-storage"
import { v4 as uuidv4 } from "uuid"

export type Project = {
  id: string
  title: string
  category: string
  description: string
  featured: boolean
  location?: string
  area?: string
  completed?: string
  images: string[]
  created_at: string
}

export type ProjectInput = Omit<Project, "id" | "created_at" | "images"> & {
  images: File[]
  existingImages?: string[]
}

// Get all projects
export const getAllProjects = async (): Promise<Project[]> => {
  try {
    const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Error fetching projects:", error)
    return []
  }
}

// Get featured projects
export const getFeaturedProjects = async (limit = 6): Promise<Project[]> => {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("featured", true)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Error fetching featured projects:", error)
    return []
  }
}

// Get projects by category
export const getProjectsByCategory = async (category: string): Promise<Project[]> => {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .ilike("category", category.trim())
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return data || []
  } catch (error) {
    console.error(`Error fetching projects by category ${category}:`, error)
    return []
  }
}

// Get a single project by ID
export const getProjectById = async (id: string): Promise<Project | null> => {
  try {
    const { data, error } = await supabase.from("projects").select("*").eq("id", id).single()

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error(`Error fetching project with ID ${id}:`, error)
    return null
  }
}

// Create a new project
export const createProject = async (project: ProjectInput): Promise<Project | null> => {
  try {
    // Upload images first
    const imageUrls: string[] = []

    // Add any existing images
    if (project.existingImages && project.existingImages.length > 0) {
      imageUrls.push(...project.existingImages)
    }

    // Upload new images
    if (project.images && project.images.length > 0) {
      for (const image of project.images) {
        const result = await uploadFile(STORAGE_BUCKETS.PROJECTS, image, "images")

        if (result) {
          imageUrls.push(result.url)
        }
      }
    }

    if (imageUrls.length === 0) {
      throw new Error("At least one image is required")
    }

    // Create the project
    const { data, error } = await supabase
      .from("projects")
      .insert([
        {
          id: uuidv4(),
          title: project.title,
          category: project.category,
          description: project.description,
          featured: project.featured,
          location: project.location || null,
          area: project.area || null,
          completed: project.completed || null,
          images: imageUrls,
        },
      ])
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error("Error creating project:", error)
    return null
  }
}

// Update an existing project
export const updateProject = async (id: string, project: ProjectInput): Promise<Project | null> => {
  try {
    // Get the current project to compare images
    const currentProject = await getProjectById(id)
    if (!currentProject) {
      throw new Error("Project not found")
    }

    // Prepare the image URLs
    let imageUrls: string[] = []

    // Add existing images that should be kept
    if (project.existingImages && project.existingImages.length > 0) {
      imageUrls = [...project.existingImages]
    }

    // Upload new images
    if (project.images && project.images.length > 0) {
      for (const image of project.images) {
        const result = await uploadFile(STORAGE_BUCKETS.PROJECTS, image, "images")

        if (result) {
          imageUrls.push(result.url)
        }
      }
    }

    if (imageUrls.length === 0) {
      throw new Error("At least one image is required")
    }

    // Update the project
    const { data, error } = await supabase
      .from("projects")
      .update({
        title: project.title,
        category: project.category,
        description: project.description,
        featured: project.featured,
        location: project.location || null,
        area: project.area || null,
        completed: project.completed || null,
        images: imageUrls,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error(`Error updating project with ID ${id}:`, error)
    return null
  }
}

// Delete a project
export const deleteProject = async (id: string): Promise<boolean> => {
  try {
    // Get the project to delete its images
    const project = await getProjectById(id)
    if (!project) {
      throw new Error("Project not found")
    }

    // Delete the project from the database
    const { error } = await supabase.from("projects").delete().eq("id", id)

    if (error) {
      throw error
    }

    // Note: In a production app, you might want to also delete the images from storage
    // This would require extracting the file paths from the URLs

    return true
  } catch (error) {
    console.error(`Error deleting project with ID ${id}:`, error)
    return false
  }
}

// Toggle featured status
export const toggleProjectFeatured = async (id: string, featured: boolean): Promise<boolean> => {
  try {
    const { error } = await supabase.from("projects").update({ featured }).eq("id", id)

    if (error) {
      throw error
    }

    return true
  } catch (error) {
    console.error(`Error toggling featured status for project ${id}:`, error)
    return false
  }
}
