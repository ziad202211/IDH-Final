export const SUPABASE_CONFIG = {
  // This file helps configure Supabase for both development and production

  // Default tables that should exist in your Supabase database
  tables: {
    CONTACT_MESSAGES: "contact_messages",
    PROJECTS: "projects",
    USERS: "auth.users",
  },

  // Schema for the tables
  schema: {
    contactMessages: {
      id: "uuid",
      name: "text",
      email: "text",
      phone: "text",
      message: "text",
      read: "boolean",
      created_at: "timestamp with time zone",
    },
    projects: {
      id: "uuid",
      title: "text",
      category: "text",
      description: "text",
      featured: "boolean",
      location: "text",
      area: "text",
      completed: "text",
      images: "text[]",
      created_at: "timestamp with time zone",
    },
  },

  // Helper to check if Supabase is properly configured
  isConfigured: () => {
    return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  },

  // Sample data for development when database is not available
  sampleData: {
    projects: [
      {
        id: "1",
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
        created_at: new Date().toISOString(),
      },
      {
        id: "2",
        title: "The Coffee Corner",
        category: "Food & Beverage",
        description: "A cozy coffee shop with modern design, creating a warm atmosphere for customers.",
        featured: false,
        location: "Seattle, WA",
        area: "95 m²",
        completed: "2022",
        images: [
          "/placeholder.svg?height=490&width=1176",
          "/placeholder.svg?height=530&width=318",
          "/placeholder.svg?height=530&width=318",
        ],
        created_at: new Date().toISOString(),
      },
      {
        id: "3",
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
        created_at: new Date().toISOString(),
      },
    ],
    contactMessages: [
      {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        phone: "555-123-4567",
        message:
          "I'm interested in your interior design services for my new home. Could you please provide more information about your process and pricing?",
        read: false,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      },
      {
        id: "2",
        name: "Jane Smith",
        email: "jane@example.com",
        phone: "555-987-6543",
        message:
          "We're looking to renovate our office space and would like to discuss your commercial design services. Please contact me at your earliest convenience.",
        read: true,
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      },
    ],
  },
}
