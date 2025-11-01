"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  category: z.string().min(2, { message: "Category must be at least 2 characters." }),
  featured: z.boolean().default(false),
  location: z.string().optional(),
  area: z.string().optional(),
  completed: z.string().optional(),
  images: z.array(z.string()).default([]),
  imageUrl: z.string().optional(), // Temporary field for adding new images
})

type FormValues = z.infer<typeof formSchema>

export default function EditProjectPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingProject, setLoadingProject] = useState(true)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      featured: false,
      location: "",
      area: "",
      completed: "",
      images: [],
      imageUrl: "",
    },
  })

  useEffect(() => {
    if (projectId) {
      fetchProjectData()
    }
  }, [projectId])

  const fetchProjectData = async () => {
    setLoadingProject(true)
    try {
      const response = await fetch(`/api/projects?id=${projectId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch project")
      }

      const project = data.data[0] // Assuming the API returns an array
      if (project) {
        form.reset({
          title: project.title,
          description: project.description,
          category: project.category,
          featured: project.featured,
          location: project.location || "",
          area: project.area || "",
          completed: project.completed || "",
          images: project.images || [],
          imageUrl: "",
        })
        setImageUrls(project.images || [])
      }
    } catch (error: any) {
      console.error("Error fetching project:", error.message)
      toast({
        title: "Error",
        description: error.message || "Failed to load project data.",
        variant: "destructive",
      })
      router.push("/dashboard") // Redirect if project not found or error
    } finally {
      setLoadingProject(false)
    }
  }

  const addImageUrl = () => {
    const newImageUrl = form.getValues("imageUrl")
    if (newImageUrl && !imageUrls.includes(newImageUrl)) {
      const updatedImageUrls = [...imageUrls, newImageUrl]
      setImageUrls(updatedImageUrls)
      form.setValue("images", updatedImageUrls)
      form.setValue("imageUrl", "") // Clear the input field
    }
  }

  const removeImage = (index: number) => {
    const newUrls = [...imageUrls]
    newUrls.splice(index, 1)
    setImageUrls(newUrls)
    form.setValue("images", newUrls)
  }

  async function handleSubmit(values: FormValues) {
    setIsSubmitting(true)
    try {
      const imagesToSave = imageUrls.length > 0 ? imageUrls : ["/placeholder.svg?height=490&width=1176"]

      const projectData = {
        ...values,
        images: imagesToSave,
      }

      delete projectData.imageUrl // Remove the temporary field

      const response = await fetch(`/api/projects?id=${projectId}`, {
        method: "PUT", // Use PUT for updating
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update project")
      }

      toast({
        title: "Project updated!",
        description: "Your project has been updated successfully.",
      })

      router.push("/dashboard")
    } catch (error: any) {
      console.error("Error updating project:", error.message)
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loadingProject) {
    return (
      <div className="container mx-auto py-12 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <p className="mt-4 text-lg">Loading project...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold mb-8">Edit Project</h1>
      <div className="max-w-2xl mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter project title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter project description" className="min-h-[120px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <select className="w-full p-2 border border-gray-300 rounded-md" {...field}>
                      <option value="">Select a category</option>
                      <option value="House">House</option>
                      <option value="Food & Beverage">Food & Beverage</option>
                      <option value="Hotels">Hotels</option>
                      <option value="Offices">Offices</option>
                      <option value="Other">Other</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., San Francisco, CA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Area (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 120 m²" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="completed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Completed (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 2023" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Featured Project</FormLabel>
                    <p className="text-sm text-muted-foreground">This project will be displayed on the home page.</p>
                  </div>
                </FormItem>
              )}
            />

            {/* Image URLs */}
            <div className="space-y-2">
              <FormLabel>Images</FormLabel>
              <div className="flex gap-2">
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          placeholder="Enter new image URL"
                          {...field}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              addImageUrl()
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="button" onClick={addImageUrl}>
                  Add
                </Button>
              </div>

              {/* Display added images */}
              {imageUrls.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium">Current Images:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <Image
                          src={url || "/placeholder.svg"}
                          alt={`Project image ${index + 1}`}
                          width={200}
                          height={100}
                          className="h-24 w-full object-cover rounded-md border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {imageUrls.length === 0 && !loadingProject && (
                <p className="text-sm text-muted-foreground mt-2">
                  No images added yet. A placeholder image will be used if none are provided.
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
