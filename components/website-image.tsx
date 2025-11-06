"use client"

import { useState, useEffect } from "react"
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

  useEffect(() => {
    try {
      setLoading(true)
      const mappedUrl = images[imageId]
      if (mappedUrl) {
        setImageSrc(mappedUrl)
      } else if (fallbackSrc) {
        setImageSrc(fallbackSrc)
      }
    } finally {
      setLoading(false)
    }
  }, [images, imageId, fallbackSrc])

  if (fill) {
    return (
      <div className={`relative w-full h-full overflow-hidden`}>
        <img
          src={imageSrc || "/placeholder.svg"}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className={`w-full h-full ${className} ${loading ? "animate-pulse" : ""}`}
          style={{ objectFit: className.includes("object-") ? undefined : "contain" }}
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
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={`${className} ${loading ? "animate-pulse" : ""}`}
      style={{ objectFit: className.includes("object-") ? undefined : "contain" }}
    />
  )
}
