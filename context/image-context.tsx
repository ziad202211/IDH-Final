"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { ImageMapping } from "@/lib/image-mapping"

interface ImageContextType {
  images: Record<string, string>
  loading: boolean
  error: string | null
  refreshImages: () => Promise<void>
}

const ImageContext = createContext<ImageContextType>({
  images: {},
  loading: true,
  error: null,
  refreshImages: async () => {},
})

export function useImages() {
  return useContext(ImageContext)
}

interface ImageProviderProps {
  children: ReactNode
}

export function ImageProvider({ children }: ImageProviderProps) {
  const [images, setImages] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchImages = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/website-images")

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch website images")
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch website images")
      }

      const imageData: ImageMapping[] = result.data || []

      // Convert to a map of id -> url for easy lookup
      const imageMap: Record<string, string> = {}
      imageData.forEach((image) => {
        imageMap[image.id] = image.image_url || ""
      })

      setImages(imageMap)
    } catch (err) {
      console.error("Error fetching images:", err)
      setError(err instanceof Error ? err.message : "Unknown error fetching images")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchImages()
  }, [])

  return (
    <ImageContext.Provider value={{ images, loading, error, refreshImages: fetchImages }}>
      {children}
    </ImageContext.Provider>
  )
}
