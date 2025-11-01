"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import AdminLayout from "@/components/admin/layout"
import { AlertTriangle, Check, RefreshCw, SproutIcon as Seedling } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"

export default function SeedDatabasePage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; message?: string }>({})

  const handleSeedDatabase = async () => {
    if (!confirm("This will add sample data to your database. Continue?")) {
      return
    }

    setLoading(true)
    try {
      // First, let's seed the projects table
      const projectsData = [
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
        {
          title: "Modern Office Complex",
          category: "Offices",
          description: "A contemporary office space designed for productivity and collaboration.",
          featured: true,
          location: "Chicago, IL",
          area: "1200 m²",
          completed: "2023",
          images: ["/placeholder.svg?height=490&width=1176", "/placeholder.svg?height=530&width=318"],
        },
        {
          title: "Coastal Retreat",
          category: "House",
          description: "A serene beachfront property with panoramic ocean views and natural materials.",
          featured: false,
          location: "Malibu, CA",
          area: "220 m²",
          completed: "2022",
          images: ["/placeholder.svg?height=490&width=1176", "/placeholder.svg?height=530&width=318"],
        },
      ]

      // Use direct SQL to insert projects (bypassing RLS)
      const { error: projectsError } = await supabase.rpc("exec_sql", {
        sql: `
          INSERT INTO projects (title, category, description, featured, location, area, completed, images)
          VALUES 
            ('Harmony House', 'House', 'A beautiful modern house with harmony in design, featuring open spaces and natural light.', true, 'San Francisco, CA', '180 m²', '2023', ARRAY['/placeholder.svg?height=490&width=1176', '/placeholder.svg?height=530&width=318', '/placeholder.svg?height=530&width=318']),
            ('The Coffee Corner', 'Food & Beverage', 'A cozy coffee shop with modern design, creating a warm atmosphere for customers.', false, 'Seattle, WA', '95 m²', '2022', ARRAY['/placeholder.svg?height=490&width=1176', '/placeholder.svg?height=530&width=318']),
            ('Paradis Hotel', 'Hotels', 'Luxury hotel with stunning views and top-tier amenities for an unforgettable stay.', true, 'Miami, FL', '2500 m²', '2021', ARRAY['/placeholder.svg?height=490&width=1176', '/placeholder.svg?height=530&width=318', '/placeholder.svg?height=530&width=318']),
            ('Modern Office Complex', 'Offices', 'A contemporary office space designed for productivity and collaboration.', true, 'Chicago, IL', '1200 m²', '2023', ARRAY['/placeholder.svg?height=490&width=1176', '/placeholder.svg?height=530&width=318']),
            ('Coastal Retreat', 'House', 'A serene beachfront property with panoramic ocean views and natural materials.', false, 'Malibu, CA', '220 m²', '2022', ARRAY['/placeholder.svg?height=490&width=1176', '/placeholder.svg?height=530&width=318'])
          ON CONFLICT DO NOTHING;
        `,
      })

      if (projectsError) {
        throw new Error(`Error seeding projects: ${projectsError.message}`)
      }

      // Now seed the contact messages
      const { error: messagesError } = await supabase.rpc("exec_sql", {
        sql: `
          INSERT INTO contact_messages (name, email, phone, message, read)
          VALUES 
            ('John Doe', 'john@example.com', '555-123-4567', 'I''m interested in your interior design services for my new home. Could you please provide more information about your process and pricing?', false),
            ('Jane Smith', 'jane@example.com', '555-987-6543', 'We''re looking to renovate our office space and would like to discuss your commercial design services. Please contact me at your earliest convenience.', true),
            ('Michael Johnson', 'michael@example.com', '555-555-5555', 'I saw your portfolio and I''m impressed with your work. I have a small apartment that needs redesigning. What would be the approximate cost for such a project?', false),
            ('Sarah Williams', 'sarah@example.com', '555-222-3333', 'We''re planning to open a new restaurant and need interior design services. Do you have experience with restaurant designs?', false),
            ('Robert Brown', 'robert@example.com', '555-444-7777', 'I''m interested in your hotel design services. We''re renovating a boutique hotel and would like to discuss our options.', true)
          ON CONFLICT DO NOTHING;
        `,
      })

      if (messagesError) {
        throw new Error(`Error seeding messages: ${messagesError.message}`)
      }

      setResult({
        success: true,
        message: "Database seeded successfully! Added 5 projects and 5 contact messages.",
      })
    } catch (error: any) {
      console.error("Error:", error)
      setResult({
        success: false,
        message: error.message || "An unexpected error occurred",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-6">Seed Database</h2>

        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-md mb-6">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium">Direct Database Seeding</h3>
              <p className="text-sm mt-1">
                This page uses direct SQL execution to bypass Row Level Security (RLS) policies and seed your database
                with sample data. This is useful for initial setup and testing purposes.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-md mb-6">
          <h3 className="font-medium mb-2 flex items-center">
            <Seedling className="h-5 w-5 mr-2 text-gray-500" />
            Seed Database with Sample Data
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            This will add 5 sample projects and 5 contact messages to your database for testing purposes.
          </p>
          <Button
            onClick={handleSeedDatabase}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Seeding Database...
              </>
            ) : (
              "Seed Database"
            )}
          </Button>
        </div>

        {result.message && (
          <div className={`p-4 rounded-md ${result.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
            <div className="flex items-start">
              {result.success ? (
                <Check className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0 text-red-500" />
              )}
              <div>{result.message}</div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
