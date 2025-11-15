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
  const [imageSrc, setImageSrc] = useState<string>(fallbackSrc || '')

  useEffect(() => {
    const mappedUrl = images[imageId]
    if (mappedUrl) {
      setImageSrc(mappedUrl)
    } else if (fallbackSrc) {
      setImageSrc(fallbackSrc)
    }
  }, [images, imageId, fallbackSrc])

  if (!imageSrc) return null

  if (fill) {
    return (
      <div className={`relative w-full h-full overflow-hidden`}>
        <img
          src={imageSrc}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className={`w-full h-full ${className}`}
          style={{ objectFit: className.includes("object-") ? undefined : "contain" }}
        />
      </div>
    )
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={className}
      style={{ objectFit: className.includes("object-") ? undefined : "contain" }}
    />
  )
}
