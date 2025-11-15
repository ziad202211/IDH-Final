"use client"

import { useState, useEffect } from "react"
import { useImages } from "@/context/image-context"
import { cn } from "@/lib/utils"

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
  placeholder?: 'blur' | 'empty' | 'color'
  blurDataURL?: string
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
  placeholder = 'empty',
  blurDataURL,
}: OptimizedImageProps) {
  const { images } = useImages()
  const [isLoading, setIsLoading] = useState(true)
  const [currentSrc, setCurrentSrc] = useState(blurDataURL || fallbackSrc || '')
  const [optimizedSrc, setOptimizedSrc] = useState<string | null>(null)

  // Get the optimized image URL from the images context
  useEffect(() => {
    if (images[imageId]) {
      const url = new URL(images[imageId])
      
      // Add quality parameter if it's a Supabase URL and not already set
      if (url.hostname.includes('supabase.co') || url.hostname.includes('supabase.in')) {
        url.searchParams.set('quality', quality.toString())
        // Add other optimization parameters if needed
        url.searchParams.set('format', 'webp')
      }
      
      setOptimizedSrc(url.toString())
    } else if (fallbackSrc) {
      setCurrentSrc(fallbackSrc)
      setIsLoading(false)
    }
  }, [images, imageId, fallbackSrc, quality])

  // Handle image load
  const handleLoad = () => {
    setIsLoading(false)
  }

  // Preload the optimized image
  useEffect(() => {
    if (!optimizedSrc || optimizedSrc === currentSrc) return
    
    const img = new window.Image()
    img.src = optimizedSrc
    img.onload = () => {
      setCurrentSrc(optimizedSrc)
    }
    img.onerror = () => {
      console.error(`Failed to load optimized image: ${optimizedSrc}`)
      setIsLoading(false)
    }
    
    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [optimizedSrc])

  if (!currentSrc) return null

  const imageProps: React.ImgHTMLAttributes<HTMLImageElement> = {
    src: currentSrc,
    alt,
    width,
    height,
    loading: priority ? 'eager' : 'lazy',
    decoding: 'async' as const,
    className: cn(
      'transition-opacity duration-300',
      isLoading ? 'opacity-30' : 'opacity-100',
      fill ? 'w-full h-full' : '',
      className
    ),
    style: {
      objectFit: className.includes("object-") ? undefined : "contain"
    } as React.CSSProperties,
    onLoad: handleLoad,
  }

  if (fill) {
    return (
      <div className={cn("relative w-full h-full overflow-hidden", className)}>
        <img {...imageProps} />
      </div>
    )
  }

  return <img {...imageProps} />
}
