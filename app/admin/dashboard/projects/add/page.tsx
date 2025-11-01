"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/admin/layout"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowLeft, Upload, Loader2, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function AddProjectPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    location: "",
    area: "",
    completed: "",
    featured: false,
  })

  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value.trim()
    if (url) {
      setImageUrls((prev) => [...prev, url])
      e.target.value = ""

      // Clear any image-related errors
      if (errors.images) {
        setErrors((prev) => ({ ...prev, images: "" }))
      }
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true)
      const files = Array.from(e.target.files)
      const newUploadProgress = { ...uploadProgress }

      try {
        const uploadedUrls: string[] = []

        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          newUploadProgress[file.name] = 0
          setUploadProgress(newUploadProgress)

          // Create form data for the file
          const formData = new FormData()
          formData.append("file", file)

          // Upload the file
          const response = await fetch("/api/projects/upload", {
            method: "POST",
            body: formData,
          })

          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || "Failed to upload file")
          }

          const result = await response.json()
          uploadedUrls.push(result.url)

          // Update progress
          newUploadProgress[file.name] = 100
          setUploadProgress({ ...newUploadProgress })
        }

        // Add the uploaded URLs to the state
        setImageUrls((prev) => [...prev, ...uploadedUrls])

        // Clear any image-related errors
        if (errors.images) {
          setErrors((prev) => ({ ...prev, images: "" }))
        }
      } catch (error) {
        console.error("Error uploading files:", error)
        alert("Failed to upload one or more files. Please try again.")
      } finally {
        setIsUploading(false)
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }
    }
  }

  const removeImage = (index: number) => {
    setImageUrls((prev) => {
      const newUrls = [...prev]
      newUrls.splice(index, 1)
      return newUrls
    })
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    }

    if (!formData.category.trim()) {
      newErrors.category = "Category is required"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    }

    // At least one image is required
    if (imageUrls.length === 0) {
      newErrors.images = "At least one image is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const projectData = {
        ...formData,
        images: imageUrls,
      }

      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to create project")
      }

      alert("Project created successfully!")
      router.push("/admin/dashboard/projects")
    } catch (error: any) {
      console.error("Error adding project:", error)
      alert("Failed to add project. Please try again. " + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AdminLayout>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center">
          <Link href="/admin/dashboard/projects" className="mr-4">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h2 className="text-xl font-semibold">Add New Project</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Project Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#636AE8] focus:border-[#636AE8]"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#636AE8] focus:border-[#636AE8]"
              >
                <option value="">Select a category</option>
                <option value="House">House</option>
                <option value="Malls">Malls</option>
                <option value="Hotels">Hotels</option>
                <option value="Offices">Offices</option>
                <option value="Residential">Residential</option>
                <option value="Other">Other</option>
              </select>
              {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#636AE8] focus:border-[#636AE8]"
              />
            </div>

            {/* Area */}
            <div>
              <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1">
                Area (e.g., "120 m²")
              </label>
              <input
                type="text"
                id="area"
                name="area"
                value={formData.area}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#636AE8] focus:border-[#636AE8]"
              />
            </div>

            {/* Completed */}
            <div>
              <label htmlFor="completed" className="block text-sm font-medium text-gray-700 mb-1">
                Completed (e.g., "2023")
              </label>
              <input
                type="text"
                id="completed"
                name="completed"
                value={formData.completed}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#636AE8] focus:border-[#636AE8]"
              />
            </div>

            {/* Featured */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={formData.featured}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-[#636AE8] focus:ring-[#636AE8] border-gray-300 rounded"
              />
              <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                Featured Project (will be highlighted on the homepage)
              </label>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#636AE8] focus:border-[#636AE8]"
            ></textarea>
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          {/* Images */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Images <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-500 mb-3">
              Upload images for your project. The first image will be used as the main image.
            </p>

            {errors.images && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{errors.images}</p>
              </div>
            )}

            {/* Image URL input */}
            <div className="mb-4">
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Add Image URL (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  id="imageUrl"
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-[#636AE8] focus:border-[#636AE8]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleImageUrlChange(e as any)
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={(e) =>
                    handleImageUrlChange({
                      target: { value: (document.getElementById("imageUrl") as HTMLInputElement).value },
                    } as any)
                  }
                >
                  Add URL
                </Button>
              </div>
            </div>

            {/* Image previews */}
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square relative rounded-md overflow-hidden border border-gray-200">
                      <Image
                        src={url || "/placeholder.svg"}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* File upload */}
            <div
              className={`border-2 border-dashed border-gray-300 rounded-md p-6 text-center ${isUploading ? "bg-gray-50" : "cursor-pointer hover:bg-gray-50"} transition-colors`}
              onClick={() => !isUploading && fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                accept="image/*"
                className="hidden"
                disabled={isUploading}
              />

              {isUploading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="h-12 w-12 text-[#636AE8] animate-spin" />
                  <p className="mt-2 text-sm text-gray-600">Uploading images...</p>
                </div>
              ) : (
                <>
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Link href="/admin/dashboard/projects">
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting || isUploading}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Project"
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
