"use client"

import { useState, useEffect } from "react"
import type { ImageMapping } from "@/lib/image-mapping"
import { useImages } from "@/context/image-context"

interface WebsiteImageProps {
  imageId: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  fallbackSrc?: string
  fill?: boolean
}

export function WebsiteImage({
  imageId,
  alt,
  width,
  height,
  className = "",
  priority = false,
  fallbackSrc,
  fill = false,
}: WebsiteImageProps) {
  const { images } = useImages()

  const [imageSrc, setImageSrc] = useState<string>(
    fallbackSrc || `/placeholder.svg?height=${height || 300}&width=${width || 300}`,
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    try {
      setLoading(true)
      const mappedUrl = images[imageId]
      if (mappedUrl) {
        setImageSrc(mappedUrl)
        setError(false)
      } else if (fallbackSrc) {
        setImageSrc(fallbackSrc)
      }
    } catch (e) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [images, imageId, fallbackSrc])

  // If we're using fill, don't pass width and height
  if (fill) {
    return (
      <div className={`relative ${className}`} style={{ width: "100%", height: "100%" }}>
        <img
          src={imageSrc || "/placeholder.svg"}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={`object-cover w-full h-full ${loading ? "animate-pulse" : ""}`}
        />
      </div>
    )
  }

  return (
    <img
      src={imageSrc || "/placeholder.svg"}
      alt={alt}
      width={width || 300}
      height={height || 300}
      loading="lazy"
      decoding="async"
      className={`${className} ${loading ? "animate-pulse" : ""}`}
    />
  )
}
