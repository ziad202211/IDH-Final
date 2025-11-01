"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/admin/layout"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Upload, Trash2, RefreshCw, ImageIcon, AlertCircle, Check, Info } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { Loader2 } from "lucide-react"
import type { ImageMapping } from "@/lib/image-mapping"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type MediaFile = {
  name: string
  url: string
  path: string
  size: number
  type: string
}

export default function MediaManagement() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState("website")
  const [setupRequired, setSetupRequired] = useState(false)

  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [websiteImages, setWebsiteImages] = useState<ImageMapping[]>([])
  const [uploadingFile, setUploadingFile] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !loading && !user) {
      router.push("/admin/login")
    } else if (mounted && user) {
      fetchData()
    }
  }, [mounted, loading, user, router, activeTab])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setSetupRequired(false)

      if (activeTab === "media") {
        const response = await fetch("/api/media")
        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || "Failed to fetch media files")
        }

        setMediaFiles(result.data || [])
      } else {
        const response = await fetch("/api/website-images")

        if (!response.ok) {
          const errorData = await response.json()
          if (errorData.error && errorData.error.includes("does not exist")) {
            setSetupRequired(true)
            throw new Error("Database setup required")
          }
          throw new Error(errorData.error || "Failed to fetch website images")
        }

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || "Failed to fetch website images")
        }

        setWebsiteImages(result.data || [])
      }
    } catch (error: any) {
      console.error(`Error fetching ${activeTab} data:`, error)
      if (error.message.includes("Database setup required")) {
        setSetupRequired(true)
      } else {
        setError(error.message || `Failed to load ${activeTab} data`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
    }
  }

  const uploadFile = async (path?: string, folder = "website") => {
    if (!selectedFile) {
      setError("Please select a file to upload")
      return
    }

    try {
      setUploadingFile(path || "new")
      setError(null)

      const formData = new FormData()
      formData.append("file", selectedFile)

      if (path) {
        formData.append("path", path)
      }

      formData.append("folder", folder)

      const response = await fetch("/api/media", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to upload file")
      }

      setSuccess(`File uploaded successfully`)

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      setSelectedFile(null)

      // Refresh data
      fetchData()
    } catch (error: any) {
      console.error("Error uploading file:", error)
      setError(error.message || "Failed to upload file")
    } finally {
      setUploadingFile(null)

      // Clear success message after 3 seconds
      if (success) {
        setTimeout(() => setSuccess(null), 3000)
      }
    }
  }

  const deleteFile = async (path: string) => {
    if (!confirm("Are you sure you want to delete this file?")) {
      return
    }

    try {
      setIsDeleting(path)
      setError(null)

      const response = await fetch(`/api/media?path=${encodeURIComponent(path)}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to delete file")
      }

      setSuccess("File deleted successfully")

      // Remove the file from the list
      setMediaFiles(mediaFiles.filter((file) => file.path !== path))
    } catch (error: any) {
      console.error("Error deleting file:", error)
      setError(error.message || "Failed to delete file")
    } finally {
      setIsDeleting(null)

      // Clear success message after 3 seconds
      if (success) {
        setTimeout(() => setSuccess(null), 3000)
      }
    }
  }

  const handleReplaceWebsiteImage = async (image: ImageMapping) => {
    if (!selectedFile) {
      setError("Please select a file to upload")
      return
    }

    try {
      setUploadingFile(image.id)
      setError(null)

      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("path", `website/${image.image_path}`)

      const response = await fetch("/api/media", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to upload file")
      }

      // Update the website image mapping
      const updateResponse = await fetch("/api/website-images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: image.id,
          url: result.url,
          path: result.path,
        }),
      })

      const updateResult = await updateResponse.json()

      if (!updateResult.success) {
        throw new Error(updateResult.error || "Failed to update website image mapping")
      }

      setSuccess(`Image "${image.name}" replaced successfully`)

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      setSelectedFile(null)

      // Refresh data
      fetchData()
    } catch (error: any) {
      console.error("Error replacing website image:", error)
      setError(error.message || "Failed to replace website image")
    } finally {
      setUploadingFile(null)
    }
  }

  if (!mounted || loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 mx-auto animate-spin text-gray-500 dark:text-gray-400" />
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading media management...</p>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
          <Link href="/admin/dashboard" className="mr-4">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h2 className="text-xl font-semibold dark:text-white">Media Management</h2>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="p-6">
          <TabsList className="mb-6">
            <TabsTrigger value="website" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Website Images
            </TabsTrigger>
            <TabsTrigger value="media" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Media Library
            </TabsTrigger>
          </TabsList>

          {setupRequired && (
            <Alert className="mb-6 mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Database Setup Required</AlertTitle>
              <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-4">
                <span>You need to run the database setup before using media management.</span>
                <Button asChild size="sm" variant="outline" className="mt-2 sm:mt-0">
                  <Link href="/admin/setup">Go to Setup</Link>
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-md flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-green-800 dark:text-green-200">{success}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <TabsContent value="website" className="space-y-6">
            {setupRequired ? (
              <Card>
                <CardHeader>
                  <CardTitle>Setup Required</CardTitle>
                  <CardDescription>
                    You need to complete the database setup before using website image management
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-6">
                    <Info className="h-12 w-12 text-blue-500 mb-4" />
                    <p className="text-center mb-4">
                      The image_mappings table has not been created yet. Please run the database setup to initialize all
                      required tables.
                    </p>
                    <Button asChild>
                      <Link href="/admin/setup">Go to Setup Page</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Website Images</CardTitle>
                  <CardDescription>Replace images used throughout the website</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <Label htmlFor="file-upload">Select image to upload</Label>
                    <div className="flex mt-1">
                      <Input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        className="flex-1"
                      />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Select an image file first, then click "Replace" on the image you want to update
                    </p>
                  </div>

                  {isLoading ? (
                    <div className="py-8 text-center">
                      <Loader2 className="h-8 w-8 mx-auto animate-spin text-gray-500 dark:text-gray-400" />
                      <p className="mt-2 text-gray-600 dark:text-gray-400">Loading website images...</p>
                    </div>
                  ) : websiteImages.length === 0 ? (
                    <div className="py-8 text-center border border-dashed border-gray-300 dark:border-gray-700 rounded-md">
                      <p className="text-gray-500 dark:text-gray-400">
                        No website images found. Please run the database setup.
                      </p>
                      <Button asChild variant="outline" className="mt-4">
                        <Link href="/admin/setup">Go to Setup</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {websiteImages.map((image) => (
                        <div key={image.id} className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
                          <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-shrink-0 w-full md:w-48 h-48 relative">
                              <img
                                src={image.image_url || "/placeholder.svg"}
                                alt={image.name}
                                className="w-full h-full object-cover rounded-md"
                              />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-medium dark:text-white">{image.name}</h3>
                              <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">{image.description}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                Location: {image.location}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Path: {image.image_path}</p>
                              <Button
                                onClick={() => handleReplaceWebsiteImage(image)}
                                disabled={!selectedFile || !!uploadingFile}
                                className="w-full md:w-auto"
                              >
                                {uploadingFile === image.id ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Uploading...
                                  </>
                                ) : (
                                  "Replace Image"
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Media Library</CardTitle>
                <CardDescription>Manage all uploaded media files</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="media-upload">Upload new file</Label>
                    <Input
                      id="media-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex-shrink-0 self-end">
                    <Button
                      onClick={() => uploadFile(undefined, "uploads")}
                      disabled={!selectedFile || !!uploadingFile}
                    >
                      {uploadingFile === "new" ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium dark:text-white">Uploaded Files</h3>
                    <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading}>
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    </Button>
                  </div>

                  {isLoading ? (
                    <div className="py-8 text-center">
                      <Loader2 className="h-8 w-8 mx-auto animate-spin text-gray-500 dark:text-gray-400" />
                      <p className="mt-2 text-gray-600 dark:text-gray-400">Loading media files...</p>
                    </div>
                  ) : mediaFiles.length === 0 ? (
                    <div className="py-8 text-center border border-dashed border-gray-300 dark:border-gray-700 rounded-md">
                      <p className="text-gray-500 dark:text-gray-400">No media files found. Upload your first file.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {mediaFiles.map((file) => (
                        <div
                          key={file.path}
                          className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden"
                        >
                          <div className="h-36 bg-gray-100 dark:bg-gray-800 relative">
                            {file.name.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/) ? (
                              <img
                                src={file.url || "/placeholder.svg"}
                                alt={file.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <ImageIcon className="h-12 w-12 text-gray-400 dark:text-gray-600" />
                              </div>
                            )}
                          </div>
                          <div className="p-3">
                            <p className="font-medium text-sm truncate dark:text-white" title={file.name}>
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {Math.round(file.size / 1024)} KB
                            </p>
                            <div className="flex justify-between items-center mt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(file.url, "_blank")}
                                className="text-xs px-2"
                              >
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteFile(file.path)}
                                disabled={!!isDeleting}
                                className="text-xs px-2 text-red-500 hover:text-red-700"
                              >
                                {isDeleting === file.path ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
