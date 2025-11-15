"use client"

import { useState, useEffect } from "react"
import { useImages } from "@/context/image-context"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface OptimizedImageProps {
  imageId: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  fallbackSrc?: string
  fill?: boolean
  quality?: number
  sizes?: string
}

export function OptimizedImage({
  imageId,
  alt,
  width,
  height,
  className = "",
  priority = false,
  fallbackSrc,
  fill = false,
  quality = 75,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
}: OptimizedImageProps) {
  const { images } = useImages()
  const [optimizedSrc, setOptimizedSrc] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Get the optimized image URL from the images context
  useEffect(() => {
    if (images[imageId]) {
      const url = new URL(images[imageId])
      
      // Add optimization parameters for Supabase
      if (url.hostname.includes('supabase.co') || url.hostname.includes('supabase.in')) {
        url.searchParams.set('quality', quality.toString())
        url.searchParams.set('format', 'webp')
        // Add width for better resizing
        if (width) {
          url.searchParams.set('width', width.toString())
        }
      }
      
      setOptimizedSrc(url.toString())
    } else if (fallbackSrc) {
      setOptimizedSrc(fallbackSrc)
    }
    setIsLoading(false)
  }, [images, imageId, fallbackSrc, quality, width])

  if (!optimizedSrc) return null

  const imageProps = {
    src: optimizedSrc,
    alt,
    width,
    height,
    priority,
    quality,
    sizes,
    className: cn(
      'transition-opacity duration-300',
      isLoading ? 'opacity-30' : 'opacity-100',
      className
    ),
    onLoadingComplete: () => setIsLoading(false),
  }

  if (fill) {
    return (
      <div className={cn("relative w-full h-full overflow-hidden", className)}>
        <Image
          {...imageProps}
          fill
          style={{
            objectFit: className.includes("object-") ? undefined : "contain"
          }}
        />
      </div>
    )
  }

  return <Image {...imageProps} />
}
