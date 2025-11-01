import { supabase } from "./supabaseClient"
import { initializeStorage } from "./supabase-storage"
import { resetAndCreateTablesQuery } from "./supabase-schema"

export async function initializeDatabase() {
  try {
    // Step 1: Reset and create tables
    const { error } = await supabase.rpc("exec_sql", { sql: resetAndCreateTablesQuery })

    if (error) {
      throw error
    }

    // Step 2: Initialize storage buckets
    await initializeStorage()

    return { success: true, message: "Database initialized successfully" }
  } catch (error) {
    console.error("Error initializing database:", error)
    return { success: false, message: "Failed to initialize database", error }
  }
}

// Seed the database with sample data
export async function seedDatabase() {
  try {
    // Sample projects
    const projects = [
      {
        title: "Harmony House",
        category: "House",
        description: "A beautiful modern house with harmony in design, featuring open spaces and natural light.",
        featured: true,
        location: "San Francisco, CA",
        area: "180 m²",
        completed: "2023",
        images: [
          "/placeholder.svg?height=490&width=1176",
          "/placeholder.svg?height=530&width=318",
          "/placeholder.svg?height=530&width=318",
        ],
      },
      {
        title: "The Coffee Corner",
        category: "Food & Beverage",
        description: "A cozy coffee shop with modern design, creating a warm atmosphere for customers.",
        featured: false,
        location: "Seattle, WA",
        area: "95 m²",
        completed: "2022",
        images: ["/placeholder.svg?height=490&width=1176", "/placeholder.svg?height=530&width=318"],
      },
      {
        title: "Paradis Hotel",
        category: "Hotels",
        description: "Luxury hotel with stunning views and top-tier amenities for an unforgettable stay.",
        featured: true,
        location: "Miami, FL",
        area: "2500 m²",
        completed: "2021",
        images: [
          "/placeholder.svg?height=490&width=1176",
          "/placeholder.svg?height=530&width=318",
          "/placeholder.svg?height=530&width=318",
        ],
      },
    ]

    // Insert projects
    const { error: projectsError } = await supabase.from("projects").insert(projects)

    if (projectsError) {
      throw projectsError
    }

    // Sample contact messages
    const messages = [
      {
        name: "John Doe",
        email: "john@example.com",
        phone: "555-123-4567",
        message:
          "I'm interested in your interior design services for my new home. Could you please provide more information about your process and pricing?",
        read: false,
      },
      {
        name: "Jane Smith",
        email: "jane@example.com",
        phone: "555-987-6543",
        message:
          "We're looking to renovate our office space and would like to discuss your commercial design services. Please contact me at your earliest convenience.",
        read: true,
      },
    ]

    // Insert messages
    const { error: messagesError } = await supabase.from("contact_messages").insert(messages)

    if (messagesError) {
      throw messagesError
    }

    return { success: true, message: "Database seeded successfully" }
  } catch (error) {
    console.error("Error seeding database:", error)
    return { success: false, message: "Failed to seed database", error }
  }
}
