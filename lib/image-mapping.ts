import { supabase } from "@/lib/supabaseClient"

export type ImageMapping = {
  id: string
  name: string
  description: string
  location: string // Where on the website this image is used
  image_path: string // Path in storage
  image_url: string // Public URL
  created_at?: string
  updated_at?: string
}

// Get all image mappings
export async function getImageMappings(): Promise<ImageMapping[]> {
  try {
    const { data, error } = await supabase.from("image_mappings").select("*").order("name")

    if (error) {
      // Check if the error is because the table doesn't exist
      if (error.message.includes("relation") && error.message.includes("does not exist")) {
        console.error("The image_mappings table doesn't exist yet. Please run the database setup first.")
        return initialImageMappings
      }

      console.error("Error fetching image mappings:", error)
      return []
    }

    const existing = data || []
    // Ensure any newly added defaults (like partner1..6) exist in DB
    const existingIds = new Set(existing.map((i) => i.id))
    const missingDefaults = initialImageMappings.filter((m) => !existingIds.has(m.id))

    if (missingDefaults.length > 0) {
      // Insert missing in one batch; ignore conflicts just in case
      const { error: insertError } = await supabase.from("image_mappings").insert(
        missingDefaults.map((m) => ({
          id: m.id,
          name: m.name,
          description: m.description,
          location: m.location,
          image_path: m.image_path,
          image_url: m.image_url,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })),
      )
      if (insertError) {
        console.error("Error inserting missing default image mappings:", insertError)
      } else {
        // Merge into returned list so UI shows immediately
        return [...existing, ...missingDefaults]
      }
    }

    return existing
  } catch (error) {
    console.error("Error in getImageMappings:", error)
    return []
  }
}

// Get a specific image mapping by ID
export async function getImageMappingById(id: string): Promise<ImageMapping | null> {
  try {
    const { data, error } = await supabase.from("image_mappings").select("*").eq("id", id).single()

    if (error) {
      console.error(`Error fetching image mapping with ID ${id}:`, error)
      return null
    }

    return data
  } catch (error) {
    console.error(`Error in getImageMappingById for ID ${id}:`, error)
    return null
  }
}

// Update an image mapping
export async function updateImageMapping(id: string, imageUrl: string, imagePath: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("image_mappings")
      .update({
        image_url: imageUrl,
        image_path: imagePath,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      console.error(`Error updating image mapping with ID ${id}:`, error)
      return false
    }

    return true
  } catch (error) {
    console.error(`Error in updateImageMapping for ID ${id}:`, error)
    return false
  }
}

// Define initial image mappings to be used for setup
export const initialImageMappings = [
  {
    id: "logo",
    name: "Site Logo",
    description: "The main logo displayed in the header",
    location: "Header",
    image_path: "logo.png",
    image_url: "/placeholder.svg?height=64&width=192",
  },
  {
    id: "hero",
    name: "Homepage Hero",
    description: "Main banner image on the homepage",
    location: "Homepage",
    image_path: "hero.jpg",
    image_url: "/placeholder.svg?height=490&width=700",
  },
  {
    id: "about1",
    name: "About Us Image 1",
    description: "First founder image in the Who We Are section",
    location: "Who We Are Page",
    image_path: "about/founder1.jpg",
    image_url: "/placeholder.svg?height=530&width=318",
  },
  {
    id: "about2",
    name: "About Us Image 2",
    description: "Second founder image in the Who We Are section",
    location: "Who We Are Page",
    image_path: "about/founder2.jpg",
    image_url: "/placeholder.svg?height=530&width=318",
  },
  {
    id: "about_hero",
    name: "About Us Hero",
    description: "Main image at the top of the Who We Are page",
    location: "Who We Are Page",
    image_path: "about/hero.jpg",
    image_url: "/placeholder.svg?height=490&width=700",
  },
  {
    id: "process1",
    name: "Process Image 1",
    description: "First process image in the Our Process section",
    location: "Who We Are Page",
    image_path: "process/process1.jpg",
    image_url: "/placeholder.svg?height=290&width=305",
  },
  {
    id: "process2",
    name: "Process Image 2",
    description: "Second process image in the Our Process section",
    location: "Who We Are Page",
    image_path: "process/process2.jpg",
    image_url: "/placeholder.svg?height=290&width=305",
  },
  {
    id: "team1",
    name: "Team Member 1",
    description: "First team member image",
    location: "Who We Are Page",
    image_path: "team/team1.jpg",
    image_url: "/placeholder.svg?height=491&width=368",
  },
  {
    id: "team2",
    name: "Team Member 2",
    description: "Second team member image",
    location: "Who We Are Page",
    image_path: "team/team2.jpg",
    image_url: "/placeholder.svg?height=491&width=368",
  },
  {
    id: "team3",
    name: "Team Member 3",
    description: "Third team member image",
    location: "Who We Are Page",
    image_path: "team/team3.jpg",
    image_url: "/placeholder.svg?height=491&width=368",
  },
  {
    id: "project1",
    name: "Project Image 1",
    description: "First project image in the portfolio",
    location: "Projects Page",
    image_path: "projects/project1.jpg",
    image_url: "/placeholder.svg?height=276&width=368",
  },
  {
    id: "project2",
    name: "Project Image 2",
    description: "Second project image in the portfolio",
    location: "Projects Page",
    image_path: "projects/project2.jpg",
    image_url: "/placeholder.svg?height=276&width=368",
  },
  {
    id: "project3",
    name: "Project Image 3",
    description: "Third project image in the portfolio",
    location: "Projects Page",
    image_path: "projects/project3.jpg",
    image_url: "/placeholder.svg?height=276&width=368",
  },
  {
    id: "whatwedo1",
    name: "What We Do Image 1",
    description: "First image on the What We Do page",
    location: "What We Do Page",
    image_path: "whatwedo/image1.jpg",
    image_url: "/placeholder.svg?height=404&width=673",
  },
  {
    id: "whatwedo2",
    name: "What We Do Image 2",
    description: "Second image on the What We Do page",
    location: "What We Do Page",
    image_path: "whatwedo/image2.jpg",
    image_url: "/placeholder.svg?height=404&width=673",
  },
  {
    id: "whatwedo3",
    name: "What We Do Image 3",
    description: "Architectural Conception image",
    location: "What We Do Page",
    image_path: "whatwedo/image3.jpg",
    image_url: "/placeholder.svg?height=334&width=557",
  },
  {
    id: "whatwedo4",
    name: "What We Do Image 4",
    description: "Brand Identity image",
    location: "What We Do Page",
    image_path: "whatwedo/image4.jpg",
    image_url: "/placeholder.svg?height=334&width=557",
  },
  {
    id: "whatwedo5",
    name: "What We Do Image 5",
    description: "Consulting image",
    location: "What We Do Page",
    image_path: "whatwedo/image5.jpg",
    image_url: "/placeholder.svg?height=404&width=673",
  },
  // Partners (Who We Are)
  {
    id: "partner1",
    name: "Partner Logo 1",
    description: "Logo in partners marquee",
    location: "Who We Are Page - Partners",
    image_path: "partners/partner1.png",
    image_url: "/placeholder.svg?height=80&width=160",
  },
  {
    id: "partner2",
    name: "Partner Logo 2",
    description: "Logo in partners marquee",
    location: "Who We Are Page - Partners",
    image_path: "partners/partner2.png",
    image_url: "/placeholder.svg?height=80&width=160",
  },
  {
    id: "partner3",
    name: "Partner Logo 3",
    description: "Logo in partners marquee",
    location: "Who We Are Page - Partners",
    image_path: "partners/partner3.png",
    image_url: "/placeholder.svg?height=80&width=160",
  },
  {
    id: "partner4",
    name: "Partner Logo 4",
    description: "Logo in partners marquee",
    location: "Who We Are Page - Partners",
    image_path: "partners/partner4.png",
    image_url: "/placeholder.svg?height=80&width=160",
  },
  {
    id: "partner5",
    name: "Partner Logo 5",
    description: "Logo in partners marquee",
    location: "Who We Are Page - Partners",
    image_path: "partners/partner5.png",
    image_url: "/placeholder.svg?height=80&width=160",
  },
  {
    id: "partner6",
    name: "Partner Logo 6",
    description: "Logo in partners marquee",
    location: "Who We Are Page - Partners",
    image_path: "partners/partner6.png",
    image_url: "/placeholder.svg?height=80&width=160",
  },
]
