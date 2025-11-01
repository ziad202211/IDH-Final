"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import AdminLayout from "@/components/admin/layout"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, Star, Eye } from "lucide-react"
import type { Project } from "@/lib/project-service"

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/projects")
      const result = await response.json()

      if (result.success && result.data) {
        setProjects(result.data)
      } else {
        console.error("Error fetching projects:", result.error)
        // Fallback to sample data
        setProjects(getSampleProjects())
      }
    } catch (error) {
      console.error("Error fetching projects:", error)
      // Fallback to sample data
      setProjects(getSampleProjects())
    } finally {
      setLoading(false)
    }
  }

  const toggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      const response = await fetch("/api/projects/featured", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, featured: !currentFeatured }),
      })

      const result = await response.json()

      if (result.success) {
        setProjects(
          projects.map((project) => (project.id === id ? { ...project, featured: !currentFeatured } : project)),
        )
      } else {
        console.error("Error toggling featured status:", result.error)
        alert("Failed to update featured status. Please try again.")
      }
    } catch (error) {
      console.error("Error toggling featured status:", error)
      alert("Failed to update featured status. Please try again.")
    }
  }

  const deleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/projects?id=${id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        setProjects(projects.filter((project) => project.id !== id))
      } else {
        console.error("Error deleting project:", result.error)
        alert("Failed to delete project. Please try again.")
      }
    } catch (error) {
      console.error("Error deleting project:", error)
      alert("Failed to delete project. Please try again.")
    }
  }

  // Sample projects as fallback
  const getSampleProjects = (): Project[] => [
    {
      id: "1",
      title: "Harmony House",
      category: "House",
      description: "A beautiful modern house with harmony in design.",
      featured: true,
      images: ["/placeholder.svg?height=276&width=368"],
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    },
    {
      id: "2",
      title: "The Coffee Corner",
      category: "Food & Beverage",
      description: "A cozy coffee shop with modern design.",
      featured: false,
      images: ["/placeholder.svg?height=276&width=368"],
      created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago
    },
    {
      id: "3",
      title: "Paradis Hotel",
      category: "Hotels",
      description: "Luxury hotel with stunning views.",
      featured: true,
      images: ["/placeholder.svg?height=276&width=368"],
      created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
    },
  ]

  if (loading) {
    return (
      <AdminLayout>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#636AE8] mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading projects...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Projects</h2>
          <Link href="/admin/dashboard/projects/add">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Project
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Featured
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 mr-3">
                        <div className="h-10 w-10 rounded-md overflow-hidden relative">
                          <Image
                            src={project.images[0] || "/placeholder.svg?height=276&width=368"}
                            alt={project.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{project.title}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{project.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleFeatured(project.id, project.featured)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        project.featured ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <Star className={`h-3 w-3 mr-1 ${project.featured ? "fill-yellow-500" : ""}`} />
                      {project.featured ? "Featured" : "Not Featured"}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(project.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Link href={`/projects/${project.id}`} target="_blank">
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          View
                        </Button>
                      </Link>
                      <Link href={`/admin/dashboard/projects/edit/${project.id}`}>
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <Edit className="h-3 w-3" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteProject(project.id)}
                        className="flex items-center gap-1 text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
